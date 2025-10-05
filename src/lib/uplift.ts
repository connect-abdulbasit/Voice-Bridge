import { TTSResponse } from "../types";

export async function generateUrduTTS(text: string): Promise<TTSResponse> {
  // Try OGG Opus format first (best for WhatsApp voice notes)
  const formats = [
    'OGG_OPUS_48000_64',  // Best for WhatsApp voice notes
    'MP3_22050_64',       // Fallback format
    'MP4_AAC_22050_64'    // Alternative format
  ];

  for (const format of formats) {
    try {
      console.log(`🎙️ Trying TTS format: ${format}`);
      
      const response = await fetch('https://api.upliftai.org/v1/synthesis/text-to-speech-async', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.UPLIFT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceId: 'v_8eelc901', // Simple Urdu voice
          text: text,
          outputFormat: format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn(`⚠️ Format ${format} failed: ${response.status} ${error.message || response.statusText}`);
        continue; // Try next format
      }

      const result = await response.json();
      
      // Create the audio URL that WhatsApp can use directly
      const audioUrl = `https://api.upliftai.org/v1/synthesis/stream-audio/${result.mediaId}?token=${result.token}`;
      
      console.log(`✅ TTS generated successfully with format: ${format}`);
      
      return {
        audioUrl: audioUrl,
        success: true,
        format: format
      };
    } catch (error) {
      console.warn(`⚠️ Format ${format} error:`, error);
      continue; // Try next format
    }
  }

  // If all formats failed
  console.error('❌ All TTS formats failed');
  return {
    success: false,
    error: 'All TTS formats failed to generate audio',
  };
}