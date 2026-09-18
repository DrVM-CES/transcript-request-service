// Diagnostics must not expose deployment configuration or database errors publicly.
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ error: 'Not found' }, {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const POST = GET;
