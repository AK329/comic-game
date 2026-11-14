"use client"
import {
  createContext,
  useContext,
  useState,
  useRef,
  forwardRef,
  memo,
  useEffect,
} from "react"
import HTMLFlipBook from "./components/StableFlipBook.jsx"
import pageAssets from "./data/pageAssets.js"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Globe2,
  LockKeyhole,
  Check,
  Star,
  Rocket,
  VolumeX,
  ChevronRight,
  Flag,
  Map,
  Backpack,
  Heart,
  Languages,
} from "lucide-react"
import en from "./locales/en.json"
import bn from "./locales/bn.json"
import missions from "./data/missions.json"
import useProgress from "./hooks/useProgress.js"
import Artwork from "./components/Artwork.jsx"
import MapSpread from "./components/map/MapSpread.jsx"
import ApolloMemories, {
  apolloMemoriesCopy,
} from "./components/mission/ApolloMemories.jsx"
import OpportunityPage, {
  opportunityCopy,
} from "./components/mission/OpportunityPages.jsx"
import OpportunityDocumentPage, {
  opportunityDocumentTitles,
  preloadOpportunitySpread,
} from "./components/mission/OpportunityDocumentPage.jsx"
import MissionProgress from "./components/mission/MissionProgress.jsx"
import { PuzzleLeft } from "./components/puzzle/PuzzlePages.jsx"
import { MemoryLeft, MemoryRight } from "./components/memory/MemoryPages.jsx"
import { CargoLeft, CargoRight } from "./components/cargo/CargoPages.jsx"
import {
  StoryPuzzleLeft,
  StoryPuzzleRight,
} from "./components/storyPuzzle/StoryPuzzlePages.jsx"
const chapterOrder = [2, 4, 6, 7, 5, 8, 10, 11, 12, 13, 14, 15]
const BOOK_PAGE_SESSION_KEY = "little-explorer-book-page"
const chapterPages = {
  0: 0,
  3: 2,
  2: 0,
  4: 2,
  6: 4,
  7: 6,
  5: 8,
  8: 10,
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, index) => [10 + index, 12 + index * 2]),
  ),
}
const PageNavigation = createContext(null)
function rememberBookPage(page) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(BOOK_PAGE_SESSION_KEY, String(page))
  } catch {}
}
const Page = memo(forwardRef(function Page(
  { children, number, label, className = "" },
  ref,
) {
  const navigation = useContext(PageNavigation)
  const previous = number % 2 === 1
  return (
    <div
      ref={ref}
      className={`paper ${
        number % 2 ? "left-paper" : "right-paper"
      } ${className}`}
    >
      <div className="paper-content">{children}</div>
      {number >= 4 &&
        number <= 12 &&
        number !== 10 &&
        number !== 11 &&
        navigation && (
          <button
            type="button"
            className={`book-page-nav ${
              previous ? "book-page-prev" : "book-page-next"
            }`}
            aria-label={
              previous ? navigation.text.previous : navigation.text.next
            }
            onClick={previous ? navigation.previous : navigation.next}
          >
            {previous ? <ArrowLeft size={23} /> : <ArrowRight size={23} />}
          </button>
        )}
      <div className="page-foot">
        <span>{label}</span>
        <span>{String(number).padStart(2, "0")}</span>
      </div>
    </div>
  )
}))
function Robot({ onClick, label, happy, floating = true }) {
  return (
    <motion.button
      className={`robot ${happy ? "happy" : ""}`}
      aria-label={label}
      onClick={onClick}
      animate={floating ? { y: [0, -8, 0] } : { y: 0 }}
      transition={
        floating ? { duration: 4, repeat: Infinity } : { duration: 0 }
      }
    >
      <div className="antenna">
        <i />
      </div>
      <div className="robot-head">
        <div className="robot-face">
          <i />
          <i />
          <span />
        </div>
        <b />
        <b />
      </div>
      <div className="robot-body">
        <Heart size={13} />
      </div>
      <div className="robot-shadow" />
    </motion.button>
  )
}

export default function BookApp({
  initialPage = 0,
  immersiveMobile = false,
  onBookReady,
}) {
  const [language, setLanguage] = useState("en")
  const text = language === "en" ? en : bn
  const [spread, setSpread] = useState(
    () => chapterOrder[Math.floor(initialPage / 2)],
  )
  const [hint, setHint] = useState("")
  const [slider, setSlider] = useState(55)
  const [progress, collect] = useProgress()
  const [mounted, setMounted] = useState(false)
  const book = useRef(null)
  const [locations, setLocations] = useState({})
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [burst, setBurst] = useState(false)
  const [cargoPositions, setCargoPositions] = useState({})
  const [cargoSelected, setCargoSelected] = useState(null)
  const moveCargo = (index, destination) => {
    if (index === null) return
    setCargoPositions((previous) => ({ ...previous, [index]: destination }))
    setCargoSelected(null)
  }
  const [storyMatches, setStoryMatches] = useState([null, null, null])
  const [storyChoice, setStoryChoice] = useState(null)
  const [storyMessage, setStoryMessage] = useState("")
  const chapterTitle = (index) =>
    index >= 10
      ? opportunityDocumentTitles[language][index - 10]
      : index === 8
        ? opportunityCopy[language].title
        : index === 4
          ? apolloMemoriesCopy[language].title
          : index === 6
            ? text.cargoLab.title
            : index === 7
              ? text.storyPuzzle.title
              : text.chapters[index]
  const matchStory = (slot, choice) => {
    if (storyMatches[slot] !== null) return
    if (choice === null) {
      setStoryMessage("pick")
      return
    }
    if (choice !== slot) {
      setStoryMessage("gentle")
      return
    }
    const next = storyMatches.map((value, index) =>
      index === slot ? choice : value,
    )
    setStoryMatches(next)
    setStoryChoice(null)
    setStoryMessage(
      next.every((value) => value !== null) ? "complete" : "matched",
    )
    if (next.every((value) => value !== null)) celebrate()
  }
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (spread === 8) return preloadOpportunitySpread(0)
  }, [spread])
  useEffect(() => {
    if (!mounted) return
    let frame
    const publish = () => {
      const api = book.current?.pageFlip()
      if (api) onBookReady?.(api)
      else frame = requestAnimationFrame(publish)
    }
    frame = requestAnimationFrame(publish)
    return () => cancelAnimationFrame(frame)
  }, [mounted, immersiveMobile, onBookReady])
  const go = (chapter) => {
    book.current?.pageFlip()?.flip(chapterPages[chapter])
    setHint("")
  }
  const celebrate = () => {
    setBurst(true)
    setTimeout(() => setBurst(false), 1800)
  }
  const weights = [8, 2, 210, 1]
  const weight = weights.reduce(
    (total, value, index) => total + (locations[index] === "earth" ? value : 0),
    0,
  )
  const move = (index, destination) => {
    if (index === null || Number.isNaN(index)) return
    setLocations((previous) => ({ ...previous, [index]: destination }))
    setSelected(null)
    setChecked(false)
  }
  const validate = () => {
    if (
      locations[0] === "earth" &&
      locations[1] === "earth" &&
      locations[2] === "moon" &&
      locations[3] === "moon" &&
      weight <= 12
    ) {
      setChecked(true)
      collect("puzzle")
      celebrate()
    } else {
      setChecked(false)
      setHint(text.gentle)
    }
  }
  const complete = progress.passport && progress.puzzle
  const icons = [
    BookOpen,
    Sparkles,
    Map,
    Flag,
    Backpack,
    Heart,
    Rocket,
    Sparkles,
    Rocket,
    Map,
  ]
  const heading = (eyebrow, title) => (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
    </>
  )
  const item = (index) => (
    <button
      key={index}
      className={`cargo ${selected === index ? "selected" : ""}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(index))
        setSelected(index)
      }}
      onClick={() => setSelected(index)}
    >
      <span>{["🪨", "🎞️", "🛞", "📦"][index]}</span>
      <strong>{text.items[index]}</strong>
      <small>
        {weights[index]} {text.kg}
      </small>
    </button>
  )
  return (
    <main className="desk" lang={language}>
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            go(0)
          }}
        >
          <div className="brand-icon">
            <BookOpen size={22} />
            <Star size={9} />
          </div>
          <span>{text.brand}</span>
        </a>
        <div className="top-actions">
          <span className="challenge">
            <span className="tiny-star">✦</span>
            {text.challenge}
          </span>
          <button
            className="language"
            onClick={() => {
              setLanguage(language === "en" ? "bn" : "en")
              setHint("")
            }}
          >
            <Languages size={15} />
            {text.language}
          </button>
          <span className="quiet" title={text.sound}>
            <VolumeX size={18} />
          </span>
        </div>
      </header>
      <div className="desk-note">
        <span>✧</span>
        {text.coverNote}
        <svg width="51" height="27" viewBox="0 0 51 27">
          <path
            d="M2 3q8 20 42 15m-8-8 9 9-12 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div
        className={`book-area${spread !== 2 ? " has-mission-progress" : ""}`}
      >
        <MissionProgress spread={spread} language={language} />
        <nav className="chapter-tabs" aria-label={text.brand}>
          {[2, 4, 6, 7, 5, 8].map((index) => {
            const title = chapterTitle(index)
            const Icon = icons[index]
            return (
              <button
                data-chapter={index}
                className={
                  spread === index || (index === 8 && spread >= 10)
                    ? "active"
                    : ""
                }
                onClick={() => go(index)}
                key={title}
                title={title}
                aria-label={title}
                aria-current={
                  spread === index || (index === 8 && spread >= 10)
                    ? "page"
                    : undefined
                }
              >
                <Icon size={17} />
                <span>{title}</span>
              </button>
            )
          })}
        </nav>
        <div className="book-binding">
          <div className="book-inner">
            <PageNavigation.Provider
              value={{
                text,
                previous: () => book.current?.pageFlip()?.flipPrev(),
                next: () => book.current?.pageFlip()?.flipNext(),
              }}
            >
              {mounted && (
                <HTMLFlipBook
                  ref={book}
                  pageAssets={pageAssets}
                  width={480}
                  height={600}
                  size="stretch"
                  minWidth={280}
                  maxWidth={550}
                  minHeight={550}
                  maxHeight={680}
                  maxShadowOpacity={immersiveMobile ? 0.12 : 0.25}
                  showCover={false}
                  mobileScrollSupport={false}
                  usePortrait={false}
                  flippingTime={immersiveMobile ? 600 : 850}
                  startPage={initialPage}
                  useMouseEvents={false}
                  disableFlipByClick
                  clickEventForward
                  showPageCorners={false}
                  onChangeState={(event) => {
                    const root = document.querySelector(".book-experience")
                    if (root)
                      root.dataset.pageTurning = String(
                        event.data === "flipping",
                      )
                  }}
                  onFlip={(event) =>
                    (() => {
                      rememberBookPage(event.data)
                      setSpread(chapterOrder[Math.floor(event.data / 2)])
                    })()
                  }
                >
                  <Page number={1} label={text.map.folioMars}>
                    <MapSpread
                      world="mars"
                      pageNumber={1}
                      active={spread === 2}
                      language={language}
                      text={text.map}
                      progress={progress}
                      onPlay={(mission) =>
                        go(mission === "opportunity" ? 8 : 4)
                      }
                    />
                  </Page>
                  <Page number={2} label={text.map.folioMoon}>
                    <MapSpread
                      world="moon"
                      pageNumber={2}
                      active={spread === 2}
                      language={language}
                      text={text.map}
                      progress={progress}
                      onPlay={() => go(4)}
                    />
                  </Page>
                  <Page number={3} label={apolloMemoriesCopy[language].title}>
                    <ApolloMemories language={language} />
                  </Page>
                  <Page number={4} label={text.chapters[4]}>
                    <PuzzleLeft
                      text={text}
                      hint={hint}
                      checked={checked}
                      active={spread === 4}
                      language={language}
                      pageNumber="04"
                    />
                  </Page>
                  <Page number={5} label={text.cargoLab.title}>
                    <CargoLeft
                      text={text}
                      positions={cargoPositions}
                      selected={cargoSelected}
                      setSelected={setCargoSelected}
                      reset={() => {
                        setCargoPositions({})
                        setCargoSelected(null)
                      }}
                    />
                  </Page>
                  <Page number={6} label={text.cargoLab.destination}>
                    <CargoRight
                      text={text}
                      positions={cargoPositions}
                      selected={cargoSelected}
                      setSelected={setCargoSelected}
                      move={moveCargo}
                    />
                  </Page>
                  <Page number={7} label={text.storyPuzzle.title}>
                    <StoryPuzzleLeft
                      text={text}
                      selected={storyChoice}
                      setSelected={(choice) => {
                        setStoryChoice(choice)
                        setStoryMessage("")
                      }}
                      matches={storyMatches}
                    />
                  </Page>
                  <Page number={8} label={text.storyPuzzle.board}>
                    <StoryPuzzleRight
                      text={text}
                      selected={storyChoice}
                      matches={storyMatches}
                      message={storyMessage}
                      onMatch={matchStory}
                      onPassport={() => go(3)}
                      onMap={() => go(2)}
                      onMemory={() => go(5)}
                    />
                  </Page>
                  <Page number={9} label={text.chapters[5]}>
                    <MemoryLeft
                      text={text}
                      progress={progress}
                      active={spread === 5}
                      onMission={() => go(3)}
                      onPuzzle={() => go(4)}
                      onExplore={() => go(2)}
                    />
                  </Page>
                  <Page number={10} label={text.chapters[5]}>
                    <MemoryRight
                      text={text}
                      progress={progress}
                      onExplore={() => go(2)}
                    />
                  </Page>
                  <Page number={11} label={opportunityCopy[language].title}>
                    <OpportunityPage
                      side="left"
                      language={language}
                      onBack={() => go(2)}
                    />
                  </Page>
                  <Page number={12} label={opportunityCopy[language].title}>
                    <OpportunityPage
                      side="right"
                      language={language}
                      onBack={() => go(2)}
                    />
                  </Page>
                  {Array.from({ length: 6 }, (_, index) =>
                    ["left", "right"].map((side, sideIndex) => (
                      <Page
                        key={`opportunity-document-${index}-${side}`}
                        number={13 + index * 2 + sideIndex}
                        label={opportunityDocumentTitles[language][index]}
                      >
                        <OpportunityDocumentPage
                          index={index}
                          side={side}
                          language={language}
                          active={spread === 10 + index}
                          onPrevious={() => go(index === 0 ? 8 : 9 + index)}
                          onNext={
                            index === 5 ? undefined : () => go(11 + index)
                          }
                        />
                      </Page>
                    )),
                  ).flat()}
                </HTMLFlipBook>
              )}
            </PageNavigation.Provider>
          </div>
        </div>
        <div className="companion">
          <AnimatePresence mode="wait">
            <motion.div
              key={hint || language + spread}
              className="robot-message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="robot-name">
                PIP <Sparkles size={11} />
              </span>
              <p>
                {hint ||
                  (spread === 4
                    ? text.hintStory
                    : spread === 3
                      ? text.hintStory
                      : text.welcome)}
              </p>
            </motion.div>
          </AnimatePresence>
          <Robot
            onClick={() => setHint(text.hintStory)}
            label={text.robotLabel}
            happy={complete}
            floating={!immersiveMobile}
          />
        </div>
        <div className="pencil">
          <i />
          <span />
        </div>
        <div className="desk-stars">✧</div>
      </div>
      <div className="bottom-bar">
        <button
          className="page-arrow"
          aria-label={text.previous}
          disabled={spread === 2}
          onClick={() => book.current?.pageFlip()?.flipPrev()}
        >
          <ArrowLeft size={19} />
        </button>
        <div className="chapter-status">
          <span>{chapterTitle(spread)}</span>
          <div className="pagination">
            {chapterOrder.map((index) => (
              <button
                aria-label={chapterTitle(index)}
                aria-current={spread === index ? "step" : undefined}
                className={spread === index ? "active" : ""}
                key={index}
                onClick={() => go(index)}
              />
            ))}
          </div>
        </div>
        <button
          className="page-arrow"
          aria-label={text.next}
          disabled={spread === 5 || spread === 15}
          onClick={() => book.current?.pageFlip()?.flipNext()}
        >
          <ArrowRight size={19} />
        </button>
      </div>
      <footer className="footer">
        <span>
          <Heart size={12} />
          {text.footer}
        </span>
        <span>
          {language === "bn"
            ? "পাতা উল্টাতে তীর চিহ্নে চাপ দাও"
            : "Use the arrows to turn the pages"}
          <ChevronRight size={13} />
        </span>
      </footer>
      <AnimatePresence>
        {burst && (
          <motion.div
            className="star-burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 14 }, (_, index) => (
              <motion.span
                key={index}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: Math.cos(index * 2.4) * 260,
                  y: Math.sin(index * 2.4) * 230,
                  scale: [0, 1, 0],
                  rotate: 90,
                }}
                transition={{ duration: 1.6 }}
              >
                ✦
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
