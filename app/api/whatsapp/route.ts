import { NextRequest, NextResponse } from 'next/server';
import { generateUrduResponse } from '@/src/lib/gemini';
import { generateUrduTTS } from '@/src/lib/uplift';

export async function POST(request: NextRequest) {
  try {
    const { message, from } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: true,
        response: "Hello! I received your message but it seems to be empty. Please send me a text message and I'll respond with a voice note!",
        audioUrl: null,
        hasAudio: false
      });
    }

    console.log(`📱 WhatsApp message from ${from}:`, message);

    // Generate AI response using Gemini
    console.log('🧠 Generating AI response with Gemini...');
    const aiResponse = await generateUrduResponse(message, []);
    
    if (!aiResponse.success) {
      console.error('❌ Gemini API failed:', aiResponse.error);
      throw new Error(`Gemini API error: ${aiResponse.error}`);
    }
    
    console.log('🤖 AI Response for WhatsApp:', aiResponse.text);

    // Generate TTS for the response
    console.log('🎙️ Generating TTS audio...');
    const ttsResult = await generateUrduTTS(aiResponse.text);
    
    if (!ttsResult.success) {
      console.warn('⚠️ TTS generation failed:', ttsResult.error);
      console.log('📝 Returning text-only response');
      return NextResponse.json({
        success: true,
        response: aiResponse.text,
        audioUrl: null,
        hasAudio: false
      });
    }
    
    console.log('🎙️ TTS generated successfully:', {
      audioUrl: ttsResult.audioUrl,
      urlLength: ttsResult.audioUrl?.length || 0,
      format: ttsResult.format || 'unknown'
    });

    return NextResponse.json({
      success: true,
      response: aiResponse.text,
      audioUrl: ttsResult.audioUrl,
      hasAudio: true
    });

  } catch (error) {
    console.error('❌ WhatsApp API error:', error);
    
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
