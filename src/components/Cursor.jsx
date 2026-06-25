import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    let raf

    const move = e => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', move)

    const tick = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (dot.current) {
        dot.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const grow = () => ring.current?.classList.add('grow')
    const shrink = () => ring.current?.classList.remove('grow')
    document.querySelectorAll('button, a, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <style>{`
        .cursor-dot {
          position: fixed; top: 0; left: 0; width: 8px; height: 8px;
          background: #c8ff00; border-radius: 50%; pointer-events: none;
          z-index: 99999; transition: transform 0.05s linear;
        }
        .cursor-ring {
          position: fixed; top: 0; left: 0; width: 40px; height: 40px;
          border: 1.5px solid rgba(200,255,0,0.5); border-radius: 50%;
          pointer-events: none; z-index: 99998;
          transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
        }
        .cursor-ring.grow {
          width: 60px; height: 60px;
          border-color: rgba(200,255,0,0.8);
          margin-top: -10px; margin-left: -10px;
        }
      `}</style>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
