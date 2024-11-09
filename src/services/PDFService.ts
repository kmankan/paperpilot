import { TextItem, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { DEBUG } from '../debug/debug';
import { pdfjsLib, initializePDFJS } from '../config/pdf.config';

interface PDFPage {
  pageNumber: number;
  content: string;
  items: TextItem[];
}

interface PDFContent {
  text: string;
  pages: PDFPage[];
  title?: string;
  metadata?: Record<string, unknown>;
}

interface TextLocation {
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Add interface for PDF metadata info
interface PDFMetadataInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModificationDate?: string;
  [key: string]: unknown;
}

export class PDFService {
  private document?: PDFDocumentProxy;
  private initialized: boolean = false;

  constructor() {
    // Don't initialize in constructor - wait for init() call
  }

  async init(workerUrl: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        DEBUG.log('Initializing PDF.js worker with URL:', workerUrl);
        const success = initializePDFJS(workerUrl);
        
        if (!success) {
          throw new Error('Failed to initialize PDF.js worker options');
        }
        
        this.initialized = true;
      } catch (error) {
        DEBUG.error('Failed to initialize PDF.js worker:', error);
        throw new Error('Failed to initialize PDF.js worker');
      }
    } else {
      throw new Error('Web Workers not supported in this environment');
    }
  }

  async parsePDF(url: string): Promise<PDFContent> {
    if (!this.initialized) {
      throw new Error('PDFService not initialized. Call init() first.');
    }

    try {
      DEBUG.log('Starting PDF parse:', url);
      
      // Load the PDF document
      this.document = await pdfjsLib.getDocument(url).promise;
      DEBUG.log('PDF document loaded, pages:', this.document.numPages);

      // Get document metadata with proper typing
      const metadata = await this.document.getMetadata();
      const info = metadata.info as PDFMetadataInfo;

      // Extract text from each page
      const pages: PDFPage[] = [];
      let fullText = '';

      for (let i = 1; i <= this.document.numPages; i++) {
        const page = await this.document.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and their positions
        const items = textContent.items as TextItem[];
        const pageText = items.map(item => item.str).join(' ');
        
        fullText += pageText + '\n';
        pages.push({
          pageNumber: i,
          content: pageText,
          items: items
        });
      }

      return {
        text: fullText,
        pages: pages,
        title: info?.Title,
        metadata: info
      };

    } catch (error) {
      DEBUG.error('PDF parsing error:', error);
      throw error;
    }
  }

  async getTextCoordinates(pdfUrl: string, searchText: string): Promise<TextLocation[]> {
    const locations: TextLocation[] = [];
    
    try {
      const doc = await pdfjsLib.getDocument(pdfUrl).promise;
      
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Find text matches and their coordinates
        const items = textContent.items as TextItem[];
        items.forEach((item) => {
          if (item.str.includes(searchText)) {
            const transform = viewport.transform;
            const [x, y] = this.applyTransform([item.transform[4], item.transform[5]], transform);
            
            locations.push({
              pageNumber: i,
              text: item.str,
              x: x,
              y: y,
              width: item.width,
              height: item.height
            });
          }
        });
      }
    } catch (error) {
      console.error('Error getting text coordinates:', error);
    }
    
    return locations;
  }

  private applyTransform(point: number[], transform: number[]): number[] {
    const x = transform[0] * point[0] + transform[2] * point[1] + transform[4];
    const y = transform[1] * point[0] + transform[3] * point[1] + transform[5];
    return [x, y];
  }

  destroy() {
    if (this.document) {
      this.document.destroy();
      this.document = undefined;
    }
  }
}

// Usage example in content script:
/*
const pdfService = new PDFService();

// Parse PDF when loaded in browser
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'PDF_LOADED') {
    try {
      const pdfContent = await pdfService.parsePDF(message.url);
      // Process content with KeywordService
      // ...
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  }
});
*/ 