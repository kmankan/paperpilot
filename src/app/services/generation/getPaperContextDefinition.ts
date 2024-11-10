import { LLMService } from '../LLMService';
import { DEBUG } from '@/app/debug/debug';

export async function getPaperContextDefinition(
  keyword: string, 
  paperContext: string
): Promise<{
  significance: string;
  paperContext: string;
  relatedTerms: string[];
}> {
  DEBUG.log('Generating paper context for keyword:', { keyword });

  const prompt = `
    Analyze the significance of "${keyword}" within the context of this academic paper.
    Your response should:
    1. Explain how this term relates to the paper's main findings
    2. Describe its importance in the paper's methodology or theoretical framework
    3. Highlight any unique or novel usage of this term
    4. Connect it to the paper's broader implications
    
    Format the response in clear paragraphs with:
    - A topic sentence explaining the term's role
    - Supporting details from the paper
    - A concluding statement about its significance
    
    Also provide a list of related terms from the paper.
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  return {
    significance: response,
    paperContext: paperContext,
    relatedTerms: [] // TODO: Extract from response
  };
} 