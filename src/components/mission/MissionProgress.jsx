import { useEffect, useState } from "react"
import { Flag, Rocket } from "lucide-react"
import "./mission-progress.css"

const missionSpreads = {
  apollo: [4, 6, 7, 5],
  opportunity: [8, 10, 11, 12, 13, 14, 15],
}

export default function MissionProgress({ spread, language }) {
  const mission = Object.keys(missionSpreads).find((key) =>
    missionSpreads[key].includes(spread),
  )
  const step = mission ? missionSpreads[mission].indexOf(spread) + 1 : 0
  const [furthest, setFurthest] = useState({ apollo: 0, opportunity: 0 })
  useEffect(() => {
    if (!mission) return
    setFurthest((previous) =>
      previous[mission] >= step ? previous : { ...previous, [mission]: step },
    )
  }, [mission, step])
  if (!mission) return null

  const bn = language === "bn"
  const total = missionSpreads[mission].length
  const reached = Math.max(furthest[mission], step)
  const percent = Math.round((reached / total) * 100)
  const title =
    mission === "apollo"
      ? bn
        ? "অ্যাপোলো লুনার রোভার"
        : "Apollo LRV"
      : bn
        ? "অপরচুনিটি"
        : "Opportunity"
  const format = (number) =>
    new Intl.NumberFormat(bn ? "bn" : "en").format(number)
  const Icon = mission === "apollo" ? Flag : Rocket

  return (
    <section
      className={`mission-progress mission-progress-${mission}`}
      aria-label={`${title} ${bn ? "অগ্রগতি" : "progress"}`}
      data-mission={mission}
    >
      <div className="mission-progress-name">
        <Icon size={15} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <progress
        value={reached}
        max={total}
        aria-label={`${title} ${bn ? "অগ্রগতি" : "progress"}`}
        aria-valuetext={
          bn
            ? `${format(total)}টি স্প্রেডের মধ্যে ${format(reached)}টিতে পৌঁছেছ`
            : `${reached} of ${total} spreads reached`
        }
      />
      <span className="mission-progress-count">
        {format(reached)} / {format(total)}{" "}
        <span>{bn ? "স্প্রেড" : "spreads"}</span>
      </span>
      <strong className="mission-progress-percent">{format(percent)}%</strong>
    </section>
  )
}
