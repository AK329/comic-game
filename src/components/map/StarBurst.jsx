import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
let confettiReady
function loadConfetti() {
 if (window.confetti) return Promise.resolve(window.confetti)
 if (!confettiReady) confettiReady = new Promise(resolve => {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
  script.onload = () => resolve(window.confetti)
  script.onerror = () => resolve(null)
  document.head.appendChild(script)
 })
 return confettiReady
}
export default function StarBurst({ effect }) {
 const reduced = useReducedMotion()
 useEffect(() => {
  let cancelled = false
  if (effect && !reduced) loadConfetti().then(confetti => {
   if (!confetti || cancelled) return
   confetti({ particleCount:10, spread:360, startVelocity:12, gravity:.3, ticks:65, shapes:['star'], colors:['#FFD93B'], scalar:1.3, origin:{x:effect.clientX/window.innerWidth,y:effect.clientY/window.innerHeight}, disableForReducedMotion:true, zIndex:1100 })
  })
  return () => { cancelled=true }
 }, [effect,reduced])
 if (!effect) return null
 return <div className="map-tap-effects" style={{left:`${effect.x}%`,top:`${effect.y}%`}} aria-hidden="true" key={effect.key}><motion.i initial={{scale:.3,opacity:1}} animate={{scale:2.4,opacity:0}} transition={{duration:.4}}/>{!reduced&&Array.from({length:10},(_,index)=><motion.span key={index} initial={{x:0,y:0,opacity:1,scale:.4}} animate={{x:Math.cos(index*Math.PI/5)*65,y:Math.sin(index*Math.PI/5)*65,opacity:0,scale:1,rotate:60}} transition={{duration:.55,delay:.1}}>★</motion.span>)}</div>
}
