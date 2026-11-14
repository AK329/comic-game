// Holding a reference keeps each decoded bitmap warm in the browser's cache,
// so a page that mounts later paints without a decode on the flip frame.
const decoded = new Map()

export function decodeUrls(urls) {
  if (typeof window === "undefined") return Promise.resolve()
  return Promise.allSettled(
    urls.map((src) => {
      if (decoded.has(src)) return decoded.get(src).ready
      const image = new Image()
      image.decoding = "async"
      image.src = src
      const ready = image.decode().catch(() => decoded.delete(src))
      decoded.set(src, { image, ready })
      return ready
    }),
  )
}

export function decodeElements(root) {
  if (!root) return Promise.resolve()
  const images = [...root.querySelectorAll("img")].filter(
    (image) => image.currentSrc || image.src,
  )
  return Promise.allSettled(images.map((image) => image.decode()))
}

export function withTimeout(promise, ms) {
  let timer
  return Promise.race([
    promise,
    new Promise((resolve) => {
      timer = setTimeout(resolve, ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

export function whenIdle(task, timeout = 1200) {
  if (typeof window === "undefined") return () => {}
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(task, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(task, 200)
  return () => window.clearTimeout(id)
}
