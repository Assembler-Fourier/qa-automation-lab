import { expect, test as base } from "@playwright/test";
import { PortfolioPage } from "../pages/portfolio.page.mjs";

export const defaultTargets = Object.freeze({
  portfolio: process.env.PORTFOLIO_URL || "https://uzairwaseem.com",
  roster: process.env.ROSTER_URL || "https://employee-roster-command.vercel.app",
  housefair: process.env.HOUSEFAIR_URL || "https://housemates-sand.vercel.app",
  theory: process.env.THEORY_URL || "https://irishtheorycoach.ie"
});

export const test = base.extend({
  targets: [defaultTargets, { scope: "worker", option: true }],

  monitoredPage: async ({ page }, use, testInfo) => {
    const browserErrors = [];

    page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
    });

    await use(page);

    if (browserErrors.length) {
      await testInfo.attach("browser-errors", {
        body: Buffer.from(browserErrors.join("\n")),
        contentType: "text/plain"
      });
    }
    expect(browserErrors, "The page emitted browser console or runtime errors").toEqual([]);
  },

  portfolioPage: async ({ monitoredPage, targets }, use) => {
    await use(new PortfolioPage(monitoredPage, targets.portfolio));
  }
});

export { expect };
