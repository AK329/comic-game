import { RotateCcw, Weight, Check, Star } from 'lucide-react'
import { flipSafeRef } from '../map/MissionNode.jsx'
import rocks from '../../assets/cargo/rocks.webp'
import film from '../../assets/cargo/film.webp'
import flag from '../../assets/cargo/flag.webp'
import hammer from '../../assets/cargo/hammer.webp'
import backpack from '../../assets/cargo/backpack.webp'
import rover from '../../assets/cargo/rover.webp'
import capsule from '../../assets/cargo/capsule.webp'
import surface from '../../assets/cargo/surface.webp'
import pip from '../../assets/cargo/pip.webp'
import rocket from '../../assets/mission/rocket.webp'
import planet from '../../assets/mission/planet.webp'
import './cargo.css'

const imageUrl = image => typeof image === 'string' ? image : image.src
const pictures = [rocks, film, flag, hammer, backpack, rover]
export const cargoWeights = [8, 2, 1, 3, 2, 210]
function Decorations() {
 return <div aria-hidden="true" className="cargo-lab-decor pointer-events-none absolute inset-0"><img className="cargo-lab-rocket" src={imageUrl(rocket)} alt=""/><img className="cargo-lab-planet" src={imageUrl(planet)} alt=""/><svg viewBox="0 0 480 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="none"><path d="M35 120 C12 166 72 185 45 204 S30 192 43 232 M40 353 C9 385 71 403 41 426 S25 412 31 452 Q34 490 65 492 M421 309 C458 368 403 388 415 352 S464 359 408 408" fill="none" stroke="#343a4c" strokeWidth="1.8" strokeDasharray="6 8" strokeLinecap="round"/></svg><Star className="cargo-lab-star" fill="#b6cfbe"/><Star className="cargo-lab-star cargo-lab-star-second" fill="#f1c787"/></div>
}
export function CargoLeft({ text, selected, setSelected, positions, reset }) {
 return <section className="cargo-lab-page cargo-lab-left"><Decorations/><h2 className="cargo-lab-heading text-center">{text.cargoLab.title}</h2><p className="cargo-lab-instruction text-center">{text.cargoLab.instruction}</p><div className="cargo-lab-grid grid grid-cols-3 grid-rows-2 gap-3">{pictures.map((picture,index)=><button type="button" ref={flipSafeRef} key={index} draggable aria-pressed={selected===index} className={`cargo-lab-card flex flex-col ${selected===index?'is-selected':''}`} onClick={()=>setSelected(index)} onDragStart={event=>{event.dataTransfer.setData('text/plain',String(index));setSelected(index)}}><img src={imageUrl(picture)} alt=""/><strong>{text.cargoLab.items[index]}</strong><span className="cargo-lab-item-weight flex items-center justify-center gap-1"><Weight aria-hidden="true"/>{cargoWeights[index]} {text.kg}{positions[index]&&<Check aria-label={text[positions[index]==='earth'?'return':'leave']}/>}</span></button>)}</div><button ref={flipSafeRef} type="button" className="cargo-lab-reset flex items-center gap-1" onClick={reset}><RotateCcw size={13}/>{text.cargoLab.reset}</button><span className="cargo-lab-folio">09</span></section>
}
export function CargoRight({ text, positions, selected, setSelected, move }) {
 const weight = cargoWeights.reduce((total,value,index)=>total+(positions[index]==='earth'?value:0),0)
 const allPacked = Object.keys(positions).length === 6
 const drop = (event, target) => {event.preventDefault();const value=event.dataTransfer.getData('text/plain');if(/^[0-5]$/.test(value))move(Number(value),target)}
 const tags = target => <div className="cargo-lab-tags flex flex-wrap justify-center gap-1">{cargoWeights.map((_,index)=>positions[index]===target&&<button key={index} ref={flipSafeRef} type="button" onClick={()=>setSelected(index)} aria-pressed={selected===index} className={selected===index?'is-selected':''}>{text.cargoLab.items[index]}</button>)}</div>
 return <section className="cargo-lab-page cargo-lab-right"><Decorations/><h2 className="cargo-lab-heading text-center">{text.cargoLab.destination}</h2><div ref={flipSafeRef} className={`cargo-lab-return ${selected!==null?'is-ready':''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,'earth')}><button type="button" className="cargo-lab-destination flex w-full flex-col items-center" onClick={()=>move(selected,'earth')}><strong>{text.return}</strong><img src={imageUrl(capsule)} alt=""/><span>{weight} / 12 {text.kg}</span><progress max="12" value={Math.min(weight,12)} aria-label={text.capacity} className={weight>12?'is-heavy':''}/></button>{tags('earth')}</div><h3 className="cargo-lab-moon-title text-center">{text.leave}</h3><div ref={flipSafeRef} className={`cargo-lab-moon ${selected!==null?'is-ready':''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,'moon')}><button type="button" className="cargo-lab-destination w-full" onClick={()=>move(selected,'moon')} aria-label={text.leave}><img src={imageUrl(surface)} alt=""/></button>{tags('moon')}</div><div className="cargo-lab-bubble flex items-center justify-center text-center"><p role="status">{weight>12?text.cargoLab.heavy:allPacked?text.cargoLab.packed:text.cargoLab.hint}</p></div><img className="cargo-lab-pip" src={imageUrl(pip)} alt={text.cargoLab.pipAlt}/><span className="cargo-lab-folio">10</span></section>
}
