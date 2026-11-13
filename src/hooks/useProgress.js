import { useEffect, useState } from 'react'
export default function useProgress() {
  const [progress, setProgress] = useState({ passport: false, puzzle: false })
  const [ready, setReady] = useState(false)
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('space-logbook-progress')); if (saved) setProgress({ passport: !!saved.passport, puzzle: !!saved.puzzle }) } catch {} setReady(true) }, [])
  useEffect(() => { if (ready) { try { localStorage.setItem('space-logbook-progress', JSON.stringify(progress)) } catch {} } }, [progress, ready])
  return [progress, (key) => setProgress(previous => ({ ...previous, [key]: true }))]
}
