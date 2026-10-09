import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import ProbeIcon from './ProbeIcon.jsx'
import { stopFlip } from './MissionNode.jsx'
export default function MissionPopup({ node, text, onClose, onPlay, language }) {
 const dialog = useRef(null)
 const closeButton = useRef(null)
 useEffect(() => {
  const previous = document.activeElement
  closeButton.current?.focus()
  function keyboard(event) {
   if (event.key==='Escape') { event.preventDefault(); onClose() }
   if (event.key==='Tab') {
    const buttons = dialog.current?.querySelectorAll('button:not(:disabled)')
    if (!buttons?.length) return
    if (event.shiftKey && document.activeElement===buttons[0]) { event.preventDefault();buttons[buttons.length-1].focus() }
    else if (!event.shiftKey && document.activeElement===buttons[buttons.length-1]) { event.preventDefault();buttons[0].focus() }
   }
  }
  document.addEventListener('keydown',keyboard)
  return () => { document.removeEventListener('keydown',keyboard);previous?.focus() }
 }, [onClose])
 return createPortal(<div className="map-popup-overlay" lang={language} onClick={onClose} onPointerDown={stopFlip} onMouseDown={stopFlip} onTouchStart={stopFlip}><motion.section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`popup-${node.id}`} className="map-popup" initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:360,damping:22}} onClick={stopFlip}><button ref={closeButton} className="map-close" aria-label={text.close} onClick={onClose}><X size={25}/></button><div className="map-popup-art"><span className="map-art-stars">✦ · ✧</span><ProbeIcon kind={node.icon}/><div className="map-surface"/></div><div className="map-level"><Play size={15} fill="currentColor"/>{text.level} {node.id==='apollo15'?'04':'01'}</div><h2 id={`popup-${node.id}`}>{node.name}</h2><p>{text.facts[node.fact]}</p>{node.state==='completed'&&<span className="map-found-badge">{text.found} ⭐</span>}{node.missionId?<button className="map-play" onClick={()=>{onClose();onPlay(node.missionId)}}><Play size={24} fill="currentColor"/>{text.play}</button>:<button className="map-play" onClick={onClose}>{text.back}</button>}</motion.section></div>,document.body)
}
