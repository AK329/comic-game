import { lazy, Suspense, useEffect, useState } from "react"
import { Move, RotateCcw, Plus, Minus } from "lucide-react"
import { flipSafeRef } from "./MissionNode.jsx"
import { preloadPlanetModel } from "./planetAssets.js"
import "./moon-missions.css"

const MoonSurface = lazy(() => import("./MoonSurface.jsx"))

const copy = {
  en: {
    eyebrow: "THE MOON",
    hint: "Drag to rotate · Scroll or pinch to zoom",
    loading: "Preparing your Moon…",
    reset: "Return to the near side",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    choose: "Find a mission",
    unavailable: "The 3D Moon could not load. You can still choose a mission.",
    retry: "Try 3D again",
    canvas:
      "Interactive Moon model. Drag to rotate and explore mission landing sites.",
  },
  bn: {
    eyebrow: "চাঁদ",
    hint: "টেনে ঘোরাও · স্ক্রল বা দুই আঙুলে ছোট-বড় করো",
    loading: "তোমার চাঁদ তৈরি হচ্ছে…",
    reset: "চাঁদের সামনের দিকে ফিরে যাও",
    zoomIn: "বড় করো",
    zoomOut: "ছোট করো",
    choose: "অভিযান খুঁজে নাও",
    unavailable: "থ্রিডি চাঁদ লোড হয়নি। নিচ থেকে অভিযান বেছে নিতে পারো।",
    retry: "আবার চেষ্টা করো",
    canvas: "চাঁদের থ্রিডি মডেল। টেনে ঘুরিয়ে অভিযানের স্থানগুলো দেখো।",
  },
}

const marsCopy = {
  en: {
    eyebrow: "MARS",
    loading: "Preparing your Mars…",
    reset: "Return to the starting view",
    unavailable: "The 3D Mars could not load. You can still choose a mission.",
    canvas:
      "Interactive Mars model. Drag to rotate and explore mission landing sites.",
  },
  bn: {
    eyebrow: "মঙ্গল",
    loading: "তোমার মঙ্গল তৈরি হচ্ছে…",
    reset: "শুরুর দৃশ্যে ফিরে যাও",
    unavailable: "থ্রিডি মঙ্গল লোড হয়নি। নিচ থেকে অভিযান বেছে নিতে পারো।",
    canvas: "মঙ্গলের থ্রিডি মডেল। টেনে ঘুরিয়ে অভিযানের স্থানগুলো দেখো।",
  },
}

export default function MoonMissionMap({
  world = "moon",
  active,
  nodes,
  language,
  text,
  onSelect,
}) {
  const [visited, setVisited] = useState(active)
  const [command, setCommand] = useState({ type: "reset", serial: 0 })
  const [selected, setSelected] = useState("")
  const locale = copy[language] ? language : "en"
  const words = {
    ...copy[locale],
    ...(world === "mars" ? marsCopy[locale] : {}),
  }
  useEffect(() => {
    if (!active) return
    preloadPlanetModel(world)
  }, [active, world])
  useEffect(() => {
    if (active) setVisited(true)
  }, [active])
  function send(type, id) {
    setCommand((previous) => ({ type, id, serial: previous.serial + 1 }))
  }
  function choose(node, event) {
    setSelected(node.id)
    onSelect(node, event)
  }
  return (
    <section className="moon-mission-page map-page" aria-label={words.eyebrow}>
      <header className="moon-mission-heading">
        <span>{words.eyebrow}</span>
        <h2>{text[world].title}</h2>
      </header>
      <div className="moon-mission-view" ref={flipSafeRef}>
        {visited && (
          <Suspense
            fallback={
              <div className="moon-model-status" role="status">
                {words.loading}
              </div>
            }
          >
            <MoonSurface
              world={world}
              active={active}
              nodes={nodes}
              selected={selected}
              copy={words}
              command={command}
              onSelect={choose}
            />
          </Suspense>
        )}
        <div className="moon-model-tools" ref={flipSafeRef}>
          <button
            type="button"
            onClick={() => send("reset")}
            title={words.reset}
            aria-label={words.reset}
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => send("in")}
            title={words.zoomIn}
            aria-label={words.zoomIn}
          >
            <Plus size={17} />
          </button>
          <button
            type="button"
            onClick={() => send("out")}
            title={words.zoomOut}
            aria-label={words.zoomOut}
          >
            <Minus size={17} />
          </button>
        </div>
      </div>
      <footer className="moon-mission-footer" ref={flipSafeRef}>
        <p>
          <Move size={13} />
          {words.hint}
        </p>
        <label className="moon-mission-picker">
          <span>{words.choose}</span>
          <select
            value={selected}
            aria-label={words.choose}
            onChange={(event) => {
              const node = nodes.find(
                (candidate) => candidate.id === event.target.value,
              )
              if (!node) return
              setSelected(node.id)
              send("focus", node.id)
            }}
          >
            <option value="">{words.choose}</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name} · {node.year}
              </option>
            ))}
          </select>
        </label>
      </footer>
    </section>
  )
}
