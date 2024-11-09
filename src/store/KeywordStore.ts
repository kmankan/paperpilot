export interface KeywordData {
  word: string;
  contextDescription: string;
  whereAreWe?: string;
  dictionaryDefinition?: string;
  paperContext?: string;
  ideaTree?: string;
}

export class KeywordStore {
  private keywords: Map<string, KeywordData> = new Map();

  addKeyword(keyword: KeywordData) {
    this.keywords.set(keyword.word, keyword);
  }

  getKeyword(word: string): KeywordData | undefined {
    return this.keywords.get(word);
  }

  getKeywords(): KeywordData[] {
    return Array.from(this.keywords.values());
  }

  updateKeywordData(word: string, data: Partial<KeywordData>) {
    const existing = this.keywords.get(word);
    if (existing) {
      this.keywords.set(word, { ...existing, ...data });
    }
  }
} 