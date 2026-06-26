import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MODE_JD_MATCH, MODE_ROLE_CHECK, MODE_DISCOVERY } from '../services/groq'

// ─── VERDICT COLOR MAP ───────────────────────────────────────────────────────
const verdictStyle = (verdict) => {
  const v = verdict?.toUpperCase() || ''
  if (['HIRE','PASS','CAN APPLY','READY','YES, PULL','GO FOR IT','STRONG FIT'].some(x => v.includes(x)))
    return { color: '#00ff87', bg: 'rgba(0,255,135,0.06)' }
  if (['MAYBE','MARGINAL','BORDERLINE','ALMOST','MAYBE PULL','GO WITH PREP','DECENT FIT'].some(x => v.includes(x)))
    return { color: '#ffb800', bg: 'rgba(255,184,0,0.06)' }
  return { color: '#ff4444', bg: 'rgba(255,68,68,0.06)' }
}

function getFinalVerdict(results) {
  const scores = results.map(r => {
    const v = (r.verdict || '').toUpperCase()
    if (['HIRE','PASS','CAN APPLY','READY','YES, PULL','GO FOR IT','STRONG FIT'].some(x => v.includes(x))) return 3
    if (['MAYBE','MARGINAL','BORDERLINE','ALMOST','MAYBE PULL','GO WITH PREP','DECENT FIT'].some(x => v.includes(x))) return 2
    return 1
  })
  const avg = scores.reduce((a,b) => a+b,0) / scores.length
  if (avg >= 2.5) return { label: 'STRONG YES', color: '#00ff87', bg: 'rgba(0,255,135,0.06)', emoji: '✓' }
  if (avg >= 1.7) return { label: 'WORTH A SHOT', color: '#ffb800', bg: 'rgba(255,184,0,0.06)', emoji: '~' }
  return { label: 'NOT READY YET', color: '#ff4444', bg: 'rgba(255,68,68,0.06)', emoji: '✗' }
}

// ─── PANEL VERDICT (for JD match + Role check) ───────────────────────────────
function PanelResults({ results, mode, role, onReset }) {
  const final = getFinalVerdict(results)
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.res-header', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8, ease:'power3.out' })
      gsap.fromTo('.final-v', { opacity:0, scale:0.85 }, { opacity:1, scale:1, duration:1.2, delay:0.3, ease:'elastic.out(1,0.6)' })
      gsap.fromTo('.judge-row', { opacity:0, x:-30 }, { opacity:1, x:0, stagger:0.18, delay:0.6, duration:0.8, ease:'power3.out' })
      gsap.fromTo('.res-actions', { opacity:0, y:20 }, { opacity:1, y:0, delay:1.4, duration:0.8 })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const modeLabel = mode === MODE_JD_MATCH ? 'JD MATCH' : 'ROLE CHECK'

  return (
    <section ref={containerRef} style={{ position:'relative', zIndex:1, padding:'clamp(4rem,8vw,8rem) clamp(1.5rem,8vw,8rem)', maxWidth:'1000px', margin:'0 auto' }}>
      <div className="res-header" style={{ opacity:0, marginBottom:'3.5rem' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.25em', color:'var(--green)', marginBottom:'1rem' }}>
          {modeLabel} — {role?.toUpperCase()}
        </div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,4rem)', fontWeight:400, lineHeight:1.1 }}>
          The panel has<br /><em>reached a decision.</em>
        </h2>
      </div>

      {/* Final verdict */}
      <div className="final-v" style={{
        opacity:0, border:`2px solid ${final.color}`, background:final.bg,
        borderRadius:'2px', padding:'3rem', textAlign:'center', marginBottom:'4rem', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'16rem', color:final.color, opacity:0.03, fontFamily:'var(--font-display)', pointerEvents:'none', lineHeight:1 }}>{final.emoji}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.2em', color:'var(--gray)', marginBottom:'1rem' }}>PANEL VERDICT</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,9vw,6rem)', color:final.color, lineHeight:1, letterSpacing:'-0.02em', marginBottom:'0.75rem' }}>{final.label}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--gray)' }}>Based on {results.length} independent evaluations</div>
      </div>

      {/* Judge cards */}
      <div style={{ display:'grid', gap:'1px', background:'var(--gray-border)', border:'1px solid var(--gray-border)', marginBottom:'4rem' }}>
        {results.map((r,i) => {
          const vs = verdictStyle(r.verdict)
          return (
            <div key={i} className="judge-row" style={{
              background:'var(--black)', padding:'2rem 2.5rem', opacity:0,
              display:'grid', gridTemplateColumns:'1fr auto', gap:'2rem', alignItems:'start',
            }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:r.color, letterSpacing:'0.15em', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:r.color, display:'inline-block' }} />
                    {r.code}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--white)' }}>{r.persona}</span>
                </div>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--gray)', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{r.text}</p>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:vs.color, whiteSpace:'nowrap', textAlign:'right', paddingTop:'0.2rem' }}>
                {r.verdict}
              </div>
            </div>
          )
        })}
      </div>

      <Actions onReset={onReset} role={role} final={final.label} />
    </section>
  )
}

// ─── DISCOVERY RESULTS ────────────────────────────────────────────────────────
function DiscoveryResults({ data, onReset }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.disc-header', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8 })
      gsap.fromTo('.disc-profile', { opacity:0, y:20 }, { opacity:1, y:0, duration:0.8, delay:0.3 })
      gsap.fromTo('.disc-card', { opacity:0, y:30 }, { opacity:1, y:0, stagger:0.1, delay:0.5, duration:0.7, ease:'power3.out' })
      gsap.fromTo('.disc-actions', { opacity:0 }, { opacity:1, delay:1.4, duration:0.8 })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} style={{ position:'relative', zIndex:1, padding:'clamp(4rem,8vw,8rem) clamp(1.5rem,8vw,8rem)', maxWidth:'1100px', margin:'0 auto' }}>
      <div className="disc-header" style={{ opacity:0, marginBottom:'3rem' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.25em', color:'var(--green)', marginBottom:'1rem' }}>RESUME ANALYSIS — DISCOVERY MODE</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,4rem)', fontWeight:400, lineHeight:1.1 }}>
          Here's what your<br /><em>resume actually says.</em>
        </h2>
      </div>

      {/* Profile summary */}
      <div className="disc-profile" style={{
        opacity:0, border:'1px solid var(--gray-border)', padding:'2rem 2.5rem',
        marginBottom:'3rem', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2rem',
      }}>
        {[
          ['EXPERIENCE LEVEL', data.experienceLevel],
          ['EST. YEARS', data.yearsEstimate],
          ['DOMAIN', data.industryDomain],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--gray)', letterSpacing:'0.15em', marginBottom:'0.5rem' }}>{label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--green)' }}>{val}</div>
          </div>
        ))}
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--gray)', letterSpacing:'0.15em', marginBottom:'0.5rem' }}>TOP SKILLS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
            {(data.coreSkills || []).map((s,i) => (
              <span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', padding:'0.25rem 0.6rem', border:'1px solid rgba(0,255,135,0.3)', color:'var(--green)', borderRadius:'1px' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Biggest strength + quick win */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'var(--gray-border)', border:'1px solid var(--gray-border)', marginBottom:'3rem' }}>
        {[
          ['💪 BIGGEST STRENGTH', data.biggestStrength, '#00ff87'],
          ['⚡ QUICK WIN THIS WEEK', data.quickWin, '#ffb800'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background:'var(--black)', padding:'2rem' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color, letterSpacing:'0.15em', marginBottom:'1rem' }}>{label}</div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem', color:'var(--white)', lineHeight:1.8 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Best fit roles */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--green)', letterSpacing:'0.2em', marginBottom:'1.5rem' }}>✓ APPLY NOW — STRONG FIT ROLES</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1px', background:'var(--gray-border)', border:'1px solid var(--gray-border)', marginBottom:'3rem' }}>
        {(data.bestFitRoles || []).map((r,i) => (
          <div key={i} className="disc-card" style={{ background:'var(--black)', padding:'1.75rem 2rem', opacity:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', lineHeight:1.2, flex:1 }}>{r.title}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.1rem', color:'#00ff87', marginLeft:'1rem', flexShrink:0 }}>{r.fitScore}%</div>
            </div>
            <div style={{ width:'100%', height:3, background:'var(--gray-border)', borderRadius:2, marginBottom:'1rem' }}>
              <div style={{ width:`${r.fitScore}%`, height:'100%', background:'#00ff87', borderRadius:2 }} />
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--gray)', lineHeight:1.75 }}>{r.reason}</p>
          </div>
        ))}
      </div>

      {/* Stretch roles */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'#ffb800', letterSpacing:'0.2em', marginBottom:'1.5rem' }}>→ STRETCH ROLES — ACHIEVABLE WITH PREP</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1px', background:'var(--gray-border)', border:'1px solid var(--gray-border)', marginBottom:'3rem' }}>
        {(data.stretchRoles || []).map((r,i) => (
          <div key={i} className="disc-card" style={{ background:'var(--black)', padding:'1.75rem 2rem', opacity:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', lineHeight:1.2, flex:1 }}>{r.title}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.1rem', color:'#ffb800', marginLeft:'1rem', flexShrink:0 }}>{r.fitScore}%</div>
            </div>
            <div style={{ width:'100%', height:3, background:'var(--gray-border)', borderRadius:2, marginBottom:'0.75rem' }}>
              <div style={{ width:`${r.fitScore}%`, height:'100%', background:'#ffb800', borderRadius:2 }} />
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--gray)', lineHeight:1.75, marginBottom:'1rem' }}>{r.reason}</p>
            {r.gaps?.length > 0 && (
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'#ffb800', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>GAPS TO FILL:</div>
                {r.gaps.map((g,j) => (
                  <div key={j} style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--gray)', marginBottom:'0.25rem' }}>· {g}</div>
                ))}
              </div>
            )}
            {r.timeToReady && (
              <div style={{ marginTop:'1rem', fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'#ffb800', padding:'0.5rem 0.75rem', border:'1px solid rgba(255,184,0,0.25)', borderRadius:'2px' }}>
                ⏱ {r.timeToReady}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.avoidRoles?.length > 0 && (
        <div style={{ marginBottom:'3rem' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'#ff4444', letterSpacing:'0.2em', marginBottom:'1rem' }}>✗ DON'T APPLY YET</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
            {data.avoidRoles.map((r,i) => (
              <span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', padding:'0.4rem 0.9rem', border:'1px solid rgba(255,68,68,0.3)', color:'#ff4444', borderRadius:'2px' }}>{r}</span>
            ))}
          </div>
        </div>
      )}

      <div className="disc-actions" style={{ opacity:0 }}>
        <Actions onReset={onReset} role="your profile" final="DISCOVERY COMPLETE" />
      </div>
    </section>
  )
}

// ─── SHARED ACTIONS ───────────────────────────────────────────────────────────
function Actions({ onReset, role, final }) {
  return (
    <div className="res-actions" style={{ opacity:0, display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center', marginTop:'1rem' }}>
      <button onClick={onReset} style={{
        background:'var(--green)', color:'var(--black)', border:'none',
        padding:'1rem 2.5rem', fontFamily:'var(--font-sans)', fontWeight:700,
        fontSize:'0.85rem', letterSpacing:'0.08em', borderRadius:'2px', cursor:'pointer',
        transition:'box-shadow 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 40px rgba(0,255,135,0.3)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
      >TRY ANOTHER RESUME →</button>
      <button onClick={() => {
        const text = `Just got evaluated by an AI hiring panel.\n\nVerdict: ${final} for ${role}\n\nTry it → wouldaihireyou.vercel.app`
        navigator.clipboard?.writeText(text)
        alert('Copied to clipboard!')
      }} style={{
        background:'transparent', color:'var(--white)', border:'1px solid var(--gray-border)',
        padding:'1rem 2rem', fontFamily:'var(--font-sans)', fontSize:'0.85rem',
        letterSpacing:'0.05em', borderRadius:'2px', cursor:'pointer',
      }}>SHARE RESULT ↗</button>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Results({ results, mode, role, onReset }) {
  if (mode === MODE_DISCOVERY) {
    return <DiscoveryResults data={results} onReset={onReset} />
  }
  return <PanelResults results={results} mode={mode} role={role} onReset={onReset} />
}
