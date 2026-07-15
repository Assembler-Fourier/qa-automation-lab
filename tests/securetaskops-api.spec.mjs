import { expect, test } from "@playwright/test";
import { expectJson, expectOk } from "./support/contracts.mjs";

const allowWrites = process.env.QA_ALLOW_WRITES === "1";

test.describe("SecureTaskOps read-only API contracts", () => {
  test("dashboard returns the release-readiness interface", async ({ request }) => {
    const response = await request.get("/");
    await expectOk(response, "SecureTaskOps dashboard");
    const html = await response.text();
    expect(html).toContain("SecureTaskOps");
    expect(html).toContain("Release Signal");
  });

  test("health endpoint identifies the service", async ({ request }) => {
    const body = await expectJson(await request.get("/api/health"), "Health endpoint");
    expect(body).toEqual({
      status: "ok",
      service: "securetaskops-workflow-platform"
    });
  });

  test("task list returns explainable risk data", async ({ request }) => {
    const body = await expectJson(await request.get("/api/tasks"), "Task list");
    expect(body.count).toBe(body.data.length);
    expect(body.count).toBeGreaterThan(0);

    for (const item of body.data) {
      expect(item).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        owner: expect.any(String),
        status: expect.any(String),
        severity: expect.any(String),
        riskScore: expect.any(Number),
        riskReasons: expect.any(Array)
      });
      expect(item.riskScore).toBeGreaterThanOrEqual(0);
      expect(item.riskScore).toBeLessThanOrEqual(100);
      expect(item.riskReasons.length).toBeGreaterThan(0);
    }
  });

  for (const [filter, value] of [["severity", "high"], ["status", "blocked"]]) {
    test(`${filter} filter only returns ${value} items`, async ({ request }) => {
      const body = await expectJson(
        await request.get(`/api/tasks?${filter}=${value}`),
        `${filter} filter`
      );
      expect(body.data.every((item) => item[filter] === value)).toBeTruthy();
    });
  }

  test("release summary exposes internally consistent counts", async ({ request }) => {
    const body = await expectJson(await request.get("/api/release-readiness"), "Release summary");
    expect(body.data).toMatchObject({
      total: expect.any(Number),
      open: expect.any(Number),
      blocked: expect.any(Number),
      highRisk: expect.any(Number),
      securitySensitive: expect.any(Number),
      averageRisk: expect.any(Number),
      releaseStatus: expect.stringMatching(/^(ready_for_review|watch|needs_attention)$/)
    });
    expect(body.data.open).toBeLessThanOrEqual(body.data.total);
    expect(body.data.blocked).toBeLessThanOrEqual(body.data.open);
  });

  test("unknown API routes fail explicitly", async ({ request }) => {
    const response = await request.get("/api/not-a-route");
    expect(response.status()).toBe(404);
  });
});

test.describe("SecureTaskOps isolated write contracts", () => {
  test.skip(!allowWrites, "Writes are opt-in and disabled for shared live deployments.");

  test("task creation rejects missing title", async ({ request }) => {
    const response = await request.post("/api/tasks", {
      data: { owner: "QA reviewer", status: "todo", severity: "medium" }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toContain("title is required");
  });

  test("task creation rejects an unsupported severity", async ({ request }) => {
    const response = await request.post("/api/tasks", {
      data: { title: "Invalid fixture", owner: "QA reviewer", severity: "urgent" }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).message).toContain("severity must be one of");
  });

  test("task creation returns a risk-scored isolated item", async ({ request }, testInfo) => {
    const uniqueTitle = `QA contract ${testInfo.workerIndex}-${Date.now()}`;
    const dueDate = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
    const response = await request.post("/api/tasks", {
      data: {
        title: uniqueTitle,
        owner: "QA automation",
        status: "review",
        severity: "medium",
        securitySensitive: true,
        dueDate,
        tags: ["qa", "contract"]
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toMatchObject({
      title: uniqueTitle,
      owner: "QA automation",
      status: "review",
      severity: "medium",
      securitySensitive: true
    });
    expect(body.data.riskReasons.join(" ")).toContain("security-sensitive");
  });
});
