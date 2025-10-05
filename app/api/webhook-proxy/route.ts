import { NextRequest, NextResponse } from 'next/server';
import axios from "axios";

// This endpoint acts as a webhook proxy for processing messages
// External systems can send messages here to be processed through the voice pipeline

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Received webhook message:', body);

    const { 
      message, 
      type = 'text', 
      audioUrl, 
      openaiKey,
      upliftKey 
    } = body;

    // Validate required fields
    if (!message && !audioUrl) {
      return NextResponse.json({ 
        error: 'Either message or audioUrl is required' 
      }, { status: 400 });
    }

    let processedText = message;
    const messageType = type;

    // Process audio if provided
    if (audioUrl && type === 'voice') {
      try {
        console.log('🎵 Processing audio from URL:', audioUrl);
        
        // Convert voice to text using UpliftAI
        if (upliftKey) {
          const sttResponse = await axios.post("https://api.upliftai.com/stt", {
            url: audioUrl,
            apiKey: upliftKey,
          });
          processedText = sttResponse.data.text;
          console.log('🎤 Voice to text:', processedText);
        } else {
          processedText = "Voice message received (API key not provided)";
        }
      } catch (error) {
        console.error('❌ Error processing audio:', error);
        processedText = "Sorry, I couldn't process that voice message.";
      }
    }

    // Process with LLM
    const llmResponse = await processWithLLM(processedText, messageType, openaiKey);

    // Generate voice response
    const voiceResponse = await generateVoiceResponse(llmResponse, upliftKey);

    return NextResponse.json({
      success: true,
      originalMessage: message,
      processedText: processedText,
      llmResponse: llmResponse,
      voiceUrl: voiceResponse.voiceUrl,
      message: "Message processed successfully"
    });

  } catch (error) {
    console.error('❌ Error processing webhook message:', error);
    return NextResponse.json({ 
      error: 'Failed to process message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processWithLLM(text: string, messageType: string, openaiKey?: string) {
  try {
    console.log('🤖 Processing with LLM...');
    
    // Use OpenAI if available
    if (openaiKey) {
      const llmResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "You are a helpful voice assistant. Keep responses concise and conversational, suitable for voice messages." 
            },
            { role: "user", content: text }
          ],
          max_tokens: 150
        },
        { headers: { Authorization: `Bearer ${openaiKey}` } }
      );
      
      const response = llmResponse.data.choices[0].message.content;
      console.log('🧠 LLM response:', response);
      return response;
    } else {
      // Fallback response
      const response = `I received your ${messageType} message: "${text}". This is a test response from the webhook proxy.`;
      console.log('📝 Fallback response:', response);
      return response;
    }
  } catch (error) {
    console.error('❌ Error with LLM:', error);
    return "I'm having trouble processing your request right now.";
  }
}

async function generateVoiceResponse(text: string, apiKey?: string) {
  try {
    console.log('🎤 Converting response to voice...');
    
    // Convert text to speech using UpliftAI
    if (apiKey) {
      const ttsResponse = await axios.post("https://api.upliftai.com/tts", {
        text: text,
        apiKey: apiKey,
      });
      
      const voiceUrl = ttsResponse.data.audioUrl;
      console.log('🔊 Voice URL generated:', voiceUrl);
      
      return { voiceUrl, success: true };
    } else {
      console.log('⚠️ No API key provided for TTS');
      return { voiceUrl: null, success: false };
    }
  } catch (error) {
    console.error('❌ Error generating voice response:', error);
    return { voiceUrl: null, success: false };
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Webhook Proxy for Voice Processing",
    description: "Send POST requests with message data to process through voice pipeline",
    example: {
      method: "POST",
      body: {
        message: "Hello, how are you?",
        type: "text",
        openaiKey: "your-openai-key",
        upliftKey: "your-upliftai-key"
      }
    },
    audioExample: {
      method: "POST", 
      body: {
        audioUrl: "https://example.com/audio.ogg",
        type: "voice",
        openaiKey: "your-openai-key",
        upliftKey: "your-upliftai-key"
      }
    }
  });
}
