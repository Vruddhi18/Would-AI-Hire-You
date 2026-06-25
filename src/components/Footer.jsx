export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 1,
      borderTop: '1px solid var(--gray-border)',
      padding: '3rem clamp(1.5rem, 8vw, 8rem)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.3rem' }}>
          Would AI Hire You?
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gray)', letterSpacing: '0.1em' }}>
          @2026 Vruddhi Shah. All rights reserved.
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray)', letterSpacing: '0.08em', lineHeight: 1.8, textAlign: 'right' }}>
        <div>Built with ♥ by Vruddhi</div>
          <div style={{ marginTop: '0.25rem' }}>
            <a
              href="https://vruddhishah.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--green)', textDecoration: 'none' }}
            >
              vruddhishah.vercel.app
            </a>
          </div>     
           </div>
    </footer>
  )
}
