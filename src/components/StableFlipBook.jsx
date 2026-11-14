import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  createElement,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { flushSync } from "react-dom"
import HTMLFlipBook from "react-pageflip"
import { decodeUrls, whenIdle } from "../lib/decodeImages.js"

// Pages mounted on each side of the visible spread, and spreads decoded ahead.
const LIVE_PAGES_AROUND = 2
const PRELOAD_SPREADS = 2
const REDUCED_FADE_MS = 260

const LivePages = createContext([])
const LiveWindow = createContext(() => true)
const memoizedContents = new WeakMap()
const wrappedApis = new WeakMap()

const spreadStart = (page) => Math.max(0, Math.floor(page / 2) * 2)
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

function LiveContent({ element }) {
  const callbacks = useRef({})
  const stableCallbacks = useRef({})
  if (
    !isValidElement(element) ||
    (typeof element.type !== "function" && typeof element.type !== "object")
  )
    return element

  const props = { ...element.props }
  callbacks.current = element.props
  for (const [name, value] of Object.entries(props)) {
    if (typeof value !== "function") continue
    if (!stableCallbacks.current[name])
      stableCallbacks.current[name] = (...args) =>
        callbacks.current[name]?.(...args)
    props[name] = stableCallbacks.current[name]
  }
  let Content = memoizedContents.get(element.type)
  if (!Content) {
    Content = memo(element.type)
    memoizedContents.set(element.type, Content)
  }
  // Stable event proxies still call the latest game callbacks. Unchanged,
  // off-screen content can skip rendering without retaining stale closures.
  return createElement(Content, props)
}

const LivePage = memo(
  forwardRef(function LivePage({ index }, ref) {
    const pages = useContext(LivePages)
    const isLive = useContext(LiveWindow)
    // Pages outside the window keep their paper shell (the library measures
    // it) but drop their content, so a flip never repaints distant spreads.
    return cloneElement(pages[index], {
      ref,
      children: isLive(index) ? (
        <LiveContent element={pages[index].props.children} />
      ) : null,
    })
  }),
)

// react-pageflip rebuilds its DOM when its children array changes. Keep those
// slots stable while context delivers live game, language, and progress updates.
const StableFlipBook = forwardRef(function StableFlipBook(
  {
    children,
    pageAssets = [],
    onFlip,
    onChangeState,
    flippingTime,
    drawShadow = true,
    ...settings
  },
  ref,
) {
  const flip = useRef(null)
  const pages = Children.toArray(children)
  const [reducedMotion] = useState(prefersReducedMotion)
  const [anchors, setAnchors] = useState(() => ({
    current: spreadStart(settings.startPage || 0),
    target: null,
  }))

  // Mount the destination before the library snapshots it for the turn, so a
  // jump to a distant chapter never animates an empty sheet.
  const prime = useCallback((page) => {
    const target = spreadStart(page)
    flushSync(() =>
      setAnchors((previous) =>
        previous.target === target ? previous : { ...previous, target },
      ),
    )
  }, [])

  const wrap = useCallback(
    (api) => {
      if (wrappedApis.has(api)) return wrappedApis.get(api)
      const overrides = {
        flip: (page, corner) => {
          prime(page)
          return api.flip(page, corner)
        },
        flipNext: (corner) => {
          prime(api.getCurrentPageIndex() + 2)
          return api.flipNext(corner)
        },
        flipPrev: (corner) => {
          prime(api.getCurrentPageIndex() - 2)
          return api.flipPrev(corner)
        },
        turnToPage: (page) => {
          const current = spreadStart(page)
          flushSync(() => setAnchors({ current, target: null }))
          return api.turnToPage(page)
        },
      }
      const proxy = new Proxy(api, {
        get(target, key) {
          if (key in overrides) return overrides[key]
          const value = target[key]
          return typeof value === "function" ? value.bind(target) : value
        },
      })
      wrappedApis.set(api, proxy)
      return proxy
    },
    [prime],
  )

  useImperativeHandle(
    ref,
    () => ({
      pageFlip: () => {
        const api = flip.current?.pageFlip()
        return api ? wrap(api) : undefined
      },
    }),
    [wrap],
  )

  const isLive = useMemo(() => {
    const near = (anchor, index) =>
      anchor !== null &&
      index >= anchor - LIVE_PAGES_AROUND &&
      index <= anchor + 1 + LIVE_PAGES_AROUND
    return (index) => near(anchors.current, index) || near(anchors.target, index)
  }, [anchors])

  const slots = useMemo(
    () =>
      Array.from({ length: pages.length }, (_, index) => (
        <LivePage key={index} index={index} />
      )),
    [pages.length],
  )

  useEffect(() => {
    const { current } = anchors
    const urls = []
    for (let page = current; page < current + 2 * (PRELOAD_SPREADS + 1); page++)
      urls.push(...(pageAssets[page] || []))
    urls.push(...(pageAssets[current - 2] || []), ...(pageAssets[current - 1] || []))
    return whenIdle(() => decodeUrls([...new Set(urls)]))
  }, [anchors, pageAssets])

  useEffect(() => {
    let frame
    let observer
    const connect = () => {
      const api = flip.current?.pageFlip()
      if (!api?.getFlipController()) {
        frame = requestAnimationFrame(connect)
        return
      }
      // A fitted viewport can resize the parent after the window resize event.
      // Update only geometry; do not recreate pages to obtain responsive sizing.
      observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => api.update())
      })
      observer.observe(api.getUI().getDistElement())
    }
    frame = requestAnimationFrame(connect)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [pages.length])

  // react-pageflip binds its handlers only when pages load, so read the
  // latest callbacks through refs instead of the first render's closures.
  const handlers = useRef({ onFlip, onChangeState })
  handlers.current = { onFlip, onChangeState }

  const handleFlip = useCallback(
    (event) => {
      setAnchors({ current: spreadStart(event.data), target: null })
      if (reducedMotion) {
        const block = flip.current?.pageFlip()?.getUI()?.getDistElement()
        block?.animate([{ opacity: 0.35 }, { opacity: 1 }], {
          duration: REDUCED_FADE_MS,
          easing: "ease-out",
        })
      }
      handlers.current.onFlip?.(event)
    },
    [reducedMotion],
  )
  const handleChangeState = useCallback(
    (event) => handlers.current.onChangeState?.(event),
    [],
  )

  return (
    <LivePages.Provider value={pages}>
      <LiveWindow.Provider value={isLive}>
        <HTMLFlipBook
          {...settings}
          flippingTime={reducedMotion ? 1 : flippingTime}
          drawShadow={reducedMotion ? false : drawShadow}
          onFlip={handleFlip}
          onChangeState={handleChangeState}
          ref={flip}
        >
          {slots}
        </HTMLFlipBook>
      </LiveWindow.Provider>
    </LivePages.Provider>
  )
})

export default StableFlipBook
