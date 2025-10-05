# Voice Bridge - WhatsApp Voice Processing System

A Next.js application that provides a webhook proxy system for processing WhatsApp messages through a voice-to-text and text-to-speech pipeline.

## 🚀 Features

- **Webhook Proxy System**: Process messages from external systems
- **Voice-to-Text**: Convert voice messages to text using UpliftAI STT
- **LLM Integration**: Process text with OpenAI GPT-4o-mini
- **Text-to-Speech**: Convert responses back to voice using UpliftAI TTS
- **WhatsApp Integration**: Basic WhatsApp bot setup (simplified for now)

## 📁 Project Structure

```
/app
  /api
    /bot              # WhatsApp bot status and initialization
    /webhook          # Meta webhook verification
    /webhook-proxy    # Main voice processing pipeline
  /page.tsx           # Web interface for bot management
```

## 🔧 API Endpoints

### 1. `/api/webhook-proxy` - Main Voice Processing Pipeline

**POST** - Process messages through voice pipeline

```json
{
  "message": "Hello, how are you?",
  "type": "text",
  "openaiKey": "your-openai-key",
  "upliftKey": "your-upliftai-key"
}
```

**For voice messages:**
```json
{
  "audioUrl": "https://example.com/audio.ogg",
  "type": "voice",
  "openaiKey": "your-openai-key",
  "upliftKey": "your-upliftai-key"
}
```

**Response:**
```json
{
  "success": true,
  "originalMessage": "Hello, how are you?",
  "processedText": "Hello, how are you?",
  "llmResponse": "I'm doing well, thank you for asking!",
  "voiceUrl": "https://upliftai.com/generated-audio.mp3",
  "message": "Message processed successfully"
}
```

### 2. `/api/bot` - WhatsApp Bot Management

**GET** - Get bot status
**POST** - Initialize bot (generates QR code)

### 3. `/api/webhook` - Meta Webhook Verification

**GET** - Handle Meta webhook verification
**POST** - Process Meta webhook events

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file with:
   ```
   OPENAI_KEY=your_openai_api_key_here
   UPLIFT_KEY=your_upliftai_api_key_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📱 How to Use

### Webhook Proxy System

1. **Send a text message:**
   ```bash
   curl -X POST http://localhost:3000/api/webhook-proxy \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Hello, how are you?",
       "type": "text",
       "openaiKey": "your-openai-key",
       "upliftKey": "your-upliftai-key"
     }'
   ```

2. **Process a voice message:**
   ```bash
   curl -X POST http://localhost:3000/api/webhook-proxy \
     -H "Content-Type: application/json" \
     -d '{
       "audioUrl": "https://example.com/audio.ogg",
       "type": "voice",
       "openaiKey": "your-openai-key",
       "upliftKey": "your-upliftai-key"
     }'
   ```

### WhatsApp Bot

1. **Start the bot:**
   ```bash
   curl -X POST http://localhost:3000/api/bot
   ```

2. **Check status:**
   ```bash
   curl http://localhost:3000/api/bot
   ```

3. **View web interface:**
   Open `http://localhost:3000` in your browser

## 🔄 Voice Processing Pipeline

1. **Input**: Text message or audio URL
2. **Voice-to-Text**: If audio, convert to text using UpliftAI STT
3. **LLM Processing**: Send text to OpenAI GPT-4o-mini
4. **Text-to-Speech**: Convert LLM response to voice using UpliftAI TTS
5. **Output**: Return processed text and voice URL

## 🎯 Use Cases

- **WhatsApp Voice Assistant**: Process voice messages and respond with voice
- **Webhook Integration**: Integrate with external systems for voice processing
- **Voice API Proxy**: Act as a middleware for voice processing services
- **Multi-platform Support**: Process messages from various sources

## 🔧 Configuration

The system is designed to be flexible and can be configured for different use cases:

- **LLM Provider**: Currently supports OpenAI, can be extended
- **Voice Services**: Currently supports UpliftAI, can be extended
- **Message Sources**: Supports direct API calls, webhooks, and WhatsApp

## 📝 Notes

- The WhatsApp integration is currently simplified for demonstration
- The system focuses on the voice processing pipeline
- All API keys should be kept secure and not committed to version control
- The webhook proxy can be used independently of WhatsApp integration

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel**: Recommended for easy deployment
- **Netlify**: Good alternative
- **Docker**: Can be containerized
- **VPS**: Traditional server deployment

## 📞 Support

For issues or questions, please check the API documentation or create an issue in the repository.