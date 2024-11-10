import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Attempt to fetch headers only (lightweight check)
    const response = await fetch(url, {
      method: 'HEAD',  // HEAD request is lighter than GET
      headers: {
        'User-Agent': 'Mozilla/5.0', // Some servers require a user agent
      }
    });

    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      return NextResponse.json({ error: 'URL not accessible' }, { status: 404 });
    }

    // Check if content type is PDF (optional)
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/pdf')) {
      return NextResponse.json({ error: 'URL does not point to a PDF' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check URL' }, { status: 500 });
  }
}