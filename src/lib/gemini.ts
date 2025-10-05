import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from '../types';


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateText(prompt: string): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      success: true,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateUrduResponse(userMessage: string, conversationHistory: string[] = []): Promise<GeminiResponse> {
  const systemPrompt = `You are a helpful AI assistant that communicates in pure Urdu script for optimal text-to-speech pronunciation.

CRITICAL REQUIREMENTS FOR TTS OPTIMIZATION:
1. ALWAYS respond in pure Urdu script (اردو) - never use Roman Urdu or English transliteration
2. Use proper Urdu script for all words, including technical terms when possible
3. For English words that must be included, keep them in ASCII (e.g., "یہ ایک exerted force ہے")
4. Use Western numerals (2024) instead of Urdu numerals (۲۰۲۴)
5. For brand names, use official spelling (WhatsApp, not واٹس ایپ)
6. Ensure proper Urdu grammar and natural flow for speech synthesis

Previous conversation context: ${conversationHistory.join('\n')}

User message: ${userMessage}

Respond in pure Urdu script that will be converted to speech. Be conversational, helpful, and culturally appropriate for Pakistani/Urdu speakers.`;

  return generateText(systemPrompt);
}
