import { useId } from 'react'
export default function TrailPath({ colors, pathRef }) {
 const id = useId().replace(/:/g, '')
 const trail = 'M88 40 V62 Q88 78 104 78 H296 Q312 78 312 94 V138 Q312 154 296 154 H104 Q88 154 88 170 V214 Q88 230 104 230 H296 Q312 230 312 246 V290 Q312 306 296 306 H104 Q88 306 88 322 V344'
 return <svg className="map-trail" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={id} x2="0" y2="1"><stop stopColor={colors[0]}/><stop offset=".5" stopColor={colors[1]}/><stop offset="1" stopColor={colors[2]}/></linearGradient></defs><path className="map-trail-halo" d={trail} stroke={`url(#${id})`}/><path ref={pathRef} d={trail} stroke={`url(#${id})`}/></svg>
}
