import { NextRequest, NextResponse } from 'next/server';

// GET method for Meta webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return new NextResponse(challenge);
  } else {
    console.log('Webhook verification failed');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// POST method for receiving Meta webhook events
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Handle different types of webhook events
    if (body.object === 'page') {
      body.entry?.forEach((entry: any) => {
        entry.messaging?.forEach((event: any) => {
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

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
