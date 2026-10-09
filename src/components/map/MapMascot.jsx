import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { stopFlip, flipSafeRef } from './MissionNode.jsx'
export default function MapMascot({ position, onClick, label, jumping }) {
 return <motion.div className="map-mascot" animate={{left:`${position.x}%`,top:`${position.y}%`,y:jumping?-14:0}} transition={{duration:.12}}><button ref={flipSafeRef} className="robot" aria-label={label} onClick={onClick} onPointerDown={stopFlip} onMouseDown={stopFlip} onTouchStart={stopFlip}><div className="antenna"><i/></div><div className="robot-head"><div className="robot-face"><i/><i/><span/></div><b/><b/></div><div className="robot-body"><Heart size={13}/></div><div className="robot-shadow"/></button>{jumping&&<span className="map-hop-trail">✦ · ·</span>}</motion.div>
}
