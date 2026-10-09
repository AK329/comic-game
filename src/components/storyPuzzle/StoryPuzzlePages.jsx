import { Check, Star, LockKeyhole } from 'lucide-react'
import { flipSafeRef } from '../map/MissionNode.jsx'
import pink from '../../assets/storyPuzzle/pink.webp'
import cyan from '../../assets/storyPuzzle/cyan.webp'
import yellow from '../../assets/storyPuzzle/yellow.webp'
import pip from '../../assets/storyPuzzle/pip.webp'
import rocket from '../../assets/mission/rocket.webp'
import planet from '../../assets/mission/planet.webp'
import rover from '../../assets/mission/rover-photo.webp'
import './storyPuzzle.css'

const imageUrl = image => typeof image === 'string' ? image : image.src
const pieces = [pink, cyan, yellow]
function Decorations() {
 return <div className="story-match-decor pointer-events-none absolute inset-0" aria-hidden="true"><img className="story-match-rocket" src={imageUrl(rocket)} alt=""/><img className="story-match-planet" src={imageUrl(planet)} alt=""/><svg viewBox="0 0 480 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="none"><path d="M35 118 C14 172 68 179 45 205 S33 194 42 230 M248 371 C294 341 304 383 348 371 M72 414 C15 469 99 504 139 523 M240 527 C235 489 354 505 383 438 M422 140 Q464 218 434 285" stroke="#353b4c" strokeWidth="1.6" strokeDasharray="6 8" strokeLinecap="round" fill="none"/></svg><Star className="story-match-doodle" fill="#eec992"/><Star className="story-match-doodle story-match-doodle-two" fill="#afccbe"/></div>
}

export function StoryPuzzleLeft({ text, selected, setSelected, matches }) {
 return <section className="story-match-page story-match-left"><Decorations/><h2 className="story-match-title text-center">{text.storyPuzzle.title}</h2><div className="story-match-questions grid grid-cols-3 gap-2">{pieces.map((piece,index)=><div key={index} className="story-match-question"><img src={imageUrl(piece)} alt=""/><strong>{text.storyPuzzle.questions[index]}</strong></div>)}</div><p className="story-match-instructions text-center">{text.storyPuzzle.instruction}</p><div className="story-match-choices">{text.storyPuzzle.answers.map((answer,index)=><button ref={flipSafeRef} type="button" key={index} draggable={!matches.includes(index)} disabled={matches.includes(index)} className={`story-match-choice choice-${index} ${selected===index?'is-selected':''}`} aria-pressed={selected===index} onClick={()=>setSelected(index)} onDragStart={event=>{event.dataTransfer.setData('text/plain',String(index));setSelected(index)}}>{answer}{matches.includes(index)&&<Check aria-hidden="true"/>}</button>)}</div><span className="story-match-folio">11</span></section>
}

export function StoryPuzzleRight({ text, selected, matches, message, onMatch, onPassport, onMap, onMemory }) {
 const completed = matches.every(value=>value!==null)
 const drop = (event,index) => {event.preventDefault();const value=event.dataTransfer.getData('text/plain');if(/^[0-5]$/.test(value))onMatch(index,Number(value))}
 return <section className="story-match-page story-match-right"><Decorations/><div className={`story-match-medal grid place-items-center ${completed?'is-earned':''}`} aria-label={completed?text.storyPuzzle.earned:text.storyPuzzle.badgeWaiting}><div className="story-match-medal-inner grid place-items-center">{completed?<><Star fill="#f6cb73"/><span>{text.storyPuzzle.earned}</span></>:<><LockKeyhole/><span>{matches.filter(value=>value!==null).length} / 3</span></>}</div>{Array.from({length:6},(_,index)=><Star key={index} className={`story-match-medal-star medal-star-${index}`} fill={index%2?'#f6cf94':'#afc6cb'} aria-hidden="true"/>)}</div><div className="story-match-board"><span className="story-match-tape"/><span className="story-match-tape tape-right"/><h2>{text.storyPuzzle.board}</h2><div className="story-match-slots grid grid-cols-3 gap-2">{pieces.map((piece,index)=><button ref={flipSafeRef} key={index} type="button" className={`story-match-slot ${matches[index]!==null?'is-matched':''}`} onClick={()=>onMatch(index,selected)} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,index)} aria-label={`${text.storyPuzzle.questions[index]}: ${matches[index]!==null?text.storyPuzzle.answers[matches[index]]:text.storyPuzzle.empty}`}><img src={imageUrl(piece)} alt=""/><span>{matches[index]!==null?text.storyPuzzle.answers[matches[index]]:text.storyPuzzle.questions[index]}</span>{matches[index]!==null&&<Check aria-hidden="true"/>}</button>)}</div><p className="story-match-message text-center" role="status">{message?text.storyPuzzle[message]:completed?text.storyPuzzle.complete:text.storyPuzzle.hint}</p></div><button type="button" ref={flipSafeRef} className="story-match-passport" onClick={onPassport}><strong>{text.storyPuzzle.passport}</strong><img src={imageUrl(rocket)} alt=""/></button><button type="button" ref={flipSafeRef} className="story-match-snapshot snapshot-one" onClick={onMap} aria-label={text.chapters[2]}><img src={imageUrl(planet)} alt=""/></button><button type="button" ref={flipSafeRef} className="story-match-snapshot snapshot-two" onClick={onMemory} aria-label={text.chapters[5]}><img src={imageUrl(rover)} alt=""/></button><img className="story-match-pip" src={imageUrl(pip)} alt={text.storyPuzzle.pipAlt}/><span className="story-match-folio">12</span></section>
}
