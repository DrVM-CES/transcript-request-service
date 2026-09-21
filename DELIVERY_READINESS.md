# Transcript delivery readiness

This service requests official academic transcripts; it is not an audio transcription service.

Missing, partial, or invalid Parchment SFTP configuration now fails closed. No upload is simulated. A public form request may be saved as pending manual processing, but is not represented as delivered. An external API submission reports a transport failure. Repeated submission is not yet idempotent; do not automatically resubmit a failed request.

`GET /api/health` probes all required request-table columns with a zero-row query and validates transport configuration. It returns HTTP 503 when either is unavailable, omits exception/environment details, and disables caching. `sftpConnectivity: not_checked` is intentional: HTTP 200 is NOT proof of Parchment connectivity, provider acceptance, or transcript delivery. Those require a separate authorized synthetic partner test and completion reconciliation.

Run isolated tests with `npm test` (or `node --test tests/*.test.cjs`). Tests use synthetic configuration and a fake transport; no Next environment file, email, database, or partner service is loaded.

Before staging acceptance:
- Upgrade the outdated framework/runtime using supported versions.
- Verify exposed credential revocation in the provider dashboard; removing a literal does not revoke it or remove git history.
- Confirm staging database, notification sink, and partner test endpoint are isolated from real recipients and production records.
- Add request authentication/ownership, abuse protection, idempotency and durable retry/reconciliation.
- Verify consent evidence and the actual database schema; public and external submission contracts currently differ.
- Verify provider acceptance/delivery and retention/deletion behavior with synthetic records.

No deployment or real submission has been performed by this change.
