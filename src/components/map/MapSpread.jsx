import { useEffect, useRef, useState, useCallback } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import mapNodes from '../../data/mapNodes.json'
import MapPage from './MapPage.jsx'
import MissionPopup from './MissionPopup.jsx'
import './map.css'

export default function MapSpread({ world, active, text, progress, onPlay, language }) {
 const [popup,setPopup] = useState(null)
 const [mascot,setMascot] = useState(world==='moon'?{x:13,y:-12}:null)
 const [jumping,setJumping] = useState(false)
 const [effect,setEffect] = useState(null)
 const [shaking,setShaking] = useState(null)
 const seen = useRef(false); const path = useRef(null); const timer = useRef(null); const motionControl = useRef(null)
 const reduced = useReducedMotion()
 const resolveNode = node => node.missionId==='rover'&&progress.passport?{...node,state:'completed'}:node
 const nodes = mapNodes[world].nodes.map(resolveNode)
 const count = Object.values(mapNodes).flatMap(page=>page.nodes).map(resolveNode).filter(node=>node.state==='completed').length
 const dismiss = useCallback(()=>setPopup(null),[])
 const land = (node, clientX, clientY, intro) => {
  setJumping(false);setMascot({x:node.x,y:node.y,nodeId:node.id})
  if(intro) setEffect({x:node.x,y:node.y,clientX,clientY,key:Date.now()})
  timer.current = setTimeout(()=>setPopup(node),320)
 }
 function hop(node, fromIntro=false) {
  motionControl.current?.stop();clearTimeout(timer.current);setPopup(null);setJumping(true)
  const start = mascot || {x:node.x,y:node.y}
  const length = path.current?.getTotalLength()||0
  const targetIndex = nodes.findIndex(candidate=>candidate.id===node.id)
  const startIndex = nodes.findIndex(candidate=>candidate.id===start.nodeId)
  const stageRect = path.current?.closest('.map-stage')?.getBoundingClientRect()
  const finish = () => land(node,stageRect?stageRect.left+stageRect.width*node.x/100:window.innerWidth/2,stageRect?stageRect.top+stageRect.height*node.y/100:window.innerHeight/2,fromIntro)
  if(reduced) { finish();return }
  motionControl.current = animate(0,1,{duration:fromIntro?2.5:.75,ease:'easeInOut',onUpdate:value=>{
   if(fromIntro && value<.18) {
    const point = path.current?.getPointAtLength(0)
    setMascot({x:start.x+((point?.x||88)/4-start.x)*value/.18,y:start.y+((point?.y||40)/4-start.y)*value/.18-Math.sin(value/.18*Math.PI)*8})
   } else if(length) {
    const from = fromIntro?0:Math.max(0,startIndex)/4
    const trailValue = fromIntro?(value-.18)/.82:value
    const point = path.current.getPointAtLength(length*(from+(targetIndex/4-from)*trailValue))
    setMascot({x:point.x/4,y:point.y/4-Math.abs(Math.sin(value*Math.PI*(fromIntro?4:1)))*8,nodeId:node.id})
   } else setMascot({x:start.x+(node.x-start.x)*value,y:start.y+(node.y-start.y)*value-Math.sin(value*Math.PI)*10,nodeId:node.id})
  },onComplete:finish})
 }
 useEffect(()=>{
  if(!active){motionControl.current?.stop();clearTimeout(timer.current);setPopup(null);setJumping(false);return}
  if(world==='moon'&&!seen.current){seen.current=true;timer.current=setTimeout(()=>hop(nodes.find(node=>node.missionId==='rover'),true),450)}
  return ()=>{motionControl.current?.stop();clearTimeout(timer.current)}
 },[active])
 useEffect(()=>()=>{motionControl.current?.stop();clearTimeout(timer.current)},[])
 function tap(node,event,stage) {
  if(node.state==='locked'){setShaking(null);requestAnimationFrame(()=>setShaking(node.id));clearTimeout(timer.current);timer.current=setTimeout(()=>setShaking(null),1800);return}
  const bounds=stage?.getBoundingClientRect()
  setEffect({x:node.x,y:node.y,clientX:bounds?bounds.left+bounds.width*node.x/100:event.clientX,clientY:bounds?bounds.top+bounds.height*node.y/100:event.clientY,key:Date.now()})
  setShaking(null);hop(node)
 }
 const currentPopup = popup?resolveNode(popup):null
 return <><MapPage world={world} data={mapNodes[world]} text={text} count={count} nodes={nodes} pathRef={path} onTap={tap} mascot={mascot} jumping={jumping} shaking={shaking} effect={effect}/>{active&&currentPopup&&<MissionPopup node={currentPopup} text={text} language={language} onClose={dismiss} onPlay={onPlay}/>}</>
}
