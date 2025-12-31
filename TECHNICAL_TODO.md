# Technical TODOs

- [ ] Implement centralized `logger` service (defer)
  - Rationale: avoid scattering `console` usage; provide structured logs for prod/staging
  - Trigger: when project has staging/prod environments and observability decisions (Sentry/Datadog/Logflare)
  - Approach: add `src/services/logger.ts` with environment-based no-op in dev; wrap `console.*` or use external client

Note: do not implement now — track as a small chore when observability is planned.
