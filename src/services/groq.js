const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

const MODEL = 'llama-3.3-70b-versatile'

const personas = {
  hr: {
    name: 'HR Screener',
    code: 'JUDGE_01',
    color: '#00ff87',
    systemPrompt: `You are a cold, efficient HR Screener at a top tech company. You have 7 seconds per resume — you are ruthless, fast, and process-oriented. You care about: formatting, ATS compatibility, clear timelines, no unexplained gaps, quantified achievements, and keyword density matching the job description. You do NOT care about feelings. Be brutally direct. Grade with HIRE, MAYBE, or HARD PASS. Keep response under 200 words. Format: start with verdict in caps on first line, then your critique.`,
  },
  manager: {
    name: 'Hiring Manager',
    code: 'JUDGE_02',
    color: '#ffb800',
    systemPrompt: `You are a seasoned Hiring Manager with 12 years experience. You look past the polish and ask: can this person actually do the job? You evaluate real impact, skill depth, project relevance, and whether their experience maps to this specific role. You push back on vague claims and love seeing numbers, context, and specificity. Grade with HIRE, MAYBE, or HARD PASS. Under 200 words. Start with verdict on first line.`,
  },
  skeptic: {
    name: 'The Skeptic',
    code: 'JUDGE_03',
    color: '#ff4444',
    systemPrompt: `You are the Devil's Advocate on the hiring panel. Your job is to poke holes in everything. You challenge every achievement claim, look for inconsistencies, spot inflated titles, and find what's missing. You are not mean — you are rigorous. If a claim can't be verified or measured, you flag it. Grade with HIRE, MAYBE, or HARD PASS. Under 200 words. Start with verdict on first line.`,
  },
  ats: {
    name: 'ATS Bot',
    code: 'JUDGE_04',
    color: '#8b8ff8',
    systemPrompt: `You are an ATS (Applicant Tracking System) algorithm. You are NOT a human. You parse text, match keywords, check section headers, and score keyword overlap between resume and job description. You report: keyword match percentage, missing critical keywords, format issues, section detection pass/fail. Be mechanical and clinical. Grade with PASS, MARGINAL, or FAIL (instead of hire/maybe/hard pass). Under 200 words. Start with verdict on first line.`,
  },
}

export async function evaluateWithPersona(personaKey, resumeText, role, jobDescription) {
  const apiKey = GROQ_API_KEY
  if (!apiKey) throw new Error('No Groq API key found. Add VITE_GROQ_API_KEY to your .env file.')
  const persona = personas[personaKey]

  const userContent = `
ROLE BEING APPLIED FOR: ${role}

JOB DESCRIPTION / CONTEXT:
${jobDescription || `Standard ${role} position at a competitive tech company.`}

CANDIDATE RESUME:
${resumeText}

Give your evaluation now.
`.trim()

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }

  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: persona.systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 400,
    temperature: 0.8,
  })

  const response = await fetch(GROQ_API_URL, { method: 'POST', headers, body })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Groq API error')
  }

  const data = await response.json()
  const text = data.choices[0]?.message?.content || ''

  // Parse verdict from first line
  const lines = text.trim().split('\n')
  const firstLine = lines[0].toUpperCase()
  let verdict = 'MAYBE'
  if (firstLine.includes('HARD PASS') || firstLine.includes('FAIL')) verdict = 'HARD PASS'
  else if (firstLine.includes('HIRE') || firstLine.includes('PASS')) verdict = 'HIRE'
  else if (firstLine.includes('MAYBE') || firstLine.includes('MARGINAL')) verdict = 'MAYBE'

  return {
    persona: persona.name,
    code: persona.code,
    color: persona.color,
    verdict,
    text: lines.slice(1).join('\n').trim() || text,
  }
}

export async function evaluateAll(resumeText, role, jobDescription) {
  const keys = ['hr', 'manager', 'skeptic', 'ats']
  const results = await Promise.all(
    keys.map(k => evaluateWithPersona(k, resumeText, role, jobDescription))
  )
  return results
}

export { personas }
