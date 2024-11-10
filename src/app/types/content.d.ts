export interface AnnotationContent {
  loading: boolean;
  contextDefinition?: {
    significance: string;
    paperContext: string;
    relatedTerms: string[];
  };
  error?: string;
} 