import { TTSRequest, TTSResponse } from '@/types';

export async function generateTTS(request: TTSRequest): Promise<TTSResponse> {
  try {
    const response = await fetch('https://api.uplift.ai/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPLIFT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        language: request.lang,
        voice: request.voice || 'urdu-female-1',
        format: 'mp3',
        quality: 'high',
      }),
    });

    if (!response.ok) {
      throw new Error(`Uplift API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      audioUrl: result.audio_url,
      success: true,
    };
  } catch (error) {
    console.error('Uplift TTS API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateUrduTTS(text: string): Promise<TTSResponse> {
  return generateTTS({
    text,
    lang: 'ur',
    voice: 'urdu-female-1',
  });
}
