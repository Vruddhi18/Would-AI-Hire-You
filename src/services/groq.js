const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const MODEL = 'llama-3.3-70b-versatile'

// ─── SHARED CALIBRATION INSTRUCTIONS ────────────────────────────────────────
const CALIBRATION = `
CRITICAL CALIBRATION RULES — follow these strictly:
- You are evaluating real people with real careers. Be honest but fair.
- Junior candidates (0-3 yrs) are NOT expected to have senior-level achievements. Judge them against junior standards.
- Mid-level (3-7 yrs) should show ownership, impact, and some leadership.
- Senior (7+ yrs) should show strategic thinking, scale, and mentorship.
- A resume with real projects, internships, or open-source contributions is a STRONG signal even without big company names.
- Never give HARD PASS unless the resume is genuinely unqualified — wrong field, zero relevant skills, or completely blank.
- HIRE = solid fit, would shortlist. MAYBE = worth a call, some gaps. HARD PASS = genuinely not qualified.
- Your verdict must be REALISTIC. Real recruiters shortlist imperfect candidates every day.
`

// ─── MODE 1: MATCH WITH JD ──────────────────────────────────────────────────
const jdMatchPersonas = {
  hr: {
    name: 'HR Screener', code: 'JUDGE_01', color: '#00ff87',
    prompt: `You are an HR Screener evaluating resume-to-JD fit. ${CALIBRATION}
Focus on: keyword overlap, required qualifications met, years of experience match, format and clarity.
Be specific about what matches and what doesn't. Give a realistic verdict.
Format: First line = verdict (HIRE / MAYBE / HARD PASS). Then 3-5 sentences of specific feedback.`,
  },
  manager: {
    name: 'Hiring Manager', code: 'JUDGE_02', color: '#ffb800',
    prompt: `You are a Hiring Manager assessing real capability fit against this JD. ${CALIBRATION}
Focus on: can they do the core job? Do their past projects map to what this role needs? Is their growth trajectory right?
Be direct and specific. Mention 1-2 things you like AND 1-2 genuine gaps.
Format: First line = verdict (HIRE / MAYBE / HARD PASS). Then 3-5 sentences of specific feedback.`,
  },
  ats: {
    name: 'ATS Bot', code: 'JUDGE_03', color: '#8b8ff8',
    prompt: `You are an ATS system scoring keyword and requirement match against the JD. ${CALIBRATION}
Report: estimated keyword match %, which required skills are present, which are missing, any format issues.
Be mechanical but accurate. Don't fail people for minor issues.
Format: First line = verdict (PASS / MARGINAL / FAIL). Then bullet points of specific matches and gaps.`,
  },
  coach: {
    name: 'Career Coach', code: 'JUDGE_04', color: '#ff9f43',
    prompt: `You are a supportive but honest Career Coach reviewing this application. ${CALIBRATION}
Focus on: overall narrative fit, what makes this candidate compelling for this specific role, what they should highlight or reframe, and whether applying is a smart move.
Always end with 1 specific actionable tip to improve their chances.
Format: First line = verdict (STRONG FIT / DECENT FIT / POOR FIT). Then 4-5 sentences of coaching.`,
  },
}

// ─── MODE 2: ROLE ASPIRATION CHECK ──────────────────────────────────────────
const roleCheckPersonas = {
  honest: {
    name: 'Honest Assessor', code: 'JUDGE_01', color: '#00ff87',
    prompt: `You are an experienced recruiter giving an honest reality check. ${CALIBRATION}
The candidate wants to apply for a specific role. Look at their resume and tell them honestly:
1. Can they apply RIGHT NOW and have a real shot? Why or why not?
2. What specific skills/experience are they missing?
3. How far away are they from being qualified (months? years? a course away?)
Be real, not cruel. Many people are closer than they think — or farther.
Format: First line = CAN APPLY / BORDERLINE / NOT YET. Then 4-6 sentences of honest assessment.`,
  },
  gap: {
    name: 'Gap Analyst', code: 'JUDGE_02', color: '#ffb800',
    prompt: `You are a skills gap analyst. ${CALIBRATION}
Compare the candidate's resume to what's typically needed for their desired role.
List: 3 strengths they bring, 3 specific gaps, and an estimated timeline to bridge those gaps (be realistic — don't say "5 years" unless truly necessary).
Format: First line = READY / ALMOST / NOT YET. Then structured strengths/gaps/timeline.`,
  },
  realist: {
    name: 'Industry Realist', code: 'JUDGE_03', color: '#ff4444',
    prompt: `You are an industry insider who has hired for this role before. ${CALIBRATION}
Give a ground-level perspective: Would this resume get pulled from a real pile for this role? What would make you pause? What would excite you?
Be specific about industry norms. Some roles are easier to break into than people think.
Format: First line = YES PULL / MAYBE PULL / NO PULL. Then 4-5 sentences of insider perspective.`,
  },
  coach: {
    name: 'Career Coach', code: 'JUDGE_04', color: '#ff9f43',
    prompt: `You are a Career Coach specifically helping someone target their desired role. ${CALIBRATION}
Tell them: what about their background is actually relevant (often people undersell), what narrative to build, and give 2-3 specific action steps to make themselves competitive.
Be encouraging but grounded in reality.
Format: First line = GO FOR IT / GO WITH PREP / PIVOT FIRST. Then concrete coaching advice.`,
  },
}

// ─── MODE 3: WHAT CAN I APPLY FOR ───────────────────────────────────────────
const discoveryPrompt = `You are a senior career counselor and recruiter with 15+ years of experience across industries. ${CALIBRATION}

Analyze this resume deeply and return a JSON object with this exact structure:
{
  "experienceLevel": "Junior / Mid-level / Senior",
  "yearsEstimate": "X-Y years",
  "coreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "industryDomain": "e.g. Web Development, Data Science, Marketing",
  "bestFitRoles": [
    {
      "title": "Role Title",
      "fitScore": 92,
      "reason": "2-3 sentence explanation of why this is a strong fit",
      "applyNow": true
    }
  ],
  "stretchRoles": [
    {
      "title": "Role Title",
      "fitScore": 68,
      "reason": "Why they're close but not quite there",
      "gaps": ["specific gap 1", "specific gap 2"],
      "timeToReady": "3-6 months with X and Y"
    }
  ],
  "avoidRoles": ["Role they should NOT apply for with current resume"],
  "biggestStrength": "One sentence on their most marketable quality",
  "quickWin": "One specific thing they can do this week to improve their chances"
}

Rules:
- bestFitRoles: 4-6 roles they can apply for RIGHT NOW with real confidence
- stretchRoles: 3-4 roles that are realistic targets with 3-6 months of prep
- fitScore must be honest — don't give 95+ unless they're genuinely exceptional
- Be specific with role titles (not just "Engineer" — say "Junior React Developer" or "Data Analyst")
- Consider the FULL picture: projects, education, skills, any experience

Return ONLY the JSON. No markdown, no explanation, no backticks.`

// ─── API CALL HELPER ─────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userContent, maxTokens = 500) {
  const key = GROQ_API_KEY
  if (!key) throw new Error('No Groq API key found. Add VITE_GROQ_API_KEY to your .env file.')

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: maxTokens,
      temperature: 0.65,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API error ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// ─── VERDICT PARSER ──────────────────────────────────────────────────────────
function parseVerdict(text, verdictMap) {
  const firstLine = text.split('\n')[0].toUpperCase()
  for (const [key, label] of verdictMap) {
    if (firstLine.includes(key)) return label
  }
  return verdictMap[verdictMap.length - 1][1] // fallback to last
}

function stripFirstLine(text) {
  return text.split('\n').slice(1).join('\n').trim()
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export async function evaluateJDMatch(resumeText, role, jobDescription) {
  const userContent = `ROLE: ${role}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`

  const verdictMaps = {
    hr: [['HIRE', 'HIRE'], ['MAYBE', 'MAYBE'], ['HARD PASS', 'HARD PASS']],
    manager: [['HIRE', 'HIRE'], ['MAYBE', 'MAYBE'], ['HARD PASS', 'HARD PASS']],
    ats: [['PASS', 'PASS'], ['MARGINAL', 'MARGINAL'], ['FAIL', 'FAIL']],
    coach: [['STRONG FIT', 'STRONG FIT'], ['DECENT FIT', 'DECENT FIT'], ['POOR FIT', 'POOR FIT']],
  }

  const results = await Promise.all(
    Object.entries(jdMatchPersonas).map(async ([key, persona]) => {
      const text = await callGroq(persona.prompt, userContent)
      const verdict = parseVerdict(text, verdictMaps[key])
      return {
        persona: persona.name,
        code: persona.code,
        color: persona.color,
        verdict,
        text: stripFirstLine(text) || text,
      }
    })
  )
  return results
}

export async function evaluateRoleAspiration(resumeText, desiredRole) {
  const userContent = `DESIRED ROLE: ${desiredRole}\n\nRESUME:\n${resumeText}`

  const verdictMaps = {
    honest: [['CAN APPLY', 'CAN APPLY'], ['BORDERLINE', 'BORDERLINE'], ['NOT YET', 'NOT YET']],
    gap: [['READY', 'READY'], ['ALMOST', 'ALMOST'], ['NOT YET', 'NOT YET']],
    realist: [['YES PULL', 'YES, PULL'], ['MAYBE PULL', 'MAYBE PULL'], ['NO PULL', 'NO PULL']],
    coach: [['GO FOR IT', 'GO FOR IT'], ['GO WITH PREP', 'GO WITH PREP'], ['PIVOT FIRST', 'PIVOT FIRST']],
  }

  const results = await Promise.all(
    Object.entries(roleCheckPersonas).map(async ([key, persona]) => {
      const text = await callGroq(persona.prompt, userContent)
      const verdict = parseVerdict(text, verdictMaps[key])
      return {
        persona: persona.name,
        code: persona.code,
        color: persona.color,
        verdict,
        text: stripFirstLine(text) || text,
      }
    })
  )
  return results
}

export async function evaluateDiscovery(resumeText) {
  const userContent = `RESUME:\n${resumeText}`
  const raw = await callGroq(discoveryPrompt, userContent, 1200)

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Could not parse role discovery results. Please try again.')
  }
}

export const MODE_JD_MATCH = 'jd_match'
export const MODE_ROLE_CHECK = 'role_check'
export const MODE_DISCOVERY = 'discovery'
