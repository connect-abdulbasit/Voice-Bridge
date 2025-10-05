# Voice Bridge - Monorepo

A complete WhatsApp voice processing system with both backend and frontend components.

## 🏗️ Architecture

```
voice-bridge-monorepo/
├── backend(node)/          # WhatsApp Bot Backend (Express + Baileys)
│   ├── src/
│   │   ├── server.ts       # Express server
│   │   ├── whatsapp.ts     # WhatsApp bot
│   │   └── routes/
│   │       └── api.ts      # API routes
│   └── baileys_auth_info/  # WhatsApp session data
└── nextjs/                 # Frontend Dashboard (Next.js)
    ├── app/
    │   ├── api/            # API routes
    │   └── page.tsx        # Dashboard UI
    └── src/
        └── lib/            # Utility libraries
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies for both projects
npm run install:all
```

### 2. Environment Setup
Create `.env` files in both directories:

**backend(node)/.env:**
```env
PORT=3001
OPENAI_KEY=your_openai_api_key_here
UPLIFT_KEY=your_upliftai_api_key_here
```

**nextjs/.env:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
OPENAI_KEY=your_openai_api_key_here
UPLIFT_KEY=your_upliftai_api_key_here
```

### 3. Run Both Services
```bash
# Run both backend and frontend simultaneously
npm run dev
```

This will start:
- **Backend**: `http://localhost:3001` (WhatsApp Bot)
- **Frontend**: `http://localhost:3000` (Dashboard)

## 📱 Features

### Backend (WhatsApp Bot)
- **WhatsApp Integration**: Full WhatsApp Web API with Baileys
- **Auto-reply System**: Intelligent message responses
- **QR Code Display**: Terminal-based QR code for authentication
- **Auto-reconnection**: Handles disconnections gracefully

### Frontend (Dashboard)
- **Bot Management**: Start/stop WhatsApp bot
- **Voice Processing**: Test voice processing pipeline
- **Real-time Status**: Monitor bot connection status
- **API Testing**: Test all endpoints

## 🔧 API Endpoints

### Backend API (`http://localhost:3001/api`)
- `GET /init` - Initialize WhatsApp connection
- `POST /send` - Send message to WhatsApp number

### Frontend API (`http://localhost:3000/api`)
- `/bot` - Bot status and management
- `/webhook-proxy` - Voice processing proxy
- `/webhook` - Meta webhook verification

## 🛠️ Development

### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Building
```bash
# Build both projects
npm run build

# Build individual projects
npm run build:backend
npm run build:frontend
```

### Production
```bash
# Start both services
npm start
```

## 📦 Dependencies

### Backend
- **@whiskeysockets/baileys**: WhatsApp Web API
- **express**: Web server
- **qrcode-terminal**: QR code display

### Frontend
- **next.js**: React framework
- **@whiskeysockets/baileys**: WhatsApp integration
- **tailwindcss**: Styling

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_KEY` | OpenAI API key for LLM | Optional |
| `UPLIFT_KEY` | UpliftAI API key for STT/TTS | Optional |
| `PORT` | Backend server port | No (default: 3001) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for frontend | No |

## 🚀 Deployment

### Manual Deployment
1. Build both projects: `npm run build`
2. Start backend: `npm run start:backend`
3. Start frontend: `npm run start:frontend`

### Vercel (Frontend only)
```bash
cd nextjs
vercel deploy
```

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both services in development |
| `npm run build` | Build both projects |
| `npm run start` | Start both services in production |
| `npm run install:all` | Install dependencies for all projects |
| `npm run clean` | Remove all node_modules |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
