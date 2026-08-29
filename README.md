# 🌸 Velora 
# Your health. Your body. Your life

Velora is a next-generation private AI-powered women's health and life companion designed to unify the major stages of a woman's health journey into one intelligent, personalized workspace.
Velora adapts to the user's current life stage — from teen years and menstrual health through fertility, pregnancy, postpartum, motherhood, perimenopause, menopause, and healthy aging.
Instead of presenting users with dozens of disconnected health modules, Velora uses its Women's Life Map™ to dynamically surface the features, information, insights, and tools that are relevant to each individual woman.
Velora is built as a scalable, privacy-first SaaS platform focused on excellent UX, health-data security, personalization, accessibility, and production-grade architecture.



<img width="755" height="436" alt="image" src="https://github.com/user-attachments/assets/60c26386-bc5b-4a80-84f6-eaf8b261be60" />




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


<img width="956" height="435" alt="image" src="https://github.com/user-attachments/assets/7e810855-b473-48e6-a3c5-4100251a8e70" />



### 🗓️ Cycle & Timeline
- Cycle phase tracking
- Timeline view of events
- Pattern recognition
- Personalized insights


<img width="956" height="433" alt="image" src="https://github.com/user-attachments/assets/607b4426-69c4-4bb7-a35f-c09468660a2c" />


<img width="951" height="437" alt="image" src="https://github.com/user-attachments/assets/51f191d4-a8b8-44ea-9a64-78828667189f" />



### 💾 Health Vault
- Secure document storage
- AI-powered document extraction
- Lab results & medical records
- Privacy-centered design


<img width="958" height="432" alt="image" src="https://github.com/user-attachments/assets/06617547-6ecc-44d8-8173-89e5a01f8a1b" />



### 🤖 AI Copilot
- Health literacy guidance
- Doctor appointment preparation
- Pattern analysis
- Safety-first responses


<img width="954" height="438" alt="image" src="https://github.com/user-attachments/assets/919a6164-fc1d-4d3e-bb5b-1d6f41f93bc5" />



### 🔒 Privacy Center
- Privacy matrix settings
- Data control & permissions
- External sync management
- Discreet mode


<img width="952" height="427" alt="image" src="https://github.com/user-attachments/assets/bf93e572-9bd6-445f-aa6d-34b801a5d252" />



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
