import { expect } from "@playwright/test";

export class PortfolioPage {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.heading = page.getByRole("heading", { level: 1 });
    this.cvLink = page.getByRole("link", { name: /download cv/i }).first();
    this.emailLink = page.getByRole("link", { name: /email me/i }).first();
  }

  async open() {
    await this.page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
    await expect(this.heading).toBeVisible();
  }

  async expectRecruiterPath() {
    await expect(this.heading).toContainText(/full-stack|software engineer/i);
    await expect(this.emailLink).toHaveAttribute("href", /^mailto:/);
    await expect(this.cvLink).toHaveAttribute("href", /\.pdf$/i);
    await expect(this.page.getByText("HouseFair", { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText("Roster Command", { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText("Irish Theory Test Coach", { exact: true }).first()).toBeVisible();
  }

  async expectNoHorizontalOverflow() {
    const metrics = await this.page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));

    expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport + 1);
  }
}
