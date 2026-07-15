import { expect } from "@playwright/test";

export class SecureTaskOpsPage {
  constructor(page) {
    this.page = page;
    this.releaseStatus = page.locator("#releaseStatus");
    this.taskGrid = page.locator("#taskGrid");
    this.form = page.locator("#taskForm");
    this.formStatus = page.locator("#formStatus");
  }

  async open() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(this.page.getByRole("heading", { level: 1 })).toContainText("Track blockers");
  }

  async expectReady() {
    await expect(this.releaseStatus).not.toHaveText("Loading");
    await expect(this.taskGrid.locator(".task-card").first()).toBeVisible();
  }

  async filterBySeverity(severity) {
    await this.page.locator("#severityFilter").selectOption(severity);
  }

  async createTask({ title, owner }) {
    await this.form.getByLabel("Title").fill(title);
    await this.form.getByLabel("Owner").fill(owner);
    await this.form.getByRole("button", { name: "Create item" }).click();
  }
}
