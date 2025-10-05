import { NextResponse } from 'next/server';
import { generateUrduResponse } from '@/src/lib/gemini';
import { generateUrduTTS } from '@/src/lib/uplift';

export async function GET() {
  try {
    console.log('🚀 Testing Voice Bridge Flow...\n');

    const message = "Assalam o alikum ap kese hain? aur aj mosam kesa ha?";
    console.log(`📝 Message: ${message}\n`);

    // Step 1: Get AI response
    console.log('🤖 Getting AI response...');
    const aiResponse = await generateUrduResponse(message, []);
    
    if (!aiResponse.success) {
      throw new Error(`Gemini error: ${aiResponse.error}`);
    }
    
    console.log(`✅ AI Response: ${aiResponse.text}\n`);

    // Step 2: Convert to speech
    console.log('🎙️ Converting to speech...');
    const ttsResult = await generateUrduTTS(aiResponse.text);
    
    if (!ttsResult.success) {
      throw new Error(`TTS error: ${ttsResult.error}`);
    }
    
    console.log(`✅ Audio URL: ${ttsResult.audioUrl}\n`);

    return NextResponse.json({
      success: true,
      message: message,
      aiResponse: aiResponse.text,
      audioUrl: ttsResult.audioUrl,
      status: '🎉 Test completed! Open the audio URL in your browser to hear the result.'
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: '❌ Test failed! Check your .env file has GOOGLE_API_KEY and UPLIFT_API_KEY'
    }, { status: 500 });
  }
}
