import PDFViewerWithOverlays from "@/app/components/pdf-viewer/keywordOverlay";
import PDFProvider from '@/app/components/PDFProvider';

export default async function PDFViewerPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const pdfUrl = searchParams.url as string;
  if (!pdfUrl) {
    throw new Error('PDF URL is required');
  }

  const storedPDFUrl = '/pdfs/storedPDF.pdf';

  try {
    // Encode the URL properly for the API call
    const encodedUrl = encodeURIComponent(pdfUrl);
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/parse-pdf?url=${encodedUrl}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error('Failed to parse PDF');
    }
    const { text: parsedPDFText } = await response.json();

    // pass the parsedPDFText to the LLM to get keywords
    const keywordsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getKeywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: parsedPDFText }),
    });
    if (!keywordsResponse.ok) {
      throw new Error('Failed to get keywords');
    }
    const keywords = await keywordsResponse.json();

    return (
      <PDFProvider>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Interactive PDF Viewer</h1>
          <PDFViewerWithOverlays keywords={keywords} pdfUrl={storedPDFUrl} />
        </div>
      </PDFProvider>
    );
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
