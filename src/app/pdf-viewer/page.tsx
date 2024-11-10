import PDFViewerWithOverlays from "@/app/components/pdf-viewer/keywordOverlay";
import PDFProvider from '@/app/components/PDFProvider';

export default async function PDFViewerPage({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  const pdfUrl = searchParams.url;
  if (!pdfUrl) {
    throw new Error('PDF URL is required');
  }

  // pass the pdf URL to Jina Reader and get text output
  const parsedPDFText = await fetch(`/api/parse-pdf?url=${encodeURIComponent(pdfUrl)}`)
    .then(res => res.json());

  // pass the parsedPDFText to the LLM (at /api/getKeywords) to get keywords
  const keywords = await fetch('/api/getKeywords', {
    method: 'POST',
    body: JSON.stringify({ text: parsedPDFText }),
  }).then(res => res.json());


  return (
    <PDFProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Interactive PDF Viewer</h1>
        <PDFViewerWithOverlays keywords={keywords} />
      </div>
    </PDFProvider>
  );
}
