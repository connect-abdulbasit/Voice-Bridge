# Voice Bridge - WhatsApp Voice Processing System

A complete monorepo solution for WhatsApp voice processing with both backend and frontend components.

## 🏗️ Architecture

```
voice-bridge-monorepo/
├── backend(node)/          # WhatsApp Bot Backend (Express + Baileys)
│   ├── src/
│   │   ├── server.ts       # Express server
│   │   ├── whatsapp.ts     # WhatsApp bot with auto-reply
│   │   └── routes/
│   │       └── api.ts      # API routes
│   ├── baileys_auth_info/  # WhatsApp session data
│   └── package.json        # Backend dependencies
└── nextjs/                 # Frontend Dashboard (Next.js)
    ├── app/
    │   ├── api/            # API routes
    │   └── page.tsx        # Dashboard UI
    ├── src/
    │   └── lib/            # Utility libraries
    └── package.json        # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- WhatsApp account

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd Voice-Bridge
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
- **Voice Processing**: Ready for voice-to-text and text-to-speech integration

### Frontend (Dashboard)
- **Bot Management**: Start/stop WhatsApp bot
- **Real-time Status**: Monitor bot connection status
- **API Testing**: Test all endpoints
- **Voice Processing**: Test voice processing pipeline

## 🔧 API Endpoints

### Backend API (`http://localhost:3001/api`)
- `GET /init` - Initialize WhatsApp connection
- `POST /send` - Send message to WhatsApp number

### Frontend API (`http://localhost:3000/api`)
- `/bot` - Bot status and management
- `/webhook-proxy` - Voice processing proxy
- `/webhook` - Meta webhook verification

## 🛠️ Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both services in development |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build both projects |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |
| `npm run start` | Start both services in production |
| `npm run install:all` | Install dependencies for all projects |
| `npm run clean` | Remove all node_modules |

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

## 📦 Dependencies

### Backend
- **@whiskeysockets/baileys**: WhatsApp Web API
- **express**: Web server
- **cors**: Cross-origin resource sharing
- **qrcode-terminal**: QR code display
- **axios**: HTTP client
- **dotenv**: Environment variables

### Frontend
- **next.js**: React framework
- **@whiskeysockets/baileys**: WhatsApp integration
- **tailwindcss**: Styling
- **axios**: HTTP client

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_KEY` | OpenAI API key for LLM | Optional |
| `UPLIFT_KEY` | UpliftAI API key for STT/TTS | Optional |
| `PORT` | Backend server port | No (default: 3001) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for frontend | No |

## 🚀 Deployment

### Railway (Recommended)
1. Push your code to GitHub
2. Connect Railway to your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Manual Deployment
1. Build both projects: `npm run build`
2. Start backend: `npm run start:backend`
3. Start frontend: `npm run start:frontend`

### Vercel (Frontend only)
```bash
cd nextjs
vercel deploy
```

## 📱 WhatsApp Bot Usage

### 1. Initialize Bot
```bash
curl -X GET http://localhost:3001/api/init
```

### 2. Check QR Code
- Look at your terminal for the QR code
- Scan with WhatsApp on your phone
- Bot will connect automatically

### 3. Test Auto-reply
Send these messages to your bot:
- `hi` → "👋 Hello! I'm your WhatsApp bot. How can I assist you?"
- `help` → Shows available commands
- `status` → "📊 System running smoothly 🚀"
- `bye` → "👋 Goodbye! Have a great day."

### 4. Send Messages via API
```bash
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "1234567890",
    "message": "Hello from API!"
  }'
```

## 🔧 Troubleshooting

### WhatsApp Connection Issues
1. **QR Code not showing**: Check terminal logs
2. **Connection fails**: Clear `baileys_auth_info` folder and reconnect
3. **Phone not connecting**: Ensure phone has internet connection

### Development Issues
1. **Port conflicts**: Change PORT in environment variables
2. **Dependencies**: Run `npm run install:all`
3. **Build errors**: Check TypeScript configuration

### Common Commands
```bash
# Clear all dependencies and reinstall
npm run clean
npm run install:all

# Check if services are running
curl http://localhost:3001/api/init
curl http://localhost:3000
```

## 🎯 Use Cases

- **WhatsApp Voice Assistant**: Process voice messages and respond with voice
- **Customer Support Bot**: Automated responses for common queries
- **Webhook Integration**: Integrate with external systems
- **Voice API Proxy**: Act as middleware for voice processing services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test both backend and frontend
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the API documentation in each service
- **Community**: Join our Discord server (if available)

## 🔄 Updates

- **Backend Updates**: Push to GitHub to trigger automatic redeployment
- **Frontend Updates**: Vercel will automatically redeploy
- **Dependencies**: Run `npm run install:all` after pulling updates

---

**Made with ❤️ for the WhatsApp developer community**
