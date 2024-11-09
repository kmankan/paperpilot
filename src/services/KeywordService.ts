import { KeywordStore, KeywordData } from '../store/KeywordStore';

export class KeywordService {
  private store: KeywordStore;

  constructor(store: KeywordStore) {
    this.store = store;
  }

  // Initial processing of paper to find keywords
  async processDocument(paperText: string): Promise<KeywordData[]> {
    try {
      // Call LLM to identify keywords and their context
      const keywords = await this.extractKeywords(paperText);
      
      // Store keywords
      keywords.forEach(keyword => {
        this.store.addKeyword(keyword);
      });

      return keywords;
    } catch (error) {
      console.error('Error processing document:', error);
      return [];
    }
  }

  // Highlight keywords in the document
  highlightKeywords(container: HTMLElement) {
    const keywords = this.store.getKeywords();
    const textNodes = this.getTextNodes(container);

    textNodes.forEach(node => {
      keywords.forEach((keyword: KeywordData) => {
        const regex = new RegExp(`\\b${keyword.word}\\b`, 'gi');
        if (regex.test(node.textContent || '')) {
          this.wrapKeywordInSVG(node, keyword.word);
        }
      });
    });
  }

  private getTextNodes(node: Node): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode: Node | null;
    while (currentNode = walker.nextNode()) {
      textNodes.push(currentNode as Text);
    }

    return textNodes;
  }

  private wrapKeywordInSVG(textNode: Text, keyword: string) {
    const span = document.createElement('span');
    span.className = 'keyword-highlight';
    
    // Create SVG overlay
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'keyword-svg');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('rx', '4');
    rect.setAttribute('ry', '4');
    
    span.appendChild(svg);
    svg.appendChild(rect);

    // Replace text with highlighted version
    const newText = textNode.textContent?.replace(
      new RegExp(`(\\b${keyword}\\b)`, 'gi'),
      () => span.outerHTML
    );

    if (newText) {
      const newNode = document.createElement('span');
      newNode.innerHTML = newText;
      textNode.parentNode?.replaceChild(newNode, textNode);
    }
  }

  private async extractKeywords(text: string): Promise<KeywordData[]> {
    console.log('Text to process:', text);
    return [] as KeywordData[];
  }
} 