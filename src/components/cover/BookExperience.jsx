"use client"

// Complete replacement component: its styles are included in this one file.

// Stop native page-flip listeners before an artwork press reaches their block.
// React's delegated click must still bubble so the cover button can open.
// Browser chrome can resize mid-gesture. Finish the current physical motion
// before applying that viewport update instead of jumping between poses.

// Discover the existing book, rather than rendering a second copy or a placeholder.
// Page-flip clears its block on updates. Keep our portal node and reattach it,
// rather than remounting the cover or duplicating any page content.

// Calculate the closed pose from the real book's final, untransformed bounds.
// The cover's old viewport dimensions and artwork are unchanged.
// Inverse parent rotation preserves the same portrait closed cover on phones.

// Every animated part shares exactly the same clock, duration, and easing.
// This is the actual left page, attached to the inside of the opening cover.
/* Optional API. */

// Resize only remeasures geometry; it never swaps content or remounts the book.
// Page-flip resolves its initial responsive height asynchronously.
// Reversing mid-opening uses the existing playheads, with no new pose.
/* Resizing or unmounting cancels the previous timeline. */ /* The existing rotated landscape fallback remains available. */ /* Closing or resizing takes ownership of the current timeline. */ /* Optional API. */
// Embedded previews and some mobile browsers report a mouse pointer.
// Fit by available space, not by a touch-only device classification.
// Fullscreen denial must not skip the independent orientation attempt.
// The fitted landscape plane owns orientation in both closed and open
// states. Do not counter-rotate the closed cover back into portrait.
// CSS already fits the book into a landscape plane. Do not hold the
// opening gesture on browsers that delay or reject orientation locking.

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { ArrowLeft } from "lucide-react"
import BookApp from "../../BookApp.jsx"
import cover from "../../assets/hardcover/reference-cover.webp"

const coverUrl = typeof cover === "string" ? cover : cover.src
const StableBook = memo(BookApp)
const DURATION = 900
const EASING = "ease-in-out"
const FRAME = { width: 1040, height: 720 }
const CLOSED_LID = "rotateY(0deg) translateZ(4px)"
const OPEN_LID = "rotateY(-180deg) translateZ(4px)"
const BOOK_SESSION_KEY = "little-explorer-book-open"
const BOOK_PAGE_SESSION_KEY = "little-explorer-book-page"
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))
const waitForResize = async () => {
  await nextFrame()
  await nextFrame()
  await new Promise((resolve) => setTimeout(resolve, 300))
}
async function decodeImages(images) {
  await Promise.all(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true })
          image.addEventListener("error", resolve, { once: true })
        })
      }
      if (typeof image.decode === "function") {
        try {
          await image.decode()
        } catch {}
      }
    }),
  )
}
function readBookSession() {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(BOOK_SESSION_KEY) === "open"
  } catch {
    return false
  }
}
function writeBookSession(open) {
  if (typeof window === "undefined") return
  try {
    if (open) window.sessionStorage.setItem(BOOK_SESSION_KEY, "open")
    else window.sessionStorage.removeItem(BOOK_SESSION_KEY)
  } catch {}
}
function readBookPage() {
  if (typeof window === "undefined") return 0
  try {
    const page = Number(window.sessionStorage.getItem(BOOK_PAGE_SESSION_KEY))
    return Number.isInteger(page) && page >= 0 ? page : 0
  } catch {
    return 0
  }
}

async function bounded(promise) {
  let timeout
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Unsupported orientation")),
          1400,
        )
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}
export default function BookExperience() {
  const [phase, setPhase] = useState(() =>
    readBookSession() ? "open" : "closed",
  )
  const [initialPage] = useState(readBookPage)
  const [preparing, setPreparing] = useState(false)
  const [host, setHost] = useState(null)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState({
    mobile: false,
    width: 1,
    height: 1,
    angle: 0,
    scale: 1,
  })
  const root = useRef(null)
  const lid = useRef(null)
  const board = useRef(null)
  const shadow = useRef(null)
  const closeButton = useRef(null)
  const phaseRef = useRef(phase)
  const viewRef = useRef(view)
  const animations = useRef([])
  const sheet = useRef(null)
  const token = useRef(0)
  const pose = useRef(null)
  const deferredResize = useRef(false)
  const controller = useRef(null)
  const bookReady = useCallback((api) => {
    controller.current = api
  }, [])
  useLayoutEffect(() => {
    const button = lid.current
    if (!button) return
    const stop = (event) => event.stopPropagation()
    const events = [
      "pointerdown",
      "mousedown",
      "mouseup",
      "mousemove",
      "touchstart",
      "touchmove",
      "touchend",
    ]
    events.forEach((name) => button.addEventListener(name, stop))
    return () =>
      events.forEach((name) => button.removeEventListener(name, stop))
  }, [host])

  useEffect(() => {
    const blockPageFlip = (event) => {
      if (phaseRef.current !== "open") event.stopImmediatePropagation()
    }
    const events = ["mousemove", "mouseup", "touchmove", "touchend"]
    events.forEach((name) => window.addEventListener(name, blockPageFlip, true))
    return () =>
      events.forEach((name) =>
        window.removeEventListener(name, blockPageFlip, true),
      )
  }, [])

  const mode = useCallback((value) => {
    phaseRef.current = value
    if (value === "open") writeBookSession(true)
    if (value === "closed") writeBookSession(false)
    setPhase(value)
  }, [])

  const cancelAnimations = useCallback(() => {
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    sheet.current?.classList.remove("experience-turning-sheet")
    sheet.current = null
  }, [])

  const measureViewport = useCallback(() => {
    if (phaseRef.current === "opening" || phaseRef.current === "closing") {
      deferredResize.current = true
      return
    }
    const viewport = window.visualViewport
    const width = viewport?.width || window.innerWidth
    const height = viewport?.height || window.innerHeight
    const mobile =
      width < 1024 ||
      height < 720 ||
      (matchMedia("(pointer: coarse)").matches &&
        Math.min(width, height) < 1100)
    const styles = getComputedStyle(root.current)
    const w = Math.max(
      1,
      width - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight),
    )
    const h = Math.max(
      1,
      height - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom),
    )
    const angle = mobile && h > w ? 90 : 0
    const planeWidth = angle ? h : w
    const planeHeight = angle ? w : h
    const value = {
      mobile,
      width: planeWidth,
      height: planeHeight,
      angle,
      scale: mobile
        ? Math.max(
            0.01,
            Math.min(
              (planeWidth - 16) / FRAME.width,
              (planeHeight - 16) / FRAME.height,
            ),
          )
        : 1,
    }
    const previous = viewRef.current
    if (
      previous.mobile === value.mobile &&
      previous.width === value.width &&
      previous.height === value.height &&
      previous.angle === value.angle &&
      previous.scale === value.scale
    )
      return
    viewRef.current = value
    setView(value)
  }, [])
  useEffect(() => {
    let current
    const discover = () => {
      const binding = root.current?.querySelector(".book-binding")
      const block = binding?.querySelector(".stf__block")
      if (!block) return
      if (current?.block === block) {
        if (current.layer.parentElement !== block)
          block.appendChild(current.layer)
        return
      }
      current?.layer.remove()
      const layer = document.createElement("div")
      layer.className = "experience-cover-layer"
      block.appendChild(layer)
      current = { binding, block, layer }
      setHost(current)
    }
    const observer = new MutationObserver(discover)
    observer.observe(root.current, { childList: true, subtree: true })
    discover()
    return () => {
      observer.disconnect()
      current?.layer.remove()
    }
  }, [])

  useLayoutEffect(() => {
    measureViewport()
    window.addEventListener("resize", measureViewport)
    window.addEventListener("orientationchange", measureViewport)
    window.visualViewport?.addEventListener("resize", measureViewport)
    return () => {
      window.removeEventListener("resize", measureViewport)
      window.removeEventListener("orientationchange", measureViewport)
      window.visualViewport?.removeEventListener("resize", measureViewport)
    }
  }, [measureViewport])

  useLayoutEffect(() => {
    if ((phase === "open" || phase === "closed") && deferredResize.current) {
      deferredResize.current = false
      measureViewport()
    }
  }, [phase, measureViewport])
  const geometry = useCallback(() => {
    if (!host || !lid.current || !board.current) return null
    cancelAnimations()
    host.binding.style.transform = "none"
    const bounds = host.binding.getBoundingClientRect()
    const localWidth = host.binding.offsetWidth
    const localHeight = host.binding.offsetHeight
    let localBlockX = 0
    let localBlockY = 0
    let parent = host.block
    while (parent && parent !== host.binding) {
      localBlockX += parent.offsetLeft
      localBlockY += parent.offsetTop
      parent = parent.offsetParent
    }
    Object.assign(lid.current.style, {
      left: `${localWidth / 2 - localBlockX}px`,
      top: `${-localBlockY}px`,
      width: `${localWidth / 2}px`,
      height: `${localHeight}px`,
    })
    const viewport = window.visualViewport
    const vw = viewport?.width || innerWidth
    const vh = viewport?.height || innerHeight
    const { mobile, width, height, angle, scale } = viewRef.current
    const coverWidth = Math.min(
      (mobile ? width : vw) * 0.76,
      460,
      ((mobile ? height : vh) - 112) * 0.814,
    )
    const coverHeight = (coverWidth * 920) / 749
    const radians = (angle * Math.PI) / 180
    const coverAngle = mobile ? radians : 0
    const dx =
      vw / 2 -
      (bounds.left + bounds.width / 2) -
      (Math.cos(coverAngle) * coverWidth) / 2
    const dy =
      vh / 2 -
      (bounds.top + bounds.height / 2) -
      (Math.sin(coverAngle) * coverWidth) / 2
    const x = (Math.cos(radians) * dx + Math.sin(radians) * dy) / scale
    const y = (-Math.sin(radians) * dx + Math.cos(radians) * dy) / scale
    const closed = `translate3d(${x}px,${y}px,0) rotateZ(${
      mobile ? 0 : -angle
    }deg) scale(${coverWidth / ((localWidth / 2) * scale)},${coverHeight / (localHeight * scale)})`
    const left = [...host.block.querySelectorAll(".left-paper")].find(
      (page) => getComputedStyle(page).display !== "none",
    )
    const base = left ? getComputedStyle(left).transform : "none"
    pose.current = {
      closed,
      left,
      base: base === "none" ? "" : base,
    }
    return pose.current
  }, [host, cancelAnimations])
  const timeline = useCallback(
    (value, reverse = false, paused = false) => {
      if (!value) return []
      const reducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
      const options = {
        duration: paused ? DURATION : reducedMotion ? 180 : DURATION,
        easing: reducedMotion ? "linear" : EASING,
        fill: "both",
        direction: reverse ? "reverse" : "normal",
      }
      const list = []
      const add = (element, frames) => {
        if (!element) return
        const animation = element.animate(frames, options)
        if (paused) {
          animation.pause()
          animation.currentTime = 0
        } else animation.startTime = document.timeline.currentTime
        list.push(animation)
      }
      add(host.binding, [
        { transform: value.closed },
        { transform: "translate3d(0,0,0) rotateZ(0deg) scale(1,1)" },
      ])
      add(
        lid.current,
        reducedMotion
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ transform: CLOSED_LID }, { transform: OPEN_LID }],
      )
      add(board.current, [
        { transform: "translateZ(-12px) rotateY(180deg)" },
        { transform: "translateZ(-12px) rotateY(0deg)" },
      ])
      if (value.left) {
        sheet.current = value.left
        value.left.classList.add("experience-turning-sheet")
        add(value.left, [
          { transform: `${value.base} rotateY(180deg)` },
          { transform: `${value.base} rotateY(0deg)` },
        ])
      }
      add(shadow.current, [
        { transform: "translateX(0) scaleX(1)", opacity: 0.08 },
        {
          transform: "translateX(-18%) scaleX(.25)",
          opacity: 0.3,
          offset: 0.5,
        },
        { transform: "translateX(-100%) scaleX(1)", opacity: 0 },
      ])
      animations.current = list
      return list
    },
    [host],
  )

  const restOpen = useCallback(() => {
    cancelAnimations()
    if (host) host.binding.style.transform = "none"
    if (lid.current) {
      lid.current.style.transform = OPEN_LID
      lid.current.style.opacity = "1"
    }
    if (board.current)
      board.current.style.transform = "translateZ(-12px) rotateY(0deg)"
    if (shadow.current) shadow.current.style.opacity = "0"
  }, [host, cancelAnimations])

  const finishClosed = useCallback(() => {
    mode("closed")
    try {
      screen.orientation?.unlock?.()
    } catch {}
    requestAnimationFrame(() => lid.current?.focus({ preventScroll: true }))
  }, [mode])
  useLayoutEffect(() => {
    if (!host || !lid.current) return
    token.current++
    const value = geometry()
    if (phaseRef.current === "closed" || phaseRef.current === "closing") {
      timeline(value, false, true)
      if (phaseRef.current === "closing") finishClosed()
    } else {
      restOpen()
      if (phaseRef.current === "opening") mode("open")
    }
    setReady(true)
  }, [host, view, geometry, timeline, restOpen, mode, finishClosed])

  useEffect(() => {
    if (!host) return
    const observer = new ResizeObserver(() => {
      if (phaseRef.current === "closed") timeline(geometry(), false, true)
    })
    observer.observe(host.binding)
    return () => observer.disconnect()
  }, [host, geometry, timeline])

  useEffect(() => {
    root.current
      .querySelectorAll(
        ".paper, .topbar, .bottom-bar, .chapter-tabs, .companion",
      )
      .forEach((element) => {
        element.inert = phase !== "open"
      })
  }, [phase, host])

  useEffect(() => {
    if (!view.mobile) return
    const body = document.body
    const html = document.documentElement
    const previous = [
      body.style.overflow,
      body.style.overscrollBehavior,
      html.style.overflow,
    ]
    body.style.overflow = "hidden"
    body.style.overscrollBehavior = "none"
    html.style.overflow = "hidden"
    const preventZoom = (event) => {
      if (event.type === "gesturestart" || event.touches?.length > 1)
        event.preventDefault()
    }
    document.addEventListener("gesturestart", preventZoom, { passive: false })
    document.addEventListener("touchmove", preventZoom, { passive: false })
    return () => {
      ;[
        body.style.overflow,
        body.style.overscrollBehavior,
        html.style.overflow,
      ] = previous
      document.removeEventListener("gesturestart", preventZoom)
      document.removeEventListener("touchmove", preventZoom)
    }
  }, [view.mobile])

  const close = useCallback(async () => {
    if (
      !ready ||
      phaseRef.current === "closed" ||
      phaseRef.current === "closing"
    )
      return
    const id = ++token.current
    mode("closing")
    let list = animations.current
    if (list.length && list[0].playState === "running")
      list.forEach((animation) => animation.reverse())
    else list = timeline(geometry(), true)
    try {
      await Promise.all(list.map((animation) => animation.finished))
      if (id === token.current) finishClosed()
    } catch {}
  }, [ready, mode, geometry, timeline, finishClosed])

  async function open() {
    if (!ready || preparing || phaseRef.current !== "closed") return
    setPreparing(true)
    if (view.mobile) {
      try {
        if (screen.orientation?.lock)
          await bounded(screen.orientation.lock("landscape"))
      } catch {}
    }
    controller.current?.turnToPage(0)
    measureViewport()
    await waitForResize()
    const firstSpreadImages = [
      document.querySelector(".hardcover-front img"),
      ...Array.from(root.current?.querySelectorAll(".paper img") || []).slice(
        0,
        4,
      ),
    ].filter(Boolean)
    await decodeImages(firstSpreadImages)
    const value = geometry()
    const id = ++token.current
    setPreparing(false)
    mode("opening")
    const list = timeline(value)
    try {
      await Promise.all(list.map((animation) => animation.finished))
      if (id !== token.current) return
      restOpen()
      mode("open")
      closeButton.current?.focus({ preventScroll: true })
    } catch {}
  }

  useEffect(() => {
    const keyboard = (event) => {
      if (
        event.key === "Escape" &&
        !document.querySelector('[role="dialog"][aria-modal="true"]')
      )
        close()
    }
    document.addEventListener("keydown", keyboard)
    return () => {
      document.removeEventListener("keydown", keyboard)
    }
  }, [close])

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    const skip = () => {
      if (
        preference.matches &&
        (phaseRef.current === "opening" || phaseRef.current === "closing")
      )
        animations.current.forEach((animation) => animation.finish())
    }
    preference.addEventListener("change", skip)
    return () => {
      preference.removeEventListener("change", skip)
      token.current++
      cancelAnimations()
      try {
        screen.orientation?.unlock?.()
      } catch {}
    }
  }, [cancelAnimations])

  const guard = (event) => {
    if (
      phaseRef.current !== "open" &&
      !event.target.closest(".hardcover-lid, .hardcover-close")
    ) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <div
      ref={root}
      className={`book-experience phase-${phase}${
        view.mobile ? " is-mobile-open" : ""
      }${ready ? " is-ready" : ""}`}
      style={{
        "--plane-width": `${view.width}px`,
        "--plane-height": `${view.height}px`,
        "--plane-rotation": `${view.angle}deg`,
        "--spread-scale": view.scale,
      }}
      onPointerDownCapture={guard}
      onMouseDownCapture={guard}
      onTouchStartCapture={guard}
      onClickCapture={guard}
    >
      <style>{STYLES}</style>
      <div className="experience-plane">
        <div className="experience-game">
          <StableBook
            initialPage={initialPage}
            immersiveMobile={view.mobile}
            onBookReady={bookReady}
          />
        </div>
        {phase !== "closed" && (
          <button
            ref={closeButton}
            className="hardcover-close"
            onClick={close}
            disabled={phase === "closing"}
            aria-label="Close book"
          >
            <ArrowLeft size={16} />
            <span>Close book</span>
          </button>
        )}
        {phase === "closed" && (
          <span className="hardcover-invitation" aria-hidden="true">
            {preparing
              ? "Getting your book ready…"
              : "A little world is waiting. Tap to open."}
          </span>
        )}
      </div>
      {host &&
        createPortal(
          <>
            <span
              className="experience-board experience-board-right"
              aria-hidden="true"
            />
            <span
              ref={board}
              className="experience-board experience-board-left"
              aria-hidden="true"
            />
          </>,
          host.binding,
        )}
      {host &&
        createPortal(
          <>
            <span
              ref={shadow}
              className="hardcover-moving-shadow"
              aria-hidden="true"
            />
            <button
              ref={lid}
              className="hardcover-lid"
              onClick={open}
              disabled={!ready || preparing || phase !== "closed"}
              aria-label="Open Abandoned but Not Forgotten"
              aria-expanded={phase === "open"}
              aria-busy={preparing}
            >
              <span className="hardcover-front">
                <img
                  src={coverUrl}
                  alt="They carried our dreams beyond the sky. Will we carry their memory? A blue cloth book with a cut-paper child and Mars rover."
                  draggable={false}
                />
              </span>
              <span className="hardcover-endpaper" aria-hidden="true" />
            </button>
          </>,
          host.layer,
        )}
    </div>
  )
}

const STYLES = `
/* One real binding, no placeholder or content cross-fade. */
.book-experience{position:relative;min-height:100dvh}
.book-experience:not(.phase-open){height:100dvh;overflow:hidden}
.book-experience .experience-game{opacity:1;visibility:visible}
.book-experience .book-area{perspective:1800px}
.book-experience .book-binding{background:transparent;box-shadow:none;transform-origin:center;transform-style:preserve-3d;will-change:transform}
.book-experience:not(.is-ready) .book-binding{visibility:hidden}
.book-experience .book-binding:after{display:none}
.book-experience .book-inner{background:transparent;transform-style:preserve-3d}
/* The page wrapper owns the responsive height. A fixed library minimum
   otherwise leaves exposed backing/endpaper below shorter spreads. */
.book-experience .stf__parent{min-height:0!important}
.book-experience .stf__parent,.book-experience .stf__block,.book-experience .stf__wrapper,.book-experience .sft__wrapper{transform-style:preserve-3d}
.book-experience .stf__block{perspective:none}
.experience-cover-layer{display:contents}
.experience-board{position:absolute;top:0;bottom:0;width:50%;background:#174d75;box-shadow:0 20px 28px -8px #301c1980,0 5px 3px #14304a70,inset 0 0 0 4px #2c648c;transform:translateZ(-5px);pointer-events:none}
.experience-board:after{content:"";position:absolute;left:5px;right:5px;bottom:6px;height:7px;background:repeating-linear-gradient(#c8bfa4 0px,#e8dfc6 1px,#b1a387 2px)}
.experience-board-right{right:0;border-radius:0 13px 13px 0}
.experience-board-left{left:0;border-radius:9px 0 0 9px;transform-origin:right center;transform-style:preserve-3d;will-change:transform}
.experience-turning-sheet{transform-origin:right center!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;will-change:transform}
.hardcover-lid{position:absolute;margin:0;padding:0;background:none;border:0;border-radius:4px;transform-origin:left center;transform-style:preserve-3d;will-change:transform;transform:rotateY(0deg) translateZ(4px)}
.hardcover-lid:disabled{cursor:default}
.phase-open .hardcover-lid{pointer-events:none;opacity:0}
.hardcover-lid:focus-visible{outline:3px solid var(--paper);outline-offset:12px}
.hardcover-front,.hardcover-endpaper{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.hardcover-front img{display:block;width:100%;height:100%;user-select:none}
.hardcover-endpaper{background:var(--paper);border:7px solid #174d75;border-radius:4px;box-shadow:inset -13px 0 28px #5f4d3130;transform:rotateY(180deg) translateZ(-1px)}
.hardcover-moving-shadow{position:absolute;left:50%;top:0;width:50%;height:100%;background:linear-gradient(90deg,#18233280,transparent 80%);pointer-events:none;transform-origin:left center;will-change:transform,opacity}
/* Only peripheral desk UI fades; neither page nor the book ever does. */
.book-experience .topbar,.book-experience .desk-note,.book-experience .chapter-tabs,.book-experience .companion,.book-experience .pencil,.book-experience .desk-stars,.book-experience .bottom-bar,.book-experience .footer{transition:opacity 1200ms cubic-bezier(0.645,0.045,0.355,1)}
.phase-closed .topbar,.phase-closed .desk-note,.phase-closed .chapter-tabs,.phase-closed .companion,.phase-closed .pencil,.phase-closed .desk-stars,.phase-closed .bottom-bar,.phase-closed .footer,.phase-closing .topbar,.phase-closing .desk-note,.phase-closing .chapter-tabs,.phase-closing .companion,.phase-closing .pencil,.phase-closing .desk-stars,.phase-closing .bottom-bar,.phase-closing .footer{opacity:0;pointer-events:none}
.hardcover-invitation{position:fixed;left:0;right:0;bottom:max(22px,env(safe-area-inset-bottom));text-align:center;color:#f4e6d0;font-family:Caveat,cursive;font-size:22px;letter-spacing:.3px;pointer-events:none}
.hardcover-close{position:fixed;bottom:max(12px,env(safe-area-inset-bottom));right:max(12px,env(safe-area-inset-right));z-index:90;display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:8px 13px;border:1px solid #ead8bd45;border-radius:30px;background:#442f25ed;color:#f4e6d0;font-size:12px;box-shadow:0 4px 15px #241b2140}
/* Preserve the existing fitted phone layout throughout opening AND closing. */
.book-experience.is-mobile-open{position:fixed;inset:0;width:100dvw;height:100dvh;min-height:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box;overflow:hidden;overscroll-behavior:none;touch-action:manipulation;background:radial-gradient(ellipse at 45% 38%,#d2ac7930,transparent 70%),repeating-linear-gradient(1deg,transparent 0px,#2e1d1520 1px,transparent 3px,transparent 65px),repeating-linear-gradient(90deg,#8b6142 0px,#936946 8px,#8a5e40 32px,#875d3d 80px,#966b48 170px,#896040 250px,#68452f 252px,#80573b 255px,#916343 410px)}
.is-mobile-open .experience-plane{position:absolute;left:calc(50% + (env(safe-area-inset-left) - env(safe-area-inset-right)) / 2);top:calc(50% + (env(safe-area-inset-top) - env(safe-area-inset-bottom)) / 2);width:var(--plane-width);height:var(--plane-height);transform:translate(-50%,-50%) rotate(var(--plane-rotation))}
.is-mobile-open.phase-opening,.is-mobile-open.phase-closing{touch-action:none}
.is-mobile-open .experience-game{position:absolute;left:50%;top:50%;width:1040px;height:720px;transform:translate(-50%,-50%) scale(var(--spread-scale));transform-origin:center}
.is-mobile-open .experience-game>.desk{width:1040px;height:720px;min-height:0;box-sizing:border-box;padding:0 14px;background:transparent;overflow:visible}
.is-mobile-open .experience-game>.desk:before{display:none}
.is-mobile-open .book-area{zoom:1;width:1000px;max-width:none;margin:0 auto;padding:36px 34px 0 0}
.is-mobile-open .topbar{position:absolute;top:0;left:0;right:40px;height:32px;justify-content:flex-end;z-index:20;pointer-events:none}
.is-mobile-open .top-actions{pointer-events:auto}
.is-mobile-open .language{font-size:14px;min-height:30px;padding:4px 10px}
.is-mobile-open .brand,.is-mobile-open .challenge,.is-mobile-open .quiet,.is-mobile-open .desk-note,.is-mobile-open .companion,.is-mobile-open .pencil,.is-mobile-open .desk-stars,.is-mobile-open .footer{display:none}
.is-mobile-open .book-inner{min-height:0}
.is-mobile-open .chapter-tabs{top:85px}
.is-mobile-open .mission-progress{right:150px}
.is-mobile-open .bottom-bar{justify-content:center;margin:10px 0 0;max-width:none}
.is-mobile-open .book-page-nav{width:58px;height:58px}
.is-mobile-open .book-page-nav svg{width:29px;height:29px}
.is-mobile-open .hardcover-close{position:absolute;top:auto;left:8px;right:auto;bottom:4px;min-height:36px}
@media(prefers-reduced-motion:reduce){.book-experience .topbar,.book-experience .desk-note,.book-experience .chapter-tabs,.book-experience .companion,.book-experience .pencil,.book-experience .desk-stars,.book-experience .bottom-bar,.book-experience .footer{transition:none}}
`
