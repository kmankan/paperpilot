import PDFViewerClient from '@/app/components/PDFViewerClient';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">PDF Viewer Test</h1>
      <PDFViewerClient />
    </div>
  );
}