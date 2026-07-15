import { expect, test } from "@playwright/test";
import { defaultTargets } from "./fixtures/public-sites.fixture.mjs";
import { expectBaselineSecurityHeaders, expectHtmlDocument, expectOk } from "./support/contracts.mjs";

test.describe("live product release boundaries", () => {
  test("Roster Command protects the recruiter demo behind its login boundary", async ({ request }) => {
    const response = await request.get(`${defaultTargets.roster}/?demo=1`, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe("/login");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    expectBaselineSecurityHeaders(response, { requireCsp: true });
  });

  test("HouseFair public early-access page is available with defensive headers", async ({ request }) => {
    const response = await request.get(defaultTargets.housefair);
    await expectOk(response, "HouseFair homepage");
    expectBaselineSecurityHeaders(response, { requireCsp: true });

    const html = await response.text();
    expect(html).toContain("HouseFair");
    expect(html.toLowerCase()).toContain("house");
  });

  test("Theory Test Coach uses its custom domain and independent-product boundary", async ({ request }) => {
    const response = await request.get(defaultTargets.theory);
    await expectOk(response, "Theory Test Coach homepage");
    expectBaselineSecurityHeaders(response, { requireCsp: true });

    const html = await response.text();
    expectHtmlDocument(html, {
      title: "Irish Theory Test Coach",
      canonical: "https://irishtheorycoach.ie/"
    });
    expect(html.toLowerCase()).toContain("not affiliated with rsa or prometric");
  });
});
