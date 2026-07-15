import { expect } from "@playwright/test";

export async function expectOk(response, label) {
  const status = response.status();
  const body = status >= 400 ? (await response.text()).slice(0, 400) : "";
  expect(response.ok(), `${label} returned ${status}${body ? `: ${body}` : ""}`).toBeTruthy();
}

export async function expectJson(response, label) {
  await expectOk(response, label);
  expect(response.headers()["content-type"], `${label} should return JSON`).toContain("application/json");
  return response.json();
}

export function expectHtmlDocument(html, { title, canonical }) {
  expect(html).toMatch(/<!doctype html>/i);
  expect(html).toMatch(new RegExp(`<title>[^<]*${escapeRegExp(title)}[^<]*<\\/title>`, "i"));
  expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
}

export function expectBaselineSecurityHeaders(response, { requireCsp = false } = {}) {
  const headers = response.headers();
  expect(headers["strict-transport-security"]).toBeTruthy();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBeTruthy();

  if (requireCsp) {
    expect(headers["content-security-policy"]).toContain("frame-ancestors");
  } else {
    expect(
      Boolean(headers["x-frame-options"] || headers["content-security-policy"]),
      "Expected clickjacking protection through X-Frame-Options or CSP"
    ).toBeTruthy();
  }
}

export function parseJsonLd(html) {
  return Array.from(html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi))
    .flatMap((match) => {
      try {
        const value = JSON.parse(match[1]);
        return Array.isArray(value) ? value : [value];
      } catch {
        return [];
      }
    });
}

export async function expectPdf(response, label) {
  await expectOk(response, label);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  const bytes = await response.body();
  expect(bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  expect(bytes.length, `${label} should not be an empty placeholder`).toBeGreaterThan(3_000);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
