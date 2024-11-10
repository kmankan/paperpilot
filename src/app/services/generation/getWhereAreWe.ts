import { LLMService } from '../LLMService';
import { DEBUG } from '@/app/debug/debug';

export async function getWhereAreWe(
  keyword: string, 
  paperContext: string
): Promise<{
  diagram: string;
  wikiLinks: Array<{ text: string; url: string; }>;
}> {
  DEBUG.log('Generating WhereAreWe for keyword:', { keyword });
  const prompt = `
    Generate a top-down Mermaid graph showing the scientific discipline hierarchy for the keyword "${keyword}" in the context of this paper.
    The graph should:
    - Use TD (top-down) direction
    - Include maximum 3 levels
    - Include Wikipedia links for each node
    - Follow this format:
    - Generate superset categorical containers if need be

    graph TD
      A[Main Field] --> B[Subfield]
      B --> C[Specific Area]
      
    Return ONLY the Mermaid graph code.
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  // Parse response to extract diagram and wiki links
  return {
    diagram: response,
    wikiLinks: [] // TODO: Extract wiki links from response
  };
} 