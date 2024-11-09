/// <reference types="chrome"/>

import { DEBUG, injectDebugPanel } from './debug/debug';
import { PDFService } from './services/PDFService';
import { KeywordService } from './services/KeywordService';
import { KeywordStore } from './store/KeywordStore';

// Initialize services
const store = new KeywordStore();
const keywordService = new KeywordService(store);
const pdfService = new PDFService();

// Debug panel for development
let debugPanel: HTMLElement | null | undefined = null;

interface ChromeMessage {
  type: string;
  url: string;
}

async function initialize() {
  try {
    DEBUG.log('Initializing PaperPilot...');
    
    // Initialize debug panel in development
    if (process.env.NODE_ENV === 'development') {
      debugPanel = injectDebugPanel();
      updateDebugInfo('Initializing...');
    }

    // Initialize PDF service with worker URL
    const workerUrl = chrome.runtime.getURL('pdf.worker.min.js');
    DEBUG.log('PDF.js worker URL:', workerUrl);
    await pdfService.init(workerUrl);

    // Listen for PDF loads
    chrome.runtime.onMessage.addListener(async (
      message: ChromeMessage
    ) => {
      if (message.type === 'PDF_LOADED') {
        DEBUG.log('PDF detected, processing...', message.url);
        await processPDF(message.url);
      }
    });

    DEBUG.log('PaperPilot initialized successfully');
  } catch (error) {
    DEBUG.error('Initialization failed', error);
  }
}

async function processPDF(url: string) {
  try {
    updateDebugInfo('Processing PDF...');
    
    // Parse PDF
    const pdfContent = await pdfService.parsePDF(url);
    DEBUG.log('PDF parsed successfully', { 
      pages: pdfContent.pages.length,
      title: pdfContent.title 
    });

    // Process keywords
    const keywords = await keywordService.processDocument(pdfContent.text);
    DEBUG.log('Keywords extracted', keywords);

    // Highlight keywords
    keywordService.highlightKeywords(document.body);
    DEBUG.log('Keywords highlighted');

    updateDebugInfo('PDF processed successfully', {
      keywords: keywords.length,
      pages: pdfContent.pages.length
    });
  } catch (error) {
    DEBUG.error('PDF processing failed', error);
    updateDebugInfo('Error processing PDF', { error });
  }
}

function updateDebugInfo(status: string, data?: Record<string, unknown>) {
  if (!debugPanel) return;
  
  debugPanel.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>Status:</strong> ${status}
    </div>
    ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
  `;
}

// Initialize on content script load
initialize(); 