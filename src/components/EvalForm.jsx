import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { extractTextFromPDF } from '../services/pdfParser'
import { evaluateAll } from '../services/groq'
import Results from './Results'

const ROLES = [
  'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'Data Scientist', 'ML Engineer', 'AI/ML Engineer', 'Data Analyst',
  'Product Manager', 'Product Designer', 'UX Designer', 'UI Designer',
  'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer',
  'Marketing Manager', 'Growth Marketer', 'Content Strategist',
  'Business Analyst', 'Project Manager', 'Scrum Master',
  'Sales Engineer', 'Account Executive', 'Customer Success Manager',
  'CTO', 'VP of Engineering', 'Engineering Manager',
]

export default function EvalForm({ formRef }) {
  const [step, setStep] = useState(1)
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
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
    }
  }, [step])

  const filteredRoles = ROLES.filter(r => r.toLowerCase().includes(roleFilter.toLowerCase()))
  const selectedRole = role || customRole

  const handleFileChange = async (file) => {
    if (!file) return
    setError('')
    if (file.type === 'application/pdf') {
      setResumeFile(file)
      try {
        const text = await extractTextFromPDF(file)
        if (!text || text.length < 50) {
          setError('Could not extract text from this PDF. Please paste your resume as text below.')
        } else {
          setResumeText(text)
        }
      } catch (e) {
        setError('Could not parse PDF. Please paste your resume as text below.')
      }
    } else {
      setError('Please upload a PDF file.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (dropRef.current) dropRef.current.style.borderColor = 'var(--gray-border)'
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleSubmit = async () => {
    if (!selectedRole) return setError('Please select a role.')
    if (!resumeText.trim()) return setError('Please upload a resume or paste your resume text.')
    setError('')
    setLoading(true)
    setLoadingMsg('Assembling the panel...')

    const msgs = [
      'Assembling the panel...',
      'HR Screener is reviewing your resume...',
      'Hiring Manager is reading between the lines...',
      'The Skeptic is challenging your claims...',
      'ATS Bot is running keyword analysis...',
      'Panel deliberating on a verdict...',
    ]
    let mi = 0
    const interval = setInterval(() => {
      mi = (mi + 1) % msgs.length
      setLoadingMsg(msgs[mi])
    }, 2500)

    try {
      const res = await evaluateAll(resumeText, selectedRole, jobDescription)
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

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: '1px solid var(--gray-border)',
    color: 'var(--white)',
    padding: '1rem 1.2rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    outline: 'none',
    borderRadius: '2px',
    transition: 'border-color 0.2s',
  }

  const btnStyle = (active) => ({
    background: active ? 'var(--green)' : 'transparent',
    color: active ? 'var(--black)' : 'var(--gray)',
    border: `1px solid ${active ? 'var(--green)' : 'var(--gray-border)'}`,
    padding: '0.65rem 1.2rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    letterSpacing: '0.05em',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  })

  if (step === 4 && results) {
    return <Results results={results} role={selectedRole} onReset={() => {
      setStep(1); setResults(null); setResumeFile(null)
      setResumeText(''); setRole(''); setCustomRole(''); setJobDescription('')
    }} />
  }

  return (
    <section ref={formRef} style={{
      position: 'relative',
      zIndex: 1,
      padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 8vw, 8rem)',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--green)', marginBottom: '1.5rem' }}>
        EVALUATION CHAMBER
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: 400,
        lineHeight: 1.05,
        marginBottom: '4rem',
      }}>
        Step into<br /><em>the room.</em>
      </h2>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '4rem', borderBottom: '1px solid var(--gray-border)' }}>
        {[['01', 'Role'], ['02', 'Resume'], ['03', 'Submit']].map(([n, label], i) => {
          const active = step === i + 1
          const done = step > i + 1
          return (
            <div key={i} style={{
              padding: '1rem 2rem',
              borderBottom: done || active ? '2px solid var(--green)' : '2px solid transparent',
              display: 'flex', gap: '0.75rem', alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: done || active ? 'var(--green)' : 'var(--gray)', letterSpacing: '0.1em' }}>
                {done ? '✓' : n}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: active ? 'var(--white)' : 'var(--gray)', letterSpacing: '0.1em' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div ref={containerRef}>

        {/* STEP 1: Role */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
              SELECT THE ROLE YOU ARE APPLYING FOR
            </div>
            <input
              type="text"
              placeholder="Search roles..."
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ ...inputStyle, marginBottom: '1.5rem' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
              marginBottom: '2rem',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '0.5rem',
            }}>
              {filteredRoles.map((r) => (
                <button key={r} style={btnStyle(role === r)} onClick={() => { setRole(r); setCustomRole('') }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
              OR TYPE A CUSTOM ROLE
            </div>
            <input
              type="text"
              placeholder="e.g. Prompt Engineer, AI Researcher..."
              value={customRole}
              onChange={e => { setCustomRole(e.target.value); setRole('') }}
              style={{ ...inputStyle, marginBottom: '2rem' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />
            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}
            <button
              onClick={() => { if (!selectedRole) return setError('Please select or type a role.'); setError(''); setStep(2) }}
              style={{
                background: 'var(--green)', color: 'var(--black)', border: 'none',
                padding: '1rem 2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 700,
                fontSize: '0.85rem', letterSpacing: '0.08em', borderRadius: '2px', cursor: 'pointer',
              }}
            >
              CONTINUE: UPLOAD RESUME →
            </button>
          </div>
        )}

        {/* STEP 2: Resume */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              APPLYING FOR: <span style={{ color: 'var(--green)' }}>{selectedRole}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              UPLOAD YOUR RESUME (PDF) OR PASTE TEXT BELOW
            </div>

            <div
              ref={dropRef}
              onDragOver={e => { e.preventDefault(); if (dropRef.current) dropRef.current.style.borderColor = 'var(--green)' }}
              onDragLeave={() => { if (dropRef.current) dropRef.current.style.borderColor = resumeFile ? 'var(--green)' : 'var(--gray-border)' }}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              style={{
                border: `2px dashed ${resumeFile ? 'var(--green)' : 'var(--gray-border)'}`,
                borderRadius: '2px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '2rem',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <input id="file-input" type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => handleFileChange(e.target.files[0])} />
              {resumeFile ? (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--green)', marginBottom: '0.5rem' }}>✓ {resumeFile.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)' }}>
                    {Math.round(resumeText.length / 5)} words extracted
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>
                    Drop your PDF here or click to browse
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', opacity: 0.6 }}>
                    Parsed entirely in your browser — never uploaded to any server
                  </div>
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
              OR PASTE RESUME TEXT DIRECTLY
            </div>
            <textarea
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '2rem', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} style={{
                background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray-border)',
                padding: '1rem 2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', borderRadius: '2px', cursor: 'pointer',
              }}>← BACK</button>
              <button
                onClick={() => { if (!resumeText.trim()) return setError('Please upload or paste your resume.'); setError(''); setStep(3) }}
                style={{
                  background: 'var(--green)', color: 'var(--black)', border: 'none',
                  padding: '1rem 2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 700,
                  fontSize: '0.85rem', letterSpacing: '0.08em', borderRadius: '2px', cursor: 'pointer',
                }}
              >CONTINUE →</button>
            </div>
          </div>
        )}

        {/* STEP 3: JD + Submit */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
              FINAL STEP — ADD JOB DESCRIPTION FOR A SHARPER VERDICT (OPTIONAL)
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
              JOB DESCRIPTION
            </div>
            <textarea
              placeholder="Paste the job description you're applying to. The panel will evaluate your resume specifically against this role's requirements..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={7}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '2.5rem', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}

            {loading ? (
              <div style={{
                border: '1px solid var(--gray-border)',
                padding: '2.5rem',
                borderRadius: '2px',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--green)', marginBottom: '1.5rem', animation: 'blink 1.5s infinite' }}>
                  ● {loadingMsg}
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--green)',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(2)} style={{
                  background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray-border)',
                  padding: '1rem 2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', borderRadius: '2px', cursor: 'pointer',
                }}>← BACK</button>
                <button onClick={handleSubmit} style={{
                  background: 'var(--green)', color: 'var(--black)', border: 'none',
                  padding: '1rem 3rem', fontFamily: 'var(--font-sans)', fontWeight: 700,
                  fontSize: '0.95rem', letterSpacing: '0.08em', borderRadius: '2px', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(0,255,135,0.2)', transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,135,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,135,0.2)'}
                >
                  FACE THE PANEL ⚡
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: var(--green); }
        div::-webkit-scrollbar { width: 3px; }
        div::-webkit-scrollbar-thumb { background: var(--green); }
      `}</style>
    </section>
  )
}
