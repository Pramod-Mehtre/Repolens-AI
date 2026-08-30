# 🔭 RepoLens AI

**Intelligent GitHub Repository Analyzer** — Powered by Groq AI

> Paste any public GitHub repository URL and get a comprehensive AI-generated technical analysis in seconds, streamed in real time.

[![IBM SkillsBuild](https://img.shields.io/badge/IBM%20SkillsBuild-Capstone%20Project-blue)](https://skillsbuild.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

---

## ✨ Features

- **Instant Analysis** — Paste a GitHub URL and receive a comprehensive AI report
- **Real-time Streaming** — Watch the analysis appear progressively via Server-Sent Events (SSE)
- **Repository Stats** — View stars, forks, languages, topics, and more at a glance
- **Full Technical Report** — Architecture, engineering decisions, production readiness, security, improvements
- **Scoring Dashboard** — Code quality scores across 6 dimensions
- **Learning Guide** — Step-by-step guide for exploring the repository
- **Decision Verdicts** — AI-powered verdicts on whether to learn, contribute, or use in production
- **Google OAuth** — Optional sign-in to save and revisit past analyses
- **Responsive Design** — Premium glassmorphism UI that works on desktop and mobile
- **Docker Ready** — Multi-stage Dockerfile for production deployment

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express, Helmet, CORS, Rate Limiting |
| **AI** | Groq API (Llama 3.3 70B / Llama 3.1 8B instant fallback) |
| **Auth** | Google OAuth 2.0 + HttpOnly JWT cookies |
| **Data** | GitHub REST API |
| **Streaming** | Server-Sent Events (SSE) |
| **DevOps** | Docker (multi-stage), Render / Railway / AWS App Runner |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Groq API Key** — [Get one free](https://console.groq.com/keys)
- (Optional) **GitHub Personal Access Token** — [Create one](https://github.com/settings/tokens) to raise rate limits from 60 to 5000 req/hr
- (Optional) **Google OAuth Client ID** — [Create one](https://console.cloud.google.com/apis/credentials) for sign-in features

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd repolens-ai

# Create your environment file from the template
cp .env.example .env
# Edit .env and fill in your real values
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Run in Development

Open **two** terminal windows:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

### 4. Run with Docker

```bash
# Build and run with your .env file
docker build -t repolens-ai .
docker run -p 8080:8080 --env-file .env repolens-ai
```

Visit **http://localhost:8080** in your browser.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Groq API key for AI analysis |
| `JWT_SECRET` | Recommended | Secret for signing JWT tokens (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID for sign-in |
| `GITHUB_TOKEN` | Optional | GitHub PAT to raise API rate limit |
| `PORT` | Optional | Server port (default: 8080) |
| `NODE_ENV` | Optional | `development` or `production` |
| `FRONTEND_URL` | Production | CORS origin for production frontend URL |

> **Security Note**: Never commit your `.env` file. It is already in `.gitignore`. Only `.env.example` (with placeholder values) is committed.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                   │
│  URL Input → Fetch API (SSE Reader) → Analysis Dashboard │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /api/analyze
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Backend                         │
│  URL Validator → GitHub Service → AI Service → SSE      │
└─────────┬────────────────────────────────┬──────────────┘
          │                                │
          ▼                                ▼
   GitHub REST API                    Groq API
   (metadata, tree,              (Llama 3.3 70B /
    README, configs)              8B instant fallback)
```

---

## 📁 Project Structure

```
repolens-ai/
├── backend/
│   ├── server.js                    # Express entry point
│   ├── routes/
│   │   ├── analyze.routes.js        # POST /api/analyze (SSE)
│   │   ├── analysis.routes.js       # Saved analyses
│   │   ├── auth.routes.js           # Google OAuth + JWT
│   │   └── stats.routes.js          # Usage stats
│   ├── services/
│   │   ├── github.service.js        # GitHub API integration
│   │   ├── ai.service.js            # Groq AI analysis
│   │   └── analyzer.service.js      # Static repo analyzer
│   ├── middleware/
│   │   ├── auth.js                  # JWT auth middleware
│   │   └── errorHandler.js          # Centralized error handling
│   └── utils/
│       ├── envValidator.js          # Fail-fast env validation
│       ├── logger.js                # Structured logger
│       └── validators.js            # URL & input validation
├── frontend/
│   ├── index.html                   # Entry HTML with SEO meta
│   ├── src/
│   │   ├── App.jsx                  # Root component + routing
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Design system
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # Auth context
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   ├── services/
│   │   │   └── api.js               # SSE streaming client
│   │   └── utils/                   # Frontend utilities
│   └── vite.config.js
├── Dockerfile                       # Multi-stage production build
├── Procfile                         # Heroku / Render process file
├── .env.example                     # Environment variable template
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

### Option 1: Render (Recommended — Free tier available)

1. Push this repository to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Build Command**: `cd frontend && npm ci && npm run build && cd ../backend && npm ci`
4. Set **Start Command**: `cd backend && node server.js`
5. Add environment variables in Render dashboard (from your `.env`)
6. Set `NODE_ENV=production` and `FRONTEND_URL=<your render URL>`

### Option 2: Railway

1. Connect your GitHub repository in [Railway](https://railway.app)
2. Add environment variables from your `.env`
3. Railway auto-detects the Node.js app and deploys

### Option 3: Docker / AWS App Runner

```bash
# Build image
docker build -t repolens-ai .

# Push to ECR then deploy via App Runner
# Set env vars in App Runner configuration — never bake them into the image
```

---

## 🔒 Security

- All API keys are loaded from environment variables — never hardcoded
- JWT tokens are stored in `HttpOnly` cookies (not accessible to JavaScript)
- CORS is locked to the configured `FRONTEND_URL` in production
- Rate limiting protects `/api/analyze` (30 req/15min) and `/api/auth` (10 req/15min)
- Helmet sets secure HTTP headers
- Stack traces are hidden in production error responses
- Source maps are disabled in the production frontend build

---

## 📝 License

This project is part of the IBM SkillsBuild GenAI & Cloud Computing Internship Capstone Project (2026).
