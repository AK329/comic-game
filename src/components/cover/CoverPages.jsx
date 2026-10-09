import { BookOpen, ArrowRight, Rocket, Star, Heart } from 'lucide-react'
import roverAsset from '../../assets/cover/lunar-rover.webp'
import rocketAsset from '../../assets/cover/rocket-sticker.webp'
import purpleAsset from '../../assets/cover/purple-planet.webp'
import greenAsset from '../../assets/cover/green-planet.webp'
import blueAsset from '../../assets/cover/blue-planet.webp'
import './cover.css'

const assetUrl = asset => typeof asset === 'string' ? asset : asset.src
function Decorations({ right = false }) {
 return <div className="opening-decorations" aria-hidden="true"><div className="opening-clouds"/><img className="opening-planet purple" src={assetUrl(purpleAsset)} alt=""/><img className="opening-planet blue" src={assetUrl(blueAsset)} alt=""/><img className="opening-planet green" src={assetUrl(greenAsset)} alt=""/>{Array.from({length:11},(_,index)=><Star key={index} className={`opening-star star-${index}`} fill="currentColor" strokeWidth={1.3}/>)}{Array.from({length:13},(_,index)=><i key={index} className={`opening-dot dot-${index}`}/>)}<svg className="opening-flight" viewBox="0 0 480 600" preserveAspectRatio="none"><path d={right?'M31 193 C-7 245 68 272 20 316 S4 375 41 359 M422 278 C465 287 435 311 438 319 S472 351 439 379':'M74 112 C26 123 23 165 43 166 S22 143 16 174 S33 224 44 234 M392 31 C347 84 465 90 429 125 S447 112 451 148 S470 194 447 213'} fill="none" stroke="#1769a2" strokeWidth="2" strokeDasharray="5 7" strokeLinecap="round"/></svg><Rocket className="opening-outline-rocket" strokeWidth={1.5}/></div>
}
export function CoverLeft({ text, onOpen }) {
 const titleLines = text.title.split('\n')
 return <section className="reference-cover opening-left"><Decorations/><img className="opening-rocket" src={assetUrl(rocketAsset)} alt=""/><h1 className="opening-title"><span>{titleLines[0]}</span><span>{titleLines[1]}</span></h1><div className="opening-eyebrow"><span>⌁</span>{text.cover.eyebrow}<span>⌁</span></div><div className="opening-divider"/><p className="opening-story">{text.subtitle.split('\n')[0]}<br/>{text.cover.subtitleLead}<em>{text.cover.subtitleAccent}</em></p><button className="opening-button" onClick={onOpen} onPointerDown={event=>event.stopPropagation()} onMouseDown={event=>event.stopPropagation()} onTouchStart={event=>event.stopPropagation()}><BookOpen strokeWidth={1.5}/><span>{text.open}</span><ArrowRight strokeWidth={3}/></button><div className="opening-takeoff"><span>{text.cover.ready}</span><Rocket size={40} strokeWidth={1.5}/></div><div className="opening-edition">{text.cover.edition}</div></section>
}
export function CoverRight({ text }) {
 return <section className="reference-cover opening-right"><Decorations right/><div className="opening-polaroid"><div className="opening-tape purple-tape">✦ ✦ ✦</div><div className="opening-tape yellow-tape"/><img className="opening-rover-photo" src={assetUrl(roverAsset)} alt={text.cover.roverAlt}/><div className="opening-photo-label"><span>⌁</span><strong>{text.cover.moon}</strong><span>⌁</span></div><div className="opening-caption">{text.distance}<Heart size={20} fill="currentColor"/></div><div className="opening-tape green-tape"/></div><div className="opening-moon-note">{text.coverNote}<span>⤷</span></div><div className="opening-explorer-badge"><div className="badge-red"/><div className="badge-blue"/><div className="badge-cream"/><Rocket className="badge-rocket" size={26}/><div className="opening-badge-text"><span>{text.cover.space}</span><strong>{text.cover.explorer}</strong><span className="badge-mini-star">★</span><span>{text.cover.badge}</span></div><Star className="badge-spark left" fill="#ffd13c" size={18}/><Star className="badge-spark right" fill="#ffd13c" size={18}/></div><Heart className="opening-heart" fill="#ff729c" size={42}/></section>
}
