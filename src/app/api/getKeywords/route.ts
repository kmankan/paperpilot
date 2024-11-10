import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI outside the handler
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    console.log('text type:', typeof text);
    console.log('text preview:', text?.substring?.(0, 100));

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text must be a string' },
        { status: 400 }
      );
    }

    console.log('text recieved', !!text);
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a scientific literature expert that extracts keywords from academic papers. You must return keywords as a JSON array of strings that appear verbatim in the source text."
        },
        {
          role: "user",
          content: `Analyze this scientific article and extract EXACTLY 10 keywords that appear in the text. Return ONLY a JSON array of strings, nothing else.

          Article text:\n${text}`
        }
      ],
      model: "gpt-4o-mini",
      temperature: 0.1,
    });
    console.log('response recieved', completion.choices[0].message.content);
    // Add better error handling for the response
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Clean the content by removing code block markers and language indicators
    const cleanedContent = content
      .replace(/^```(?:json)?\s*/, '') // Remove opening ```json or just ```
      .replace(/\s*```$/, '')          // Remove closing ```
      .trim();

    let keywords: string[];
    try {
      keywords = JSON.parse(cleanedContent) as string[];
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
    
    // Validate array
    if (!Array.isArray(keywords)) {
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

