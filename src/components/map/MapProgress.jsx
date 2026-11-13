export default function MapProgress({ count, text }) {
 return <div className="map-progress"><span>{text.signals}: <strong>{count} / 10</strong></span><div role="progressbar" aria-label={text.signals} aria-valuemin={0} aria-valuemax={10} aria-valuenow={count}>{Array.from({length:10},(_,index)=><span key={index} className={index<count?'found':''} aria-hidden="true">★</span>)}</div></div>
}
