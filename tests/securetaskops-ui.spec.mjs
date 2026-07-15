import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SecureTaskOpsPage } from "./pages/securetaskops.page.mjs";

const taskFixture = {
  id: "task-fixture-1",
  title: "Review mocked deployment boundary",
  owner: "QA automation",
  status: "blocked",
  severity: "high",
  securitySensitive: true,
  dueDate: "2026-07-18",
  tags: ["qa", "release"],
  riskScore: 94,
  riskBand: "critical",
  riskReasons: ["high severity baseline", "blocked work increases delivery risk"]
};

const releaseFixture = {
  total: 1,
  open: 1,
  blocked: 1,
  highRisk: 1,
  securitySensitive: 1,
  averageRisk: 94,
  releaseStatus: "needs_attention"
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/release-readiness", (route) => route.fulfill({ json: { data: releaseFixture } }));
  await page.route("**/api/tasks*", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { data: { ...taskFixture, ...payload } } });
    }
    return route.fulfill({ json: { data: [taskFixture], count: 1 } });
  });
});

test.describe("SecureTaskOps deterministic UI regression", () => {
  test("dashboard renders mocked risk and sends a stable filter query", async ({ page }) => {
    const app = new SecureTaskOpsPage(page);
    await app.open();
    await app.expectReady();

    await expect(app.releaseStatus).toHaveText("needs attention");
    await expect(app.taskGrid.getByRole("heading", { name: taskFixture.title })).toBeVisible();

    const filteredRequest = page.waitForRequest((request) =>
      request.url().includes("/api/tasks?") && request.url().includes("severity=high")
    );
    await app.filterBySeverity("high");
    await filteredRequest;
  });

  test("task form sends the entered contract and reports success", async ({ page }) => {
    const app = new SecureTaskOpsPage(page);
    await app.open();
    await app.expectReady();

    const requestPromise = page.waitForRequest((request) =>
      request.url().includes("/api/tasks") && request.method() === "POST"
    );
    await app.createTask({ title: "Verify intercepted submission", owner: "Local QA" });
    const request = await requestPromise;

    expect(request.postDataJSON()).toMatchObject({
      title: "Verify intercepted submission",
      owner: "Local QA",
      securitySensitive: true
    });
    await expect(app.formStatus).toHaveText("Workflow item created and risk-scored.");
  });

  test("dashboard has no critical automated accessibility violations", async ({ page }) => {
    const app = new SecureTaskOpsPage(page);
    await app.open();
    await app.expectReady();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.filter((violation) => violation.impact === "critical")).toEqual([]);
  });
});
