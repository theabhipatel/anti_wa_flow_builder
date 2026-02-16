# WhatsApp Flow Builder Platform

A production-ready, visual WhatsApp chatbot builder with a drag-and-drop flow canvas, real-time simulator, and WhatsApp Cloud API integration.

## Architecture

```
├── server/          # Express + TypeScript + MongoDB backend
│   ├── src/
│   │   ├── models/      # Mongoose schemas (User, Bot, Flow, Session, etc.)
│   │   ├── controllers/ # Route handlers (auth, bot, flow, webhook, etc.)
│   │   ├── services/    # Business logic (execution engine, WhatsApp, OpenAI)
│   │   ├── middlewares/ # Auth, rate limiting, error handling
│   │   ├── routes/      # Express route definitions
│   │   └── utils/       # Encryption, flow validation
│   └── package.json
├── client/          # Vite + React + TypeScript + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/  # FlowBuilder (FlowNode, NodeLibrary, Settings, Simulator)
│   │   ├── pages/       # Login, Dashboard, BotList, FlowBuilder, Admin, Settings
│   │   ├── store/       # Redux slices (auth, builder with undo/redo)
│   │   ├── lib/         # Axios API client with JWT interceptor
│   │   └── types/       # Shared TypeScript interfaces
│   └── package.json
```

## Features

### 10 Node Types
| Node | Description |
|------|-------------|
| **START** | Entry point for every flow |
| **MESSAGE** | Send text messages with `{{variable}}` interpolation |
| **BUTTON** | Interactive button menus (up to 3 buttons) |
| **INPUT** | Collect user input with regex validation |
| **CONDITION** | Branch logic (equals, contains, regex, >, <) |
| **DELAY** | Pause execution (cron-based resume) |
| **API** | HTTP requests (GET/POST/PUT/DELETE) with variable storage |
| **AI** | OpenAI GPT integration with custom prompts |
| **LOOP** | Iterate over arrays with max iteration limits |
| **END** | Terminate flow with optional farewell message |

### Core Capabilities
- **Visual Flow Builder** — React Flow canvas with drag-and-drop, zoom, pan, minimap
- **WhatsApp Cloud API v24.0** — Send messages, interactive buttons, webhook handling
- **OpenAI Integration** — Per-user encrypted API keys, GPT-powered AI nodes
- **Flow Versioning** — Draft/Production versions with deploy and rollback
- **Session Management** — Per-user session isolation with variable scoping
- **Built-in Simulator** — Test flows without WhatsApp in a chat-style panel
- **Admin Panel** — User/bot monitoring with role-based access (ADMIN/USER)
- **Undo/Redo** — 50-action stack in the flow builder
- **Flow Validation** — Check for missing START/END, disconnected nodes, empty configs

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+

### 1. Clone and install
```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.
```

**Required `.env` variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whatsapp_flow_builder
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-character-hex-string
```

### 3. Seed the database
```bash
cd server && npx ts-node src/seed.ts
```
Creates two users:
- `admin@gmail.com` / `Admin@123` (ADMIN role)
- `abhi@gmail.com` / `Abhi@123` (USER role)

### 4. Run development servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 5. Connect WhatsApp
1. Go to **Bot Settings** → **WhatsApp Connection**
2. Enter your WhatsApp Business Phone Number ID and Access Token
3. Set your webhook URL to: `https://your-domain.com/api/webhook/whatsapp`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Flow, Redux Toolkit |
| Backend | Express.js, TypeScript, Mongoose |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| APIs | WhatsApp Cloud API v24.0, OpenAI API |
| Security | AES-256-CBC encryption, helmet, rate limiting, CORS |

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/bots` | List user's bots |
| POST | `/api/bots` | Create bot |
| POST | `/api/bots/:id/whatsapp` | Connect WhatsApp |
| GET | `/api/bots/:botId/flows` | List flows |
| POST | `/api/bots/:botId/flows` | Create flow |
| PUT | `/api/bots/:botId/flows/:id/draft` | Save draft |
| POST | `/api/bots/:botId/flows/:id/deploy` | Deploy to production |
| POST | `/api/bots/:botId/flows/:id/rollback` | Rollback version |
| POST | `/api/simulator/message` | Test flow in simulator |
| GET/POST | `/api/webhook/whatsapp` | WhatsApp webhook |

## License

MIT
