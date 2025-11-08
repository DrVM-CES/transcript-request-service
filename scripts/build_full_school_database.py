#!/usr/bin/env python3
"""
School Database Builder
Downloads and processes Federal School Codes and K-12 CEEB codes
into a comprehensive searchable database.
"""

import pandas as pd
import requests
import argparse
import sys
import os
from pathlib import Path

# Federal School Code List URL (US Dept of Education)
FEDERAL_SCHOOL_CODE_URL = "https://studentaid.gov/sites/default/files/fsawg/datacenter/library/SchoolCodeList.xlsx"

def download_federal_codes(output_csv):
    """Download and parse Federal School Code List from US Dept of Education"""
    print("📥 Downloading Federal School Code List from US Department of Education...")
    print(f"   URL: {FEDERAL_SCHOOL_CODE_URL}")
    
    try:
        # Download the Excel file
        response = requests.get(FEDERAL_SCHOOL_CODE_URL, timeout=30)
        response.raise_for_status()
        
        # Save temporarily
        temp_file = "temp_federal_codes.xlsx"
        with open(temp_file, 'wb') as f:
            f.write(response.content)
        
        print("✅ Download complete. Parsing Excel file...")
        
        # Read Excel file
        df = pd.read_excel(temp_file, sheet_name=0)
        
        # Clean up temp file
        os.remove(temp_file)
        
        print(f"📊 Found {len(df)} institutions in Federal School Code List")
        
        # Map columns to our schema
        # Typical columns: School Code, School Name, Address, City, State, Zip, Country
        schools = []
        
        for _, row in df.iterrows():
            school = {
                'School Name': row.get('School Name', row.get('SchoolName', '')),
                'Type': 'University',  # Federal codes are for postsecondary
                'City': row.get('City', ''),
                'State': row.get('State', ''),
                'Country': row.get('Country', 'USA'),
                'CEEB Code': '',  # Will be added if available
                'Federal School Code': str(row.get('School Code', row.get('SchoolCode', ''))),
                'Website': '',  # Not in federal list
                'Notes': 'Federal Title IV Institution'
            }
            schools.append(school)
        
        # Create DataFrame
        result_df = pd.DataFrame(schools)
        
        # Remove duplicates
        result_df = result_df.drop_duplicates(subset=['School Name', 'City', 'State'])
        
        # Sort by state, then name
        result_df = result_df.sort_values(['State', 'School Name'])
        
        # Write to CSV
        result_df.to_csv(output_csv, index=False)
        
        print(f"✅ Wrote {len(result_df)} schools to {output_csv}")
        print(f"📍 States covered: {result_df['State'].nunique()}")
        
        return True
        
    except requests.RequestException as e:
        print(f"❌ Error downloading federal codes: {e}")
        print("   The URL might have changed. Please check:")
        print("   https://studentaid.gov/data-center/school/federal-school-codes")
        return False
    except Exception as e:
        print(f"❌ Error processing federal codes: {e}")
        return False

def append_k12_data(k12_csv_path, output_csv):
    """Append K-12 CEEB data to existing school database"""
    print(f"📥 Loading K-12 data from {k12_csv_path}...")
    
    try:
        # Read existing data
        existing_df = pd.read_csv(output_csv)
        print(f"   Existing schools: {len(existing_df)}")
        
        # Read K-12 data
        k12_df = pd.read_csv(k12_csv_path)
        print(f"   K-12 schools to add: {len(k12_df)}")
        
        # Map K-12 columns to our schema
        k12_schools = []
        
        for _, row in k12_df.iterrows():
            school = {
                'School Name': row.get('School Name', row.get('Name', '')),
                'Type': 'High School',
                'City': row.get('City', ''),
                'State': row.get('State', ''),
                'Country': 'USA',
                'CEEB Code': str(row.get('CEEB Code', row.get('CEEB', ''))),
                'Federal School Code': '',
                'Website': row.get('Website', ''),
                'Notes': 'K-12 Institution'
            }
            k12_schools.append(school)
        
        # Create DataFrame
        k12_result_df = pd.DataFrame(k12_schools)
        
        # Combine with existing
        combined_df = pd.concat([existing_df, k12_result_df], ignore_index=True)
        
        # Remove duplicates
        combined_df = combined_df.drop_duplicates(subset=['School Name', 'City', 'State'])
        
        # Sort
        combined_df = combined_df.sort_values(['State', 'School Name'])
        
        # Write back
        combined_df.to_csv(output_csv, index=False)
        
        print(f"✅ Updated database with K-12 schools")
        print(f"   Total schools: {len(combined_df)}")
        print(f"   High Schools: {len(combined_df[combined_df['Type'] == 'High School'])}")
        print(f"   Colleges/Universities: {len(combined_df[combined_df['Type'] == 'University'])}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ File not found: {k12_csv_path}")
        return False
    except Exception as e:
        print(f"❌ Error appending K-12 data: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Build comprehensive school database with CEEB and Federal codes',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download federal school codes
  python build_full_school_database.py --federal yes
  
  # Append K-12 CEEB codes
  python build_full_school_database.py --k12 california_schools.csv
  
  # Do both
  python build_full_school_database.py --federal yes --k12 california_schools.csv
        """
    )
    
    parser.add_argument('--federal', choices=['yes', 'no'], 
                       help='Download and process federal school codes')
    parser.add_argument('--k12', metavar='CSV_PATH',
                       help='Path to K-12 CEEB CSV to append')
    
    args = parser.parse_args()
    
    # Determine output path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'data'
    data_dir.mkdir(exist_ok=True)
    
    output_csv = data_dir / 'us_schools_ceeb_and_federal_codes_template.csv'
    
    print("🏫 School Database Builder")
    print("=" * 60)
    print(f"Output file: {output_csv}")
    print()
    
    success = True
    
    # Download federal codes if requested
    if args.federal == 'yes':
        if not download_federal_codes(output_csv):
            success = False
    
    # Append K-12 data if provided
    if args.k12:
        if not append_k12_data(args.k12, output_csv):
            success = False
    
    if not args.federal and not args.k12:
        parser.print_help()
        print("\n⚠️  No action specified. Use --federal yes or --k12 <path>")
        return 1
    
    if success:
        print("\n✅ School database build complete!")
        print(f"📁 Output: {output_csv}")
        print("\nNext steps:")
        print("  1. Review the CSV file")
        print("  2. Load into database: python scripts/load_schools_to_db.py")
        print("  3. Test search API: curl http://localhost:3000/api/schools/search?q=stanford")
        return 0
    else:
        print("\n❌ Build completed with errors. Check messages above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
