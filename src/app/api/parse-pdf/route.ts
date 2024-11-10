import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the PDF URL from the search params
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      );
    }

    // Decode the URL before sending to Jina
    const decodedUrl = decodeURIComponent(pdfUrl);
    const url = `https://r.jina.ai/${decodedUrl}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('PDF parsed successfully:', text);
    return NextResponse.json({ text });

  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}