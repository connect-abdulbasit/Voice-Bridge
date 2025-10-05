import { NextRequest, NextResponse } from 'next/server';
import { generateUrduResponse } from '@/src/lib/gemini';
import { generateUrduTTS } from '@/src/lib/uplift';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('💬 Chat request:', message);

    // Generate AI response using Gemini
    const aiResponse = await generateUrduResponse(message, []);
    
    if (!aiResponse.success) {
      throw new Error(`Gemini API error: ${aiResponse.error}`);
    }
    
    console.log('🤖 AI Response:', aiResponse.text);

    // Generate TTS for the response
    const ttsResult = await generateUrduTTS(aiResponse.text);
    
    if (!ttsResult.success) {
      console.warn('TTS generation failed, returning text only:', ttsResult.error);
      return NextResponse.json({
        success: true,
        response: aiResponse.text,
        audioUrl: null,
        hasAudio: false
      });
    }
    
    console.log('🎙️ TTS generated:', ttsResult.audioUrl);

    return NextResponse.json({
      success: true,
      response: aiResponse.text,
      audioUrl: ttsResult.audioUrl,
      hasAudio: true
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Sorry, I encountered an error processing your message. Please try again.',
        hasAudio: false
      },
      { status: 500 }
    );
  }
}
