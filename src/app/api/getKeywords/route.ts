import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI outside the handler
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a scientific literature expert that extracts keywords from academic papers. You must only return keywords that appear verbatim in the source text."
        },
        {
          role: "user",
          content: `Analyze this scientific article and extract EXACTLY 10 keywords that appear verbatim in the text. These keywords should be the most significant terms that:
          - Are explicitly present in the paper
          - Represent main concepts, methodologies, or findings
          - Would be valuable for academic indexing and literature searches
          - Include both specific technical terms and broader research areas

          Return ONLY a valid JSON array of exactly 10 strings, like this: ["keyword1", "keyword2", "keyword3"]
          Do not include any other text in your response.

          Article text:\n${text}`
        }
      ],
      model: "gpt-4o-mini",
      temperature: 0.1,
    });

    const keywordsString = completion.choices[0].message.content?.trim() || '[]';
    const keywords = JSON.parse(keywordsString) as string[];
    
    // Validate array
    if (!Array.isArray(keywords) || keywords.length !== 10) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json(keywords);
  } catch (error) {
    console.error('Error processing keywords:', error);
    return NextResponse.json(
      { error: 'Failed to process keywords' },
      { status: 500 }
    );
  }
}

