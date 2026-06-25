# Would AI Hire You?

A brutally honest AI hiring panel that evaluates your resume against any role.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Add your Groq API key to `.env`:
```bash
cp .env.example .env
# Edit .env and add your VITE_GROQ_API_KEY
```

Get a free Groq API key at https://console.groq.com/keys

3. Run locally:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add `VITE_GROQ_API_KEY` in Vercel environment variables
4. Deploy

## Stack

- React + Vite
- Three.js (3D background)
- GSAP + ScrollTrigger (animations)
- Groq API (LLaMA 3.3 70B)
- pdf.js (browser-side PDF parsing)
- Zero backend — fully static deployment

## Privacy

Resumes are parsed entirely in the browser. Nothing is stored or transmitted except to the Groq API for evaluation.
# Would-AI-Hire-You
