import { useState } from "react"
import { ArrowLeft, Play, Sun, Waves, Hand, X } from "lucide-react"
import { flipSafeRef, stopFlip } from "../map/MissionNode.jsx"
import landscape from "../../assets/opportunity/landscape.webp"
import rover from "../../assets/opportunity/rover.webp"
import paper from "../../assets/opportunity/paper.webp"
import "../cover/cover.css"
import "./opportunity.css"

const url = (image) => (typeof image === "string" ? image : image.src)
const opportunityVideo = "/opportunity-rover.mp4"
const solLinks = [
  {
    href: "https://www.giss.nasa.gov/tools/mars24/help/notes.html",
    label: "Mars24 notes",
  },
  {
    href: "https://science.nasa.gov/mars/facts/",
    label: "NASA Mars facts",
  },
]
const marsReferences = [
  {
    href: "https://astrobiology.nasa.gov/news/evidence-for-ancient-water-on-mars/",
    label: "Evidence for ancient water on Mars",
  },
  {
    href: "https://www.jpl.nasa.gov/news/nasa-orbiter-reveals-details-of-a-wetter-mars/",
    label: "JPL: Details of a wetter Mars",
  },
  {
    href: "https://www.jpl.nasa.gov/news/nasa-confirms-evidence-that-liquid-water-flows-on-todays-mars/",
    label: "JPL: Liquid water on Mars",
  },
  {
    href: "https://www.nasa.gov/solar-system/planets/mars/nasa-discovery-reveals-complex-water-systems-on-early-mars/",
    label: "NASA: Water systems on early Mars",
  },
  {
    href: "https://www.nasa.gov/missions/mars-science-laboratory/nasas-curiosity-searches-for-new-clues-about-mars-ancient-water/",
    label: "NASA: Curiosity searches for water clues",
  },
]
export const opportunityCopy = {
  en: {
    title: "Opportunity’s story",
    heading: "I WAS BUILT TO\nSURVIVE 90 SOLS.",
    journey: "BUT MY JOURNEY LASTED\nALMOST 15 YEARS.",
    meet: "Meet me",
    sol: "Tap to explore\nwhat a ‘sol’ means",
    definition:
      "A sol is one day on Mars. It lasts 24 hours, 39 minutes, and 35.244 seconds—nearly 40 minutes longer than an Earth day! My first plan was to explore for just 90 Martian days.",
    learnMore: ["Learn about Mars24", "Explore NASA Mars facts"],
    intro:
      "Hello, I’m Opportunity! I landed on Mars in 2004. Powered by sunlight, I explored rocks and craters for almost 15 years. The rocks helped me discover signs that water once flowed here.",
    question:
      "Was Mars always dry and cold?\nOr did water once flow here?\nMy job was to search the rocks for clues.",
    think: "What do you think?",
    dry: "Dry\nforever?",
    water: "Once had\nwater?",
    gentle:
      "Mars looks dry today. Let’s look a little closer: its rocks hold clues to a wetter past. Try the other idea!",
    wrongTitle: "Not quite!",
    correct:
      "Yes! I found minerals and rock layers that formed with water. Long ago, parts of Mars were wet.",
    correctTitle: "Correct!",
    answerClose: "Close answer",
    referencesTitle: "Explore the evidence",
    sourcesHeading: "NASA Sources",
    sourceClose: "Close sources",
    references: [
      "Evidence for ancient water on Mars",
      "JPL: Details of a wetter Mars",
      "JPL: Liquid water on Mars",
      "NASA: Water systems on early Mars",
      "NASA: Curiosity searches for water clues",
    ],
    back: "Back to Mars",
    close: "Close note",
  },
  bn: {
    title: "অপরচুনিটির গল্প",
    heading: "আমাকে তৈরি করা হয়েছিল\n৯০ সল টিকে থাকার জন্য।",
    journey: "কিন্তু আমার অভিযান চলেছিল\nপ্রায় ১৫ বছর।",
    meet: "আমার সঙ্গে পরিচিত হও",
    sol: "‘সল’ মানে কী,\nজানতে ট্যাপ করো",
    definition:
      "মঙ্গলের এক দিনকে বলে সল: প্রায় ২৪ ঘণ্টা ৩৯ মিনিট। শুরুতে আমার অভিযানের পরিকল্পনা ছিল মাত্র ৯০ মঙ্গল-দিনের!",
    learnMore: ["মঙ্গল ২৪ সম্পর্কে জানুন", "নাসার মঙ্গল তথ্য দেখুন"],
    intro:
      "হ্যালো, আমি অপরচুনিটি! ২০০৪ সালে মঙ্গলে নেমেছিলাম। সূর্যের আলোয় শক্তি পেয়ে প্রায় ১৫ বছর পাথর আর গর্ত ঘুরে দেখেছি। পাথর থেকে জেনেছি, এখানে একসময় জল ছিল।",
    question:
      "মঙ্গল কি সবসময় শুষ্ক আর ঠান্ডা ছিল?\nনাকি এখানে একসময় জল বইত?\nপাথরের মধ্যে তারই সূত্র খুঁজতাম আমি।",
    think: "তোমার কী মনে হয়?",
    dry: "সবসময়\nশুষ্ক?",
    water: "একসময়\nজল ছিল?",
    gentle:
      "আজ মঙ্গলকে শুষ্ক দেখায়। কিন্তু পাথরে লুকিয়ে আছে তার ভেজা অতীতের সূত্র। অন্য ধারণাটি ভেবে দেখো!",
    wrongTitle: "এটি ঠিক নয়!",
    correct:
      "ঠিক তাই! জল দিয়ে তৈরি খনিজ আর পাথরের স্তর খুঁজে পেয়েছিলাম। অনেক আগে মঙ্গলের কিছু অংশে জল ছিল।",
    correctTitle: "সঠিক উত্তর!",
    answerClose: "উত্তর বন্ধ করো",
    referencesTitle: "প্রমাণগুলো আরও দেখো",
    sourcesHeading: "নাসার সূত্র",
    sourceClose: "সূত্র বন্ধ করো",
    references: [
      "মঙ্গলে প্রাচীন জলের প্রমাণ",
      "জেপিএল: আরও ভেজা মঙ্গলের তথ্য",
      "জেপিএল: মঙ্গলে তরল জলের প্রমাণ",
      "নাসা: প্রাচীন মঙ্গলের জলব্যবস্থা",
      "নাসা: জল সম্পর্কে কিউরিওসিটির অনুসন্ধান",
    ],
    back: "মঙ্গলে ফিরে যাও",
    close: "নোট বন্ধ করো",
  },
}

export default function OpportunityPage({ side, language, onBack }) {
  const copy = opportunityCopy[language] || opportunityCopy.en
  const [note, setNote] = useState(null)
  const [choice, setChoice] = useState(null)
  const [showSources, setShowSources] = useState(false)
  return (
    <section
      className={`opportunity-page opportunity-${side}`}
      style={{ "--opportunity-paper": `url("${url(paper)}")` }}
    >
      {side === "left" ? (
        <>
          <h2 className="opportunity-heading">{copy.heading}</h2>
          <img
            className="opportunity-landscape"
            src={url(landscape)}
            alt={
              language === "bn"
                ? "মঙ্গলের বিস্তীর্ণ পাথুরে প্রান্তরে ছোট্ট অপরচুনিটি রোভার"
                : "Tiny Opportunity rover in a vast watercolor Martian landscape"
            }
            draggable={false}
          />
          <p className="opportunity-journey">{copy.journey}</p>
          <div className="opportunity-notes" ref={flipSafeRef}>
            <button
              className="opportunity-meet"
              onClick={() => setNote("intro")}
              aria-expanded={note === "intro"}
            >
              <span className="opportunity-thumbnail">
                <img src={url(rover)} alt="" />
                <Play fill="currentColor" size={22} />
              </span>
              <span>{copy.meet}</span>
            </button>
            <button
              className="opportunity-sol"
              onClick={() => setNote("definition")}
              aria-expanded={note === "definition"}
            >
              {copy.sol}
              <Hand size={21} />
            </button>
          </div>
          {note && (
            <aside
              className="opportunity-note"
              ref={flipSafeRef}
              role="region"
              aria-label={note === "intro" ? copy.meet : copy.sol}
            >
              <button onClick={() => setNote(null)} aria-label={copy.close}>
                <X size={19} />
              </button>
              {note === "intro" ? (
                <video
                  className="opportunity-video"
                  src={opportunityVideo}
                  title={copy.meet}
                  controls
                  preload="auto"
                  playsInline
                  onLoadedMetadata={(event) => {
                    event.currentTarget.muted = false
                    event.currentTarget.volume = 1
                  }}
                  onPointerDown={stopFlip}
                  onMouseDown={stopFlip}
                  onTouchStart={stopFlip}
                  onClick={stopFlip}
                />
              ) : (
                <>
                  <p>{copy[note]}</p>
                  <div className="opportunity-note-links">
                    {solLinks.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {copy.learnMore[index]}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </aside>
          )}
        </>
      ) : (
        <>
          <button
            className="opportunity-source-button"
            ref={flipSafeRef}
            onClick={() => setShowSources((visible) => !visible)}
            aria-expanded={showSources}
          >
            {copy.sourcesHeading}
          </button>
          {showSources && (
            <aside
              className="opportunity-source-panel"
              ref={flipSafeRef}
              role="dialog"
              aria-label={copy.sourcesHeading}
            >
              <button
                className="opportunity-source-close"
                onClick={() => setShowSources(false)}
                aria-label={copy.sourceClose}
              >
                <X size={16} />
              </button>
              <div className="opportunity-source-links">
                {marsReferences.map((reference, index) => (
                  <a
                    key={reference.href}
                    href={reference.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.references[index]}
                  </a>
                ))}
              </div>
            </aside>
          )}
          <h2 className="opportunity-question">{copy.question}</h2>
          <img
            className="opportunity-rover"
            src={url(rover)}
            alt={
              language === "bn"
                ? "পাথরের মধ্যে জল থাকার সূত্র খুঁজছে অপরচুনিটি"
                : "Opportunity searching Martian rocks for clues of ancient water"
            }
            draggable={false}
          />
          <div className="opportunity-quiz" ref={flipSafeRef}>
            <h3>{copy.think}</h3>
            {choice && (
              <div
                className={`opportunity-answer-popup ${
                  choice === "water" ? "is-correct" : "is-wrong"
                }`}
                role="status"
                aria-live="polite"
              >
                <button
                  className="opportunity-answer-close"
                  ref={flipSafeRef}
                  onClick={() => setChoice(null)}
                  aria-label={copy.answerClose}
                >
                  <X size={15} />
                </button>
                <h4>
                  {copy[choice === "water" ? "correctTitle" : "wrongTitle"]}
                </h4>
                <p>{copy[choice === "water" ? "correct" : "gentle"]}</p>
              </div>
            )}
            <div className="opportunity-choices">
              <button
                className={`opportunity-dry ${
                  choice === "dry" ? "is-chosen is-wrong" : ""
                }`}
                aria-pressed={choice === "dry"}
                onClick={() => setChoice("dry")}
              >
                <span>{copy.dry}</span>
                <Sun size={29} />
              </button>
              <button
                className={`opportunity-water ${
                  choice === "water" ? "is-chosen is-correct" : ""
                }`}
                aria-pressed={choice === "water"}
                onClick={() => setChoice("water")}
              >
                <span>{copy.water}</span>
                <Waves size={29} />
              </button>
            </div>
            <button className="opportunity-back" onClick={onBack}>
              <ArrowLeft size={15} />
              {copy.back}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
