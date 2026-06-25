import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const judges = [
  {
    id: 'hr',
    code: 'JUDGE_01',
    name: 'The HR Screener',
    role: 'Process Gatekeeper',
    color: '#00ff87',
    traits: ['Keyword density', 'Format compliance', 'Gap detection', 'ATS score'],
    quote: '"Your summary paragraph is 4 lines of buzzwords. I stopped reading at line 2."',
    bias: 'Loves: Clean formatting, clear timelines\nHates: Gaps, vague titles, walls of text',
  },
  {
    id: 'mgr',
    code: 'JUDGE_02',
    name: 'The Hiring Manager',
    role: 'Skill Depth Analyst',
    color: '#ffb800',
    traits: ['Real impact metrics', 'Skill relevance', 'Project depth', 'Team fit signals'],
    quote: '"You \'led\' three projects. What did you actually ship? What broke? What did you learn?"',
    bias: 'Loves: Numbers, specificity, honest failures\nHates: Fluff, vague "contributions"',
  },
  {
    id: 'skeptic',
    code: 'JUDGE_03',
    name: 'The Skeptic',
    role: 'Claim Validator',
    color: '#ff4444',
    traits: ['Achievement verification', 'Consistency check', 'Red flag detection', 'Inflated claims'],
    quote: '"\'Increased revenue by 40%\' — from what baseline? Over what period? Prove it."',
    bias: 'Loves: Verifiable facts, specifics, honesty\nHates: Everything that can\'t be proven',
  },
  {
    id: 'ats',
    code: 'JUDGE_04',
    name: 'The ATS Bot',
    role: 'Algorithm Gatekeeper',
    color: '#8b8ff8',
    traits: ['Keyword match %', 'Section detection', 'Parse-ability', 'Job description fit'],
    quote: '"I am not reading this. I am pattern matching. Your resume failed 6 of my 14 checks."',
    bias: 'Loves: Standard headings, keywords, simple fonts\nHates: Tables, graphics, fancy layouts',
  },
]

export default function ThePanel() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.panel-heading',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.panel-heading', start: 'top 85%' } }
      )
      gsap.fromTo('.judge-card',
        { opacity: 0, y: 60, rotateX: 15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.judges-grid', start: 'top 80%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative',
      zIndex: 1,
      padding: 'clamp(5rem, 10vw, 10rem) clamp(1.5rem, 8vw, 8rem)',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      <div style={{ marginBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          color: 'var(--green)',
          marginBottom: '1.5rem',
        }}>MEET THE PANEL</div>
        <h2 className="panel-heading" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 400,
          lineHeight: 1.05,
          opacity: 0,
        }}>
          They've seen<br /><em>thousands of resumes.</em><br />Most didn't make it.
        </h2>
      </div>

      <div className="judges-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1px',
        background: 'var(--gray-border)',
        border: '1px solid var(--gray-border)',
      }}>
        {judges.map((j) => (
          <div key={j.id} className="judge-card" style={{
            background: 'var(--black)',
            padding: '2.5rem 2rem',
            opacity: 0,
            transition: 'background 0.4s',
            perspective: '1000px',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
          >
            {/* Code */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: j.color,
              letterSpacing: '0.2em',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: j.color, display: 'inline-block' }} />
              {j.code}
            </div>

            {/* Name */}
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.7rem',
              fontWeight: 400,
              marginBottom: '0.25rem',
              color: 'var(--white)',
            }}>{j.name}</h3>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--gray)',
              letterSpacing: '0.1em',
              marginBottom: '2rem',
            }}>{j.role}</div>

            {/* Traits */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {j.traits.map((t, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  padding: '0.3rem 0.7rem',
                  border: `1px solid ${j.color}33`,
                  color: j.color,
                  borderRadius: '1px',
                  letterSpacing: '0.05em',
                }}>{t}</span>
              ))}
            </div>

            {/* Quote */}
            <blockquote style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--white)',
              lineHeight: 1.7,
              borderLeft: `2px solid ${j.color}`,
              paddingLeft: '1rem',
              marginBottom: '1.5rem',
              fontStyle: 'italic',
            }}>{j.quote}</blockquote>

            {/* Bias */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--gray)',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>{j.bias}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
