import { useRef } from 'react'
import { motion } from 'framer-motion'
import TrailPath from './TrailPath.jsx'
import MissionNode from './MissionNode.jsx'
import MapMascot from './MapMascot.jsx'
import MapProgress from './MapProgress.jsx'
import StarBurst from './StarBurst.jsx'
export default function MapPage({ world, data, text, count, nodes, onTap, mascot, jumping, pathRef, shaking, effect }) {
 const stage = useRef(null)
 return <section className={`map-page map-${world}`}><div className="map-orbits" aria-hidden="true"/><div className="map-corner-planet" aria-hidden="true"><span/><i/><i/><i/></div><header className="map-heading"><h2>{text[world].title}</h2><p>{text[world].tagline}</p></header><div className="map-decorations" aria-hidden="true"><span className="map-ringed">●</span><span className="map-earth">🌎</span>{Array.from({length:12},(_,index)=><motion.span key={index} className="map-twinkle" style={{left:`${(index*37+7)%98}%`,top:`${(index*19+3)%95}%`}} animate={{opacity:[.3,1,.3],scale:[.8,1.1,.8]}} transition={{duration:2.5,repeat:Infinity,delay:index*.25}}>✦</motion.span>)}</div><div className="map-stage" ref={stage}><TrailPath colors={data.colors} pathRef={pathRef}/>{nodes.map(node=><MissionNode key={node.id} node={node} fact={text.facts[node.fact]} comingSoon={text.soon} shaking={shaking===node.id} onTap={(tapped,event)=>onTap(tapped,event,stage.current)}/>)}{mascot&&<MapMascot position={mascot} jumping={jumping} label={text.mascot} onClick={event=>{event.stopPropagation();const node=nodes.find(candidate=>candidate.id===mascot.nodeId)||nodes.find(candidate=>candidate.state!=='locked');onTap(node,event,stage.current)}}/>}<StarBurst effect={effect}/></div><div className="map-page-bottom">{world==='mars'?<div className="map-ribbon">✦ {text.ribbon}</div>:<MapProgress count={count} text={text}/>}<span className="map-folio">{world==='moon'?text.folioMoon:text.folioMars}</span></div></section>
}
