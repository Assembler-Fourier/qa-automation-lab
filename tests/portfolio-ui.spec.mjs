import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures/public-sites.fixture.mjs";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("portfolio recruiter journey", () => {
  test("mobile page exposes the primary contact and proof path without overflow", async ({ portfolioPage }) => {
    await portfolioPage.open();
    await portfolioPage.expectRecruiterPath();
    await portfolioPage.expectNoHorizontalOverflow();
  });

  test("external profile links are labelled and open safely", async ({ monitoredPage, targets }) => {
    await monitoredPage.goto(targets.portfolio, { waitUntil: "domcontentloaded" });

    const github = monitoredPage.locator('a[href="https://github.com/Assembler-Fourier"]').first();
    const linkedin = monitoredPage.locator('a[href*="linkedin.com/in/uzair-waseem"]').first();

    await expect(github).toBeVisible();
    await expect(linkedin).toBeVisible();
    await expect(github).toHaveAttribute("rel", /noopener|noreferrer/);
    await expect(linkedin).toHaveAttribute("rel", /noopener|noreferrer/);
  });

  test("main recruiter content has no critical automated accessibility violations", async ({ monitoredPage, targets }) => {
    await monitoredPage.goto(targets.portfolio, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page: monitoredPage })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const critical = results.violations.filter((violation) => violation.impact === "critical");

    expect(critical).toEqual([]);
  });
});
