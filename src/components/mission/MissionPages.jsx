import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight, BookOpen, X, Heart } from 'lucide-react'
import Artwork from '../Artwork.jsx'
import { flipSafeRef, stopFlip } from '../map/MissionNode.jsx'
import pipAsset from '../../assets/mission/pip-portrait.webp'
import astronautHead from '../../assets/mission/astronaut-head.webp'
import astronautBoots from '../../assets/mission/astronaut-boots.webp'
import roverAsset from '../../assets/mission/rover-photo.webp'
import wavingAsset from '../../assets/mission/pip-wave.webp'
import rocketAsset from '../../assets/mission/rocket.webp'
import planetAsset from '../../assets/mission/planet.webp'
import './mission.css'

const imageUrl = image => typeof image === 'string' ? image : image.src
function Decorations({ paper=false }) {
 return <div className="mission-scrap-decor" aria-hidden="true"><svg className="mission-sketch-trail" viewBox="0 0 480 600" preserveAspectRatio="none"><path d={paper?'M38 120 C0 174 89 206 51 226 S57 215 41 252 M420 137 C474 184 437 228 452 283 M54 365 C5 395 89 409 57 435 S36 399 30 458 S40 510 69 512':'M31 130 C0 166 16 231 44 258 M223 155 C250 69 317 146 382 108 M45 407 C7 469 59 539 80 513 M244 531 C259 481 279 566 320 534 S381 546 426 489 S454 436 438 413'} fill="none" stroke="#2d354b" strokeWidth="1.7" strokeDasharray="5 8" strokeLinecap="round"/></svg>{[0,1,2,3,4,5,6].map(index=><Star key={index} className={`mission-sketch-star mission-star-${index}`} fill={index%2?'#b4d8bd':'#f6d79a'} strokeWidth={1.7}/>)}<img className="mission-sketch-planet" src={imageUrl(planetAsset)} alt=""/>{paper&&<><img className="mission-sketch-rocket" src={imageUrl(rocketAsset)} alt=""/><div className="mission-watercolor"/></>}</div>
}
export function MissionLeft({ text }) {
 const [soon,setSoon] = useState(false)
 const [selected,setSelected] = useState(true)
 useEffect(()=>{if(!soon)return;const timer=setTimeout(()=>setSoon(false),2200);return()=>clearTimeout(timer)},[soon])
 return <section className="mission-scrapbook mission-cork"><Decorations/><h2 className="mission-scrap-heading">{text.missionDesign.choose}</h2><div className="mission-character-cards"><motion.button ref={flipSafeRef} className={`mission-character available ${selected?'chosen':''}`} onClick={event=>{stopFlip(event);setSelected(true)}} whileHover={{rotate:-2,scale:1.025}} whileTap={{scale:.98}} aria-label={text.missionDesign.pip} aria-pressed={selected}><span className="mission-masking-tape"/><img src={imageUrl(pipAsset)} alt=""/><span className="mission-character-number">1</span>{selected&&<Check className="mission-character-check" size={38} strokeWidth={3}/>}</motion.button><motion.button ref={flipSafeRef} className="mission-character unavailable" onClick={event=>{stopFlip(event);setSoon(true)}} animate={soon?{x:[0,-4,4,-3,3,0]}:{x:0}} aria-label={text.missionDesign.astronaut}><span className="mission-masking-tape"/><div className="mission-astronaut"><img className="astronaut-head" src={imageUrl(astronautHead)} alt=""/><img className="astronaut-boots" src={imageUrl(astronautBoots)} alt=""/><span className="mission-coming-ribbon">{text.map.soon}</span></div></motion.button></div><span className="mission-second-number">2</span>{soon&&<div className="mission-character-hint" role="status">{text.map.soon}</div>}</section>
}
function PassportOverlay({ text, progress, onCollect, onClose, slider, setSlider }) {
 const dialog=useRef(null)
 useEffect(()=>{
  const previous=document.activeElement
  dialog.current?.querySelector('button')?.focus()
  const keyboard=event=>{
   if(event.key==='Escape'){event.preventDefault();onClose()}
   if(event.key==='Tab'){
    const controls=dialog.current?.querySelectorAll('button,input')
    if(!controls?.length)return
    if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls[controls.length-1].focus()}
    else if(!event.shiftKey&&document.activeElement===controls[controls.length-1]){event.preventDefault();controls[0].focus()}
   }
  }
  document.addEventListener('keydown',keyboard)
  return()=>{document.removeEventListener('keydown',keyboard);previous?.focus()}
 },[onClose])
 return createPortal(<div className="mission-passport-overlay" onClick={onClose} onPointerDown={stopFlip} onMouseDown={stopFlip} onTouchStart={stopFlip}><motion.section className="mission-passport-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="mission-passport-title" initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} onClick={stopFlip}><button className="mission-passport-close" onClick={onClose} aria-label={text.map.close}><X size={23}/></button><div className="mission-dialog-eyebrow">{text.passport}</div><h2 id="mission-passport-title">{text.rover}</h2><p className="mission-dialog-story">{text.missionIntro} {text.missionEnd}</p>{['what','why','science'].map(key=><div className="mission-dialog-answer" key={key}><strong>{text[key]}</strong><p>{text[`${key}Answer`]}</p></div>)}<div className="comparison"><Artwork tracks={false}/><div className="comparison-after" style={{clipPath:`inset(0 ${100-slider}% 0 0)`}}><Artwork tracks/></div><div className="slider-line" style={{left:`${slider}%`}}><span>↔</span></div><input aria-label={text.slider} type="range" min="0" max="100" value={slider} onChange={event=>setSlider(Number(event.target.value))}/><span className="before-label">{text.before}</span><span className="after-label">{text.after}</span></div><button className="mission-collect-button" onClick={onCollect}>{progress.passport?<Check size={20}/>:<Heart size={20}/>} {progress.passport?text.collected:text.collect}</button></motion.section></div>,document.body)
}
export function MissionRight({ text, active, progress, onCollect, slider, setSlider }) {
 const [open,setOpen]=useState(false)
 const close=useCallback(()=>setOpen(false),[])
 useEffect(()=>{if(!active)setOpen(false)},[active])
 return <section className="mission-scrapbook mission-cream"><Decorations paper/><h2 className="mission-scrap-heading">{text.rover}</h2><div className="mission-rover-polaroid"><span className="mission-masking-tape"/><img src={imageUrl(roverAsset)} alt={text.missionDesign.roverAlt}/><div className="mission-photo-note">{text.missionDesign.photoNote}</div><span className="mission-masking-tape lower-tape"/></div><div className="mission-ticket-tags"><span>{text.missionDesign.apollo}</span><span>{text.missionDesign.year}</span></div><button ref={flipSafeRef} className="mission-explore-button" onClick={event=>{stopFlip(event);setOpen(true)}}><BookOpen size={22}/>{text.missionDesign.explore}<ArrowRight size={20}/></button><img className="mission-waving-pip" src={imageUrl(wavingAsset)} alt=""/>{active&&open&&<PassportOverlay text={text} progress={progress} onCollect={onCollect} onClose={close} slider={slider} setSlider={setSlider}/>}</section>
}
