import { useRef } from 'react'
import ThreeBackground from './components/ThreeBackground'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import ThePanel from './components/ThePanel'
import EvalForm from './components/EvalForm'
import Footer from './components/Footer'

export default function App() {
  const formRef = useRef(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <ThreeBackground />
      <Hero onStart={scrollToForm} />
      <HowItWorks />
      <ThePanel />
      <div ref={formRef}>
        <EvalForm formRef={formRef} />
      </div>
      <Footer />
    </div>
  )
}
