# Supported runtime upgrade

The transcript app moves from Next 14.2.5 / React 18 to Next 15.5.24 / React 19.3.0. Next 14 is outside the supported LTS lines. Next 15.5.24 includes the August 2026 security release; React 19.3.0 is the September 9 stable release.

References:
- https://nextjs.org/support-policy
- https://nextjs.org/blog/august-2026-security-release
- https://nextjs.org/docs/app/guides/upgrading/version-15
- https://react.dev/blog/2026/09/09/react-19-3

Migration changes:
- Await the dynamic status-route parameters required by Next 15.
- Use the supported `serverExternalPackages` configuration name.
- Update React and Node TypeScript definitions; keep build typechecking enabled.
- Set the Netlify runtime target to Node 22, with local Node 22–24 permitted.
- Remove unused Better Auth, canvg and DOMPurify direct dependencies. Repository searches found no runtime imports; this does not implement authentication.

Acceptance requires the updated npm lockfile, a clean lockfile install, isolated tests, typechecking and a production build using local/synthetic configuration. Never use live provider credentials for these checks. This source upgrade does not change a hosted deployment.

## Remaining security work

The final paired upgrade pins Drizzle ORM to 0.45.2 and @libsql/client to 0.10.0, satisfying Drizzle's client peer requirement. Next's scoped PostCSS override resolves to 8.5.28; Kysely resolves to 0.28.17. UUID generation now uses Node's built-in randomUUID, and the uuid dependencies have been removed.

Validation on the updated lockfile: all 40 tests pass, the production build passes with synthetic/local configuration, and the subsequent TypeScript check passes. Production-only npm audit reports zero findings. The full audit still reports seven development dependency findings (two high, five moderate); these require separate remediation. Audit results describe the checked dependency graph, not complete application security or launch readiness.

The database compatibility test uses only an in-memory database, exercises insert/select/update and timestamp/boolean/null mapping, and applies the three SQL literals from the existing signature migration without executing its environment-loading script. No live database, hosted migrations or migration-runner changes were involved. The existing drizzle-kit generation/migration tooling has not been separately validated against the upgraded ORM; do not infer migration-tool compatibility from runtime CRUD tests.

## Independent review commands

1. Use a clean checkout and `npm ci --ignore-scripts` from the checked-in npm lockfile; do not commit generated node_modules or a second package-manager lockfile.
2. Run `npm test` (40 tests, including local database compatibility) and `npx tsc --noEmit --incremental false`.
3. Build with a local database URL, dummy MFC/email keys, empty Parchment configuration and telemetry disabled. Override every environment-file value before running `npm run build`; no hosted database or provider credentials are needed. Google Fonts is fetched during the build.
4. Inspect the pending-versus-processing receipt, neutral direct success page and request-only email templates. No success display constitutes partner delivery evidence.
5. Confirm health returns 503 for absent/unmigrated storage or missing transport configuration; public debug/test routes return 404. A healthy configuration does not establish partner connectivity.
6. Re-run both full and production-only npm audits. Keep remaining findings explicit and validate any later remediation separately.
