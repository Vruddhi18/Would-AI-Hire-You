import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'

export default function ResumeUpload({ role, onSubmit }) {
  const [mode, setMode] = useState('upload') // 'upload' | 'paste' | 'url'
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState(null)
  const [loading, setLoading] = useState(false)

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map(item => item.str).join(' ') + '\n'
    }
    return fullText
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setLoading(true)
    setFileName(file.name)
    try {
      if (file.type === 'application/pdf') {
        const extracted = await extractTextFromPDF(file)
        setText(extracted)
      } else {
        const reader = new FileReader()
        reader.onload = e => setText(e.target.result)
        reader.readAsText(file)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] }, maxFiles: 1
  })

  const handleSubmit = () => {
    const content = mode === 'url' ? url : text
    if (content.trim()) onSubmit(content.trim(), mode)
  }

  const canSubmit = mode === 'url' ? url.trim() : text.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: 'clamp(40px, 8vh, 80px) clamp(24px, 5vw, 80px)' }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--acid)', letterSpacing: '0.12em', marginBottom: '16px' }}>
          STEP 02 / 03 — RESUME
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, marginBottom: '8px', lineHeight: 1.1 }}>
          Now show us what you've got
        </h2>
        <p style={{ color: 'var(--gray-5)', fontSize: '16px', marginBottom: '16px', fontWeight: 300 }}>
          Applying as <span style={{ color: 'var(--acid)', fontWeight: 500 }}>{role.icon} {role.label}</span> — upload your resume or paste your portfolio URL.
        </p>

        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {[['upload', '📄 PDF Upload'], ['paste', '✍️ Paste Text'], ['url', '🔗 Portfolio URL']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              data-hover="true"
              style={{
                background: mode === m ? 'var(--acid)' : 'transparent',
                color: mode === m ? 'var(--black)' : 'var(--gray-5)',
                border: 'none', borderRadius: '7px', padding: '8px 18px',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: mode === m ? 600 : 400,
                transition: 'all 0.2s', cursor: 'none'
              }}
            >{label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--acid)' : fileName ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '16px', padding: '60px 40px', textAlign: 'center',
                  background: isDragActive ? 'rgba(200,255,0,0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s ease', cursor: 'none'
                }}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div style={{ color: 'var(--gray-4)' }}>Extracting text...</div>
                ) : fileName ? (
                  <>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--acid)' }}>{fileName}</div>
                    <div style={{ color: 'var(--gray-5)', fontSize: '13px', marginTop: '8px' }}>{text.length} characters extracted · Drop another to replace</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>
                      {isDragActive ? 'Drop it here' : 'Drag & drop your resume'}
                    </div>
                    <div style={{ color: 'var(--gray-5)', fontSize: '14px' }}>PDF or TXT · or click to browse</div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'paste' && (
            <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your resume text here — work experience, skills, education, projects..."
                style={{
                  width: '100%', minHeight: '280px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '20px', color: 'var(--white)', fontSize: '14px', lineHeight: 1.7,
                  fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none',
                }}
              />
              <div style={{ color: 'var(--gray-5)', fontSize: '12px', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                {text.length} / 8000 characters
              </div>
            </motion.div>
          )}

          {mode === 'url' && (
            <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '20px', marginBottom: '16px'
              }}>
                <p style={{ color: 'var(--gray-4)', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
                  // Portfolio, LinkedIn, GitHub, or personal site
                </p>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(200,255,0,0.2)', borderRadius: '8px',
                    padding: '14px 18px', color: 'var(--white)', fontSize: '15px',
                    fontFamily: 'var(--font-mono)', outline: 'none',
                  }}
                />
              </div>
              <p style={{ color: 'var(--gray-5)', fontSize: '13px', lineHeight: 1.6 }}>
                The panel will evaluate your public portfolio, GitHub activity, or LinkedIn profile as your "resume substitute." Make sure the link is public.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '32px' }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-hover="true"
            style={{
              background: canSubmit ? 'var(--acid)' : 'rgba(255,255,255,0.08)',
              color: canSubmit ? 'var(--black)' : 'var(--gray-4)',
              border: 'none', borderRadius: '8px', padding: '16px 40px',
              fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700,
              transition: 'all 0.2s ease', cursor: 'none',
              opacity: canSubmit ? 1 : 0.5
            }}
            onMouseEnter={e => { if (canSubmit) { e.target.style.boxShadow = '0 0 40px rgba(200,255,0,0.4)'; e.target.style.transform = 'scale(1.03)' }}}
            onMouseLeave={e => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'scale(1)' }}
          >
            Face the Panel →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
