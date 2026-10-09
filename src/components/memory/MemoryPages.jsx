import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, Rocket, Check, LockKeyhole, Play, ArrowRight, ArrowLeft, X, BookOpen, Backpack } from 'lucide-react'
import { flipSafeRef } from '../map/MissionNode.jsx'
import rover from '../../assets/mission/rover-photo.webp'
import rocket from '../../assets/mission/rocket.webp'
import planet from '../../assets/mission/planet.webp'
import pip from '../../assets/memory/pip-tablet.webp'
import './memory.css'

const imageUrl = image => typeof image === 'string' ? image : image.src
function Decorations({ right = false }) {
 return <div className="memory-decoration pointer-events-none absolute inset-0" aria-hidden="true"><img className="memory-rocket" src={imageUrl(rocket)} alt=""/><img className="memory-planet" src={imageUrl(planet)} alt=""/><svg className="absolute inset-0 h-full w-full" viewBox="0 0 480 600" preserveAspectRatio="none"><path d={right ? 'M38 117 C7 179 79 190 45 211 S28 197 44 236 M44 340 C9 394 77 415 45 432 S28 414 36 455 Q32 499 75 506' : 'M32 292 C25 361 57 385 106 354 M290 376 C251 413 352 422 323 386 S296 409 338 402 Q413 326 485 350'} fill="none" stroke="#363b4b" strokeWidth="1.8" strokeDasharray="6 8" strokeLinecap="round"/></svg>{[0,1,2,3,4].map(index=><Star key={index} className={`memory-doodle memory-doodle-${index}`} fill={index%2 ? '#bbd3be' : '#f3d09a'}/>)}{right && <><img className="memory-small-planet" src={imageUrl(planet)} alt=""/><img className="memory-bottom-planet" src={imageUrl(planet)} alt=""/></>}</div>
}

function Recap({ text, onClose, onExplore }) {
 const [step, setStep] = useState(0)
 const dialog = useRef(null)
 const content = [text.missionIntro, text.missionEnd, text.hintPuzzle]
 useEffect(() => {
  const previous = document.activeElement
  dialog.current?.querySelector('button')?.focus()
  const keyDown = event => {
   if (event.key === 'Escape') { event.preventDefault(); onClose() }
   if (event.key !== 'Tab') return
   const elements = [...dialog.current.querySelectorAll('button')].filter(element=>!element.disabled)
   const first = elements[0], last = elements[elements.length-1]
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
   if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  document.addEventListener('keydown', keyDown)
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  return () => { document.removeEventListener('keydown', keyDown); document.body.style.overflow = previousOverflow; previous?.focus() }
 }, [onClose])
 return createPortal(<div className="memory-recap-backdrop fixed inset-0 flex items-center justify-center p-5" onClick={onClose}><section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="memory-recap-title" className="memory-recap relative w-full max-w-md" onClick={event=>event.stopPropagation()}><button className="memory-recap-close absolute right-4 top-4" onClick={onClose} aria-label={text.memoryDesign.close}><X/></button><h2 id="memory-recap-title">{text.memoryDesign.replay}</h2><div className="memory-recap-photo">{step<2 ? <img src={imageUrl(rover)} alt={text.missionDesign.roverAlt}/> : <Backpack aria-hidden="true"/>}</div><p aria-live="polite">{content[step]}</p><div className="flex items-center justify-between gap-3"><button disabled={step===0} onClick={()=>setStep(step-1)} aria-label={text.previous}><ArrowLeft/></button><span>{step+1} / 3</span><button onClick={()=>step<2 ? setStep(step+1) : onExplore()} aria-label={step<2 ? text.next : text.continue}><ArrowRight/></button></div></section></div>, document.body)
}

export function MemoryLeft({ text, progress, active, onMission, onPuzzle, onExplore }) {
 const [recap, setRecap] = useState(false)
 const complete = progress.passport && progress.puzzle
 const percent = (Number(progress.passport) + Number(progress.puzzle)) * 50
 useEffect(()=>setRecap(false), [active])
 return <section className="memory-page memory-left"><Decorations/><h2 className="memory-heading text-center">{text.chapters[5]}</h2><div className="memory-gallery"><button ref={flipSafeRef} type="button" className="memory-photo memory-photo-rover" onClick={onMission} aria-label={`${text.rover}. ${progress.passport ? text.collected : text.empty}`}><span className="memory-tape"/><span className="memory-photo-image grid place-items-center">{progress.passport ? <img src={imageUrl(rover)} alt={text.missionDesign.roverAlt}/> : <BookOpen aria-hidden="true"/>}<span className="memory-photo-status">{progress.passport ? <Check/> : <LockKeyhole/>}</span></span><span className="memory-caption">{text.rover}</span></button><button ref={flipSafeRef} type="button" className="memory-photo memory-photo-packing" onClick={onPuzzle}><span className="memory-tape"/><span className="memory-photo-image grid place-items-center"><span className="memory-samples" aria-hidden="true">{progress.puzzle ? '🪨 🎞️' : '📦'}</span><span className="memory-photo-status">{progress.puzzle ? <Check/> : <LockKeyhole/>}</span></span><span className="memory-caption">{text.memoryDesign.packing}</span></button><button ref={flipSafeRef} type="button" className={`memory-photo memory-photo-badge ${complete ? 'is-earned' : ''}`} onClick={()=>setRecap(true)}><span className="memory-tape"/><span className="memory-photo-image grid place-items-center"><Star className="memory-badge-star" fill={complete ? '#f5ca74' : '#abb7ce'} aria-hidden="true"/><span className="memory-photo-status">{complete ? <Check/> : <LockKeyhole/>}</span></span><span className="memory-caption">{complete ? text.badge : text.badgeLocked}</span><span className="memory-tape memory-lower-tape"/></button></div><div className="memory-chart"><div className="flex items-center justify-between gap-2"><h3>{text.progress}</h3><strong>{percent}%</strong></div><div className="memory-chart-columns flex items-end justify-around"><div><div className="memory-bars flex items-end justify-center gap-1" aria-hidden="true"><span/><span/><span className={progress.passport ? 'is-filled' : ''}/></div><p>{text.memoryDesign.passport}</p><Check className={progress.passport ? 'memory-step-done' : 'memory-step-waiting'} aria-label={progress.passport ? text.collected : text.empty}/></div><div><div className="memory-bars flex items-end justify-center gap-1" aria-hidden="true"><span/><span/><span className={progress.puzzle ? 'is-filled' : ''}/></div><p>{text.memoryDesign.packing}</p><Check className={progress.puzzle ? 'memory-step-done' : 'memory-step-waiting'} aria-label={progress.puzzle ? text.success : text.drag}/></div></div><progress max="100" value={percent} aria-label={text.progress}/></div><button ref={flipSafeRef} type="button" className="memory-replay" onClick={()=>setRecap(true)} aria-haspopup="dialog"><span className="memory-replay-screen grid place-items-center"><Play fill="#fff6de" aria-hidden="true"/></span><span className="memory-replay-caption flex items-center gap-1"><Play size={12}/>{text.memoryDesign.replay}</span></button><span className="memory-folio">13</span>{recap && active && <Recap text={text} onClose={()=>setRecap(false)} onExplore={()=>{setRecap(false);onExplore()}}/>}</section>
}

export function MemoryRight({ text, progress, onExplore }) {
 const complete = progress.passport && progress.puzzle
 return <section className="memory-page memory-right"><Decorations right/><div className="memory-cloud"/><h2 className="memory-heading text-center">{text.memoryDesign.pipTitle}</h2><div className="memory-speech flex flex-col items-center justify-center text-center"><span className="memory-message-star" aria-hidden="true">✦</span><h3>{complete ? text.memoryDesign.wellDone : text.memoryDesign.keepCurious}</h3><p>{complete ? text.complete : text.memoryIntro}</p><p className="memory-saved flex items-center justify-center gap-1"><Check size={14}/>{text.saved}</p><button ref={flipSafeRef} type="button" className="memory-explore flex items-center justify-center gap-2" onClick={onExplore}>{text.continue}<ArrowRight size={16}/></button></div><img className="memory-pip" src={imageUrl(pip)} alt={text.memoryDesign.pipAlt}/><span className="memory-folio">14</span></section>
}
