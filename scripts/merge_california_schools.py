"""
Merge all California schools data into single CSV for loading into database

Combines:
- Higher education (UC, CSU, private universities, community colleges, trade schools)
- High schools

Output: california_schools_complete.csv (ready for loading into Turso)
"""

import csv
import os

def read_csv_file(filename):
    """Read CSV file and return rows"""
    filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
    schools = []
    
    if not os.path.exists(filepath):
        print(f"⚠ File not found: {filepath}")
        return schools
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            schools.append(row)
    
    return schools

def write_merged_csv(schools, output_file):
    """Write merged schools to CSV"""
    fieldnames = ['School Name', 'Type', 'City', 'State', 'Country', 'Address', 'ZIP', 'Phone', 'CEEB Code', 'Federal School Code', 'Website', 'Notes']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for school in schools:
            writer.writerow(school)

def main():
    """Main function to merge all California schools"""
    
    print("Merging California Schools Database...")
    print("=" * 60)
    
    # Read all CSV files
    higher_ed = read_csv_file('california_schools_higher_ed.csv')
    high_schools = read_csv_file('california_high_schools.csv')
    
    print(f"\n✓ Higher Education: {len(higher_ed)} schools")
    print(f"✓ High Schools: {len(high_schools)} schools")
    
    # Combine all
    all_schools = []
    all_schools.extend(higher_ed)
    all_schools.extend(high_schools)
    
    # Sort by name
    all_schools.sort(key=lambda x: x.get('School Name', ''))
    
    print(f"\nTotal California Schools: {len(all_schools)}")
    
    # Count by type
    types = {}
    for school in all_schools:
        school_type = school.get('Type', 'Unknown')
        types[school_type] = types.get(school_type, 0) + 1
    
    print("\nBreakdown by Type:")
    for school_type, count in sorted(types.items()):
        print(f"  {school_type}: {count}")
    
    # Write merged file
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'california_schools_complete.csv')
    write_merged_csv(all_schools, output_file)
    
    print(f"\n✓ Merged file written to: {output_file}")
    print("\n" + "=" * 60)
    print("READY TO LOAD!")
    print("Run: node scripts/load-schools-batch.js california_schools_complete.csv")
    print("=" * 60)

if __name__ == '__main__':
    main()
