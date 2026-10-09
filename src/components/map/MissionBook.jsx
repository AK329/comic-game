'use client'
import { useEffect, useRef } from 'react'
import BookApp from '../../BookApp.jsx'

export default function MissionBook() {
 const root = useRef(null)
 useEffect(() => {
  let timer
  const observer = new MutationObserver(() => {
   if (root.current?.querySelector('.stf__parent')) {
    observer.disconnect()
    timer = setTimeout(() => root.current?.querySelector('.chapter-tabs button[data-chapter="3"]')?.click(), 100)
   }
  })
  observer.observe(root.current, { childList: true, subtree: true })
  return () => { observer.disconnect(); clearTimeout(timer) }
 }, [])
 return <div ref={root}><BookApp /></div>
}
