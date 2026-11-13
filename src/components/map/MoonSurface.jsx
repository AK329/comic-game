import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { planetModelUrls } from "./planetAssets.js"

const MIN_DISTANCE = 1.35

function direction(node) {
  const latitude = THREE.MathUtils.degToRad(node.lat)
  const longitude = THREE.MathUtils.degToRad(node.lon)
  return new THREE.Vector3(
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    -Math.cos(latitude) * Math.sin(longitude),
  )
}

function addMissionTrail(globe, model, nodes) {
  const ordered = [...nodes].sort((a, b) => a.year - b.year)
  const samples = []
  const ray = new THREE.Raycaster()
  const identity = new THREE.Quaternion()
  const turn = new THREE.Quaternion()
  const interpolation = new THREE.Quaternion()
  for (let segment = 0; segment < ordered.length - 1; segment++) {
    const from = direction(ordered[segment])
    const to = direction(ordered[segment + 1])
    const steps = Math.max(2, Math.ceil(from.angleTo(to) / 0.043))
    turn.setFromUnitVectors(from, to)
    for (let i = 0; i < steps; i++) {
      const normal = from
        .clone()
        .applyQuaternion(
          interpolation.slerpQuaternions(identity, turn, i / steps),
        )
      ray.set(normal.clone().multiplyScalar(3), normal.clone().negate())
      const hit = ray.intersectObject(model, true)[0]
      samples.push({
        position: (hit ? hit.point : normal.clone()).addScaledVector(
          normal,
          0.014,
        ),
        progress: (segment + i / steps) / (ordered.length - 1),
      })
    }
  }
  if (!samples.length) return ordered
  // A single instanced draw call keeps the dotted path inexpensive on phones.
  // Real depth testing lets the Moon hide trail sections on its far side.
  const dots = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.011, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    samples.length,
  )
  const matrix = new THREE.Matrix4()
  const yellow = new THREE.Color("#ffd93b")
  const pink = new THREE.Color("#ff5f70")
  samples.forEach((sample, index) => {
    dots.setMatrixAt(
      index,
      matrix.makeTranslation(
        sample.position.x,
        sample.position.y,
        sample.position.z,
      ),
    )
    dots.setColorAt(index, yellow.clone().lerp(pink, sample.progress))
  })
  dots.name = "Chronological mission trail"
  dots.raycast = () => {} // The trail is decorative, not a mission hit target.
  dots.instanceMatrix.needsUpdate = true
  dots.instanceColor.needsUpdate = true
  globe.add(dots)
  return ordered
}

function disposeObject(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  root.traverse((object) => {
    if (object.isInstancedMesh) object.dispose()
    if (object.geometry) geometries.add(object.geometry)
    for (const material of [].concat(object.material || [])) {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value)
      })
    }
  })
  geometries.forEach((value) => value.dispose())
  textures.forEach((value) => value.dispose())
  materials.forEach((value) => value.dispose())
}

// Convert screen-space input back into the canvas's local axes, including the
// rotated/scaled phone book. Native pointer hit-testing still handles the labels.
function inputMatrix(element) {
  let matrix = new DOMMatrix()
  for (let parent = element; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent)
    if (style.transform !== "none")
      matrix = new DOMMatrix(style.transform).multiply(matrix)
    const zoom = parseFloat(style.zoom)
    if (zoom && zoom !== 1)
      matrix = new DOMMatrix().scale(zoom).multiply(matrix)
  }
  return matrix.inverse()
}

export default function MoonSurface({
  world = "moon",
  active,
  nodes,
  selected,
  command,
  copy,
  onSelect,
}) {
  const host = useRef(null)
  const labels = useRef({})
  const lines = useRef({})
  const years = useRef({})
  const labelSizes = useRef({})
  const engine = useRef(null)
  const latest = useRef({ active, nodes, onSelect })
  latest.current = { active, nodes, onSelect }
  const [status, setStatus] = useState("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const element = host.current
    const bookRoot = element.closest(".book-experience")
    const isBookMoving = () =>
      bookRoot &&
      (bookRoot.classList.contains("phase-opening") ||
        bookRoot.classList.contains("phase-closing") ||
        bookRoot.dataset.pageTurning === "true")
    let popupOpen = false
    const canAnimate = () =>
      latest.current.active &&
      !document.hidden &&
      !popupOpen &&
      !isBookMoving() &&
      (!bookRoot || bookRoot.classList.contains("phase-open"))
    const constrained =
      navigator.hardwareConcurrency <= 4 ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4)
    const pixelRatio = () => {
      const fitted = bookRoot?.classList.contains("is-mobile-open")
      const scale = fitted
        ? parseFloat(bookRoot.style.getPropertyValue("--spread-scale")) || 1
        : 1
      const ceiling = fitted
        ? constrained
          ? 0.9
          : 1.15
        : constrained
          ? 1
          : 1.5
      return Math.min(ceiling, Math.max(0.75, (devicePixelRatio || 1) * scale))
    }
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !constrained,
        alpha: false,
        powerPreference: constrained ? "low-power" : "high-performance",
      })
    } catch {
      setStatus("error")
      return
    }
    let disposed = false
    let frame = 0
    let ready = false
    let pendingModel = null
    let width = 1
    let height = 1
    let lastTime = 0
    let distance = 3.45
    let targetDistance = distance
    let focusing = null
    let dragging = false
    let moved = false
    let inverse = new DOMMatrix()
    let startPoint = null
    let pinchDistance = 0
    const pointers = new Map()
    const velocity = new THREE.Vector2()
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#020405")
    const globe = new THREE.Group()
    scene.add(globe)
    const camera = new THREE.PerspectiveCamera(43, 1, 0.05, 30)
    const viewDirection = direction(
      world === "mars" ? { lat: 15, lon: -40 } : { lat: -15, lon: -8 },
    )
    camera.position.copy(viewDirection).multiplyScalar(distance)
    camera.lookAt(0, 0, 0)
    scene.add(new THREE.AmbientLight(0xe6efff, 0.55))
    scene.add(new THREE.HemisphereLight(0xe6efff, 0x394454, 0.7))
    const sunlight = new THREE.DirectionalLight(0xfff7ea, 2.2)
    sunlight.position.set(-3, 4.5, 4)
    camera.add(sunlight)
    const fill = new THREE.DirectionalLight(0xdce8ff, 0.55)
    fill.position.set(3, -1, 3)
    camera.add(fill)
    scene.add(camera)
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
      camera.quaternion,
    )
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
      camera.quaternion,
    )
    const rotation = new THREE.Quaternion()
    const anchors = []
    renderer.setPixelRatio(pixelRatio())
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.setAttribute("aria-label", copy.canvas)
    renderer.domElement.setAttribute("role", "img")
    element.prepend(renderer.domElement)
    setStatus("loading")

    function rotate(dx, dy) {
      rotation.setFromAxisAngle(cameraUp, dx)
      globe.quaternion.premultiply(rotation)
      rotation.setFromAxisAngle(cameraRight, dy)
      globe.quaternion.premultiply(rotation)
    }
    function layoutLabels() {
      globe.updateMatrixWorld(true)
      const occupied = []
      const world = new THREE.Vector3()
      const normal = new THREE.Vector3()
      const toCamera = new THREE.Vector3()
      const projected = new THREE.Vector3()
      // Reserve the physical markers too, so another site's name cannot cover a year.
      for (const anchor of anchors) {
        world.copy(anchor.position).applyMatrix4(globe.matrixWorld)
        normal.copy(anchor.normal).applyQuaternion(globe.quaternion)
        if (normal.dot(toCamera.copy(camera.position).sub(world)) <= 0.08)
          continue
        projected.copy(world).project(camera)
        occupied.push({
          x: (projected.x * 0.5 + 0.5) * width - 29,
          y: (-projected.y * 0.5 + 0.5) * height - 29,
          w: 58,
          h: 62,
        })
      }
      for (const anchor of anchors) {
        const label = labels.current[anchor.node.id]
        const line = lines.current[anchor.node.id]
        const year = years.current[anchor.node.id]
        if (!label || !line || !year) continue
        world.copy(anchor.position).applyMatrix4(globe.matrixWorld)
        normal.copy(anchor.normal).applyQuaternion(globe.quaternion)
        toCamera.copy(camera.position).sub(world)
        projected.copy(world).project(camera)
        const x = (projected.x * 0.5 + 0.5) * width
        const y = (-projected.y * 0.5 + 0.5) * height
        const visible =
          normal.dot(toCamera) > 0.08 &&
          projected.z < 1 &&
          x > 12 &&
          x < width - 12 &&
          y > 22 &&
          y < height - 12
        label.style.visibility = visible ? "visible" : "hidden"
        line.style.visibility = visible ? "visible" : "hidden"
        year.style.visibility = visible ? "visible" : "hidden"
        year.tabIndex = visible ? 0 : -1
        year.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`
        if (!visible) continue
        const size = labelSizes.current[anchor.node.id]
        if (!size) continue
        const boxWidth = size.width
        const boxHeight = size.height
        let left = THREE.MathUtils.clamp(
          x - boxWidth / 2,
          8,
          width - boxWidth - 8,
        )
        let top = Math.max(8, y - 48 - boxHeight)
        // Nearby historical landing sites stay geographically accurate; only
        // their name boxes move to avoid collisions, with a leader to the site.
        for (let step = 0; step < 24; step++) {
          const overlap = occupied.some(
            (box) =>
              left < box.x + box.w + 5 &&
              left + boxWidth + 5 > box.x &&
              top < box.y + box.h + 5 &&
              top + boxHeight + 5 > box.y,
          )
          if (!overlap) break
          const row = Math.floor(step / 3)
          const direction = step % 3 === 0 ? 0 : step % 3 === 1 ? -1 : 1
          left = THREE.MathUtils.clamp(
            x - boxWidth / 2 + direction * Math.ceil((step + 1) / 3) * 44,
            8,
            width - boxWidth - 8,
          )
          top =
            row < 4
              ? Math.max(8, y - 48 - boxHeight - (row % 2) * (boxHeight + 8))
              : Math.min(
                  height - boxHeight - 52,
                  y + 34 + (row - 4) * (boxHeight + 8),
                )
        }
        occupied.push({ x: left, y: top, w: boxWidth, h: boxHeight })
        label.style.transform = `translate3d(${left}px,${top}px,0)`
        const a = left + boxWidth / 2 - x
        const b = top + boxHeight / 2 - y
        line.style.width = `${Math.hypot(a, b)}px`
        line.style.transform = `translate3d(${x}px,${y}px,0) rotate(${Math.atan2(b, a)}rad)`
      }
    }
    function draw(time = 0) {
      frame = 0
      if (disposed || !ready || !canAnimate()) return
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60
      lastTime = time
      if (focusing) {
        globe.quaternion.slerp(
          focusing,
          reduced.matches ? 1 : 1 - Math.exp(-delta * 7),
        )
        if (globe.quaternion.angleTo(focusing) < 0.002) focusing = null
      } else if (
        !dragging &&
        !reduced.matches &&
        velocity.lengthSq() > 0.000001
      ) {
        rotate(velocity.x * delta * 60, velocity.y * delta * 60)
        velocity.multiplyScalar(Math.pow(0.88, delta * 60))
      }
      distance = THREE.MathUtils.lerp(
        distance,
        targetDistance,
        reduced.matches ? 1 : 1 - Math.exp(-delta * 9),
      )
      camera.position.copy(viewDirection).multiplyScalar(distance)
      camera.updateMatrixWorld()
      layoutLabels()
      renderer.render(scene, camera)
      // Both planets share a spread: stop spending GPU time once they settle.
      if (
        focusing ||
        (!reduced.matches && velocity.lengthSq() > 0.000001) ||
        Math.abs(distance - targetDistance) > 0.0001
      )
        frame = requestAnimationFrame(draw)
    }
    function start() {
      if (!frame && ready && canAnimate()) {
        lastTime = 0
        frame = requestAnimationFrame(draw)
      }
    }
    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
    }
    function refresh() {
      if (canAnimate()) start()
      else if (
        ready &&
        !disposed &&
        latest.current.active &&
        !document.hidden &&
        !isBookMoving() &&
        !popupOpen &&
        bookRoot?.classList.contains("phase-closed")
      ) {
        // Prepare one real, still frame beneath the cover. Opening then moves
        // that existing surface without competing WebGL animation.
        camera.position.copy(viewDirection).multiplyScalar(distance)
        camera.updateMatrixWorld()
        layoutLabels()
        renderer.render(scene, camera)
      }
    }
    function resize() {
      // offset dimensions are not distorted by the mobile book's CSS scale/rotation.
      const nextWidth = element.offsetWidth
      const nextHeight = element.offsetHeight
      if (!nextWidth || !nextHeight) return
      const sizeChanged = width !== nextWidth || height !== nextHeight
      const ratio = pixelRatio()
      if (!sizeChanged && renderer.getPixelRatio() === ratio) return
      width = nextWidth
      height = nextHeight
      renderer.setPixelRatio(ratio)
      camera.aspect = width / height
      // Off-axis framing: a large upper hemisphere rises from the bottom,
      // rather than shrinking the entire globe into the middle of the page.
      camera.setViewOffset(width, height, 0, -height * 0.42, width, height)
      renderer.setSize(width, height, false)
      const radius = Math.max(width * 0.7, height * 0.82)
      const focalLength =
        height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
      if (sizeChanged)
        distance = targetDistance = Math.sqrt(1 + (focalLength / radius) ** 2)
      refresh()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
    function down(event) {
      if (event.button && event.pointerType === "mouse") return
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      start()
      renderer.domElement.setPointerCapture(event.pointerId)
      inverse = inputMatrix(renderer.domElement)
      dragging = true
      moved = false
      focusing = null
      velocity.set(0, 0)
      startPoint = { x: event.clientX, y: event.clientY }
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchDistance = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    function move(event) {
      const previous = pointers.get(event.pointerId)
      if (!previous) return
      start()
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const span = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchDistance > 0)
          targetDistance = THREE.MathUtils.clamp(
            (targetDistance * pinchDistance) / Math.max(span, 1),
            MIN_DISTANCE,
            6,
          )
        pinchDistance = span
        moved = true
        return
      }
      const dx = event.clientX - previous.x
      const dy = event.clientY - previous.y
      const localX = inverse.m11 * dx + inverse.m21 * dy
      const localY = inverse.m12 * dx + inverse.m22 * dy
      const speed = (Math.PI / Math.max(width, height)) * 0.9
      velocity.set(localX * speed, localY * speed)
      rotate(velocity.x, velocity.y)
      if (
        Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) >
        5
      )
        moved = true
    }
    function up(event) {
      const wasPointer = pointers.has(event.pointerId)
      pointers.delete(event.pointerId)
      if (!wasPointer) return
      dragging = pointers.size > 0
      start()
    }
    function wheel(event) {
      event.preventDefault()
      focusing = null
      targetDistance = THREE.MathUtils.clamp(
        targetDistance * Math.exp(event.deltaY * 0.001),
        MIN_DISTANCE,
        6,
      )
      start()
    }
    function visibility() {
      document.hidden ? stop() : updateActivity()
    }
    const canvas = renderer.domElement
    const stopBookGesture = (event) => event.stopPropagation()
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)
    canvas.addEventListener("wheel", wheel, { passive: false })
    const bookEvents = [
      "mousedown",
      "mousemove",
      "mouseup",
      "touchstart",
      "touchmove",
      "touchend",
    ]
    bookEvents.forEach((name) => canvas.addEventListener(name, stopBookGesture))
    document.addEventListener("visibilitychange", visibility)
    canvas.addEventListener("webglcontextlost", contextLost)
    function contextLost(event) {
      event.preventDefault()
      stop()
      setStatus("error")
    }
    engine.current = {
      start,
      stop,
      refresh,
      command(value) {
        velocity.set(0, 0)
        if (value.type === "reset") {
          focusing = new THREE.Quaternion()
          resize()
        } else if (value.type === "focus") {
          const node = latest.current.nodes.find((item) => item.id === value.id)
          if (node)
            focusing = new THREE.Quaternion().setFromUnitVectors(
              direction(node),
              // Bring the chosen site to the visible upper surface, not the
              // globe's center, which is intentionally below the page edge.
              viewDirection
                .clone()
                .multiplyScalar(0.954)
                .addScaledVector(cameraUp, 0.3)
                .normalize(),
            )
        } else {
          targetDistance = THREE.MathUtils.clamp(
            targetDistance * (value.type === "in" ? 0.86 : 1.16),
            MIN_DISTANCE,
            6,
          )
        }
        start()
      },
    }

    function prepareModel(gltf) {
      if (disposed) {
        disposeObject(gltf.scene)
        return
      }
      const bounds = new THREE.Box3().setFromObject(gltf.scene)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      const scale = 2 / Math.max(size.x, size.y, size.z)
      gltf.scene.scale.multiplyScalar(scale)
      gltf.scene.position.sub(center.multiplyScalar(scale))
      const resizedTextures = new Map()
      gltf.scene.traverse((object) => {
        if (!object.material) return
        const surfaceMaterials = [].concat(object.material).map((material) => {
          const original = material.map
          if (original?.image?.width > 2048) {
            if (!resizedTextures.has(original)) {
              const image = original.image
              const preview = document.createElement("canvas")
              preview.width = 2048
              preview.height = Math.round((image.height * 2048) / image.width)
              preview
                .getContext("2d", { willReadFrequently: true })
                .drawImage(image, 0, 0, preview.width, preview.height)
              const texture = original.clone()
              texture.source = new THREE.Source(preview)
              texture.needsUpdate = true
              resizedTextures.set(original, texture)
              original.dispose()
            }
            material.map = resizedTextures.get(original)
          }
          // Preserve the uploaded Mars texture's color; both worlds are matte.
          const surface = new THREE.MeshStandardMaterial({
            map: material.map,
            color: world === "mars" ? material.color : 0xd5d5d5,
            roughness: 1,
            metalness: 0,
            side: material.side,
          })
          if (surface.map) renderer.initTexture(surface.map)
          material.dispose()
          return surface
        })
        object.material = Array.isArray(object.material)
          ? surfaceMaterials
          : surfaceMaterials[0]
      })
      globe.add(gltf.scene)
      globe.updateMatrixWorld(true)
      const raycaster = new THREE.Raycaster()
      for (const node of latest.current.nodes) {
        const normal = direction(node)
        raycaster.set(normal.clone().multiplyScalar(3), normal.clone().negate())
        const hit = raycaster.intersectObject(gltf.scene, true)[0]
        const position = hit ? hit.point : normal.clone()
        anchors.push({
          node,
          position: position.clone().addScaledVector(normal, 0.018),
          normal,
        })
      }
      const chronological = addMissionTrail(
        globe,
        gltf.scene,
        latest.current.nodes,
      )
      canvas.setAttribute(
        "aria-description",
        chronological.map((node) => `${node.year}: ${node.name}`).join(" → "),
      )
      ready = true
      setStatus("ready")
      refresh()
    }
    function updateActivity() {
      popupOpen = !!document.querySelector('[role="dialog"][aria-modal="true"]')
      if (!canAnimate()) {
        stop()
        velocity.set(0, 0)
      }
      if (pendingModel && !isBookMoving()) {
        const gltf = pendingModel
        pendingModel = null
        prepareModel(gltf)
      }
      resize()
      refresh()
    }
    const activityObserver = new MutationObserver(updateActivity)
    if (bookRoot) {
      activityObserver.observe(bookRoot, {
        attributes: true,
        attributeFilter: ["class", "style", "data-page-turning"],
      })
      const plane = bookRoot.querySelector(".experience-plane")
      if (plane) activityObserver.observe(plane, { childList: true })
    }
    activityObserver.observe(document.body, { childList: true })
    new GLTFLoader().load(
      planetModelUrls[world],
      (gltf) => {
        if (!disposed && isBookMoving()) pendingModel = gltf
        else prepareModel(gltf)
      },
      undefined,
      () => {
        if (!disposed) setStatus("error")
      },
    )

    return () => {
      disposed = true
      engine.current = null
      stop()
      observer.disconnect()
      activityObserver.disconnect()
      if (pendingModel) disposeObject(pendingModel.scene)
      document.removeEventListener("visibilitychange", visibility)
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
      canvas.removeEventListener("wheel", wheel)
      bookEvents.forEach((name) =>
        canvas.removeEventListener(name, stopBookGesture),
      )
      canvas.removeEventListener("webglcontextlost", contextLost)
      disposeObject(scene)
      renderer.dispose()
      canvas.remove()
    }
  }, [attempt, world])

  useEffect(() => {
    active ? engine.current?.refresh() : engine.current?.stop()
  }, [active])
  useEffect(() => {
    if (status !== "ready") return
    // Cache layout dimensions outside the animation loop. Reading offsetWidth
    // between every label write previously forced repeated synchronous layouts.
    const measure = () => {
      for (const [id, label] of Object.entries(labels.current)) {
        if (label)
          labelSizes.current[id] = {
            width: label.offsetWidth,
            height: label.offsetHeight,
          }
      }
      engine.current?.refresh()
    }
    const observer = new ResizeObserver(measure)
    Object.values(labels.current).forEach((label) => {
      if (label) observer.observe(label)
    })
    measure()
    return () => observer.disconnect()
  }, [status])
  useEffect(() => {
    engine.current?.command(command)
  }, [command])

  useEffect(() => {
    const canvas = host.current?.querySelector("canvas")
    if (canvas) canvas.setAttribute("aria-label", copy.canvas)
  }, [copy.canvas, status])

  return (
    <div className="moon-surface" ref={host}>
      {status === "loading" && (
        <div className="moon-model-status" role="status">
          {copy.loading}
        </div>
      )}
      {status === "ready" && (
        <div className="moon-label-layer">
          {nodes.map((node) => (
            <span
              key={`line-${node.id}`}
              ref={(element) => {
                lines.current[node.id] = element
              }}
              className="moon-site-leader"
            />
          ))}
          {nodes.map((node) => (
            <button
              key={`year-${node.id}`}
              type="button"
              ref={(element) => {
                years.current[node.id] = element
              }}
              className="moon-site-year"
              data-availability={node.missionId ? "available" : "coming-soon"}
              aria-label={`${node.name}, ${node.year}`}
              aria-haspopup="dialog"
              onClick={(event) => {
                event.stopPropagation()
                latest.current.onSelect(node, event)
              }}
            >
              {node.year}
            </button>
          ))}
          {nodes.map((node) => (
            <span
              key={node.id}
              ref={(element) => {
                labels.current[node.id] = element
              }}
              className={`moon-site-label ${
                selected === node.id ? "is-selected" : ""
              } ${node.state} ${
                node.missionId ? "mission-available" : "mission-coming-soon"
              }`}
              aria-hidden="true"
            >
              {node.name}
            </span>
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="moon-model-error" role="status">
          <p>{copy.unavailable}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {copy.retry}
          </button>
          {nodes.map((node) => (
            <button
              type="button"
              key={node.id}
              onClick={(event) => onSelect(node, event)}
            >
              {node.name} · {node.year}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
