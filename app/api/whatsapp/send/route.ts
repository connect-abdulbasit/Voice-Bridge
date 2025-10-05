import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppSendRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppSendRequest = await request.json();
    
    // Validate required fields
    if (!body.to || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('WhatsApp send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
