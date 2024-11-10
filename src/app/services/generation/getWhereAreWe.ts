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
    Generate a Mermaid diagram showing the scientific discipline hierarchy for "${keyword}".
    
    Requirements:
    1. Use exactly this format:
    graph TD
      %% Define nodes first
      A[Field Name]
      B[Subfield]
      C[Specific Area]

      %% Define relationships
      A --> B
      B --> C

      %% Define hyperlinks for each node
      click A href "https://en.wikipedia.org/wiki/Field_Name"
      click B href "https://en.wikipedia.org/wiki/Subfield"
      click C href "https://en.wikipedia.org/wiki/Specific_Area"
    
    2. Replace placeholders with actual field names and Wikipedia URLs
    3. Use TD direction (top-down)
    4. Include exactly 3 levels
    5. Each node must have a corresponding click definition with Wikipedia URL
    6. Return ONLY valid Mermaid syntax
    7. Do not include backticks or language markers
    
    Example valid response:
    graph TD
      %% Define nodes
      A[Physics]
      B[Optics]
      C[Laser Science]

      %% Define relationships
      A --> B
      B --> C

      %% Define hyperlinks
      click A href "https://en.wikipedia.org/wiki/Physics"
      click B href "https://en.wikipedia.org/wiki/Optics"
      click C href "https://en.wikipedia.org/wiki/Laser_science"
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  DEBUG.log('LLM Response for diagram:', response);

  // Basic validation of diagram syntax
  if (!response.includes('graph TD')) {
    throw new Error('Invalid diagram syntax: Missing graph TD declaration');
  }

  // Extract wiki links from the response using new click syntax
  const wikiLinkRegex = /click \w+ href "([^"]+)"/g;
  const wikiLinks = [...response.matchAll(wikiLinkRegex)].map(match => {
    const url = match[1]; // Get the URL from the capture group
    const text = url.split('/').pop()?.replace(/_/g, ' ') || '';
    return { text, url };
  });

  return {
    diagram: response.trim(),
    wikiLinks
  };
} 