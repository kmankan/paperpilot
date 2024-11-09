import { LLMService } from '../LLMService';

export async function getIdeaTree(
  keyword: string, 
  paperContext: string
): Promise<string> {
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
  
  return response;
} 