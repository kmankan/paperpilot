import { LLMService } from '../LLMService';
import { DEBUG } from '@/app/debug/debug';

export async function getDictionaryDefinition(keyword: string): Promise<{
  definition: {
    text: string;
    type: string;
    usage?: string;
  };
  sources: string[];
}> {
  try {
    DEBUG.log('Generating dictionary definition for keyword:', { keyword });

    const prompt = `
      Define the keyword "${keyword}" in the style of a New Oxford American Dictionary entry.
      Include:
      - Word type (noun, verb, etc.)
      - Clear definition
      - Optional: usage example
      - List of sources
    `;

    const llm = new LLMService();
    const response = await llm.generate(prompt);

    return {
      definition: {
        text: response,
        type: 'noun', // TODO: Extract from response
        usage: undefined
      },
      sources: ['Oxford Dictionary', 'Merriam-Webster'] // TODO: Extract from response
    };
  } catch (error) {
    DEBUG.error('Failed to generate dictionary definition:', error);
    throw error;
  }
} 