'use client';

import { pdfjs } from 'react-pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default function PDFProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}