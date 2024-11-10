export class LLMService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.log('can i acces env', process.env.TEST)
    console.log(apiKey)
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.apiKey = apiKey;
  }

  async generate(prompt: string, context?: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates structured responses for academic paper analysis."
            },
            {
              role: "user",
              content: context ? `Context: ${context}\n\nPrompt: ${prompt}` : prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('LLM generation error:', error);
      throw error;
    }
  }
} 