-- Issue #3: additive, staging-only ledger. Back up the service DB before apply.
-- No legacy transcript_requests rows are copied, changed or reinterpreted.
BEGIN;
CREATE TABLE parchment_int_orders (
  external_order_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  mfc_order_id TEXT NOT NULL,
  request_digest TEXT NOT NULL CHECK(length(request_digest)=64),
  release_reference TEXT NOT NULL,
  sender_code TEXT NOT NULL,
  product_code TEXT NOT NULL,
  dispatch_state TEXT NOT NULL DEFAULT 'prepared' CHECK(dispatch_state IN ('prepared','unknown','accepted')),
  claim_id TEXT UNIQUE,
  document_id TEXT,
  created_at TEXT NOT NULL,
  claimed_at TEXT,
  accepted_at TEXT,
  reconciliation_required INTEGER NOT NULL DEFAULT 0 CHECK(reconciliation_required IN (0,1)),
  UNIQUE(owner_id,mfc_order_id)
);
CREATE TABLE parchment_int_receipts (
  payload_digest TEXT PRIMARY KEY CHECK(length(payload_digest)=64),
  external_order_id TEXT NOT NULL REFERENCES parchment_int_orders(external_order_id),
  document_id TEXT NOT NULL,
  event_time TEXT NOT NULL,
  provider_status TEXT NOT NULL CHECK(provider_status IN ('PENDING','APPROVED','ERROR','AVAILABLE','DELIVERED','COMPLETE','CANCELLED')),
  received_at TEXT NOT NULL
);
CREATE INDEX parchment_int_receipts_order ON parchment_int_receipts(external_order_id);
COMMIT;
