import PDFViewerWithOverlays from "./keyword-overlay-pixelCoords";
import PDFProvider from '@/app/components/PDFProvider';

export default function PDFViewerPage() {
  return (
    <PDFProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Interactive PDF Viewer</h1>
        <PDFViewerWithOverlays pdfUrl="/2411.pdf" />
      </div>
    </PDFProvider>
  );
}
