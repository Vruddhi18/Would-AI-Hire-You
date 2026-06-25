import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ROLES = [
  { id: 'swe', label: 'Software Engineer', icon: '⌨️', tags: ['Coding', 'System Design', 'Algorithms'] },
  { id: 'pm', label: 'Product Manager', icon: '🧭', tags: ['Roadmap', 'Metrics', 'Stakeholders'] },
  { id: 'ds', label: 'Data Scientist', icon: '📊', tags: ['ML/AI', 'Statistics', 'Python'] },
  { id: 'ux', label: 'UX Designer', icon: '✏️', tags: ['Figma', 'Research', 'Prototyping'] },
  { id: 'devops', label: 'DevOps Engineer', icon: '⚙️', tags: ['CI/CD', 'Cloud', 'Infrastructure'] },
  { id: 'mkt', label: 'Marketing Lead', icon: '📣', tags: ['Growth', 'Brand', 'Analytics'] },
  { id: 'ai', label: 'AI/ML Engineer', icon: '🤖', tags: ['LLMs', 'PyTorch', 'MLOps'] },
  { id: 'founder', label: 'Startup Founder', icon: '🚀', tags: ['Vision', 'Fundraising', 'GTM'] },
  { id: 'sales', label: 'Sales Engineer', icon: '💼', tags: ['Demo', 'Technical', 'Closing'] },
  { id: 'analyst', label: 'Business Analyst', icon: '🔍', tags: ['Requirements', 'SQL', 'Process'] },
]

export default function RoleSelector({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleContinue = () => {
    if (showCustom && custom.trim()) {
      onSelect({ id: 'custom', label: custom.trim(), icon: '🎯', tags: [] })
    } else if (selected) {
      onSelect(selected)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: 'clamp(40px, 8vh, 80px) clamp(24px, 5vw, 80px)' }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--acid)', letterSpacing: '0.12em', marginBottom: '16px' }}>
            STEP 01 / 03 — ROLE
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, marginBottom: '12px', lineHeight: 1.1 }}>
            What role are you gunning for?
          </h2>
          <p style={{ color: 'var(--gray-5)', fontSize: '16px', marginBottom: '48px', fontWeight: 300 }}>
            Your resume will be judged through the lens of this role. Be specific — the panel has zero patience for ambiguity.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px', marginBottom: '24px'
        }}>
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              onClick={() => { setSelected(role); setShowCustom(false) }}
              data-hover="true"
              style={{
                background: selected?.id === role.id ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.03)',
                border: selected?.id === role.id ? '1px solid var(--acid)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '20px', textAlign: 'left',
                transition: 'all 0.2s ease', cursor: 'none', color: 'var(--white)',
              }}
              onMouseEnter={e => { if (selected?.id !== role.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { if (selected?.id !== role.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{role.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', marginBottom: '10px' }}>{role.label}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {role.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', color: selected?.id === role.id ? 'var(--acid)' : 'var(--gray-4)',
                    background: selected?.id === role.id ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                    padding: '2px 8px', borderRadius: '4px'
                  }}>{t}</span>
                ))}
              </div>
            </motion.button>
          ))}

          {/* Custom role */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => { setShowCustom(true); setSelected(null) }}
            data-hover="true"
            style={{
              background: showCustom ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.02)',
              border: showCustom ? '1px solid var(--acid)' : '1px dashed rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '20px', textAlign: 'left',
              transition: 'all 0.2s ease', cursor: 'none', color: 'var(--gray-4)',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>✍️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', color: 'var(--white)' }}>Something else</div>
            <div style={{ fontSize: '12px', marginTop: '6px' }}>Type your own role</div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '32px', overflow: 'hidden' }}
            >
              <input
                autoFocus
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="e.g. Growth Hacker, Blockchain Dev, Chief of Staff..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(200,255,0,0.3)', borderRadius: '10px',
                  padding: '16px 20px', color: 'var(--white)', fontSize: '16px',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button
            onClick={handleContinue}
            disabled={!selected && !(showCustom && custom.trim())}
            data-hover="true"
            style={{
              background: (selected || (showCustom && custom.trim())) ? 'var(--acid)' : 'rgba(255,255,255,0.08)',
              color: (selected || (showCustom && custom.trim())) ? 'var(--black)' : 'var(--gray-4)',
              border: 'none', borderRadius: '8px', padding: '16px 40px',
              fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700,
              transition: 'all 0.2s ease', cursor: 'none',
              opacity: (selected || (showCustom && custom.trim())) ? 1 : 0.5
            }}
          >
            Continue →
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
