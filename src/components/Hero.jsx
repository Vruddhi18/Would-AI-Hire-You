import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ onStart }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-eyebrow',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-word',
        { opacity: 0, y: 80, skewY: 5 },
        { opacity: 1, y: 0, skewY: 0, duration: 1.2, delay: 0.4, stagger: 0.1, ease: 'power4.out' }
      )
      gsap.fromTo('.hero-sub',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.0, ease: 'power3.out' }
      )
      gsap.fromTo('.hero-btn',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 1.3, ease: 'back.out(1.7)' }
      )
      gsap.fromTo('.hero-stat',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.5, stagger: 0.12, ease: 'power3.out' }
      )
      gsap.fromTo('.scroll-hint',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2.2 }
      )
      gsap.to('.hero-title', {
        y: -120,
        opacity: 0.2,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        }
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div className="hero-eyebrow" style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.25em',
        color: 'var(--green)',
        marginBottom: '2.5rem',
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <span style={{
          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: 'var(--green)', animation: 'pulse 2s infinite'
        }} />
        AI HIRING PANEL — LIVE EVALUATION SYSTEM
      </div>

      <div className="hero-title" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3.5rem, 12vw, 11rem)',
          fontWeight: 400,
          lineHeight: 0.92,
          letterSpacing: '-0.02em',
        }}>
          {['Would', 'AI', 'Hire', 'You?'].map((w, i) => (
            <span key={i} className="hero-word" style={{
              display: 'inline-block',
              marginRight: '0.2em',
              color: w === 'AI' ? 'var(--green)' : 'var(--white)',
              fontStyle: w === 'You?' ? 'italic' : 'normal',
              opacity: 0,
            }}>{w}</span>
          ))}
        </h1>
      </div>

      <p className="hero-sub" style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(0.75rem, 1.3vw, 0.95rem)',
        color: 'var(--gray)',
        maxWidth: '540px',
        lineHeight: 1.9,
        marginBottom: '3rem',
        opacity: 0,
      }}>
        Drop your resume. Pick the role. Four ruthless AI personas tear it apart and give you a verdict in 30 seconds.
      </p>

      <button className="hero-btn" onClick={onStart} style={{
        background: 'var(--green)',
        color: 'var(--black)',
        border: 'none',
        padding: '1.1rem 3.5rem',
        fontSize: '0.95rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        borderRadius: '2px',
        opacity: 0,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,135,0.35)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        FACE THE PANEL →
      </button>

      <div style={{ display: 'flex', gap: '3rem', marginTop: '5rem', borderTop: '1px solid var(--gray-border)', paddingTop: '2rem' }}>
        {[['4', 'AI Personas'], ['30s', 'Verdict Time'], ['100%', 'Brutally Honest']].map(([n, l], i) => (
          <div key={i} className="hero-stat" style={{ textAlign: 'center', opacity: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--green)' }}>{n}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray)', letterSpacing: '0.12em', marginTop: '0.3rem' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="scroll-hint" style={{ position: 'absolute', bottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--gray)', letterSpacing: '0.15em' }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--green), transparent)', animation: 'scrollLine 1.5s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)} }
        @keyframes scrollLine {
          0%{transform:scaleY(0);transform-origin:top}
          50%{transform:scaleY(1);transform-origin:top}
          51%{transform:scaleY(1);transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom}
        }
      `}</style>
    </section>
  )
}
