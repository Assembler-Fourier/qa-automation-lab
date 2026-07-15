# Test Strategy

## Risk Model

The suite prioritises failures that would damage a public hiring profile or a small product release:

1. A flagship link, CV, deployment, or canonical URL disappears.
2. Public positioning drifts away from repository evidence.
3. A protected route becomes indexable or loses defensive headers.
4. An API changes its validation or response contract.
5. A workflow dashboard cannot render, filter, or submit its API contract.
6. A critical accessibility error blocks the main journey.

## Test Levels

- **Smoke:** service availability, product identity, health, CV and critical routes.
- **Contract:** HTTP status, headers, JSON fields, invariants, metadata and release boundaries.
- **Regression:** filtering, validation, risk-score limits, mocked dashboard rendering and form submission.
- **End-to-end boundary:** mobile recruiter path from landing content to contact, CV and project proof. This does not claim to cover private product workflows.

## Isolation

- Public and live checks are read-only.
- Write tests require `QA_ALLOW_WRITES=1` and use unique data against a fresh local process.
- UI regression tests mock API responses with deterministic fixtures.
- Dynamic dates prevent fixtures from becoming overdue merely because time passed.

## Selectors

Prefer accessible role and label locators. Use IDs only for application-owned, semantically stable controls such as `releaseStatus` and `severityFilter`. Avoid nth-child, generated class names, and text that is purely marketing copy.

## Flake Controls

- Wait on health or an observable request, never a fixed timeout.
- Retry once in CI only.
- Use two CI workers and fully parallel tests where state permits.
- Keep shared live checks read-only.
- Retain failure traces and response snippets.
- Separate local target failures from external deployment failures.

## Accessibility

axe-core scans WCAG A/AA rules and fails critical violations. Manual keyboard, screen-reader, 200% zoom, reduced-motion, and visual contrast review remain product-owner responsibilities.

## Authentication

No public target currently provides a dedicated non-production test identity. Authentication-state reuse is therefore out of scope rather than simulated. When a safe test environment exists, add a setup project that signs in once, stores encrypted/ephemeral `storageState`, and never uploads that state as an artifact.
