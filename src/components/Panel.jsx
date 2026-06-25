import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeAll, PERSONAS } from '../utils/groq'

const verdictConfig = {
  HIRE: { label: 'HIRE', color: '#00e676', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.3)' },
  MAYBE: { label: 'MAYBE', color: '#ffb700', bg: 'rgba(255,183,0,0.1)', border: 'rgba(255,183,0,0.3)' },
  PASS: { label: 'HARD PASS', color: '#ff3b30', bg: 'rgba(255,59,48,0.1)', border: 'rgba(255,59,48,0.3)' },
  ERROR: { label: 'ERROR', color: '#666', bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.3)' },
}

function ScoreRing({ score, color, size = 80 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  )
}

function PersonaCard({ persona, result, loading }) {
  const [expanded, setExpanded] = useState(false)
  const vc = result ? verdictConfig[result.verdict] || verdictConfig.ERROR : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${result ? persona.border : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px', overflow: 'hidden',
        transition: 'border-color 0.4s ease'
      }}
    >
      {/* Card header */}
      <div style={{ padding: '24px', background: result ? persona.accent : 'transparent', transition: 'background 0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>{persona.emoji}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>{persona.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.08em' }}>{persona.title.toUpperCase()}</div>
            </div>
          </div>
          {result && (
            <ScoreRing score={result.score} color={persona.color} size={72} />
          )}
        </div>

        {loading && !result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gray-5)' }}>
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 16, height: 16, border: `2px solid ${persona.color}`, borderTopColor: 'transparent', borderRadius: '50%' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Analyzing your profile...</span>
          </div>
        )}

        {result && (
          <>
            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: '6px',
              background: vc.bg, border: `1px solid ${vc.border}`,
              color: vc.color, fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.1em', marginBottom: '12px'
            }}>
              {vc.label}
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, lineHeight: 1.4, color: 'var(--white)' }}>
              "{result.headline}"
            </p>
          </>
        )}
      </div>

      {/* Expandable details */}
      {result && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            data-hover="true"
            style={{
              width: '100%', padding: '14px 24px', background: 'transparent',
              border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--gray-5)', fontFamily: 'var(--font-mono)', fontSize: '12px',
              textAlign: 'left', cursor: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = persona.color}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-5)'}
          >
            <span>VIEW FULL BREAKDOWN</span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>▾</motion.span>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px 24px 24px' }}>
                  {result.positives?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#00e676', letterSpacing: '0.1em', marginBottom: '10px' }}>✓ WORKS IN YOUR FAVOR</div>
                      {result.positives.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: '#00e676', marginTop: '2px', flexShrink: 0 }}>+</span>
                          <span style={{ fontSize: '14px', color: 'var(--gray-5)', lineHeight: 1.5 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.concerns?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ff3b30', letterSpacing: '0.1em', marginBottom: '10px' }}>✗ RED FLAGS</div>
                      {result.concerns.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: '#ff3b30', marginTop: '2px', flexShrink: 0 }}>—</span>
                          <span style={{ fontSize: '14px', color: 'var(--gray-5)', lineHeight: 1.5 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.fixThis && (
                    <div style={{
                      background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.2)',
                      borderRadius: '10px', padding: '14px 16px'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--acid)', letterSpacing: '0.1em', marginBottom: '6px' }}>⚡ FIX THIS FIRST</div>
                      <p style={{ fontSize: '14px', color: 'var(--white)', lineHeight: 1.5 }}>{result.fixThis}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}

function FinalVerdict({ results }) {
  const scores = Object.values(results).map(r => r.score || 0)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const hires = Object.values(results).filter(r => r.verdict === 'HIRE').length
  const maybes = Object.values(results).filter(r => r.verdict === 'MAYBE').length

  let verdict, color, message
  if (hires >= 3) { verdict = 'HIRE'; color = '#00e676'; message = "You'd get the interview. The panel is impressed — but don't get cocky." }
  else if (hires >= 2 || maybes >= 3) { verdict = 'MAYBE'; color = '#ffb700'; message = "You're on the fence. Some panelists see potential, others see red flags." }
  else { verdict = 'HARD PASS'; color = '#ff3b30'; message = "The panel passed. Your resume needs serious work before it lands interviews." }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        gridColumn: '1 / -1',
        background: 'rgba(255,255,255,0.03)',
        border: `2px solid ${color}33`,
        borderRadius: '20px', padding: '40px',
        textAlign: 'center', marginBottom: '8px',
        boxShadow: `0 0 60px ${color}15`
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.12em', marginBottom: '16px' }}>
        PANEL VERDICT
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 80px)',
        fontWeight: 800, color, letterSpacing: '-0.02em', marginBottom: '12px',
        textShadow: `0 0 80px ${color}40`
      }}>
        {verdict}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            width: 40, height: 6, borderRadius: '3px',
            background: i < hires ? '#00e676' : i < hires + maybes ? '#ffb700' : 'rgba(255,255,255,0.1)'
          }} />
        ))}
      </div>
      <p style={{ color: 'var(--gray-4)', fontSize: '16px', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', color }}>{avg}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.08em' }}>AVG SCORE</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', color: '#00e676' }}>{hires}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.08em' }}>HIRED</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', color: '#ff3b30' }}>{4 - hires - maybes}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.08em' }}>PASSED</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Panel({ resume, role, inputMode, onReset }) {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [doneCount, setDoneCount] = useState(0)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      await analyzeAll(resume, role, inputMode, (personaId, result) => {
        setResults(prev => ({ ...prev, [personaId]: result }))
        setDoneCount(prev => prev + 1)
      })
      setLoading(false)
    }
    run()
  }, [])

  const allDone = doneCount === PERSONAS.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: 'clamp(40px, 6vh, 60px) clamp(24px, 5vw, 80px)', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--acid)', letterSpacing: '0.12em', marginBottom: '12px' }}>
            STEP 03 / 03 — VERDICT
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.1 }}>
                The panel has spoken.
              </h2>
              <p style={{ color: 'var(--gray-5)', marginTop: '8px' }}>
                Applying as <span style={{ color: 'var(--acid)' }}>{role.icon} {role.label}</span>
                {loading && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginLeft: '16px', color: 'var(--gray-4)' }}>
                  {doneCount}/4 panelists done...
                </span>}
              </p>
            </div>
            {allDone && (
              <button
                onClick={onReset}
                data-hover="true"
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '10px 24px', color: 'var(--gray-4)',
                  fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = 'var(--white)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'var(--gray-4)' }}
              >
                ↩ Try Another Resume
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '16px' }}>
          {allDone && Object.keys(results).length === 4 && <FinalVerdict results={results} />}
          {PERSONAS.map(persona => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              result={results[persona.id]}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
