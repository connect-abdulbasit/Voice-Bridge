import { NextRequest, NextResponse } from 'next/server';
import { generateUrduTTS } from '@/src/lib/uplift';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text') || 'Hello, this is a test message';
    
    console.log('🧪 Testing TTS with text:', text);
    
    const ttsResult = await generateUrduTTS(text);
    
    console.log('🎙️ TTS Test Result:', {
      success: ttsResult.success,
      error: ttsResult.error,
      audioUrl: ttsResult.audioUrl,
      urlLength: ttsResult.audioUrl?.length || 0
    });
    
    return NextResponse.json({
      success: ttsResult.success,
      text: text,
      audioUrl: ttsResult.audioUrl,
      error: ttsResult.error,
      testInfo: {
        timestamp: new Date().toISOString(),
        urlValid: ttsResult.audioUrl ? ttsResult.audioUrl.startsWith('http') : false
      }
    });
    
  } catch (error) {
    console.error('❌ TTS Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
