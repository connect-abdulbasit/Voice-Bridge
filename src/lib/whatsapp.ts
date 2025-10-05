import { WhatsAppSendRequest, WhatsAppWebhookPayload } from "../types";


export async function sendWhatsAppMessage(request: WhatsAppSendRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: request.to,
      type: request.type || 'text',
      ...(request.type === 'audio' 
        ? { 
            audio: { 
              link: request.audioUrl,
              filename: 'response.mp3'
            } 
          }
        : { text: { body: request.message } }
      ),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function parseWhatsAppWebhook(payload: WhatsAppWebhookPayload): Array<{
  from: string;
  messageId: string;
  text: string;
  timestamp: string;
}> {
  const messages: Array<{
    from: string;
    messageId: string;
    text: string;
    timestamp: string;
  }> = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.value.messages) {
        for (const message of change.value.messages) {
          if (message.type === 'text') {
            messages.push({
              from: message.from,
              messageId: message.id,
              text: message.text.body,
              timestamp: message.timestamp,
            });
          }
        }
      }
    }
  }

  return messages;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Implement webhook signature verification
  // This is a simplified version - in production, you should use proper HMAC verification
  const expectedSignature = process.env.WHATSAPP_WEBHOOK_SECRET;
  return signature === expectedSignature;
}
