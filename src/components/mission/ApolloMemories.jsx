import { Star } from "lucide-react"
import rocket from "../../assets/mission/rocket.webp"
import planet from "../../assets/mission/planet.webp"
import moon from "../../assets/cover/blue-planet.webp"
import memoryOne from "../../assets/apollo/rover-memory-1.webp"
import memoryTwo from "../../assets/apollo/rover-memory-2.webp"
import memoryThree from "../../assets/apollo/rover-memory-3.webp"
import memoryFour from "../../assets/apollo/rover-memory-4.webp"
import { stopFlip } from "../map/MissionNode.jsx"
import "./apollo-memories.css"

export const apolloMemoriesCopy = {
  en: {
    title: "Memories of Apollo Lunar Rover",
    note: "A little journey. A story that stays.",
    captions: [
      "Ready to explore",
      "A ride on the Moon",
      "Our trusty lunar rover",
      "Memories left behind",
    ],
    descriptions: [
      "An astronaut beside a lunar rover and landing module.",
      "An astronaut seated in a lunar rover.",
      "A lunar rover on the rocky Moon surface.",
      "An astronaut walking beside a rover and lunar module.",
    ],
    dataNote:
      "PDS lunar archives include Apollo and Lunar Reconnaissance Orbiter mission data—the same lunar story family behind this rover memory.",
  },
  bn: {
    title: "অ্যাপোলো লুনার রোভারের স্মৃতি",
    note: "ছোট্ট এক অভিযান। রয়ে যাওয়া এক গল্প।",
    captions: [
      "অভিযানের প্রস্তুতি",
      "চাঁদের বুকে গাড়িভ্রমণ",
      "আমাদের চাঁদের রোভার",
      "রেখে আসা স্মৃতি",
    ],
    descriptions: [
      "চাঁদের রোভার ও অবতরণযানের পাশে একজন নভোচারী।",
      "চাঁদের রোভারে বসে আছেন একজন নভোচারী।",
      "চাঁদের পাথুরে মাটিতে একটি রোভার।",
      "রোভার ও অবতরণযানের পাশে হাঁটছেন একজন নভোচারী।",
    ],
    dataNote:
      "পিডিএস-এর চাঁদের আর্কাইভে অ্যাপোলো ও লুনার রিকনেসান্স অরবিটার মিশনের তথ্য আছে—এই রোভার-স্মৃতিরই বৈজ্ঞানিক প্রেক্ষাপট।",
  },
}
const imageUrl = (image) => (typeof image === "string" ? image : image.src)
const photos = [memoryOne, memoryTwo, memoryThree, memoryFour]
const moonDatasetUrl =
  "https://pds-geosciences.wustl.edu/dataserv/moon.html?utm_source=chatgpt.com"

export default function ApolloMemories({ language }) {
  const copy = apolloMemoriesCopy[language]
  return (
    <section
      className="apollo-memories"
      aria-labelledby="apollo-memories-title"
    >
      <div className="apollo-memory-decor" aria-hidden="true">
        <svg
          className="apollo-memory-trails"
          viewBox="0 0 480 600"
          preserveAspectRatio="none"
        >
          <path d="M38 140 C10 220 90 240 43 297 S22 390 76 420 M316 104 C238 82 309 237 399 208 S463 302 413 345 M94 510 C139 557 214 521 223 478 S334 444 370 513" />
          <path d="M52 322 C110 367 200 288 243 339 S376 392 431 452 M195 120 C256 176 276 123 317 150" />
        </svg>
        <img className="apollo-memory-rocket" src={imageUrl(rocket)} alt="" />
        <img className="apollo-memory-planet" src={imageUrl(planet)} alt="" />
        <img className="apollo-memory-moon" src={imageUrl(moon)} alt="" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`apollo-memory-star apollo-memory-star-${index}`}
          />
        ))}
      </div>
      <h2 id="apollo-memories-title" className="apollo-memory-heading">
        {copy.title}
      </h2>
      <div className="apollo-memory-divider" aria-hidden="true">
        <span />
        <Star />
        <span />
      </div>
      <div className="apollo-memory-gallery">
        {photos.map((photo, index) => (
          <figure
            key={index}
            className={`apollo-memory-photo apollo-memory-photo-${index}`}
          >
            <span className="apollo-memory-tape" aria-hidden="true" />
            <img
              src={imageUrl(photo)}
              alt={copy.descriptions[index]}
              draggable={false}
            />
            <figcaption>{copy.captions[index]}</figcaption>
          </figure>
        ))}
      </div>
      <p className="apollo-memory-data">{copy.dataNote}</p>
      <p className="apollo-memory-note">{copy.note}</p>
      <a
        className="apollo-memory-source"
        href={moonDatasetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={stopFlip}
        onMouseDown={stopFlip}
        onTouchStart={stopFlip}
        onClick={stopFlip}
      >
        {language === "bn" ? "চাঁদের ডেটাসেট দেখুন" : "View Moon dataset"}
      </a>
      <span className="apollo-memory-folio">
        {language === "bn" ? "০৩" : "03"}
      </span>
    </section>
  )
}
