export interface Annotation {
  id: string;
  text: string;
  keyword: string;
  hash: string;
  pageNumber: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  context?: string;
}

export interface AnnotationContent {
  contextDefinition?: string;
  loading: boolean;
  error?: string;
} 