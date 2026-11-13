import { useState } from 'react'
import { Star, Check, BookOpen, ArrowRight, RotateCcw } from 'lucide-react'
import { flipSafeRef } from '../map/MissionNode.jsx'
import pink from '../../assets/matching/pink.webp'
import cyan from '../../assets/matching/cyan.webp'
import yellow from '../../assets/matching/yellow.webp'
import pip from '../../assets/matching/pip-cheer.webp'
import rocket from '../../assets/mission/rocket.webp'
import planet from '../../assets/mission/planet.webp'
import rover from '../../assets/mission/rover-photo.webp'
import './matching.css'

const pieces = [pink, cyan, yellow]
const imageUrl = image => typeof image === 'string' ? image : image.src
export function useMatchingGame() {
 const [matches, setMatches] = useState({})
 const [answer, setAnswer] = useState(null)
 const [question, setQuestion] = useState(null)
 const [message, setMessage] = useState('instruction')
 const connect = (slot, choice) => {
  if (slot === choice) { setMatches(previous=>({...previous,[slot]:choice})); setAnswer(null); setQuestion(null); setMessage('correct') }
  else { setMessage('gentle'); setAnswer(null); setQuestion(null) }
 }
 const chooseAnswer = choice => { if(question!==null)connect(question,choice);else{setAnswer(choice);setMessage('pickQuestion')} }
 const chooseQuestion = slot => { if(answer!==null)connect(slot,answer);else{setQuestion(slot);setMessage('pickAnswer')} }
 const reset = () => {setMatches({});setAnswer(null);setQuestion(null);setMessage('instruction')}
 return {matches,answer,question,message,chooseAnswer,chooseQuestion,reset}
}
function Decorations({ right = false }) {
 return <div className="matching-decor pointer-events-none absolute inset-0" aria-hidden="true"><img className="matching-rocket" src={imageUrl(rocket)} alt=""/><img className="matching-planet" src={imageUrl(planet)} alt=""/><svg className="absolute inset-0 h-full w-full" viewBox="0 0 480 600" preserveAspectRatio="none"><path d={right?'M36 123 C6 171 79 189 48 211 S31 198 44 233 M42 328 C6 375 78 406 43 425 S24 413 32 457':'M112 341 Q149 307 167 356 M256 352 Q267 320 297 329 M278 465 Q267 493 230 501 M121 508 Q104 502 104 480'} fill="none" stroke="#363b4d" strokeWidth="1.8" strokeDasharray="6 8" strokeLinecap="round"/></svg><Star className="matching-doodle" fill="#b8d0bd"/><Star className="matching-doodle matching-doodle-two" fill="#f3cd93"/></div>
}
export function MatchingLeft({ text, game }) {
 return <section className="matching-page matching-left"><Decorations/><h2 className="matching-heading text-center">{text.matching.title}</h2><div className="matching-questions grid grid-cols-3 gap-1">{pieces.map((piece,index)=><button ref={flipSafeRef} type="button" key={index} className={`matching-piece ${game.question===index?'is-selected':''} ${game.matches[index]!==undefined?'is-connected':''}`} onClick={()=>game.chooseQuestion(index)} aria-pressed={game.question===index}><img src={imageUrl(piece)} alt=""/><span>{text.matching.questions[index]}{game.matches[index]!==undefined&&<Check aria-label={text.matching.correct}/>}</span></button>)}</div><p className="matching-instruction text-center" role="status">{Object.keys(game.matches).length===3?text.matching.complete:text.matching[game.message]}</p><div className="matching-answers grid grid-cols-2 grid-rows-3">{[0,1,2,3,4,5].map(index=><button ref={flipSafeRef} type="button" key={index} className={`matching-answer matching-color-${index%3} ${game.answer===index?'is-selected':''} ${Object.values(game.matches).includes(index)?'is-connected':''}`} onClick={()=>game.chooseAnswer(index)} aria-pressed={game.answer===index}>{text.matching.answers[index]}{Object.values(game.matches).includes(index)&&<Check aria-hidden="true"/>}</button>)}</div><button ref={flipSafeRef} type="button" className="matching-reset flex items-center gap-1" onClick={game.reset}><RotateCcw size={13}/>{text.cargoLab.reset}</button><span className="matching-folio">11</span></section>
}
export function MatchingRight({ text, game, onMission, onMemory }) {
 const count = Object.keys(game.matches).length
 return <section className="matching-page matching-right"><Decorations right/><div className={`matching-badge grid place-items-center ${count===3?'is-earned':''}`} role="status" aria-label={`${text.matching.connected}: ${count} / 3`}><div className="flex flex-col items-center"><Star fill={count===3?'#f4c669':'#d5e0e4'} aria-hidden="true"/><strong>{count} / 3</strong><span>{count===3?text.matching.badge:text.matching.connected}</span></div>{[0,1,2,3,4,5].map(index=><Star key={index} className={`matching-badge-star matching-badge-star-${index}`} fill={index<count*2?'#efbd77':'#f4e1bf'} aria-hidden="true"/>)}</div><div className="matching-board"><span className="matching-tape matching-tape-left"/><span className="matching-tape matching-tape-right"/><h2 className="matching-board-title text-center">{text.matching.board}</h2><div className="matching-board-pieces grid grid-cols-3 gap-1">{pieces.map((piece,index)=><div className={`matching-board-piece ${game.matches[index]!==undefined?'is-connected':''}`} key={index}><img src={imageUrl(piece)} alt=""/><p>{game.matches[index]!==undefined?text.matching.answers[game.matches[index]]:text.matching.questions[index]}</p>{game.matches[index]!==undefined&&<Check aria-label={text.matching.correct}/>}</div>)}</div></div><button ref={flipSafeRef} type="button" className="matching-passport" onClick={onMission}><BookOpen aria-hidden="true"/><span>{text.matching.passport}</span><img src={imageUrl(rocket)} alt=""/></button><button ref={flipSafeRef} type="button" className="matching-photo matching-photo-back" onClick={onMemory} aria-label={text.chapters[5]}><Star fill="#f0bd75" aria-hidden="true"/></button><button ref={flipSafeRef} type="button" className="matching-photo matching-photo-front" onClick={onMemory}><span className="matching-tape"/><img src={imageUrl(rover)} alt=""/><span>{text.chapters[5]}<ArrowRight size={12}/></span></button><img className="matching-pip" src={imageUrl(pip)} alt={text.matching.pipAlt}/><span className="matching-folio">12</span></section>
}
