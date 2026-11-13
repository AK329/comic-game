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
} from "react"
import HTMLFlipBook from "react-pageflip"

const LivePages = createContext([])
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
  const pages = useContext(LivePages)
  return cloneElement(pages[index], {
    ref,
    children: <LiveContent element={pages[index].props.children} />,
  })
})

// react-pageflip rebuilds its DOM when its children array changes. Keep those
// slots stable while context delivers live game, language, and progress updates.
const StableFlipBook = forwardRef(function StableFlipBook(
  { children, ...settings },
  ref,
) {
  const flip = useRef(null)
  useImperativeHandle(
    ref,
    () => ({
      pageFlip: () => flip.current?.pageFlip(),
    }),
    [],
  )
  const pages = Children.toArray(children)
  const slots = useMemo(
    () =>
      Array.from({ length: pages.length }, (_, index) => (
        <LivePage key={index} index={index} />
      )),
    [pages.length],
  )
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
  return (
    <LivePages.Provider value={pages}>
      <HTMLFlipBook {...settings} ref={flip}>
        {slots}
      </HTMLFlipBook>
    </LivePages.Provider>
  )
})

export default StableFlipBook
