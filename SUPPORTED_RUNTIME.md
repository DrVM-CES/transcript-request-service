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

The post-upgrade production-only npm audit still reports 17 findings (11 high, 5 moderate, 1 low). The full audit reports 24. This upgrade is not a production-readiness declaration. Follow-up requires targeted dependency remediation and reachability review, including Drizzle, nested PostCSS, websocket and email dependency chains. Static schema identifiers and UUID v4 calls do not exercise the specific audited identifier-injection and UUID v3/v5/v6 paths, but this is not a blanket exemption for their dependencies.

## Independent review commands

1. Use a clean checkout and `npm ci --ignore-scripts` from the checked-in npm lockfile; do not commit generated node_modules or a second package-manager lockfile.
2. Run `npm test` (24 tests) and `npx tsc --noEmit --incremental false`.
3. Build with a local database URL, dummy MFC/email keys, empty Parchment configuration and telemetry disabled. Override every environment-file value before running `npm run build`; no hosted database or provider credentials are needed. Google Fonts is fetched during the build.
4. Inspect the pending-versus-processing receipt, neutral direct success page and request-only email templates. No success display constitutes partner delivery evidence.
5. Confirm health returns 503 for absent/unmigrated storage or missing transport configuration; public debug/test routes return 404. A healthy configuration does not establish partner connectivity.
6. Re-run both full and production-only npm audits. Keep remaining findings explicit and validate any later remediation separately.
