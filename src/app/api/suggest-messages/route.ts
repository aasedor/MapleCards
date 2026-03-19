import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface SuggestRequest {
  occasion: string;
  recipientName?: string;
  tone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestRequest = await request.json();
    const { occasion, recipientName, tone } = body;

    if (!occasion) {
      return NextResponse.json({ error: 'Occasion is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const recipientPart = recipientName ? ` for someone named ${recipientName}` : '';
    const tonePart = tone ? ` The tone should be ${tone}.` : '';

    const prompt = `Generate 3 short, warm greeting card messages for ${occasion}${recipientPart}. Keep each under 30 words. Canadian flavour encouraged.${tonePart} Return as a JSON array of strings only, no markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';

    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 });
    }

    const suggestions: string[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggest messages error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
