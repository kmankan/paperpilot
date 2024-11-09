'use client'

// pages/pdf-viewer.js
import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Update the worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

// Simple Modal Component
const SimpleModal = ({ isOpen, onClose, title, children }) => {
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

// Create clickable areas with their corresponding modal content
const INTERACTIVE_AREAS = [
  {
    id: 'area1',
    position: { x: 0, y: 0, width: 500, height: 500 },
    content: 'Modal content for Area 1'
  },
  {
    id: 'area2',
    position: { x: 200, y: 200, width: 50, height: 50 },
    content: 'Modal content for Area 2'
  }
];

const PDFViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedArea, setSelectedArea] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [debug, setDebug] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const closeModal = () => {
    setSelectedArea(null);
  };

  const renderClickableAreas = () => {
    return INTERACTIVE_AREAS.map((area) => (
      <div
        key={area.id}
        className="absolute cursor-pointer"
        style={{
          left: area.position.x * scale,
          top: area.position.y * scale,
          width: area.position.width * scale,
          height: area.position.height * scale,
          border: '2px solid transparent',
          backgroundColor: debug ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 123, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
        }}
        onClick={() => handleAreaClick(area)}
      />
    ));
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setScale(scale + 0.1)}
          >
            Zoom In
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          >
            Zoom Out
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setDebug(!debug)}
          >
            {debug ? 'Hide' : 'Show'} Clickable Areas
          </button>
        </div>

        <div className="relative">
          <Document
            file="/2411.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {renderClickableAreas()}
          </Document>
        </div>

        <div className="mt-4">
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            className="px-4 py-2 mr-2 bg-blue-500 text-white rounded"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <SimpleModal
        isOpen={!!selectedArea}
        onClose={closeModal}
        title={`Content for ${selectedArea?.id}`}
      >
        <div className="p-4">
          {selectedArea?.content}
        </div>
      </SimpleModal>
    </div>
  );
};

export default PDFViewer;