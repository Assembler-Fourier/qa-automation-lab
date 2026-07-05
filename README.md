# QA Automation Lab

Playwright API testing proof repo for SecureTaskOps. This repository shows practical QA automation around API smoke checks, validation, filtering, release-readiness signals, and CI reporting.

> Honest status: this currently tests the existing SecureTaskOps API surface. Authentication, CRUD UI flows, role restrictions, and browser E2E tests will be added after SecureTaskOps grows those features.

## What Is Tested

- Service health check.
- Seeded task API response shape.
- Task filtering by severity.
- Release-readiness summary signal.
- Validation error handling.
- Valid task creation path.

## Tech Stack

- Playwright test runner.
- Playwright APIRequestContext.
- JavaScript modules.
- GitHub Actions.
- HTML test report artifacts.

## Local Setup

Start SecureTaskOps locally first:

```bash
git clone https://github.com/Assembler-Fourier/securetaskops-workflow-platform.git
cd securetaskops-workflow-platform
npm install
npm start
```

Then run this repo:

```bash
git clone https://github.com/Assembler-Fourier/qa-automation-lab.git
cd qa-automation-lab
npm install
npm run test:api
```

To point tests at a different target:

```bash
QA_BASE_URL=http://127.0.0.1:3000 npm run test:api
```

## CI

The GitHub Actions workflow checks out this repo, checks out SecureTaskOps as the target app, starts the target API, runs the Playwright API suite, and uploads the HTML report.

## Current Coverage

- API smoke checks.
- API response shape checks.
- Validation behavior.
- Release readiness behavior.
- Filtering behavior.

## Planned Coverage

- Authentication flow.
- Invalid login.
- Project CRUD.
- Task CRUD.
- Role-based restrictions.
- API validation across all protected endpoints.
- Browser smoke tests.
- Accessibility smoke checks.
- Dashboard load checks.

## Known Limitations

- SecureTaskOps does not yet have authentication, role-based access, PostgreSQL persistence, or a frontend dashboard.
- This repo is intentionally scoped to the current API until those features exist.
- No fake coverage percentage is claimed.

## What This Demonstrates

- QA automation strategy.
- Playwright API testing.
- CI test execution.
- Validation and regression checks.
- Honest roadmap linking tests to real app capability.
