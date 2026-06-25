import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ApiKeySetup({ onKeySet }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  const handleSubmit = async () => {
    if (!key.trim().startsWith('gsk_')) {
      setError('Groq API keys start with "gsk_" — double check yours')
      return
    }
    setTesting(true)
    setError('')
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${key.trim()}` }
      })
      if (!res.ok) throw new Error('Invalid key')
      localStorage.setItem('groq_api_key', key.trim())
      onKeySet(key.trim())
    } catch {
      setError('Key validation failed — check your key and try again')
    }
    setTesting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 80px)'
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--acid)', letterSpacing: '0.12em', marginBottom: '24px' }}>
          ONE-TIME SETUP
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}>
          Add your Groq API key
        </h2>
        <p style={{ color: 'var(--gray-5)', marginBottom: '32px', lineHeight: 1.6 }}>
          This app runs entirely in your browser. Your key is stored locally and never sent anywhere except Groq's servers.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <input
            value={key}
            onChange={e => { setKey(e.target.value); setError('') }}
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            type="password"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? '#ff3b30' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '10px', padding: '16px 20px',
              color: 'var(--white)', fontSize: '15px', fontFamily: 'var(--font-mono)',
              outline: 'none', marginBottom: '8px'
            }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p style={{ color: '#ff3b30', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!key.trim() || testing}
          data-hover="true"
          style={{
            width: '100%', background: key.trim() ? 'var(--acid)' : 'rgba(255,255,255,0.08)',
            color: key.trim() ? 'var(--black)' : 'var(--gray-4)',
            border: 'none', borderRadius: '8px', padding: '16px',
            fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700,
            cursor: 'none', transition: 'all 0.2s', marginBottom: '24px'
          }}
        >
          {testing ? 'Validating...' : 'Start the Panel →'}
        </button>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--gray-5)', lineHeight: 1.6 }}>
            Get a free Groq key at <a href="https://console.groq.com" target="_blank" style={{ color: 'var(--acid)', textDecoration: 'none' }}>console.groq.com</a> — takes 2 minutes, no credit card. The free tier is more than enough for this tool.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
