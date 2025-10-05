export interface WhatsAppMessage {
  from: string;
  to: string;
  text: string;
  timestamp: string;
  messageId: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface TTSResponse {
  audioUrl?: string;
  success: boolean;
  error?: string;
  format?: string;
}

export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface WhatsAppSendRequest {
  to: string;
  message: string;
  type?: 'text' | 'audio';
  audioUrl?: string;
}
