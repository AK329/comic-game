import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  createElement,
  isValidElement,
  memo,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import HTMLFlipBook from "react-pageflip"

const LivePages = createContext({
  pages: [],
  firstLivePage: 0,
  lastLivePage: -1,
})
const memoizedContents = new WeakMap()

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

const LivePage = forwardRef(function LivePage({ index }, ref) {
  const { pages, firstLivePage, lastLivePage } = useContext(LivePages)
  const isLive = index >= firstLivePage && index <= lastLivePage
  if (!isLive) {
    return cloneElement(pages[index], {
      ref,
      children: null,
    })
  }
  return cloneElement(pages[index], {
    ref,
    children: <LiveContent element={pages[index].props.children} />,
  })
})

// react-pageflip rebuilds its DOM when its children array changes. Keep those
// slots stable while context delivers live game, language, and progress updates.
const StableFlipBook = forwardRef(function StableFlipBook(
  { children, onFlip, ...settings },
  ref,
) {
  const flip = useRef(null)
  const [activePage, setActivePage] = useState(settings.startPage || 0)
  useImperativeHandle(
    ref,
    () => ({
      pageFlip: () => flip.current?.pageFlip(),
    }),
    [],
  )
  const pages = Children.toArray(children)
  const currentSpread = activePage - (activePage % 2)
  const firstLivePage = Math.max(0, currentSpread - 4)
  const lastLivePage = Math.min(pages.length - 1, currentSpread + 5)
  const slots = useMemo(
    () =>
      Array.from({ length: pages.length }, (_, index) => (
        <LivePage key={index} index={index} />
      )),
    [pages.length],
  )
  const handleFlip = (event) => {
    setActivePage(event.data)
    onFlip?.(event)
  }
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
  useEffect(() => {
    let cancelled = false
    const decodeNearbyImages = async () => {
      const images = Array.from(
        document.querySelectorAll(".stf__block .paper img"),
      )
      await Promise.all(
        images.map(async (image) => {
          if (typeof image.decode !== "function") return
          try {
            await image.decode()
          } catch {}
        }),
      )
      if (cancelled) return
    }
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(decodeNearbyImages)
      : window.setTimeout(decodeNearbyImages, 120)
    return () => {
      cancelled = true
      if (window.cancelIdleCallback && typeof idle === "number")
        window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [activePage, firstLivePage, lastLivePage])
  return (
    <LivePages.Provider value={{ pages, firstLivePage, lastLivePage }}>
      <HTMLFlipBook {...settings} onFlip={handleFlip} ref={flip}>
        {slots}
      </HTMLFlipBook>
    </LivePages.Provider>
  )
})

export default StableFlipBook
