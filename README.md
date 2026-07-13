# QA Automation Lab

[![QA Automation Lab](https://github.com/Assembler-Fourier/qa-automation-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/Assembler-Fourier/qa-automation-lab/actions/workflows/ci.yml)

Playwright-based verification for a small portfolio of deployed products. The suite treats public pages, APIs, search metadata, downloadable artifacts, and release boundaries as contracts that should fail loudly when they drift.

## What This Demonstrates

- API smoke and regression testing with Playwright `APIRequestContext`.
- Local-target testing against a checked-out service in GitHub Actions.
- Live deployment checks without depending on private credentials.
- SEO, sitemap, robots, JSON-LD, PDF, and case-study contract testing.
- Honest boundary checks for authenticated, early-access, and pre-launch products.
- HTML reports uploaded for every CI path, including failures.

## Test Matrix

| Target | Contract under test | Current coverage |
| --- | --- | --- |
| [Engineering portfolio](https://uzairwaseem.com) | Recruiter message, product proof, JSON-LD, robots, sitemap, CV, case studies | 5 release-contract checks |
| [Roster Command](https://employee-roster-command.vercel.app/?demo=1) | Protected login and server-session boundary | Public boundary smoke check |
| [HouseFair](https://housemates-sand.vercel.app) | Public product and early-access availability | Deployment smoke check |
| [Irish Theory Test Coach](https://irish-theory-test-coach-assembler-fourier-job-work.vercel.app) | Independent-product disclaimer and release availability | Deployment and legal-boundary smoke check |
| [SecureTaskOps](https://securetaskops-workflow-platform.vercel.app) | Health, seeded workflow data, filtering, validation, risk scoring, creation | 7 API and dashboard checks |

## CI Design

The workflow runs three independent jobs:

1. **Local SecureTaskOps target** checks out the application, starts it, waits for health, and executes the API suite.
2. **Live SecureTaskOps smoke** runs the same checks against the deployed service.
3. **Portfolio and product contracts** verifies the portfolio, CV, search routes, case studies, and public release boundaries across the flagship products.

Separating the jobs keeps a third-party deployment failure from hiding a local service regression and makes the report artifact useful during triage.

## Run Locally

```bash
npm ci
npm run test:portfolio
```

To run SecureTaskOps checks against its deployed environment:

```bash
QA_BASE_URL=https://securetaskops-workflow-platform.vercel.app npm run test:securetaskops
```

Every product URL can be replaced without editing the suite:

```bash
PORTFOLIO_URL=http://localhost:3000 npm run test:portfolio
```

Supported variables: `PORTFOLIO_URL`, `ROSTER_URL`, `HOUSEFAIR_URL`, `THEORY_URL`, and `QA_BASE_URL`.

## Current Limits

- Public-product checks intentionally avoid private accounts and operational data.
- Browser interaction suites remain inside the owning product repositories, where fixtures and environment setup can be controlled safely.
- These tests verify release contracts and critical smoke paths; they are not a substitute for exploratory testing, accessibility review, performance testing, or product-specific unit coverage.
