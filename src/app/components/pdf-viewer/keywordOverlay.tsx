'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import PaperPilotPanel from '../PaperPilotPanel';
import type { Annotation } from '../../types/annotations';
import { useUrlStore } from '@/app/store/UrlStore';


interface Word {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: number[];
  keyword?: string;
}

interface PDFViewerProps {
  keywords: string[];
  pdfUrl: string;
}

const PDFViewerWithOverlays: React.FC<PDFViewerProps> = ({ keywords }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [interactiveWords, setInteractiveWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<{
    keyword: string;
    context: string;
  } | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const pdfDirectory = useUrlStore(state => state.fileName);

  console.log('these are the keywords', keywords);

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    const loadedPdf = await pdfjs.getDocument(pdfDirectory).promise;
    setPdf(loadedPdf);
    processPage(loadedPdf, pageNumber);
  };

  useEffect(() => {
    if (pdf) {
      processPage(pdf, pageNumber);
    }
  }, [pageNumber, pdf]);

  const convertPDFToHTMLCoordinates = (
    pdfX: number,
    pdfY: number,
    pageHeight: number
  ): [number, number] => {
    return [pdfX, pageHeight - pdfY];
  };

  const processPage = async (pdf: PDFDocumentProxy, pageNumber: number) => {
    const page: PDFPageProxy = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const processedWords = textContent.items
      .map((item: any) => {
        if ('str' in item) {
          const keyword = keywords.find(kw =>
            item.str.toLowerCase().includes(kw.toLowerCase())
          );
          if (keyword) {
            const [x, y] = convertPDFToHTMLCoordinates(
              item.transform[4],
              item.transform[5],
              viewport.height
            );
            return {
              text: item.str,
              x,
              y,
              width: item.width,
              height: item.height,
              transform: item.transform,
              keyword
            } as Word;
          }
        }
        return null;
      })
      .filter((word): word is Word => word !== null);

    setInteractiveWords(processedWords);
    console.log('processed words', processedWords);
  };

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
          transform: 'translateY(-100%)', // Add this line to shift the highlight up
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
    if (word.keyword) {
      const context = `Context around "${word.text}"`;
      setSelectedWord({
        keyword: word.keyword,
        context
      });
    }
  };

  return (
    <div className="relative flex">
      <div className="flex-1">
        <Document
          file={pdfDirectory}
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


      {selectedWord && (
        <div className="w-96 border-l border-gray-200">
          <PaperPilotPanel
            keyword={selectedWord.keyword}
            context={selectedWord.context}
          />
        </div>
      )}
    </div>
  );
};

export default PDFViewerWithOverlays;