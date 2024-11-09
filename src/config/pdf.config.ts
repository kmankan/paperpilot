import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Initialize PDF.js
const initializePDFJS = (workerUrl: string) => {
  if (typeof window !== 'undefined' && 'Worker' in window) {
    try {
      // Set worker source
      GlobalWorkerOptions.workerSrc = workerUrl;
      return true;
    } catch (error) {
      console.error('Error initializing PDF.js worker options:', error);
      return false;
    }
  }
  return false;
};

export { getDocument, initializePDFJS }; 