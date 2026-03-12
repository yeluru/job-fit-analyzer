# Job Fit Analyzer — PrepRight

AI-powered job fit analysis. Paste your resume + any job description. Get an honest grade, ATS score, learning plan with YouTube videos, interview prep questions, and a tailored cover letter.

Part of the [PrepRight](https://github.com/yeluru/prep-right) open-source ecosystem.

---

## Features

- **Fit Score** — Letter grade (A–F) with honest breakdown of strengths and gaps
- **ATS Check** — Keyword match score, found vs missing keywords
- **What to Learn** — Gap-based learning plan with YouTube tutorials fetched automatically
- **Interview Prep** — Likely interview questions from your gaps + how to answer them
- **Cover Letter** — One-click tailored cover letter from your actual experience

---

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **APIs:** Anthropic Claude, YouTube Data API v3
- **Hosting:** Render.com

---

## Local Development

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/job-fit-analyzer.git
cd job-fit-analyzer
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 4. Run in development
```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend runs on `http://localhost:5173`, proxies API calls to backend on `3001`.

---

## Getting API Keys

### Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account / log in
3. API Keys → Create Key
4. Copy into `.env` as `ANTHROPIC_API_KEY`
5. Cost: ~$0.03–0.05 per full analysis

### YouTube Data API Key (optional — videos won't show without it)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. APIs & Services → Library → search "YouTube Data API v3" → Enable
4. APIs & Services → Credentials → Create Credentials → API Key
5. Copy into `.env` as `YOUTUBE_API_KEY`
6. Free quota: 10,000 units/day (each video search = 100 units = 100 free searches/day)

---

## Deploy to Render

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Job Fit Analyzer"
git remote add origin https://github.com/YOUR_USERNAME/job-fit-analyzer.git
git push -u origin main
```

### 2. Create Render Web Service
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `job-fit-analyzer`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`

### 3. Add Environment Variables in Render
Go to your service → Environment → Add these:
```
ANTHROPIC_API_KEY = your_key_here
YOUTUBE_API_KEY   = your_key_here
NODE_ENV          = production
```

### 4. Deploy
Click "Create Web Service". Render builds and deploys automatically.

Every `git push` to `main` triggers a new deploy automatically.

---

## Cost Summary

| Service | Cost |
|---------|------|
| GitHub | Free |
| Render Free tier | $0 (cold starts after 15min idle) |
| Render Starter | $7/month (always-on, recommended) |
| Anthropic API | ~$0.03–0.05/analysis |
| YouTube Data API | Free (10K units/day) |
| **Total to launch** | **$0** |
| **To run properly** | **~$7/month** |

---

## Project Structure

```
job-fit-analyzer/
├── server.js          ← Express backend + API routes
├── package.json       ← Backend dependencies
├── client/
│   ├── src/
│   │   ├── App.jsx    ← Full React frontend
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## Part of PrepRight

This tool is part of the PrepRight open-source career intelligence ecosystem.
→ [github.com/yeluru/prep-right](https://github.com/yeluru/prep-right)
