'use client';

import { useEffect, useState } from 'react';
import { PDFProcessor } from '../services/pdf-processor';
import { KeywordDetector } from '../services/keyword-detector';
import { getPaperContextDefinition } from '../services/generation';
import { Document, Page } from 'react-pdf';
import '../utils/pdf-worker';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { Annotation } from '../types/annotations';
import type { AnnotationContent } from '../types/content';
import PaperPilotPanel from './PaperPilotPanel';
import { DEBUG, injectDebugPanel } from '@/app/debug/debug';

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  keywords: string[];
}

export default function EnhancedPDFViewer({ pdfUrl, keywords }: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [annotationContent, setAnnotationContent] = useState<AnnotationContent>({
    loading: false
  });
  const [scale, setScale] = useState(1.0);
  const [debugPanel, setDebugPanel] = useState<HTMLDivElement | null>(null);
  
  // Initialize debug panel
  useEffect(() => {
    const panel = injectDebugPanel();
    if (panel) {
      setDebugPanel(panel);
      DEBUG.log('Debug panel initialized');
    }
    return () => {
      panel?.remove();
      DEBUG.log('Debug panel removed');
    };
  }, []);

  // Update debug panel with current state
  useEffect(() => {
    if (!debugPanel) return;

    debugPanel.innerHTML = `
      <div class="debug-info">
        <h3>PaperPilot Debug Info</h3>
        <hr/>
        <p>Pages: ${numPages || 'Loading...'}</p>
        <p>Current Page: ${pageNumber}</p>
        <p>Scale: ${scale.toFixed(2)}</p>
        <p>Annotations: ${annotations.length}</p>
        <p>Selected: ${selectedAnnotation?.keyword || 'None'}</p>
        <hr/>
        <p>Last Updated: ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
  }, [debugPanel, numPages, pageNumber, scale, annotations, selectedAnnotation]);
  
  useEffect(() => {
    DEBUG.log('Keywords provided to EnhancedPDFViewer:', keywords);
  }, [keywords]);

  useEffect(() => {
    const processor = new PDFProcessor();
    const detector = new KeywordDetector(keywords);
    
    async function processDocument() {
      DEBUG.log('Processing document for keywords', { 
        url: pdfUrl, 
        keywords,
        totalAnnotations: annotations.length 
      });

      try {
        const result = await processor.process(pdfUrl);
        
        const newAnnotations = result.words
          .map(word => {
            const match = detector.detectKeywords(word.text);
            if (match) {
              DEBUG.log('Found keyword match', { 
                word: word.text, 
                keyword: match.keyword,
                pageNumber: word.pageNumber,
                coordinates: word.coordinates
              });
              return {
                ...word,
                ...match,
                id: `${match.hash}-${word.pageNumber}-${word.coordinates.x}-${word.coordinates.y}`
              } as Annotation;
            }
            return null;
          })
          .filter((item): item is Annotation => item !== null);
        
        DEBUG.log('Processed annotations', { 
          total: newAnnotations.length,
          keywords: newAnnotations.map(a => a.keyword)
        });
        setAnnotations(newAnnotations);
      } catch (error) {
        DEBUG.error('Failed to process document for keywords', error);
      }
    }
    
    processDocument();
  }, [pdfUrl, keywords]);

  // Load annotation content when selected
  useEffect(() => {
    async function loadAnnotationContent() {
      if (!selectedAnnotation) return;

      DEBUG.log('Loading annotation content', { keyword: selectedAnnotation.keyword });
      setAnnotationContent({ loading: true });
      
      try {
        const contextDefinition = await getPaperContextDefinition(
          selectedAnnotation.keyword,
          `Context around "${selectedAnnotation.text}"`
        );

        DEBUG.log('Loaded annotation content', { keyword: selectedAnnotation.keyword });
        setAnnotationContent({
          loading: false,
          contextDefinition
        });
      } catch (error) {
        DEBUG.error('Failed to load annotation content', error);
        setAnnotationContent({
          loading: false,
          error: 'Failed to load content'
        });
      }
    }

    loadAnnotationContent();
  }, [selectedAnnotation]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    DEBUG.log('PDF document loaded', { pages: numPages });
    setNumPages(numPages);
  }

  return (
    <div className="relative">
      <div className="flex gap-4">
        <div className="flex-1">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber}
              className="pdf-page"
              renderAnnotationLayer={false}
              renderTextLayer={true}
              scale={scale}
            />
            
            <div className="annotation-layer">
              {annotations
                .filter(annotation => annotation.pageNumber === pageNumber)
                .map(annotation => (
                  <div
                    key={annotation.id}
                    className="absolute cursor-pointer hover:bg-yellow-200/50 transition-colors"
                    style={{
                      left: annotation.coordinates.x * scale,
                      top: annotation.coordinates.y * scale,
                      width: annotation.coordinates.width * scale,
                      height: annotation.coordinates.height * scale,
                    }}
                    onClick={() => setSelectedAnnotation(annotation)}
                  />
              ))}
            </div>
          </Document>
          
          <div className="flex justify-between mt-4">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                -
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>
            <button
              disabled={pageNumber >= (numPages || 0)}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <PaperPilotPanel
        keyword={selectedAnnotation?.keyword || ''}
        context={selectedAnnotation?.context || ''}
      />
    </div>
  );
} 