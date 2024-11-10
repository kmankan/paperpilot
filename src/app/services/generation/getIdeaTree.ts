import { LLMService } from '../LLMService';
import { DEBUG } from '@/app/debug/debug';

export async function getIdeaTree(
  keyword: string, 
  paperContext: string
): Promise<{
  diagram: string;
  nodes: Array<{ id: string; label: string; }>;
}> {
  DEBUG.log('Generating idea tree for keyword:', { keyword });

  const prompt = `
    Create a Mermaid graph showing the conceptual breakdown of "${keyword}" in the context of this paper.
    The graph should:
    - Use LR (left-to-right) direction
    - Start with one root concept
    - Branch into maximum 3 related concepts
    - Those concepts should converge into maximum 3 key implications
    - End with a single conclusion
    - Follow this format:
    
    graph LR
      A[Root Concept] --> B[Related 1]
      A --> C[Related 2]
      A --> D[Related 3]
      B --> E[Implication 1]
      C --> E
      D --> F[Implication 2]
      E --> G[Conclusion]
      F --> G
    
    Return ONLY the Mermaid graph code.
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  return {
    diagram: response,
    nodes: [] // TODO: Extract nodes from response
  };
} 

//we need to refactor to inlcude the output from DictionaryDefinition