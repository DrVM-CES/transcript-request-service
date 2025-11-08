# School Database Builder - Instructions

## Overview

This script builds a comprehensive school database with CEEB codes and Federal School Codes for use in the transcript request system.

## What It Does

1. **Downloads Federal School Code List** from US Department of Education
2. **Parses postsecondary institutions:**
   - Colleges
   - Universities  
   - Community colleges
   - Trade/technical schools
3. **Outputs CSV with fields:**
   - School Name
   - Type (High School, College, University, etc.)
   - City
   - State
   - Country
   - CEEB Code
   - Federal School Code (if applicable)
   - Website
   - Notes

4. **Optionally appends K-12 CEEB data** from College Board exports

## Prerequisites

Install required Python packages:

```bash
pip install pandas openpyxl requests
```

Or with uv (faster):

```bash
uv pip install pandas openpyxl requests
```

## Usage

### Step 1: Build Postsecondary Database

Download and process all colleges/universities with Federal School Codes:

```bash
python scripts/build_full_school_database.py --federal yes
```

This will:
- Download the latest Federal School Code List (Excel file)
- Parse all postsecondary institutions
- Write to `data/us_schools_ceeb_and_federal_codes_template.csv`

### Step 2 (Optional): Add K-12 Schools

If you have a CSV export from College Board or other source with K-12 CEEB codes:

```bash
python scripts/build_full_school_database.py --k12 path/to/k12_ceeb_export.csv
```

Expected K-12 CSV format:
```csv
School Name,CEEB Code,City,State,Address,Website
Example High School,123456,Los Angeles,CA,123 Main St,https://example.edu
```

## Output

**File:** `data/us_schools_ceeb_and_federal_codes_template.csv`

**Format:**
```csv
School Name,Type,City,State,Country,CEEB Code,Federal School Code,Website,Notes
Harvard University,University,Cambridge,MA,USA,002155,002155,https://harvard.edu,
UCLA,University,Los Angeles,CA,USA,004837,001315,https://ucla.edu,
Lincoln High School,High School,Portland,OR,USA,382100,,https://lincolnhs.org,
```

## Data Sources

### Federal School Codes
- **Source:** US Department of Education Federal Student Aid
- **URL:** https://studentaid.gov/data-center/school/federal-school-codes
- **Coverage:** All Title IV participating institutions (colleges, universities, trade schools)
- **Updated:** Quarterly

### CEEB Codes (K-12)
- **Source:** College Board
- **Manual Export:** Required for K-12 schools
- **Coverage:** High schools that send students to college
- **Format:** Can be exported from College Board's database

## Usage in Application

Once the CSV is built, it will be:

1. **Loaded into database** on application start
2. **Indexed for fast search** by name, city, state, CEEB code
3. **Used for autocomplete** in the transcript request form
4. **Auto-fills** school details when selected

## Starter K-12 Dataset

If you need a starter K-12 dataset for specific states or districts, we can generate it. Just specify:
- State(s): e.g., California, Texas, Florida
- Districts: e.g., Los Angeles Unified, Chicago Public Schools
- Regions: e.g., Bay Area, Southern California

## Next Steps

After building the database:

1. Load CSV into SQLite/Turso database table
2. Create search API endpoint
3. Build autocomplete UI component
4. Update form steps to use autocomplete

## Maintenance

### Updating Federal Codes
Re-run the script quarterly to get latest federal school codes:

```bash
python scripts/build_full_school_database.py --federal yes
```

### Adding More K-12 Schools
Export from College Board and append:

```bash
python scripts/build_full_school_database.py --k12 new_schools.csv
```

## Database Schema

Once loaded into the database:

```sql
CREATE TABLE schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT, -- 'High School', 'University', 'College', 'Community College', 'Trade School'
  city TEXT,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  ceeb_code TEXT,
  federal_code TEXT,
  website TEXT,
  notes TEXT,
  search_text TEXT GENERATED -- For full-text search
);

CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_ceeb ON schools(ceeb_code);
CREATE INDEX idx_schools_state ON schools(state);
```

## Questions?

Contact the development team or see the main project documentation.
