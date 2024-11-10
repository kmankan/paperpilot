import { pdfjs } from 'react-pdf';

interface PDFProcessingResult {
  words: {
    text: string;
    coordinates: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    pageNumber: number;
    keywordMatch?: string;
    context?: string;
  }[];
  pages: number;
}

export class PDFProcessor {
  async process(pdfUrl: string): Promise<PDFProcessingResult> {
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const pages = pdf.numPages;
    const words: PDFProcessingResult['words'] = [];

    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => 'str' in item ? item.str : '')
        .join(' ');

      textContent.items.forEach((item: any) => {
        if ('str' in item) {
          const itemIndex = pageText.indexOf(item.str);
          const contextStart = Math.max(0, itemIndex - 100);
          const contextEnd = Math.min(pageText.length, itemIndex + item.str.length + 100);
          
          words.push({
            text: item.str,
            coordinates: {
              x: item.transform[4],
              y: item.transform[5],
              width: item.width || 0,
              height: item.height || 0,
            },
            pageNumber: pageNum,
            context: pageText.slice(contextStart, contextEnd)
          });
        }
      });
    }

    return { words, pages };
  }
} 