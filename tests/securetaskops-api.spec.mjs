import { expect, test } from "@playwright/test";

test.describe("SecureTaskOps API smoke and regression checks", () => {
  test("health endpoint returns service status", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      service: "securetaskops-workflow-platform"
    });
  });

  test("tasks endpoint returns seeded workflow items", async ({ request }) => {
    const response = await request.get("/api/tasks");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.count).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty("riskScore");
    expect(body.data[0]).toHaveProperty("riskReasons");
  });

  test("task filters return high severity items", async ({ request }) => {
    const response = await request.get("/api/tasks?severity=high");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data.every((item) => item.severity === "high")).toBeTruthy();
  });

  test("release readiness endpoint exposes review signal", async ({ request }) => {
    const response = await request.get("/api/release-readiness");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data).toHaveProperty("releaseStatus");
    expect(["ready_for_review", "watch", "needs_attention"]).toContain(body.data.releaseStatus);
  });

  test("task creation validates required title", async ({ request }) => {
    const response = await request.post("/api/tasks", {
      data: {
        owner: "QA reviewer",
        status: "todo",
        severity: "medium"
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain("title is required");
  });

  test("task creation accepts valid workflow item", async ({ request }) => {
    const response = await request.post("/api/tasks", {
      data: {
        title: "Verify QA automation smoke path",
        owner: "Uzair",
        status: "review",
        severity: "medium",
        securitySensitive: true,
        dueDate: "2026-07-10",
        tags: ["qa", "api"]
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toMatchObject({
      title: "Verify QA automation smoke path",
      owner: "Uzair",
      status: "review",
      severity: "medium",
      securitySensitive: true
    });
    expect(body.data.riskReasons.join(" ")).toContain("security-sensitive");
  });
});
