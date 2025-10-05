import { NextRequest, NextResponse } from 'next/server';

interface WebhookEntry {
  messaging?: Array<{
    message?: Record<string, unknown>;
    postback?: Record<string, unknown>;
  }>;
}

interface WebhookBody {
  object?: string;
  entry?: WebhookEntry[];
}

// GET method for Meta webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'success' });
}

// POST method for receiving Meta webhook events
export async function POST(request: Request) {
  try {
    const body: WebhookBody = await request.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Handle different types of webhook events
    if (body.object === 'page') {
      body.entry?.forEach((entry: WebhookEntry) => {
        entry.messaging?.forEach((event) => {
          if (event.message) {
            console.log('Received message:', event.message);
            // Handle message event
          } else if (event.postback) {
            console.log('Received postback:', event.postback);
            // Handle postback event
          }
        });
      });
    }

    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
