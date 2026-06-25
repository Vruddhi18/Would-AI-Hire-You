import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', title: 'Pick Your Role', desc: 'Choose the job you\'re applying for — Software Engineer, Designer, Product Manager, Data Scientist, Marketing, and more. The panel calibrates to that role\'s real hiring standards.' },
  { num: '02', title: 'Upload Your Resume', desc: 'Drop your PDF resume. Our parser extracts the text in-browser — nothing is stored on any server. Your data stays yours.' },
  { num: '03', title: 'Face The Panel', desc: 'Four AI personas simultaneously analyze your profile against the role. HR Screener, Hiring Manager, ATS Bot, and The Skeptic. They don\'t hold back.' },
  { num: '04', title: 'Get Your Verdict', desc: 'Hire. Strong Maybe. Hard Pass. Plus a detailed breakdown of what each judge thought — and exactly what to fix.' },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hiw-label',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-label', start: 'top 85%' } }
      )
      gsap.fromTo('.hiw-heading',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-heading', start: 'top 85%' } }
      )
      gsap.fromTo('.hiw-step',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      zIndex: 1,
      padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 8vw, 8rem)',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <div className="hiw-label" style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.25em',
        color: 'var(--green)',
        marginBottom: '1.5rem',
        opacity: 0,
      }}>
        HOW IT WORKS
      </div>

      <h2 className="hiw-heading" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        fontWeight: 400,
        lineHeight: 1.05,
        marginBottom: 'clamp(4rem, 8vw, 7rem)',
        maxWidth: '600px',
        opacity: 0,
      }}>
        Four judges.<br /><em>Zero mercy.</em>
      </h2>

      <div className="hiw-steps" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0',
      }}>
        {steps.map((step, i) => (
          <div key={i} className="hiw-step" style={{
            borderLeft: i === 0 ? '1px solid var(--gray-border)' : 'none',
            borderRight: '1px solid var(--gray-border)',
            borderTop: '1px solid var(--gray-border)',
            borderBottom: '1px solid var(--gray-border)',
            padding: '2.5rem 2rem',
            opacity: 0,
            transition: 'background 0.3s',
            cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,135,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--green)',
              letterSpacing: '0.15em',
              marginBottom: '1.5rem',
            }}>{step.num}</div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 400,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}>{step.title}</h3>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--gray)',
              lineHeight: 1.8,
            }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
