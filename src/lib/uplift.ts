import { TTSResponse } from "../types";

export async function generateUrduTTS(text: string): Promise<TTSResponse> {
  try {
    // Use async TTS for WhatsApp bots - returns URL immediately
    const response = await fetch('https://api.upliftai.org/v1/synthesis/text-to-speech-async', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPLIFT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voiceId: 'v_8eelc901', // Simple Urdu voice
        text: text,
        outputFormat: 'MP3_22050_64', // Smaller for WhatsApp
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Uplift API error: ${response.status} ${error.message || response.statusText}`);
    }

    const result = await response.json();
    
    // Create the audio URL that WhatsApp can use directly
    const audioUrl = `https://api.upliftai.org/v1/synthesis/stream-audio/${result.mediaId}?token=${result.token}`;
    
    return {
      audioUrl: audioUrl,
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