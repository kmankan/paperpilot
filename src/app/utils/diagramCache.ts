const CACHE_PREFIX = 'diagram_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedDiagram {
  diagram: string;
  timestamp: number;
}

export const diagramCache = {
  set: (key: string, diagram: string) => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cacheData: CachedDiagram = {
        diagram,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache diagram:', error);
    }
  },

  get: (key: string): string | null => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheData: CachedDiagram = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheData.diagram;
    } catch (error) {
      console.warn('Failed to retrieve cached diagram:', error);
      return null;
    }
  },

  clear: (key: string) => {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Failed to clear cached diagram:', error);
    }
  }
}; 