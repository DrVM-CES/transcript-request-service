import { NextRequest, NextResponse } from 'next/server';
import { rawClient } from '../../../../../db/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim().toLowerCase();
    const type = searchParams.get('type'); // 'High School' or 'University'
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters'
      }, { status: 400 });
    }

    // Build query parts
    const searchPattern = `%${query}%`;
    let sqlString = `
      SELECT 
        id,
        school_name,
        school_type,
        city,
        state,
        country,
        address,
        zip,
        phone,
        ceeb_code,
        federal_school_code,
        website
      FROM schools
      WHERE search_text LIKE ?
    `;
    const params: any[] = [searchPattern];

    if (type) {
      sqlString += ` AND school_type = ?`;
      params.push(type);
    }

    if (state) {
      sqlString += ` AND state = ?`;
      params.push(state);
    }

    sqlString += ` ORDER BY school_name LIMIT ?`;
    params.push(limit);

    // Execute search query
    const result = await rawClient.execute({ sql: sqlString, args: params });

    // Transform to camelCase
    const results = result.rows.map((row: any) => ({
      id: row.id,
      schoolName: row.school_name,
      schoolType: row.school_type,
      city: row.city,
      state: row.state,
      country: row.country,
      address: row.address,
      zip: row.zip,
      phone: row.phone,
      ceebCode: row.ceeb_code,
      federalSchoolCode: row.federal_school_code,
      website: row.website,
      displayName: `${row.school_name} - ${row.city}, ${row.state}`,
    }));

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      query
    });

  } catch (error) {
    console.error('School search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search schools',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
