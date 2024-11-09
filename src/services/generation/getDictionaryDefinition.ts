import { LLMService } from '../LLMService';

export async function getDictionaryDefinition(keyword: string): Promise<string> {
  const prompt = `
    Define the term "${keyword}" in the style of a New Oxford American Dictionary entry.
    The definition should:
    - Start with the part of speech
    - Include pronunciation if relevant
    - Provide a clear, concise definition
    - Include relevant usage examples if applicable
    - Follow this format example:
    
    algorithm /ˈalɡəˌriðəm/ (n.)
    a process or set of rules to be followed in calculations or other problem-solving operations, especially by a computer.

    Return ONLY the dictionary-style definition.
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, '');
  
  return response;
} 