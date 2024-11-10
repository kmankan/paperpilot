import { DEBUG } from '../debug/debug';

interface KeywordMatch {
  keyword: string;
  hash: string;
  variations: string[];
}

export class KeywordDetector {
  private keywords: string[];

  constructor(keywords: string[]) {
    this.keywords = keywords;
    DEBUG.log('KeywordDetector initialized with keywords:', keywords);
  }

  detectKeywords(text: string): KeywordMatch | null {
    const match = this.keywords.find(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (match) {
      DEBUG.log('Keyword detected:', { text, keyword: match });
      return {
        keyword: match,
        hash: this.generateHash(match),
        variations: [text] // Can be expanded with stemming/lemmatization
      };
    }

    return null;
  }

  private generateHash(text: string): string {
    return `kw-${text.toLowerCase().replace(/\s+/g, '-')}`;
  }
} 