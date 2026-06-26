import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { extractTextFromPDF } from '../services/pdfParser'
import { evaluateJDMatch, evaluateRoleAspiration, evaluateDiscovery, MODE_JD_MATCH, MODE_ROLE_CHECK, MODE_DISCOVERY } from '../services/groq'
import Results from './Results'

const ROLES = [
  'Software Engineer','Frontend Engineer','Backend Engineer','Full Stack Engineer',
  'Data Scientist','ML Engineer','AI/ML Engineer','Data Analyst',
  'Product Manager','Product Designer','UX Designer','UI Designer',
  'DevOps Engineer','Cloud Engineer','Site Reliability Engineer',
  'Marketing Manager','Growth Marketer','Content Strategist',
  'Business Analyst','Project Manager','Scrum Master',
  'Sales Engineer','Account Executive','Customer Success Manager',
  'CTO','VP of Engineering','Engineering Manager','QA Engineer',
  'Prompt Engineer','AI Research Scientist','Automation Engineer',
]

const MODES = [
  {
    id: MODE_JD_MATCH,
    icon: '🎯',
    title: 'Match With Job Description',
    subtitle: 'Have a specific JD? See exactly how well your resume maps to it.',
    detail: 'Paste the job description and get a keyword match score, requirement gap analysis, and a realistic verdict from 4 evaluators.',
    needsRole: true,
    needsJD: true,
  },
  {
    id: MODE_ROLE_CHECK,
    icon: '🔍',
    title: 'Can I Apply For This Role?',
    subtitle: "Targeting a role but not sure you're ready? Get an honest answer.",
    detail: 'Tell us the role you want. Our panel checks your resume against real hiring standards for that role and tells you honestly: apply now, apply with prep, or not yet.',
    needsRole: true,
    needsJD: false,
  },
  {
    id: MODE_DISCOVERY,
    icon: '🗺️',
    title: 'What Can I Apply For?',
    subtitle: 'Not sure where you fit? Let your resume speak for itself.',
    detail: 'Upload your resume with no role in mind. We analyze your full profile and return: roles you can apply for right now + stretch roles with a roadmap to get there.',
    needsRole: false,
    needsJD: false,
  },
]

export default function EvalForm({ formRef }) {
  const [mode, setMode] = useState(null)
  const [step, setStep] = useState(0) // 0=mode, 1=resume, 2=role/jd, 3=loading/results
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const dropRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
    }
  }, [step, mode])

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(roleFilter.toLowerCase()))
  const selectedRole = role || customRole
  const currentMode = MODES.find(m => m.id === mode)

  const handleFileChange = async (file) => {
    if (!file) return
    setError('')
    if (file.type !== 'application/pdf') return setError('Please upload a PDF file.')
    setResumeFile(file)
    try {
      const text = await extractTextFromPDF(file)
      if (!text || text.length < 50) {
        setError('Could not extract text from this PDF. Please paste your resume as text below.')
      } else {
        setResumeText(text)
      }
    } catch {
      setError('Could not parse PDF. Please paste your resume as text below.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (dropRef.current) dropRef.current.style.borderColor = 'var(--gray-border)'
    handleFileChange(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!resumeText.trim()) return setError('Please upload or paste your resume.')
    if (currentMode.needsRole && !selectedRole) return setError('Please select or enter a role.')
    setError('')
    setLoading(true)

    const loadingMsgSets = {
      [MODE_JD_MATCH]: ['Parsing job description...','Matching keywords...','HR Screener reviewing...','Hiring Manager assessing...','ATS Bot scoring...','Career Coach weighing in...','Compiling verdict...'],
      [MODE_ROLE_CHECK]: ['Analyzing your target role...','Checking your qualifications...','Running gap analysis...','Getting insider perspective...','Career Coach reviewing...','Finalizing assessment...'],
      [MODE_DISCOVERY]: ['Reading your full profile...','Identifying your strengths...','Mapping role fit...','Finding stretch opportunities...','Building your roadmap...','Almost done...'],
    }

    const msgs = loadingMsgSets[mode]
    let mi = 0
    setLoadingMsg(msgs[0])
    const interval = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadingMsg(msgs[mi]) }, 2200)

    try {
      let res
      if (mode === MODE_JD_MATCH) res = await evaluateJDMatch(resumeText, selectedRole, jobDescription)
      else if (mode === MODE_ROLE_CHECK) res = await evaluateRoleAspiration(resumeText, selectedRole)
      else res = await evaluateDiscovery(resumeText)
      clearInterval(interval)
      setResults(res)
      setStep(4)
    } catch (e) {
      clearInterval(interval)
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMode(null); setStep(0); setResults(null)
    setResumeFile(null); setResumeText(''); setRole('')
    setCustomRole(''); setJobDescription(''); setError('')
  }

  const inputStyle = {
    width: '100%', background: 'transparent',
    border: '1px solid var(--gray-border)', color: 'var(--white)',
    padding: '1rem 1.2rem', fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem', outline: 'none', borderRadius: '2px',
    transition: 'border-color 0.2s',
  }

  if (step === 4 && results) {
    return <Results results={results} mode={mode} role={selectedRole} onReset={reset} />
  }

  // Total steps for progress bar
  const totalSteps = currentMode?.needsRole ? 3 : 2
  const stepLabels = currentMode?.needsRole
    ? currentMode?.needsJD ? ['Mode', 'Resume', 'Role + JD'] : ['Mode', 'Resume', 'Role']
    : ['Mode', 'Resume', 'Submit']

  return (
    <section ref={formRef} style={{
      position: 'relative', zIndex: 1,
      padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 8vw, 8rem)',
      maxWidth: '960px', margin: '0 auto',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--green)', marginBottom: '1.5rem' }}>
        EVALUATION CHAMBER
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 400, lineHeight: 1.05, marginBottom: '3rem' }}>
        Step into<br /><em>the room.</em>
      </h2>

      {/* Progress bar — only show after mode selected */}
      {step > 0 && (
        <div style={{ display: 'flex', gap: 0, marginBottom: '3.5rem', borderBottom: '1px solid var(--gray-border)' }}>
          {stepLabels.map((label, i) => {
            const active = step === i + 1
            const done = step > i + 1
            return (
              <div key={i} style={{
                padding: '1rem 1.75rem',
                borderBottom: done || active ? '2px solid var(--green)' : '2px solid transparent',
                display: 'flex', gap: '0.75rem', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: done || active ? 'var(--green)' : 'var(--gray)' }}>
                  {done ? '✓' : `0${i + 1}`}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: active ? 'var(--white)' : 'var(--gray)', letterSpacing: '0.08em' }}>
                  {label.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div ref={containerRef}>

        {/* STEP 0: Mode Selection */}
        {step === 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              WHAT WOULD YOU LIKE TO DO?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--gray-border)', border: '1px solid var(--gray-border)' }}>
              {MODES.map((m) => (
                <div key={m.id}
                  onClick={() => { setMode(m.id); setStep(1) }}
                  style={{
                    background: mode === m.id ? 'rgba(0,255,135,0.04)' : 'var(--black)',
                    padding: '2rem 2.5rem',
                    cursor: 'pointer',
                    borderLeft: mode === m.id ? '3px solid var(--green)' : '3px solid transparent',
                    transition: 'background 0.2s, border-color 0.2s',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '1.5rem',
                    alignItems: 'start',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,135,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = mode === m.id ? 'rgba(0,255,135,0.04)' : 'var(--black)'}
                >
                  <div style={{ fontSize: '2rem', lineHeight: 1, paddingTop: '0.1rem' }}>{m.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.4rem', lineHeight: 1.2 }}>{m.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray)', marginBottom: '0.75rem', lineHeight: 1.6 }}>{m.subtitle}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#555', lineHeight: 1.7 }}>{m.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Resume Upload */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              MODE: <span style={{ color: 'var(--green)' }}>{currentMode?.title?.toUpperCase()}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              UPLOAD YOUR RESUME OR PASTE TEXT BELOW
            </div>

            <div ref={dropRef}
              onDragOver={e => { e.preventDefault(); if (dropRef.current) dropRef.current.style.borderColor = 'var(--green)' }}
              onDragLeave={() => { if (dropRef.current) dropRef.current.style.borderColor = resumeFile ? 'var(--green)' : 'var(--gray-border)' }}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              style={{
                border: `2px dashed ${resumeFile ? 'var(--green)' : 'var(--gray-border)'}`,
                borderRadius: '2px', padding: '3rem 2rem',
                textAlign: 'center', cursor: 'pointer',
                marginBottom: '2rem', transition: 'border-color 0.2s',
              }}
            >
              <input id="file-input" type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files[0])} />
              {resumeFile ? (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--green)', marginBottom: '0.5rem' }}>✓ {resumeFile.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)' }}>~{Math.round(resumeText.length / 5)} words extracted</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Drop your PDF here or click to browse</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#555' }}>Parsed in your browser — never sent to any server</div>
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>OR PASTE RESUME TEXT DIRECTLY</div>
            <textarea
              placeholder="Paste your resume here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '2rem', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setStep(0); setError('') }} style={{ background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray-border)', padding: '1rem 2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', borderRadius: '2px', cursor: 'pointer' }}>← BACK</button>
              <button
                onClick={() => {
                  if (!resumeText.trim()) return setError('Please upload or paste your resume.')
                  setError('')
                  if (currentMode.needsRole) setStep(2)
                  else handleSubmit()
                }}
                style={{ background: 'var(--green)', color: 'var(--black)', border: 'none', padding: '1rem 2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', borderRadius: '2px', cursor: 'pointer' }}
              >
                {currentMode.needsRole ? 'CONTINUE →' : 'ANALYSE MY RESUME ⚡'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Role + optional JD */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              {currentMode?.needsJD ? 'SELECT ROLE + PASTE JOB DESCRIPTION' : 'WHICH ROLE ARE YOU TARGETING?'}
            </div>

            {/* Role filter */}
            <input
              type="text"
              placeholder="Search roles..."
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ ...inputStyle, marginBottom: '1rem' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.4rem', marginBottom: '1.5rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.5rem',
            }}>
              {filteredRoles.map(r => (
                <button key={r}
                  onClick={() => { setRole(r); setCustomRole('') }}
                  style={{
                    background: role === r ? 'var(--green)' : 'transparent',
                    color: role === r ? 'var(--black)' : 'var(--gray)',
                    border: `1px solid ${role === r ? 'var(--green)' : 'var(--gray-border)'}`,
                    padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  }}
                >{r}</button>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray)', marginBottom: '0.6rem', letterSpacing: '0.1em' }}>OR TYPE A CUSTOM ROLE</div>
            <input
              type="text"
              placeholder="e.g. Prompt Engineer, AI Researcher, Indie Hacker..."
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setRole('') }}
              style={{ ...inputStyle, marginBottom: currentMode?.needsJD ? '2rem' : '2rem' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            {currentMode?.needsJD && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gray)', marginBottom: '0.6rem', letterSpacing: '0.1em' }}>
                  PASTE JOB DESCRIPTION <span style={{ color: '#555' }}>(the more complete, the sharper the match)</span>
                </div>
                <textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={7}
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: '2rem', lineHeight: 1.7 }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
                />
              </>
            )}

            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}

            {loading ? (
              <div style={{ border: '1px solid var(--gray-border)', padding: '2.5rem', borderRadius: '2px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--green)', marginBottom: '1.5rem', animation: 'blink 1.5s infinite' }}>● {loadingMsg}</div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => { setStep(1); setError('') }} style={{ background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray-border)', padding: '1rem 2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', borderRadius: '2px', cursor: 'pointer' }}>← BACK</button>
                <button onClick={handleSubmit} style={{
                  background: 'var(--green)', color: 'var(--black)', border: 'none',
                  padding: '1rem 3rem', fontFamily: 'var(--font-sans)', fontWeight: 700,
                  fontSize: '0.95rem', letterSpacing: '0.08em', borderRadius: '2px', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(0,255,135,0.2)', transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,135,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,135,0.2)'}
                >FACE THE PANEL ⚡</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea::-webkit-scrollbar,div::-webkit-scrollbar{width:3px}
        textarea::-webkit-scrollbar-thumb,div::-webkit-scrollbar-thumb{background:var(--green)}
      `}</style>
    </section>
  )
}
