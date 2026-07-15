import { expect, test } from "@playwright/test";
import { defaultTargets } from "./fixtures/public-sites.fixture.mjs";
import {
  expectBaselineSecurityHeaders,
  expectHtmlDocument,
  expectOk,
  expectPdf,
  parseJsonLd
} from "./support/contracts.mjs";

const caseStudies = [
  { slug: "housefair", name: "HouseFair" },
  { slug: "roster-command", name: "Roster Command" },
  { slug: "theory-test-coach", name: "Irish Theory Test Coach" }
];

test.describe("portfolio release contract", () => {
  test("homepage exposes focused software-engineering evidence", async ({ request }) => {
    const response = await request.get(defaultTargets.portfolio);
    await expectOk(response, "Portfolio homepage");
    expect(response.headers()["content-type"]).toContain("text/html");

    const html = await response.text();
    expectHtmlDocument(html, {
      title: "Uzair Waseem",
      canonical: "https://uzairwaseem.com"
    });
    expect(html).toMatch(/Full-Stack Software Engineer|Software Engineer/i);
    for (const project of caseStudies) expect(html).toContain(project.name);

    const schemas = parseJsonLd(html);
    const person = schemas.find((item) => item?.["@type"] === "Person");
    expect(person).toMatchObject({
      name: "Uzair Waseem",
      url: "https://uzairwaseem.com"
    });
    expect(person?.sameAs).toEqual(
      expect.arrayContaining([
        expect.stringContaining("linkedin.com/in/uzair-waseem"),
        expect.stringContaining("github.com/Assembler-Fourier")
      ])
    );

    expect(html).not.toContain('"birthDate"');
    expect(html).not.toContain('"telephone"');
  });

  test("homepage returns a baseline set of browser security headers", async ({ request }) => {
    const response = await request.get(defaultTargets.portfolio);
    await expectOk(response, "Portfolio homepage");
    expectBaselineSecurityHeaders(response);
  });

  test("SEO discovery files and canonical CV remain available", async ({ request }) => {
    const [robots, sitemap, cv] = await Promise.all([
      request.get(`${defaultTargets.portfolio}/robots.txt`),
      request.get(`${defaultTargets.portfolio}/sitemap.xml`),
      request.get(`${defaultTargets.portfolio}/Uzair-Waseem-CV.pdf`)
    ]);

    await expectOk(robots, "robots.txt");
    expect(await robots.text()).toContain("Sitemap: https://uzairwaseem.com/sitemap.xml");

    await expectOk(sitemap, "sitemap.xml");
    const sitemapXml = await sitemap.text();
    for (const project of caseStudies) expect(sitemapXml).toContain(`/projects/${project.slug}`);

    await expectPdf(cv, "Software engineering CV");
  });

  for (const project of caseStudies) {
    test(`${project.name} case study exposes ownership and verification`, async ({ request }) => {
      const response = await request.get(`${defaultTargets.portfolio}/projects/${project.slug}`);
      await expectOk(response, `${project.name} case study`);

      const html = await response.text();
      expect(html).toContain(project.name);
      expect(html).toContain("Context and ownership");
      expect(html).toContain("Verification and release boundary");
      expect(html).toContain("Tradeoffs and next work");
    });
  }

  test("unknown routes return a real 404", async ({ request }) => {
    const response = await request.get(`${defaultTargets.portfolio}/this-route-must-not-exist`, {
      maxRedirects: 0
    });
    expect(response.status()).toBe(404);
  });
});
