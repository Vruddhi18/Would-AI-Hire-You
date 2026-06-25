import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const verdictConfig = {
  'HIRE': { color: '#00ff87', label: 'HIRE', bg: 'rgba(0,255,135,0.05)', emoji: '✓' },
  'MAYBE': { color: '#ffb800', label: 'STRONG MAYBE', bg: 'rgba(255,184,0,0.05)', emoji: '~' },
  'HARD PASS': { color: '#ff4444', label: 'HARD PASS', bg: 'rgba(255,68,68,0.05)', emoji: '✗' },
  'PASS': { color: '#00ff87', label: 'ATS PASS', bg: 'rgba(0,255,135,0.05)', emoji: '✓' },
  'MARGINAL': { color: '#ffb800', label: 'MARGINAL', bg: 'rgba(255,184,0,0.05)', emoji: '~' },
  'FAIL': { color: '#ff4444', label: 'ATS FAIL', bg: 'rgba(255,68,68,0.05)', emoji: '✗' },
}

function getFinalVerdict(results) {
  const scores = results.map(r => {
    const v = r.verdict
    if (v === 'HIRE' || v === 'PASS') return 3
    if (v === 'MAYBE' || v === 'MARGINAL') return 2
    return 1
  })
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 2.5) return 'HIRE'
  if (avg >= 1.8) return 'MAYBE'
  return 'HARD PASS'
}

export default function Results({ results, role, onReset }) {
  const containerRef = useRef(null)
  const verdictRef = useRef(null)

  const finalVerdict = getFinalVerdict(results)
  const vc = verdictConfig[finalVerdict]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.results-header',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      gsap.fromTo('.final-verdict',
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'elastic.out(1, 0.6)' }
      )
      gsap.fromTo('.judge-result',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, delay: 0.6, ease: 'power3.out' }
      )
      gsap.fromTo('.results-actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.4, ease: 'power3.out' }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} style={{
      position: 'relative',
      zIndex: 1,
      padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 8vw, 8rem)',
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div className="results-header" style={{ opacity: 0, marginBottom: '4rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--green)', marginBottom: '1rem' }}>
          PANEL VERDICT — {role.toUpperCase()}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          fontWeight: 400,
          lineHeight: 1.1,
        }}>
          The panel has<br /><em>reached a decision.</em>
        </h2>
      </div>

      {/* Final Verdict Card */}
      <div className="final-verdict" style={{
        opacity: 0,
        border: `2px solid ${vc.color}`,
        background: vc.bg,
        borderRadius: '2px',
        padding: '3rem',
        textAlign: 'center',
        marginBottom: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '20rem',
          color: vc.color,
          opacity: 0.03,
          fontFamily: 'var(--font-display)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
        }}>{vc.emoji}</div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gray)', marginBottom: '1rem' }}>
          FINAL PANEL VERDICT
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 10vw, 7rem)',
          color: vc.color,
          lineHeight: 1,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}>
          {vc.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--gray)',
        }}>
          Based on {results.length} independent evaluations
        </div>
      </div>

      {/* Individual Judge Cards */}
      <div style={{ display: 'grid', gap: '1px', background: 'var(--gray-border)', border: '1px solid var(--gray-border)', marginBottom: '4rem' }}>
        {results.map((r, i) => {
          const v = verdictConfig[r.verdict] || verdictConfig['MAYBE']
          return (
            <div key={i} className="judge-result" style={{
              background: 'var(--black)',
              padding: '2rem 2.5rem',
              opacity: 0,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '2rem',
              alignItems: 'start',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: r.color,
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                    {r.code}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--white)' }}>
                    {r.persona}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--gray)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}>{r.text}</p>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: v.color,
                whiteSpace: 'nowrap',
                textAlign: 'right',
                paddingTop: '0.25rem',
              }}>
                {v.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="results-actions" style={{
        opacity: 0,
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <button onClick={onReset} style={{
          background: 'var(--green)',
          color: 'var(--black)',
          border: 'none',
          padding: '1rem 2.5rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.08em',
          borderRadius: '2px',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,135,0.3)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          TRY ANOTHER RESUME →
        </button>
        <button onClick={() => {
          const text = `I just got evaluated by an AI hiring panel for ${role}.\n\nVerdict: ${vc.label}\n\nTry it yourself → wouldaihireyou.vercel.app`
          navigator.clipboard?.writeText(text)
          alert('Result copied to clipboard! Share it.')
        }} style={{
          background: 'transparent',
          color: 'var(--white)',
          border: '1px solid var(--gray-border)',
          padding: '1rem 2rem',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          borderRadius: '2px',
          cursor: 'pointer',
        }}>
          SHARE RESULT ↗
        </button>
      </div>

      {/* Encouragement based on verdict */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        border: '1px solid var(--gray-border)',
        borderRadius: '2px',
        background: 'var(--gray-dark)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green)', letterSpacing: '0.15em', marginBottom: '1rem' }}>
          WHAT NOW
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray)', lineHeight: 1.8 }}>
          {finalVerdict === 'HIRE'
            ? 'Strong profile. But even HIRE verdicts have room to improve. Read each judge\'s notes carefully — the difference between getting an interview and getting the offer is in the details they flagged.'
            : finalVerdict === 'MAYBE'
            ? 'You\'re in the grey zone — dangerous territory. Hiring managers rarely fight for "maybes." Go through each judge\'s critique and make the specific changes they called out. Then run this again.'
            : 'A Hard Pass means there\'s a gap between how you\'ve presented yourself and what this role requires. That\'s fixable. Read every critique carefully. The Skeptic\'s notes especially — they often reveal the real issue.'}
        </p>
      </div>
    </section>
  )
}
