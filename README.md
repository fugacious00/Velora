# 🌸 Velora Health OS

A comprehensive women's health companion platform with AI-powered health insights, cycle tracking, health vault management, and personalized wellness guidance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup & Run Locally

```bash
# Install dependencies
npm install

# Create environment file
cat > .env.local << 'ENVEOF'
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
ENVEOF

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🛠️ Available Commands

```bash
npm run dev      # Start dev server with backend & frontend
npm run build    # Build for production (frontend only)
npm start        # Run production build (requires npm run build first)
npm run lint     # TypeScript type checking
npm run preview  # Preview production build locally
```

## 📁 Project Structure

```
src/
├── components/      # React UI components
├── context/        # State management (HealthContext)
├── data/          # Initial data & affirmations
├── types.ts       # TypeScript type definitions
├── utils/         # Health insights engine
└── main.tsx       # React entry point

server.ts          # Express backend server
vite.config.ts     # Vite configuration
tsconfig.json      # TypeScript configuration
```

## ✨ Features

### 📊 Dashboard
- Today's health snapshot
- Mood & symptom tracking
- Sleep and hydration logs
- 7-day trend analysis

### 🗓️ Cycle & Timeline
- Cycle phase tracking
- Timeline view of events
- Pattern recognition
- Personalized insights

### 💾 Health Vault
- Secure document storage
- AI-powered document extraction
- Lab results & medical records
- Privacy-centered design

### 🤖 AI Copilot
- Health literacy guidance
- Doctor appointment preparation
- Pattern analysis
- Safety-first responses

### 🔒 Privacy Center
- Privacy matrix settings
- Data control & permissions
- External sync management
- Discreet mode

## 🔧 Environment Setup

```env
# Required for AI features (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Server configuration
NODE_ENV=development
PORT=3000
```

## 📦 Tech Stack

**Frontend:**
- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS 4
- Lucide React (icons)
- Recharts (charts)
- Motion (animations)

**Backend:**
- Express.js
- Node.js
- Google Gemini AI (optional)
- Helmet (security)
- CORS (cross-origin)
- Rate limiting

## 🔐 Security Features

✅ **Request Validation** - Input sanitization & size limits  
✅ **Rate Limiting** - API throttling (100 req/15min)  
✅ **Security Headers** - CSP, HSTS, X-Frame-Options  
✅ **CORS** - Configurable origin restrictions  
✅ **Error Handling** - Safe error responses  
✅ **No Data Persistence** - Browser-only storage  
✅ **Offline Support** - Works without internet  

## 🏥 Health Copilot

The AI-powered health companion provides:
- Non-diagnostic health education
- Pattern observation from your logs
- Doctor appointment question suggestions
- Lifecycle-specific wellness guidance
- Red flag symptom detection

**Important:** Copilot provides educational content, not medical diagnosis. Always consult healthcare providers for medical advice.

## 📝 License

MIT

---

**Velora Health OS** — Supporting women's health at every life stage.

Built for privacy, security, and empowerment.
