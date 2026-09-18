# Transcript submission rollout controls

All flags below are server deployment settings. Never accept them from request JSON, URL parameters, headers or browser storage.

Default installation:
- `TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED` is absent/false: public submissions return 503 before reading the request body or performing database/email work. `/request` shows an unavailable message.
- `TRANSCRIPT_DELIVERY_MODE` is absent/disabled: email and SFTP delivery remain off. Valid service API keys alone do not enable processing.

Controlled staging (synthetic records only):
- `TRANSCRIPT_ENVIRONMENT=staging`
- `TRANSCRIPT_DELIVERY_MODE=staging`
- `TRANSCRIPT_STAGING_EMAIL_SINK=<operator-owned single test inbox>`
- Set `TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED=true` only when intentionally testing the public form in the restricted staging environment.
- Use a dedicated staging database. Email delivery additionally requires its separately configured provider credential. Both student and school notifications go only to the configured sink; caller addresses never override it.
- SFTP is disabled in staging even if credentials are accidentally present. Saved public requests remain pending. External requests report transport failure, not simulated success. Health remains not-ready for real delivery. These results do not validate partner acceptance.

Eventual live activation, after launch gates:
- `TRANSCRIPT_ENVIRONMENT=production` and `TRANSCRIPT_DELIVERY_MODE=live` are both required before real recipient email or SFTP can occur.
- Public capability remains separately controlled by `TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED=true`. Do not enable it until authentication/ownership or the intended standalone abuse controls, rate limits, idempotency, consent, monitoring, retention and recovery have been verified.
- The external endpoint continues to require the existing service API key. This is not learner authentication or SSO; MFC must enforce the learner's authority before calling it.

Input safety:
- Both submission handlers require an application/json object and enforce 512 KiB while streaming; Content-Length alone is not trusted.
- Public signature data is limited to 256 KiB of PNG data URL, 2048 pixels per dimension and two million pixels total. Parsing the PNG header is a resource bound, not proof of signer identity.
- Email interpolation is HTML escaped. Request receipts never establish transcript delivery.
- MFC source hints are attribution only. Membership verification returns false until a trusted server verifier exists.

Regression tests execute the handlers with fake persistence/email and an isolated transport. No live provider calls are part of the test suite. This change does not enable any hosted setting or deliver a real notification.
