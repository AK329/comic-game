import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { flipSafeRef } from "../map/MissionNode.jsx"
import oneLeft from "../../assets/opportunity/document/1-left.webp"
import oneRight from "../../assets/opportunity/document/1-right.webp"
import twoLeft from "../../assets/opportunity/document/2-left.webp"
import twoRight from "../../assets/opportunity/document/2-right.webp"
import threeLeft from "../../assets/opportunity/document/3-left.webp"
import threeRight from "../../assets/opportunity/document/3-right.webp"
import fourLeft from "../../assets/opportunity/document/4-left.webp"
import fourRight from "../../assets/opportunity/document/4-right.webp"
import fiveLeft from "../../assets/opportunity/document/5-left.webp"
import fiveRight from "../../assets/opportunity/document/5-right.webp"
import sixLeft from "../../assets/opportunity/document/6-left.webp"
import sixRight from "../../assets/opportunity/document/6-right.webp"
import "./opportunity-document.css"

const artwork = [
  [oneLeft, oneRight],
  [twoLeft, twoRight],
  [threeLeft, threeRight],
  [fourLeft, fourRight],
  [fiveLeft, fiveRight],
  [sixLeft, sixRight],
]
const warmedArtwork = new Set()

export function preloadOpportunitySpread(index) {
  if (!artwork[index]) return
  const warm = () => {
    for (const image of artwork[index]) {
      const src = typeof image === "string" ? image : image.src
      if (warmedArtwork.has(src)) continue
      warmedArtwork.add(src)
      const preview = new Image()
      preview.decoding = "async"
      preview.src = src
      if (preview.decode)
        preview.decode().catch(() => warmedArtwork.delete(src))
    }
  }
  if (window.requestIdleCallback) {
    const task = window.requestIdleCallback(warm, { timeout: 1200 })
    return () => window.cancelIdleCallback(task)
  }
  const task = window.setTimeout(warm, 250)
  return () => window.clearTimeout(task)
}
export const opportunityDocumentTitles = {
  en: [
    "Opportunity: built to explore",
    "Opportunity: launch and arrival",
    "Opportunity: clues in the rocks",
    "Opportunity: tools and sunlight",
    "Opportunity: a remarkable route",
    "Opportunity: discoveries live on",
  ],
  bn: [
    "অপরচুনিটি: অভিযানের প্রস্তুতি",
    "অপরচুনিটি: উৎক্ষেপণ ও আগমন",
    "অপরচুনিটি: পাথরের সূত্র",
    "অপরচুনিটি: যন্ত্র ও সূর্যালোক",
    "অপরচুনিটি: অসাধারণ পথ",
    "অপরচুনিটি: রয়ে যাওয়া আবিষ্কার",
  ],
}
const descriptions = [
  [
    "Scientists found an interesting clue at Meridiani Planum: hematite. An orbiter scans the Martian surface.",
    "Every part of me had a job. Cameras capture images; solar panels collect sunlight for power; antennas communicate with Earth; the robotic arm examines rocks; wheels move across Mars.",
  ],
  [
    "July 7, 2003. My journey to Mars began. Opportunity launches on a Delta II rocket.",
    "Mars was getting closer. Now I had to survive the heat. A heat shield protected the spacecraft from extreme heating. Mars has a very thin atmosphere.",
  ],
  [
    "For the first time, I could see the world I had travelled so far to explore. The view from Opportunity shows a crater, layered rocks, and the rover's solar panels.",
    "The rocks tell a story. Their structures helped scientists understand ancient water-related environments. Small spheres rich in hematite provided evidence of water-related geological processes.",
  ],
  [
    "To understand a rock, I had to examine it closely. The Rock Abrasion Tool exposes the inner surface. The Microscopic Imager takes close-up pictures. APXS studies chemical elements.",
    "Sunlight was my power. Dust could make it harder to keep going. Choose use power or conserve power.",
  ],
  [
    "My team on Earth planned the route. I explored the ground. A glowing route guides the rover around rocks.",
    "One crater led to another. I travelled farther than anyone expected: Eagle, Endurance, Victoria, Endeavour, Perseverance Valley. Total distance: 45.16 km.",
  ],
  [
    "A giant dust storm blocked the sunlight I depended on. Then my signals stopped. Last communication: June 10, 2018. Mission officially ended: February 13, 2019.",
    "My wheels stopped moving, but my discoveries continued travelling. Ninety sols planned became almost fifteen years. About one kilometre planned became 45.16 kilometres travelled. Evidence of ancient water-related environments. My journey ended on Mars, but my story is still travelling across the universe.",
  ],
]
const facts = {
  scan: [
    "Hematite can form in the presence of water. This orbital clue helped scientists choose this region for Opportunity to explore.",
    "হেমাটাইট জল থাকা অবস্থায় তৈরি হতে পারে। এই সূত্র থেকেই মেরিডিয়ানি প্ল্যানামকে অভিযানের জন্য বেছে নেওয়া হয়।",
  ],
  heat: [
    "The heat shield protected Opportunity during its fiery entry. It was released before the rover landed.",
    "মঙ্গলের বায়ুমণ্ডলে প্রবেশের সময় তাপঢাল অপরচুনিটিকে রক্ষা করেছিল। অবতরণের আগে এটি খুলে ফেলা হয়।",
  ],
  crater: [
    "Opportunity landed inside Eagle crater. Exposed rock layers were close enough for its instruments to investigate.",
    "অপরচুনিটি ঈগল গর্তের ভিতরে নেমেছিল। পাশেই ছিল পরীক্ষা করার মতো উন্মুক্ত পাথরের স্তর।",
  ],
  layers: [
    "Layers record changing conditions over time. Some rocks preserved evidence of water in Mars’s past.",
    "পাথরের স্তর অতীতের পরিবর্তনের কথা বলে। কিছু পাথরে মঙ্গলে জল থাকার প্রমাণ ছিল।",
  ],
  spheres: [
    "These tiny hematite-rich spheres were nicknamed ‘blueberries’. Together with other rock evidence, they helped reveal a wetter past.",
    "হেমাটাইট সমৃদ্ধ ছোট গোলকগুলোর ডাকনাম ছিল ‘ব্লুবেরি’। অন্য পাথরের প্রমাণের সঙ্গে এগুলো জল থাকার অতীত জানায়।",
  ],
  abrasion: [
    "The Rock Abrasion Tool ground away a rock’s outer surface so scientists could study the material underneath.",
    "রক অ্যাব্রেশন টুল পাথরের বাইরের অংশ ঘষে সরাত, যাতে ভিতরের অংশ পরীক্ষা করা যায়।",
  ],
  imager: [
    "The Microscopic Imager photographed tiny textures in rocks and soil.",
    "মাইক্রোস্কোপিক ইমেজার পাথর আর মাটির ছোট ছোট গঠনের ছবি তুলত।",
  ],
  apxs: [
    "The Alpha Particle X-ray Spectrometer measured chemical elements in rocks and soil.",
    "আলফা পার্টিকল এক্স-রে স্পেকট্রোমিটার পাথর আর মাটির রাসায়নিক মৌল মাপত।",
  ],
  use: [
    "Using power lets the rover explore and work, but uses stored energy. When sunlight is weak, the team must plan carefully.",
    "শক্তি খরচ করে রোভার চলতে আর পরীক্ষা করতে পারে। সূর্যের আলো কম হলে শক্তি ব্যবহার সাবধানে পরিকল্পনা করতে হয়।",
  ],
  conserve: [
    "Conserving power saves energy by doing less. This helps protect the rover when dust blocks sunlight.",
    "কাজ কমিয়ে শক্তি বাঁচানো যায়। ধুলো সূর্যের আলো আটকে দিলে এভাবে রোভারকে রক্ষা করা যায়।",
  ],
  route: [
    "Engineers on Earth planned safe routes. Opportunity used its cameras to help navigate around rocks and other hazards.",
    "পৃথিবীর প্রকৌশলীরা নিরাপদ পথ বেছে নিতেন। ক্যামেরার সাহায্যে অপরচুনিটি পাথর আর বাধা এড়িয়ে চলত।",
  ],
}
const hotspots = {
  "0-left": [{ key: "scan", x: 30, y: 89, w: 40, h: 9, label: "Scan Mars" }],
  "1-left": [{ key: "launch", x: 38, y: 79, w: 27, h: 12, label: "Launch" }],
  "1-right": [
    {
      key: "heat",
      x: 29,
      y: 25,
      w: 53,
      h: 39,
      label: "Explore the heat shield",
    },
  ],
  "2-left": [
    {
      key: "crater",
      x: 12,
      y: 39,
      w: 82,
      h: 43,
      label: "Explore Eagle crater",
    },
  ],
  "2-right": [
    { key: "layers", x: 23, y: 17, w: 74, h: 25, label: "Explore rock layers" },
    {
      key: "spheres",
      x: 45,
      y: 60,
      w: 52,
      h: 26,
      label: "Examine hematite spheres",
    },
  ],
  "3-left": [
    {
      key: "abrasion",
      x: 38,
      y: 39,
      w: 20,
      h: 12,
      label: "Rock Abrasion Tool",
    },
    { key: "imager", x: 46, y: 48, w: 19, h: 12, label: "Microscopic Imager" },
    { key: "apxs", x: 42, y: 58, w: 20, h: 13, label: "APXS" },
  ],
  "3-right": [
    { key: "use", x: 8, y: 84, w: 37, h: 10, label: "Use power" },
    { key: "conserve", x: 51, y: 84, w: 43, h: 10, label: "Conserve power" },
  ],
  "4-left": [
    {
      key: "route",
      x: 25,
      y: 35,
      w: 65,
      h: 41,
      label: "Explore the safe route",
    },
  ],
}

export default function OpportunityDocumentPage({
  index,
  side,
  language,
  active,
  onPrevious,
  onNext,
}) {
  const [note, setNote] = useState(null)
  const [power, setPower] = useState(null)
  const [scanActive, setScanActive] = useState(false)
  const [animationActive, setAnimationActive] = useState(false)
  const scanTimer = useRef(null)
  const left = side === "left"
  const bn = language === "bn"
  const image = artwork[index][left ? 0 : 1]
  useEffect(() => {
    if (!active) {
      setNote(null)
      setScanActive(false)
      setAnimationActive(false)
      if (scanTimer.current) window.clearTimeout(scanTimer.current)
    }
  }, [active])
  useEffect(
    () => () => {
      if (scanTimer.current) window.clearTimeout(scanTimer.current)
    },
    [],
  )
  useEffect(() => {
    if (active && left) return preloadOpportunitySpread(index + 1)
  }, [active, left, index])
  return (
    <section
      className={`opportunity-document-page document-${index}-${side}${
        scanActive ? " is-scanning" : ""
      }`}
      aria-label={
        (opportunityDocumentTitles[language] || opportunityDocumentTitles.en)[
          index
        ]
      }
    >
      <div className="opportunity-document-canvas">
        <img
          src={typeof image === "string" ? image : image.src}
          alt={descriptions[index][left ? 0 : 1]}
          draggable={false}
          decoding="async"
          loading={active ? "eager" : "lazy"}
        />
        {index === 1 && animationActive && (
          <video
            className="document-animation"
            src={
              left
                ? "/opportunity-launch.mp4"
                : "/opportunity-spread-3-right.mp4"
            }
            autoPlay
            muted
            playsInline
            onEnded={() => setAnimationActive(false)}
            aria-label={descriptions[index][1]}
          />
        )}
        {(left || onNext) && (
          <button
            ref={flipSafeRef}
            className={`document-hit document-arrow document-arrow-${side}`}
            aria-label={
              bn
                ? left
                  ? "আগের পাতা"
                  : "পরের পাতা"
                : left
                  ? "Previous pages"
                  : "Next pages"
            }
            onClick={left ? onPrevious : onNext}
          />
        )}
        {(hotspots[`${index}-${side}`] || []).map((spot) => (
          <button
            key={spot.key}
            ref={flipSafeRef}
            className={`document-hit document-${spot.key}`}
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: `${spot.w}%`,
              height: `${spot.h}%`,
            }}
            aria-label={spot.label}
            onClick={() => {
              if (spot.key === "launch") {
                setAnimationActive(true)
                return
              }
              if (spot.key === "scan") {
                if (scanTimer.current) window.clearTimeout(scanTimer.current)
                setNote(null)
                setScanActive(true)
                scanTimer.current = window.setTimeout(() => {
                  setScanActive(false)
                  setNote("scan")
                }, 1600)
                return
              }
              if (spot.key === "launch" || spot.key === "heat")
                setAnimationActive(true)
              if (spot.key === "use" || spot.key === "conserve")
                setPower(spot.key)
              setNote(spot.key)
            }}
          />
        ))}
        {index === 3 && !left && power && (
          <div
            className={`document-energy ${power}`}
            role="status"
            aria-label={bn ? "শক্তির মাত্রা" : "Energy level"}
          >
            <span />
          </div>
        )}
        {note && (
          <aside ref={flipSafeRef} className="document-fact" role="status">
            <button
              aria-label={bn ? "নোট বন্ধ করো" : "Close note"}
              onClick={() => setNote(null)}
            >
              <X size={18} />
            </button>
            {note === "scan" && (
              <h3>{bn ? "মেরিডিয়ানি প্ল্যানাম" : "Meridiani Planum"}</h3>
            )}
            <p>{facts[note][bn ? 1 : 0]}</p>
          </aside>
        )}
      </div>
    </section>
  )
}
