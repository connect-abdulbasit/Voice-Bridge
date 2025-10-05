import { NextRequest, NextResponse } from 'next/server';
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

let sock: ReturnType<typeof makeWASocket> | null = null;
let qrCode: string | null = null;
let isInitialized = false;
let isConnecting = false;

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: "WhatsApp bot status",
      qrCode: qrCode,
      connected: sock?.user ? true : false,
      initialized: isInitialized,
      connecting: isConnecting
    });
  } catch (error) {
    console.error('Error in bot GET:', error);
    return NextResponse.json({ error: 'Failed to get bot status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isInitialized && !isConnecting) {
      await initializeWhatsAppBot();
    }
    
    return NextResponse.json({ message: "WhatsApp bot initialization started" });
  } catch (error) {
    console.error('Error in bot POST:', error);
    return NextResponse.json({ error: 'Failed to initialize bot' }, { status: 500 });
  }
}

async function initializeWhatsAppBot() {
  if (isInitialized || isConnecting) return;
  
  isConnecting = true;
  
  try {
    console.log('🚀 Starting WhatsApp bot initialization...');
    
    // 1️⃣ Load or create WhatsApp session
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    console.log('📁 Auth state loaded');
    
    sock = makeWASocket({ 
      auth: state,
      printQRInTerminal: true,
      logger: undefined,
      browser: ['Voice Bridge', 'Chrome', '1.0.0'],
      connectTimeoutMs: 60_000,
      keepAliveIntervalMs: 30_000
    });

    console.log('🔌 WhatsApp socket created');

    sock.ev.on("creds.update", saveCreds);

    // 2️⃣ Handle QR code generation
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      console.log('📡 Connection update:', { connection, hasQR: !!qr });
      
      if (qr) {
        qrCode = qr;
        console.log('📱 QR Code generated!');
        console.log('='.repeat(50));
        console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP:');
        console.log('='.repeat(50));
        console.log(qr);
        console.log('='.repeat(50));
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== 401;
        console.log('❌ Connection closed, reconnecting:', shouldReconnect);
        
        if (shouldReconnect) {
          setTimeout(() => {
            isInitialized = false;
            isConnecting = false;
            initializeWhatsAppBot();
          }, 3000);
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connection opened successfully!');
        console.log('👤 User info:', sock?.user);
        qrCode = null;
        isInitialized = true;
        isConnecting = false;
      }
    });

    // 3️⃣ Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const from = msg.key.remoteJid!;
      console.log('📨 Received message from:', from);

      // Handle text messages
      if (msg.message.conversation) {
        const text = msg.message.conversation;
        console.log('💬 Text message:', text);
        
        // Simple echo response
        await sock?.sendMessage(from, { 
          text: `🤖 Bot received: "${text}"` 
        });
        console.log('✅ Echo response sent');
      }
      
      // Handle audio messages
      if (msg.message.audioMessage) {
        console.log('🎵 Received audio message');
        await sock?.sendMessage(from, { 
          text: "🎤 I received your voice message! Voice processing will be added soon." 
        });
        console.log('✅ Audio response sent');
      }
    });

    console.log('🎯 WhatsApp bot event listeners set up');

  } catch (error) {
    console.error('❌ Error initializing WhatsApp bot:', error);
    isInitialized = false;
    isConnecting = false;
    throw error;
  }
}
