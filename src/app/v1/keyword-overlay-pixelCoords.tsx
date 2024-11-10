'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Keywords we want to make interactive
const KEYWORDS = ['lensing'];

interface Word {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: number[];
  keyword: string | undefined;
}

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewerWithOverlays: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [interactiveWords, setInteractiveWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null); // Add this state

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    const loadedPdf = await pdfjs.getDocument(pdfUrl).promise;
    setPdf(loadedPdf); // Store PDF reference
    processPage(loadedPdf, pageNumber);
  };

  // Add useEffect to handle page changes
  useEffect(() => {
    if (pdf) {
      processPage(pdf, pageNumber);
    }
  }, [pageNumber]); // Re-run when page changes

  const convertPDFToHTMLCoordinates = (
    pdfX: number,
    pdfY: number,
    pageHeight: number
  ): [number, number] => {
    return [
      pdfX,                    // X stays the same
      pageHeight - pdfY        // Flip Y coordinate
    ];
  };

  // Add debugging to see what words are being found
  const processPage = async (pdf: PDFDocumentProxy, pageNumber: number) => {
    const page: PDFPageProxy = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    console.log('Processing page:', pageNumber);
    console.log('Text content items:', textContent.items);

    const words = textContent.items
      .map((item: any) => {
        if ('str' in item) {
          const keyword = KEYWORDS.find(kw =>
            item.str.toLowerCase().includes(kw.toLowerCase())
          );
          if (keyword) {
            const [x, y] = convertPDFToHTMLCoordinates(
              item.transform[4],
              item.transform[5],
              viewport.height
            );
            console.log('Found keyword:', item.str, keyword);
            return {
              text: item.str,
              x,
              y,
              width: item.width,
              height: item.height,
              transform: item.transform,
              keyword
            };
          }
        }
        return null;
      })
      .filter((item): item is Word => item !== null && item.keyword !== undefined);

    console.log('Interactive words found:', words);
    setInteractiveWords(words);
  };

  // Render overlays for interactive words
  const renderOverlays = () => {
    return interactiveWords.map((word, index) => (
      <div
        key={index}
        className="group absolute cursor-pointer"
        style={{
          left: `${word.x * scale}px`,
          top: `${word.y * scale}px`,
          width: `${word.width * scale}px`,
          height: `${Math.max(word.height, 12) * scale}px`,
          backgroundColor: 'rgba(255, 255, 0, 0.2)',
          border: '1px solid rgba(0, 0, 255, 0.2)',
          pointerEvents: 'auto',
          zIndex: 10
        }}
        onClick={() => handleWordClick(word)}
      >
        <div className="opacity-0 group-hover:opacity-100 absolute -top-4 left-0 bg-black text-white text-xs p-1 rounded">
          {word.text}
        </div>
      </div>
    ));
  };

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    // Here you could:
    // 1. Show a modal
    // 2. Load additional content
    // 3. Navigate to related content
  };

  // Simple Modal Component
  const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <div className="relative">
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
          {renderOverlays()}
        </div>
      </Document>

      <div>
        {/* Add navigation controls */}
        <div className="mt-4 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Previous
          </button>
          <span className="self-center">
            Page {pageNumber} of {numPages}
          </span>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            disabled={pageNumber >= (numPages || 1)}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next
          </button>
        </div>

        {/* Add zoom controls */}
        <div className="mt-2 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setScale(scale - 0.1)}
          >
            Zoom Out
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setScale(scale + 0.1)}
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* Modal stays the same */}
      {selectedWord && (
        <SimpleModal
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          title={`About "${selectedWord.text}"`}
        >
          <div className="p-4">
            Content for {selectedWord.keyword}
          </div>
        </SimpleModal>
      )}
    </div>
  );
};

export default PDFViewerWithOverlays;