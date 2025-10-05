import { generateUrduTTS } from '@/src/lib/uplift';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    // Generate TTS
    const result = await generateUrduTTS(body.text);

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
