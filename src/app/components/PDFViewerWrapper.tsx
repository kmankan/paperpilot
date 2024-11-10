'use client';

import dynamic from 'next/dynamic';

const EnhancedPDFViewer = dynamic(
  () => import('./EnhancedPDFViewer'),
  { ssr: false }
);

interface PDFViewerWrapperProps {
  pdfUrl: string;
  keywords: string[];
}

export default function PDFViewerWrapper({ pdfUrl, keywords }: PDFViewerWrapperProps) {
  return <EnhancedPDFViewer pdfUrl={pdfUrl} keywords={keywords} />;
} 