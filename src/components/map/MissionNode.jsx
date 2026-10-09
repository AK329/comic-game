import { motion } from 'framer-motion'
import { Check, LockKeyhole } from 'lucide-react'
import ProbeIcon from './ProbeIcon.jsx'
export function stopFlip(event) { event.stopPropagation() }
export function flipSafeRef(element) {
 if (!element) return
 const events = ['pointerdown','mousedown','touchstart']
 events.forEach(name=>element.addEventListener(name,stopFlip))
 return ()=>events.forEach(name=>element.removeEventListener(name,stopFlip))
}
export default function MissionNode({ node, fact, comingSoon, onTap, shaking }) {
 const locked = node.state==='locked'
 return <motion.div className={`map-node ${node.state} ${node.x<50?'label-right':'label-left'}`} style={{left:`${node.x}%`,top:`${node.y}%`}} animate={shaking?{x:[0,-6,6,-5,5,0]}:{y:[0,-2,0]}} transition={shaking?{duration:.35}:{duration:3.5,repeat:Infinity,delay:node.y/100}}><motion.button ref={flipSafeRef} className="map-node-button" onPointerDown={stopFlip} onMouseDown={stopFlip} onTouchStart={stopFlip} onClick={event=>{stopFlip(event);onTap(node,event)}} whileHover={{scale:1.08}} whileTap={{scale:.95}} aria-label={`${node.name}. ${fact}${locked?`. ${comingSoon}`:''}`} aria-haspopup={locked?undefined:'dialog'}><ProbeIcon kind={node.icon}/>{locked?<span className="map-lock"><LockKeyhole size={14}/></span>:node.state==='completed'?<span className="map-check"><Check size={18}/></span>:<span className="map-current-star">✦</span>}</motion.button><div className="map-name-pill"><strong>{node.name}</strong></div>{node.state==='completed'&&<span className="map-found-stars" aria-hidden="true">✦ ✧</span>}{shaking&&<div className="map-soon" role="status">{comingSoon}</div>}</motion.div>
}
