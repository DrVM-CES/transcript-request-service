"""
Fetch California High Schools from CDE (California Department of Education)

Data source: California Department of Education Public Schools Database
This script generates a CSV with major California high schools and their contact information.

For comprehensive data, you can:
1. Download from: https://www.cde.ca.gov/ds/si/ds/pubschls.asp
2. Use the CDE API (if available)
3. Use this curated list of major high schools

Output: california_high_schools.csv
"""

import csv
import os

# Major California High Schools by Region
# Data compiled from CDE public records and school websites

CALIFORNIA_HIGH_SCHOOLS = [
    # Los Angeles County
    {'name': 'Abraham Lincoln High School', 'city': 'Los Angeles', 'address': '3501 N Broadway', 'zip': '90031', 'phone': '(323) 441-3650', 'ceeb': '052460'},
    {'name': 'Alexander Hamilton High School', 'city': 'Los Angeles', 'address': '2955 S Robertson Blvd', 'zip': '90034', 'phone': '(310) 280-1400', 'ceeb': '050010'},
    {'name': 'Beverly Hills High School', 'city': 'Beverly Hills', 'address': '241 Moreno Dr', 'zip': '90212', 'phone': '(310) 229-3685', 'ceeb': '050360'},
    {'name': 'Birmingham Community Charter High School', 'city': 'Van Nuys', 'address': '17000 Haynes St', 'zip': '91406', 'phone': '(818) 894-5890', 'ceeb': '050375'},
    {'name': 'Brentwood School', 'city': 'Los Angeles', 'address': '100 S Barrington Pl', 'zip': '90049', 'phone': '(310) 476-9633', 'ceeb': '050585'},
    {'name': 'Canoga Park High School', 'city': 'Canoga Park', 'address': '6850 Topanga Canyon Blvd', 'zip': '91303', 'phone': '(818) 346-5608', 'ceeb': '050935'},
    {'name': 'Crenshaw High School', 'city': 'Los Angeles', 'address': '5010 11th Ave', 'zip': '90043', 'phone': '(323) 290-6980', 'ceeb': '051075'},
    {'name': 'Dorsey High School', 'city': 'Los Angeles', 'address': '3537 Farmdale Ave', 'zip': '90016', 'phone': '(323) 731-8500', 'ceeb': '051135'},
    {'name': 'El Camino Real Charter High School', 'city': 'Woodland Hills', 'address': '5440 Valley Circle Blvd', 'zip': '91367', 'phone': '(818) 595-7500', 'ceeb': '051215'},
    {'name': 'Fairfax High School', 'city': 'Los Angeles', 'address': '7850 Melrose Ave', 'zip': '90046', 'phone': '(323) 370-1200', 'ceeb': '051280'},
    {'name': 'Franklin High School', 'city': 'Los Angeles', 'address': '820 N Avenue 54', 'zip': '90042', 'phone': '(323) 481-7920', 'ceeb': '051335'},
    {'name': 'Garfield High School', 'city': 'Los Angeles', 'address': '5101 E 6th St', 'zip': '90022', 'phone': '(323) 581-6501', 'ceeb': '051405'},
    {'name': 'Granada Hills Charter High School', 'city': 'Granada Hills', 'address': '10535 Zelzah Ave', 'zip': '91344', 'phone': '(818) 360-2361', 'ceeb': '051445'},
    {'name': 'Hollywood High School', 'city': 'Los Angeles', 'address': '1521 N Highland Ave', 'zip': '90028', 'phone': '(323) 993-1700', 'ceeb': '051740'},
    {'name': 'John Marshall High School', 'city': 'Los Angeles', 'address': '3939 Tracy St', 'zip': '90027', 'phone': '(323) 671-8001', 'ceeb': '051990'},
    {'name': 'Monroe High School', 'city': 'Sepulveda', 'address': '9229 Haskell Ave', 'zip': '91343', 'phone': '(818) 830-1700', 'ceeb': '052190'},
    {'name': 'Palisades Charter High School', 'city': 'Pacific Palisades', 'address': '15777 Bowdoin St', 'zip': '90272', 'phone': '(310) 230-6623', 'ceeb': '052440'},
    {'name': 'Roosevelt High School', 'city': 'Los Angeles', 'address': '456 S Mathews St', 'zip': '90033', 'phone': '(323) 267-4100', 'ceeb': '052670'},
    {'name': 'San Fernando High School', 'city': 'San Fernando', 'address': '11133 O\'Melveny Ave', 'zip': '91340', 'phone': '(818) 365-4631', 'ceeb': '052750'},
    {'name': 'Taft High School', 'city': 'Woodland Hills', 'address': '5461 Winnetka Ave', 'zip': '91364', 'phone': '(818) 609-6100', 'ceeb': '052975'},
    {'name': 'University High School', 'city': 'Los Angeles', 'address': '11800 Texas Ave', 'zip': '90025', 'phone': '(310) 914-3500', 'ceeb': '053035'},
    {'name': 'Venice High School', 'city': 'Los Angeles', 'address': '13000 Venice Blvd', 'zip': '90066', 'phone': '(310) 577-4200', 'ceeb': '053060'},
    {'name': 'Washington Prep High School', 'city': 'Los Angeles', 'address': '10860 S Denker Ave', 'zip': '90047', 'phone': '(323) 753-7141', 'ceeb': '053120'},
    
    # Orange County
    {'name': 'Foothill High School', 'city': 'Santa Ana', 'address': '19251 Dodge Ave', 'zip': '92705', 'phone': '(714) 730-7464', 'ceeb': '051325'},
    {'name': 'Fountain Valley High School', 'city': 'Fountain Valley', 'address': '17816 Bushard St', 'zip': '92708', 'phone': '(714) 964-7766', 'ceeb': '051330'},
    {'name': 'Huntington Beach High School', 'city': 'Huntington Beach', 'address': '1905 Main St', 'zip': '92648', 'phone': '(714) 536-2514', 'ceeb': '051780'},
    {'name': 'Irvine High School', 'city': 'Irvine', 'address': '4321 Walnut Ave', 'zip': '92604', 'phone': '(949) 936-7000', 'ceeb': '051830'},
    {'name': 'Laguna Beach High School', 'city': 'Laguna Beach', 'address': '625 Park Ave', 'zip': '92651', 'phone': '(949) 497-7750', 'ceeb': '052100'},
    {'name': 'Newport Harbor High School', 'city': 'Newport Beach', 'address': '600 Irvine Ave', 'zip': '92663', 'phone': '(949) 515-6300', 'ceeb': '052270'},
    {'name': 'Santa Ana High School', 'city': 'Santa Ana', 'address': '520 W Walnut St', 'zip': '92701', 'phone': '(714) 558-5515', 'ceeb': '052800'},
    {'name': 'Santa Margarita Catholic High School', 'city': 'Rancho Santa Margarita', 'address': '22062 Antonio Pkwy', 'zip': '92688', 'phone': '(949) 766-6000', 'ceeb': '052835'},
    {'name': 'Servite High School', 'city': 'Anaheim', 'address': '1952 W La Palma Ave', 'zip': '92801', 'phone': '(714) 774-7575', 'ceeb': '052870'},
    {'name': 'Troy High School', 'city': 'Fullerton', 'address': '2200 E Dorothy Ln', 'zip': '92831', 'phone': '(714) 626-4483', 'ceeb': '053015'},
    
    # San Diego County
    {'name': 'Bonita Vista High School', 'city': 'Chula Vista', 'address': '751 Otay Lakes Rd', 'zip': '91913', 'phone': '(619) 397-2000', 'ceeb': '050535'},
    {'name': 'Castle Park High School', 'city': 'Chula Vista', 'address': '1395 Hilltop Dr', 'zip': '91911', 'phone': '(619) 691-5550', 'ceeb': '050975'},
    {'name': 'Eastlake High School', 'city': 'Chula Vista', 'address': '1120 Eastlake Pkwy', 'zip': '91915', 'phone': '(619) 397-1500', 'ceeb': '051170'},
    {'name': 'Granite Hills High School', 'city': 'El Cajon', 'address': '1661 Magnolia Ave', 'zip': '92021', 'phone': '(619) 452-5500', 'ceeb': '051450'},
    {'name': 'Helix Charter High School', 'city': 'La Mesa', 'address': '7323 University Ave', 'zip': '91942', 'phone': '(619) 668-6000', 'ceeb': '051670'},
    {'name': 'La Jolla High School', 'city': 'La Jolla', 'address': '750 Nautilus St', 'zip': '92037', 'phone': '(858) 551-2800', 'ceeb': '052070'},
    {'name': 'Madison High School', 'city': 'San Diego', 'address': '4833 Doliva Dr', 'zip': '92117', 'phone': '(858) 496-8370', 'ceeb': '052147'},
    {'name': 'Mission Bay High School', 'city': 'San Diego', 'address': '2475 Grand Ave', 'zip': '92109', 'phone': '(858) 273-1313', 'ceeb': '052150'},
    {'name': 'Poway High School', 'city': 'Poway', 'address': '15500 Espola Rd', 'zip': '92064', 'phone': '(858) 679-2500', 'ceeb': '052570'},
    {'name': 'Rancho Bernardo High School', 'city': 'San Diego', 'address': '13010 Paseo Lucido', 'zip': '92128', 'phone': '(858) 485-0990', 'ceeb': '052625'},
    {'name': 'Scripps Ranch High School', 'city': 'San Diego', 'address': '10410 Treena St', 'zip': '92131', 'phone': '(858) 537-1500', 'ceeb': '052860'},
    {'name': 'Torrey Pines High School', 'city': 'San Diego', 'address': '3710 Del Mar Heights Rd', 'zip': '92130', 'phone': '(858) 755-0125', 'ceeb': '053005'},
    
    # San Francisco Bay Area
    {'name': 'American High School', 'city': 'Fremont', 'address': '36300 Fremont Blvd', 'zip': '94536', 'phone': '(510) 796-1776', 'ceeb': '050060'},
    {'name': 'Andrew Hill High School', 'city': 'San Jose', 'address': '3200 Senter Rd', 'zip': '95111', 'phone': '(408) 347-4080', 'ceeb': '050085'},
    {'name': 'Aragon High School', 'city': 'San Mateo', 'address': '900 Alameda De Las Pulgas', 'zip': '94402', 'phone': '(650) 558-2650', 'ceeb': '050145'},
    {'name': 'Balboa High School', 'city': 'San Francisco', 'address': '1000 Cayuga Ave', 'zip': '94112', 'phone': '(415) 469-4500', 'ceeb': '050265'},
    {'name': 'Burlingame High School', 'city': 'Burlingame', 'address': '1 Mangini Way', 'zip': '94010', 'phone': '(650) 558-3800', 'ceeb': '050790'},
    {'name': 'Capuchino High School', 'city': 'San Bruno', 'address': '1501 Magnolia Ave', 'zip': '94066', 'phone': '(650) 558-2750', 'ceeb': '050945'},
    {'name': 'Carlmont High School', 'city': 'Belmont', 'address': '1400 Alameda De Las Pulgas', 'zip': '94002', 'phone': '(650) 595-0210', 'ceeb': '050950'},
    {'name': 'Castlemont High School', 'city': 'Oakland', 'address': '8601 MacArthur Blvd', 'zip': '94605', 'phone': '(510) 879-3060', 'ceeb': '050980'},
    {'name': 'Evergreen Valley High School', 'city': 'San Jose', 'address': '3300 Quimby Rd', 'zip': '95148', 'phone': '(408) 347-7000', 'ceeb': '051270'},
    {'name': 'Fremont High School', 'city': 'Oakland', 'address': '4610 Foothill Blvd', 'zip': '94601', 'phone': '(510) 434-5257', 'ceeb': '051360'},
    {'name': 'Gunderson High School', 'city': 'San Jose', 'address': '622 Gaundabert Ln', 'zip': '95123', 'phone': '(408) 347-7000', 'ceeb': '051510'},
    {'name': 'Independence High School', 'city': 'San Jose', 'address': '1776 Educational Park Dr', 'zip': '95133', 'phone': '(408) 928-9500', 'ceeb': '051805'},
    {'name': 'Lincoln High School', 'city': 'San Francisco', 'address': '2162 24th Ave', 'zip': '94116', 'phone': '(415) 753-5610', 'ceeb': '052115'},
    {'name': 'Lick-Wilmerding High School', 'city': 'San Francisco', 'address': '755 Ocean Ave', 'zip': '94112', 'phone': '(415) 333-4021', 'ceeb': '052120'},
    {'name': 'Lowell High School', 'city': 'San Francisco', 'address': '1101 Eucalyptus Dr', 'zip': '94132', 'phone': '(415) 759-2730', 'ceeb': '052125'},
    {'name': 'Menlo-Atherton High School', 'city': 'Atherton', 'address': '555 Middlefield Rd', 'zip': '94027', 'phone': '(650) 322-5311', 'ceeb': '052160'},
    {'name': 'Mills High School', 'city': 'Millbrae', 'address': '400 Murchison Dr', 'zip': '94030', 'phone': '(650) 697-7345', 'ceeb': '052180'},
    {'name': 'Mission High School', 'city': 'San Francisco', 'address': '3750 18th St', 'zip': '94114', 'phone': '(415) 241-6240', 'ceeb': '052155'},
    {'name': 'Oakland High School', 'city': 'Oakland', 'address': '1023 MacArthur Blvd', 'zip': '94610', 'phone': '(510) 879-3060', 'ceeb': '052340'},
    {'name': 'Oak Grove High School', 'city': 'San Jose', 'address': '285 Blossom Hill Rd', 'zip': '95123', 'phone': '(408) 347-4000', 'ceeb': '052330'},
    {'name': 'Piedmont High School', 'city': 'Piedmont', 'address': '800 Magnolia Ave', 'zip': '94611', 'phone': '(510) 594-2695', 'ceeb': '052510'},
    {'name': 'Pioneer High School', 'city': 'San Jose', 'address': '1780 Educational Park Dr', 'zip': '95133', 'phone': '(408) 928-9700', 'ceeb': '052515'},
    {'name': 'San Mateo High School', 'city': 'San Mateo', 'address': '506 N Delaware St', 'zip': '94401', 'phone': '(650) 558-2299', 'ceeb': '052780'},
    {'name': 'Sequoia High School', 'city': 'Redwood City', 'address': '1201 Brewster Ave', 'zip': '94062', 'phone': '(650) 369-1411', 'ceeb': '052865'},
    {'name': 'Skyline High School', 'city': 'Oakland', 'address': '12250 Skyline Blvd', 'zip': '94619', 'phone': '(510) 686-4540', 'ceeb': '052910'},
    {'name': 'South San Francisco High School', 'city': 'South San Francisco', 'address': '400 B St', 'zip': '94080', 'phone': '(650) 877-8900', 'ceeb': '052945'},
    {'name': 'Washington High School', 'city': 'Fremont', 'address': '38442 Fremont Blvd', 'zip': '94536', 'phone': '(510) 657-1016', 'ceeb': '053115'},
    {'name': 'Westmoor High School', 'city': 'Daly City', 'address': '131 Westmoor Ave', 'zip': '94015', 'phone': '(650) 550-7900', 'ceeb': '053175'},
    
    # Sacramento Area
    {'name': 'Burbank High School', 'city': 'Sacramento', 'address': '3500 Florin Rd', 'zip': '95823', 'phone': '(916) 395-5090', 'ceeb': '050795'},
    {'name': 'C.K. McClatchy High School', 'city': 'Sacramento', 'address': '3066 Freeport Blvd', 'zip': '95818', 'phone': '(916) 277-6536', 'ceeb': '050870'},
    {'name': 'Del Campo High School', 'city': 'Fair Oaks', 'address': '4925 Dewey Dr', 'zip': '95628', 'phone': '(916) 971-5750', 'ceeb': '051085'},
    {'name': 'El Camino Fundamental High School', 'city': 'Sacramento', 'address': '4300 El Camino Ave', 'zip': '95821', 'phone': '(916) 971-7465', 'ceeb': '051200'},
    {'name': 'Grant Union High School', 'city': 'Sacramento', 'address': '1400 Grand Ave', 'zip': '95838', 'phone': '(916) 286-3500', 'ceeb': '051460'},
    {'name': 'Hiram Johnson High School', 'city': 'Sacramento', 'address': '6879 14th Ave', 'zip': '95820', 'phone': '(916) 433-5200', 'ceeb': '051720'},
    {'name': 'Luther Burbank High School', 'city': 'Sacramento', 'address': '3500 Florin Rd', 'zip': '95823', 'phone': '(916) 395-5090', 'ceeb': '052130'},
    {'name': 'Rio Americano High School', 'city': 'Sacramento', 'address': '4540 American River Dr', 'zip': '95864', 'phone': '(916) 971-7465', 'ceeb': '052650'},
    
    # Central Valley
    {'name': 'Bullard High School', 'city': 'Fresno', 'address': '5445 N Palm Ave', 'zip': '93704', 'phone': '(559) 248-7000', 'ceeb': '050770'},
    {'name': 'Clovis High School', 'city': 'Clovis', 'address': '1055 Fowler Ave', 'zip': '93611', 'phone': '(559) 327-3000', 'ceeb': '051010'},
    {'name': 'Edison High School', 'city': 'Fresno', 'address': '540 E California Ave', 'zip': '93706', 'phone': '(559) 248-7400', 'ceeb': '051190'},
    {'name': 'Fresno High School', 'city': 'Fresno', 'address': '1839 R St', 'zip': '93721', 'phone': '(559) 457-2800', 'ceeb': '051370'},
    {'name': 'Roosevelt High School', 'city': 'Fresno', 'address': '6365 N Palm Ave', 'zip': '93704', 'phone': '(559) 457-2700', 'ceeb': '052672'},
    
    # Inland Empire
    {'name': 'Chino Hills High School', 'city': 'Chino Hills', 'address': '16150 Pomona Rincon Rd', 'zip': '91709', 'phone': '(909) 606-7540', 'ceeb': '050995'},
    {'name': 'Corona del Mar High School', 'city': 'Newport Beach', 'address': '2101 Eastbluff Dr', 'zip': '92660', 'phone': '(949) 515-6500', 'ceeb': '051065'},
    {'name': 'Etiwanda High School', 'city': 'Rancho Cucamonga', 'address': '13500 Victoria Ave', 'zip': '91739', 'phone': '(909) 803-3550', 'ceeb': '051260'},
    {'name': 'Poly High School', 'city': 'Riverside', 'address': '5450 Victoria Ave', 'zip': '92506', 'phone': '(951) 788-7275', 'ceeb': '052543'},
    {'name': 'Rancho Cucamonga High School', 'city': 'Rancho Cucamonga', 'address': '11801 Lark Dr', 'zip': '91701', 'phone': '(909) 484-5000', 'ceeb': '052630'},
]

def write_high_schools_to_csv(schools, output_file):
    """Write high schools data to CSV file"""
    
    fieldnames = ['School Name', 'Type', 'City', 'State', 'Country', 'Address', 'ZIP', 'Phone', 'CEEB Code', 'Federal School Code', 'Website', 'Notes']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for school in schools:
            writer.writerow({
                'School Name': school.get('name', ''),
                'Type': 'High School',
                'City': school.get('city', ''),
                'State': 'CA',
                'Country': 'USA',
                'Address': school.get('address', ''),
                'ZIP': school.get('zip', ''),
                'Phone': school.get('phone', ''),
                'CEEB Code': school.get('ceeb', ''),
                'Federal School Code': '',
                'Website': '',
                'Notes': 'California High School'
            })

def main():
    """Main function to build California high schools database"""
    
    print("Building California High Schools Database...")
    print("=" * 60)
    
    print(f"\n✓ High Schools: {len(CALIFORNIA_HIGH_SCHOOLS)} schools")
    
    # Group by region
    regions = {}
    for school in CALIFORNIA_HIGH_SCHOOLS:
        city = school['city']
        if 'Los Angeles' in city or city in ['Beverly Hills', 'Van Nuys', 'Canoga Park', 'Woodland Hills', 'Pacific Palisades', 'San Fernando', 'Sepulveda']:
            region = 'Los Angeles County'
        elif city in ['Santa Ana', 'Fullerton', 'Fountain Valley', 'Huntington Beach', 'Irvine', 'Laguna Beach', 'Newport Beach', 'Rancho Santa Margarita', 'Anaheim']:
            region = 'Orange County'
        elif 'San Diego' in city or city in ['Chula Vista', 'El Cajon', 'La Mesa', 'La Jolla', 'Poway']:
            region = 'San Diego County'
        elif city in ['Fremont', 'San Jose', 'San Mateo', 'San Francisco', 'San Bruno', 'Belmont', 'Oakland', 'Atherton', 'Millbrae', 'Piedmont', 'Redwood City', 'Daly City', 'South San Francisco']:
            region = 'Bay Area'
        elif city in ['Sacramento', 'Fair Oaks']:
            region = 'Sacramento Area'
        elif city in ['Fresno', 'Clovis']:
            region = 'Central Valley'
        elif city in ['Chino Hills', 'Rancho Cucamonga', 'Riverside']:
            region = 'Inland Empire'
        else:
            region = 'Other'
        
        if region not in regions:
            regions[region] = 0
        regions[region] += 1
    
    print("\nBreakdown by Region:")
    for region, count in sorted(regions.items()):
        print(f"  {region}: {count} schools")
    
    # Write to CSV
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'california_high_schools.csv')
    write_high_schools_to_csv(CALIFORNIA_HIGH_SCHOOLS, output_file)
    
    print(f"\n✓ Written to: {output_file}")
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("1. Combine with higher education data")
    print("2. Run: python scripts/merge_california_schools.py")
    print("3. Run: node scripts/load-schools-batch.js")
    print("=" * 60)

if __name__ == '__main__':
    main()
