// src/components/PDFViewerClient.tsx
'use client';

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('../pdf-viewer'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function PDFViewerClient() {
  return <PDFViewer />;
}