import { NextRequest, NextResponse } from 'next/server';
import { parseWhatsAppWebhook, sendWhatsAppMessage, verifyWebhookSignature } from '@/src/lib/whatsapp';
import { generateUrduResponse } from '@/src/lib/gemini';
import { generateUrduTTS } from '@/src/lib/uplift';
import { findOrCreateUser, saveMessage, getConversationHistory, updateUserSession } from '@/src/lib/database';
import { WhatsAppWebhookPayload } from '@/src/types';


export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppWebhookPayload = await request.json();
    
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('x-hub-signature-256');
    if (signature && !verifyWebhookSignature(JSON.stringify(body), signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse incoming messages
    const messages = parseWhatsAppWebhook(body);
    
    if (messages.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    // Process each message
    for (const message of messages) {
      try {
        // Find or create user
        const user = await findOrCreateUser(message.from);
        
        // Save user message
        await saveMessage(user.id, message.text, 'user');
        
        // Update user session
        await updateUserSession(user.id);
        
        // Get conversation history for context
        const history = await getConversationHistory(user.id, 5);
        const historyTexts = history.map((msg: { role: string; text: string }) => `${msg.role}: ${msg.text}`);
        
        // Generate AI response using Gemini
        const aiResponse = await generateUrduResponse(message.text, historyTexts);
        
        if (!aiResponse.success) {
          throw new Error(`Gemini API error: ${aiResponse.error}`);
        }
        
        // Save AI response
        await saveMessage(user.id, aiResponse.text, 'ai');
        
        // Generate TTS for the response (required for voice-only responses)
        let audioUrl: string | undefined;
        try {
          const ttsResult = await generateUrduTTS(aiResponse.text);
          if (ttsResult.success && ttsResult.audioUrl) {
            audioUrl = ttsResult.audioUrl;
          } else {
            throw new Error('TTS generation failed');
          }
        } catch (ttsError) {
          console.error('TTS generation failed:', ttsError);
          // Send fallback text message if TTS fails
          await sendWhatsAppMessage({
            to: message.from,
            message: 'معذرت، میں آپ کا جواب تیار کرنے میں مسئلہ آ رہا ہے۔ برائے کرم دوبارہ کوشش کریں۔',
            type: 'text',
          });
          continue; // Skip to next message
        }
        
        // Send voice-only response back via WhatsApp
        const sendResult = await sendWhatsAppMessage({
          to: message.from,
          message: '', // Empty message since we're sending voice only
          type: 'audio',
          audioUrl,
        });
        
        if (!sendResult.success) {
          console.error('Failed to send WhatsApp response:', sendResult.error);
        }
        
      } catch (messageError) {
        console.error('Error processing message:', messageError);
        
        // Send error message to user
        await sendWhatsAppMessage({
          to: message.from,
          message: 'Sorry, I encountered an error processing your message. Please try again.',
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Message API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle webhook verification (GET request)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_SECRET) {
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
