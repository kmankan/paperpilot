export interface ModalContent {
  whereAreWe: {
    diagram: string;
    wikiLinks: Array<{ text: string; url: string; }>;
  } | null;
  definition: {
    text: string;
    type: string;
    usage?: string;
    sources: string[];
  } | null;
  context: {
    significance: string;
    paperContext: string;
    relatedTerms: string[];
  } | null;
  ideaTree: {
    diagram: string;
    nodes: Array<{ id: string; label: string; }>;
  } | null;
  loading: {
    whereAreWe: boolean;
    definition: boolean;
    context: boolean;
    tree: boolean;
  };
  error?: {
    whereAreWe?: string;
    definition?: string;
    context?: string;
    tree?: string;
  };
} 