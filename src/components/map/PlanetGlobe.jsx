import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import moonColor from "../../assets/map/moonColor.webp"
import moonBump from "../../assets/map/moonBump.webp"
import marsColor from "../../assets/map/marsColor.webp"
import marsBump from "../../assets/map/marsBump.webp"

const imageUrl = (image) => (typeof image === "string" ? image : image.src)
function sitePosition(node, radius = 1.025) {
  const latitude = THREE.MathUtils.degToRad(node.lat)
  const longitude = THREE.MathUtils.degToRad(node.lon)
  return new THREE.Vector3(
    Math.cos(latitude) * Math.cos(longitude) * radius,
    Math.sin(latitude) * radius,
    -Math.cos(latitude) * Math.sin(longitude) * radius,
  )
}

export default function PlanetGlobe({
  world,
  nodes,
  selected,
  spinning,
  onSelect,
  onInteract,
  copy,
}) {
  const container = useRef(null)
  const controller = useRef(null)
  const markers = useRef({})
  const callbacks = useRef({ onInteract })
  callbacks.current = { onInteract }
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const host = container.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      setUnavailable(true)
      return
    }
    setUnavailable(false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    host.prepend(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
    const home = nodes.find((node) => node.state === "current") || nodes[0]
    camera.position.copy(sitePosition(home, 3.65))
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2.9
    controls.maxDistance = 4.5
    controls.autoRotateSpeed = 0.45
    controls.rotateSpeed = 0.6
    const interact = () => callbacks.current.onInteract()
    controls.addEventListener("start", interact)
    const loader = new THREE.TextureLoader()
    const color = loader.load(
      imageUrl(world === "moon" ? moonColor : marsColor),
    )
    const bump = loader.load(imageUrl(world === "moon" ? moonBump : marsBump))
    color.colorSpace = THREE.SRGBColorSpace
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 48),
      new THREE.MeshStandardMaterial({
        map: color,
        bumpMap: bump,
        bumpScale: 0.035,
        roughness: 0.95,
      }),
    )
    scene.add(globe)
    scene.add(new THREE.AmbientLight(0xffffff, 1.3))
    const sunlight = new THREE.DirectionalLight(0xfff2df, 2.5)
    sunlight.position.set(4, 3, 5)
    camera.add(sunlight)
    scene.add(camera)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.035, 48, 32),
      new THREE.MeshBasicMaterial({
        color: world === "moon" ? 0x7dbbff : 0xff8b51,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.16,
      }),
    )
    scene.add(atmosphere)
    const positions = nodes.map((node) => sitePosition(node))
    const currentPosition = new THREE.Vector3()
    const direction = new THREE.Vector3()
    let frame
    let contextLost = false
    const bookRoot = document.querySelector(".book-experience")
    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    function draw() {
      if (contextLost) return
      frame = requestAnimationFrame(draw)
      if (
        bookRoot?.dataset.pageTurning === "true" ||
        bookRoot?.classList.contains("phase-opening") ||
        bookRoot?.classList.contains("phase-closing")
      )
        return
      controls.update()
      direction.copy(camera.position).normalize()
      positions.forEach((position, index) => {
        const marker = markers.current[nodes[index].id]
        if (!marker) return
        const visible = position.clone().normalize().dot(direction) > 0.18
        currentPosition.copy(position).project(camera)
        marker.style.left = `${(currentPosition.x * 0.5 + 0.5) * 100}%`
        marker.style.top = `${(-currentPosition.y * 0.5 + 0.5) * 100}%`
        marker.style.visibility = visible ? "visible" : "hidden"
        marker.tabIndex = visible ? 0 : -1
      })
      renderer.render(scene, camera)
    }
    const loseContext = (event) => {
      event.preventDefault()
      contextLost = true
      cancelAnimationFrame(frame)
      setUnavailable(true)
    }
    renderer.domElement.addEventListener("webglcontextlost", loseContext)
    controller.current = { camera, controls }
    draw()
    return () => {
      controller.current = null
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.removeEventListener("start", interact)
      controls.dispose()
      renderer.domElement.removeEventListener("webglcontextlost", loseContext)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (object.material) object.material.dispose()
      })
      color.dispose()
      bump.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [world])

  useEffect(() => {
    if (controller.current) controller.current.controls.autoRotate = spinning
  }, [spinning, world])
  useEffect(() => {
    const node = nodes.find((candidate) => candidate.id === selected)
    if (node && controller.current) {
      const { camera, controls } = controller.current
      camera.position.copy(sitePosition(node, 3.65))
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [selected, world])

  return (
    <div className="atlas-globe" ref={container}>
      {unavailable ? (
        <div
          className={`atlas-planet-fallback atlas-planet-fallback-${world}`}
          role="img"
          aria-label={copy.fallback}
        />
      ) : (
        nodes.map((node) => (
          <button
            key={node.id}
            ref={(element) => {
              markers.current[node.id] = element
            }}
            type="button"
            className={`atlas-beacon ${node.state} ${
              selected === node.id ? "is-selected" : ""
            }`}
            aria-label={node.name}
            title={node.name}
            onClick={() => onSelect(node)}
          >
            <span />
          </button>
        ))
      )}
      {unavailable && (
        <span className="atlas-fallback-note">{copy.fallback}</span>
      )}
    </div>
  )
}
