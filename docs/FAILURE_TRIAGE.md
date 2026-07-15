# Failure Triage

## First Classification

| Signal | Likely owner | First check |
| --- | --- | --- |
| Local target never becomes healthy | Target app / CI | `target-app.log`, startup command, port 3000 |
| Local API assertion fails | API contract | Status/body in list output and trace |
| Mocked UI test fails | Frontend contract | Route payload, locator, screenshot, trace |
| Live smoke fails only | Deployment / network | Open health endpoint and inspect Vercel status |
| Portfolio API test fails | Content or metadata | Response HTML, sitemap, headers, CV route |
| Portfolio browser test fails | Rendering / accessibility | Screenshot, console attachment, axe nodes |

## Narrow Reproduction

```bash
npx playwright test tests/portfolio-ui.spec.mjs --headed
npx playwright test tests/portfolio-products.spec.mjs --grep "CV"
QA_BASE_URL=https://securetaskops-workflow-platform.vercel.app npm run test:securetaskops:read
```

## Evidence Order

1. Assertion message and HTTP status/body excerpt.
2. Playwright HTML report.
3. Trace timeline, network panel, and DOM snapshot.
4. Failure screenshot or video.
5. Target process log.
6. Deployment logs in the owning project.

Do not fix an external outage by weakening a product contract. Record the outage, confirm whether the deployment or assertion changed, and update the test only when the intended contract changed.
