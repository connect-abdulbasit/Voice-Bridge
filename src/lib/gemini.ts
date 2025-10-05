import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateText(prompt: string): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
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
  const systemPrompt = `You are a helpful AI assistant that can communicate in both English and Urdu. 
  When the user writes in Urdu, respond in Urdu. When they write in English, respond in English.
  Be conversational, helpful, and culturally appropriate for Pakistani/Urdu speakers.
  
  Previous conversation context: ${conversationHistory.join('\n')}
  
  User message: ${userMessage}`;

  return generateText(systemPrompt);
}
