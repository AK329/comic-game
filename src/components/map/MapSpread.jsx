import { useCallback, useEffect, useState } from "react"
import mapNodes from "../../data/mapNodes.json"
import MissionPopup from "./MissionPopup.jsx"
import MoonMissionMap from "./MoonMissionMap.jsx"
import "./map.css"

export default function MapSpread({
  world,
  active,
  text,
  progress,
  onPlay,
  language,
}) {
  const [popup, setPopup] = useState(null)
  const data = mapNodes[world]
  const resolveNode = (node) =>
    node.missionId === "rover" && progress.passport
      ? { ...node, state: "completed" }
      : node
  const nodes = data.nodes.map(resolveNode)
  const dismiss = useCallback(() => setPopup(null), [])

  useEffect(() => {
    if (!active) {
      setPopup(null)
    }
  }, [active])

  function onTap(node) {
    setPopup(node)
  }

  return (
    <>
      <MoonMissionMap
        world={world}
        active={active}
        nodes={nodes}
        language={language}
        text={text}
        onSelect={onTap}
      />
      {popup && (
        <MissionPopup
          node={popup}
          text={text}
          language={language}
          onClose={dismiss}
          onPlay={onPlay}
        />
      )}
    </>
  )
}
