import { NextRequest, NextResponse } from 'next/server';
import { generateTTS } from '@/lib/uplift';
import { TTSRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    
    // Validate required fields
    if (!body.text || !body.lang) {
      return NextResponse.json(
        { error: 'Missing required fields: text and lang' },
        { status: 400 }
      );
    }

    // Generate TTS
    const result = await generateTTS(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'TTS generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
