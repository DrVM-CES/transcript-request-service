-- This file would be too large to create manually
-- Instead, use one of these methods:

-- METHOD 1: Export from local SQLite
-- sqlite3 .data/transcript-requests.db ".dump schools" > schools-dump.sql

-- METHOD 2: Use the Python script to generate INSERT statements
-- python scripts/generate-schools-sql.py

-- METHOD 3: Or just tell me and I'll help you do it step by step

-- For now, here's a test query to verify schools table exists:
SELECT COUNT(*) FROM schools;
