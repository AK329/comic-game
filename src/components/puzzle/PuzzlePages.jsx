import { useEffect, useState } from 'react'
import { Rocket, Volume2, VolumeX, Star, Check, Globe2 } from 'lucide-react'
import { flipSafeRef } from '../map/MissionNode.jsx'
import pip from '../../assets/puzzle/pip-point.webp'
import radio from '../../assets/puzzle/radio.webp'
import rocket from '../../assets/mission/rocket.webp'
import planet from '../../assets/mission/planet.webp'
import './puzzle.css'

const imageUrl = image => typeof image === 'string' ? image : image.src
function Decorations() {
 return <div className="packing-decor pointer-events-none absolute inset-0" aria-hidden="true"><svg viewBox="0 0 480 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><path d="M35 120 C5 180 83 196 46 214 S29 204 45 241 M420 152 C475 219 444 289 421 306 M46 310 C14 369 60 399 42 420 S21 412 36 454 Q46 489 73 498" fill="none" stroke="#34374b" strokeWidth="1.8" strokeDasharray="6 8" strokeLinecap="round"/></svg><Star className="packing-star packing-star-one" fill="#eac77f"/><Star className="packing-star packing-star-two" fill="#b3d0ba"/><Star className="packing-star packing-star-three" fill="#ebb98c"/><img className="packing-planet" src={imageUrl(planet)} alt=""/></div>
}

export function PuzzleLeft({ text, hint, checked, active, language }) {
 const [speaking, setSpeaking] = useState(false)
 useEffect(() => { if (!active || speaking) { window.speechSynthesis?.cancel(); setSpeaking(false) } }, [active, language])
 useEffect(() => () => window.speechSynthesis?.cancel(), [])
 const narrate = () => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  if (speaking) { setSpeaking(false); return }
  const utterance = new SpeechSynthesisUtterance(`${text.puzzleTitle}. ${text.puzzleIntro}. ${text.drag}`)
  utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US'
  utterance.rate = .85
  utterance.onend = utterance.onerror = () => setSpeaking(false)
  setSpeaking(true); window.speechSynthesis.speak(utterance)
 }
 return <section className="packing-page packing-left"><Decorations/><div className="packing-cloud"/><div className="packing-speech flex flex-col items-center justify-center text-center"><span className="packing-eyebrow">{text.puzzleDesign.pipSays}</span><h2>{text.puzzleTitle}</h2><p>{text.puzzleIntro}</p><p className="packing-tip" role="status">{checked ? text.success : hint || text.drag}</p></div><img className="packing-pip" src={imageUrl(pip)} alt={text.puzzleDesign.pipAlt}/><svg className="packing-flight" viewBox="0 0 300 100" aria-hidden="true"><path d="M5 85 C85 125 115 30 88 30 S55 84 111 62 S208 -1 284 16" fill="none" stroke="#30394f" strokeWidth="2" strokeDasharray="7 8" strokeLinecap="round"/><path d="m279 8 12 11-17 1" fill="none" stroke="#30394f" strokeWidth="2"/></svg><button ref={flipSafeRef} type="button" className="packing-speaker grid place-items-center" onClick={narrate} aria-label={speaking ? text.puzzleDesign.stop : text.puzzleDesign.listen} aria-pressed={speaking}>{speaking ? <VolumeX/> : <Volume2/>}</button><img className="packing-radio" src={imageUrl(radio)} alt=""/><span className="packing-folio">07</span></section>
}

export function PuzzleRight({ text, weights, locations, selected, setSelected, move, weight, validate, checked }) {
 const drop = (event, destination) => {
  event.preventDefault()
  const value = event.dataTransfer.getData('text/plain')
  if (/^[0-3]$/.test(value)) move(Number(value), destination)
 }
 const destination = (target, className) => <div className={className} ref={flipSafeRef} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,target)}><button type="button" className="packing-destination flex w-full items-center justify-center gap-2" onClick={()=>move(selected,target)}>{target === 'earth' ? <Rocket/> : <Globe2/>}<strong>{text[target === 'earth' ? 'return' : 'leave']}</strong></button><div className="packing-stored flex flex-col gap-1">{weights.map((value,index)=>locations[index]===target && <button type="button" key={index} draggable onDragStart={event=>{event.dataTransfer.setData('text/plain',String(index));setSelected(index)}} aria-pressed={selected===index} className={selected===index?'is-selected':''} onClick={()=>setSelected(index)}>{text.items[index]} <small>· {value} {text.kg}</small></button>)}</div></div>
 return <section className="packing-page packing-right"><Decorations/><img className="packing-rocket" src={imageUrl(rocket)} alt=""/><h2 className="packing-title text-center">{text.puzzleDesign.title}</h2><div className="packing-cargo packing-lined"><p>{text.drag}</p><div className="grid grid-cols-4 gap-1">{weights.map((value,index)=><button ref={flipSafeRef} type="button" key={index} className={`packing-item flex flex-col items-center ${selected===index?'is-selected':''} ${locations[index]?'is-packed':''}`} draggable aria-pressed={selected===index} onDragStart={event=>{event.dataTransfer.setData('text/plain',String(index));setSelected(index)}} onClick={()=>setSelected(index)}><span aria-hidden="true">{['🪨','🎞️','🛞','📦'][index]}</span><strong>{text.items[index]}</strong><small>{value} {text.kg} {locations[index]?'✓':''}</small></button>)}</div></div><div className="packing-polaroid"><div className="packing-tape"/>{destination('earth','packing-earth')}<span className="packing-photo-caption">{text.puzzleDesign.homeward}</span><div className="packing-tape packing-tape-bottom"/></div>{destination('moon','packing-moon packing-lined')}<div className="packing-capacity packing-lined"><div className="flex items-center justify-between gap-2"><strong>{text.capacity}</strong><span>{weight} / 12 {text.kg}</span></div><progress max="12" value={Math.min(weight,12)} className={weight>12?'is-heavy':''} aria-label={text.capacity}/><p role="status">{checked ? text.puzzleDesign.complete : text.hintPuzzle}</p></div><button ref={flipSafeRef} type="button" className="packing-launch grid place-items-center" onClick={validate} aria-label={text.check} title={text.check}>{checked ? <Check/> : <Rocket/>}</button><span className="packing-folio">08</span></section>
}
