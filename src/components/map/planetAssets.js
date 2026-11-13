export const planetModelUrls = {
  moon: "/models/moon-fast.glb",
  mars: "/models/mars-fast.glb",
}

export function preloadPlanetModel(world) {
  const href = planetModelUrls[world]
  if (
    !href ||
    document.head.querySelector(`link[data-planet-model="${world}"]`)
  )
    return
  // Start downloading while the lazy Three.js module is still being loaded.
  // GLTFLoader can reuse this response instead of starting another download.
  const link = document.createElement("link")
  link.rel = "preload"
  link.as = "fetch"
  link.crossOrigin = "anonymous"
  link.href = href
  link.dataset.planetModel = world
  document.head.appendChild(link)
}
