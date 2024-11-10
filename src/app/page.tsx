import PDFViewerWithOverlays from "@/app/components/pdf-viewer/keywordOverlay";
import PDFProvider from '@/app/components/PDFProvider';

export default async function PDFViewerPage(pdfUrl: string) {
  // pass the pdf URL to Jina Reader and get text output
  const text = await fetch(`/api/parse-pdf?url=${encodeURIComponent(pdfUrl)}`)




  // pass the text to the LLM to get keywords
  const keywords = await getKeywordsFromText(text);

  return (
    <PDFProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Interactive PDF Viewer</h1>
        <PDFViewerWithOverlays pdfUrl="/2411.pdf" />
      </div>
    </PDFProvider>
  );
}
