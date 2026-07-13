import { expect, test } from "@playwright/test";

const targets = {
  portfolio: process.env.PORTFOLIO_URL || "https://uzairwaseem.com",
  roster: process.env.ROSTER_URL || "https://employee-roster-command.vercel.app",
  housefair: process.env.HOUSEFAIR_URL || "https://housemates-sand.vercel.app",
  theory:
    process.env.THEORY_URL ||
    "https://irish-theory-test-coach-assembler-fourier-job-work.vercel.app"
};

test.describe("portfolio release contract", () => {
  test("home page exposes a focused role and reviewable product proof", async ({ request }) => {
    const response = await request.get(targets.portfolio);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain("Full-stack engineer shipping tested products and backend systems.");
    expect(html).toContain("Roster Command");
    expect(html).toContain("HouseFair");
    expect(html).toContain("Irish Theory Test Coach");
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Person"');
  });

  test("SEO discovery routes and canonical CV remain available", async ({ request }) => {
    const [robots, sitemap, cv] = await Promise.all([
      request.get(`${targets.portfolio}/robots.txt`),
      request.get(`${targets.portfolio}/sitemap.xml`),
      request.get(`${targets.portfolio}/Uzair-Waseem-CV.pdf`)
    ]);

    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap: https://uzairwaseem.com/sitemap.xml");

    expect(sitemap.ok()).toBeTruthy();
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).toContain("/projects/roster-command");
    expect(sitemapXml).toContain("/projects/housefair");
    expect(sitemapXml).toContain("/projects/theory-test-coach");

    expect(cv.ok()).toBeTruthy();
    expect(cv.headers()["content-type"]).toContain("application/pdf");
  });

  for (const slug of ["roster-command", "housefair", "theory-test-coach"]) {
    test(`${slug} case study exposes ownership and verification`, async ({ request }) => {
      const response = await request.get(`${targets.portfolio}/projects/${slug}`);
      expect(response.ok()).toBeTruthy();

      const html = await response.text();
      expect(html).toContain("Context and ownership");
      expect(html).toContain("Verification and release boundary");
      expect(html).toContain("Tradeoffs and next work");
    });
  }
});

test.describe("live product boundaries", () => {
  test("Roster Command presents the protected login boundary", async ({ request }) => {
    const response = await request.get(`${targets.roster}/?demo=1`);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(response.url()).toContain("/login");
    expect(html).toContain("Roster Command");
    expect(html).toContain('<div id="root"></div>');
  });

  test("HouseFair public release identifies the product and early-access path", async ({ request }) => {
    const response = await request.get(targets.housefair);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain("HouseFair");
    expect(html.toLowerCase()).toContain("house");
  });

  test("Theory Test Coach exposes the independent-product disclaimer", async ({ request }) => {
    const response = await request.get(targets.theory);
    expect(response.ok()).toBeTruthy();

    const html = await response.text();
    expect(html).toContain("Irish Theory Test Coach");
    expect(html.toLowerCase()).toContain("not affiliated with rsa or prometric");
  });
});
