# Voice Bridge - Next.js WhatsApp AI Assistant

A Next.js backend project that integrates WhatsApp Business API with Google Gemini AI and Uplift TTS for creating an intelligent voice-enabled chatbot.

## Features

- **WhatsApp Integration**: Send and receive messages via WhatsApp Business API
- **AI Responses**: Powered by Google Gemini API with Urdu/English support
- **Text-to-Speech**: Realistic Urdu TTS using Uplift API
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Conversation History**: Persistent chat history and user sessions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **AI**: Google Gemini API
- **TTS**: Uplift API for Urdu text-to-speech
- **Messaging**: WhatsApp Business API
- **Language**: TypeScript

## Setup Instructions

### 1. Environment Variables

Copy the environment template and fill in your API keys:

```bash
cp env.template .env.local
```

Required environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"

# Google Gemini API
GOOGLE_API_KEY="your-google-api-key"

# Uplift TTS API
UPLIFT_API_KEY="your-uplift-api-key"

# WhatsApp Business API
WHATSAPP_API_KEY="your-whatsapp-api-key"
WHATSAPP_PHONE_ID="your-phone-id"
WHATSAPP_BUSINESS_ID="your-business-id"
WHATSAPP_WEBHOOK_SECRET="your-webhook-secret"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup

1. Create a Supabase project and get your database URL
2. Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

3. (Optional) Open Drizzle Studio to view your database:

```bash
npm run db:studio
```

### 3. API Keys Setup

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local`

#### Uplift TTS API
1. Sign up at [Uplift.ai](https://uplift.ai)
2. Get your API key from the dashboard
3. Add it to your `.env.local`

#### WhatsApp Business API
1. Set up a Meta Business account
2. Create a WhatsApp Business app
3. Get your API key, phone ID, and business ID
4. Configure webhook URL: `https://your-domain.com/api/message`
5. Set webhook secret for verification

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check service status

### Message Processing
- **POST** `/api/message` - WhatsApp webhook endpoint
- **GET** `/api/message` - Webhook verification

### Text-to-Speech
- **POST** `/api/tts` - Generate TTS audio

### WhatsApp
- **POST** `/api/whatsapp/send` - Send WhatsApp message

## Database Schema

### Users Table
- `id` (serial, primary key)
- `phone` (varchar, unique)
- `created_at` (timestamp)

### Messages Table
- `id` (serial, primary key)
- `user_id` (integer, foreign key)
- `text` (text)
- `role` (varchar: 'user' or 'ai')
- `created_at` (timestamp)

### Sessions Table
- `id` (serial, primary key)
- `user_id` (integer, foreign key)
- `last_active` (timestamp)

## Flow Example

1. User sends WhatsApp message → webhook hits `/api/message`
2. Backend saves message in Supabase (via Drizzle)
3. Calls Gemini API → gets AI response
4. Optionally calls Uplift → generates Urdu TTS audio
5. Sends response back via WhatsApp API

## Development Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio

# Linting
npm run lint
```

## Project Structure

```
├── app/
│   └── api/
│       ├── health/route.ts
│       ├── message/route.ts
│       ├── tts/route.ts
│       └── whatsapp/send/route.ts
├── src/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── database.ts
│   │   ├── gemini.ts
│   │   ├── uplift.ts
│   │   └── whatsapp.ts
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── env.template
└── README.md
```

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Set environment variables in your deployment platform
3. Update WhatsApp webhook URL to your production domain
4. Run database migrations in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License