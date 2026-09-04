import {
  Color,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three'
import { solveCamera } from './motion/camera'
import {
  ANCHOR,
  AUTH_DOWN,
  AUTH_FWD,
  AUTH_DUR,
  DUR,
  ENV_BOT,
  ENV_TOP,
  FOV,
  HALF_W,
  STAGE,
  TILT_PITCH,
  TILT_YAW,
} from './config'
import type { Stage, StageName } from './config'
import { SKY_FRAG, SKY_VERT } from './shaders/env'
import { poseOf, stageAt } from './motion/flight'
import { loadLogo } from './geometry/decode'
import { createLogoMaterial } from './shaders/logo'
import type { SceneUniforms } from './types'

export interface SceneHandle {
  resize(): void
  /** release the logo, the opening flight runs once */
  launch(): void
  /** fly to a stage from wherever the scene is right now */
  flyTo(name: StageName): void
  /** pointer in -1..1, already inverted */
  setPointer(x: number, y: number): void
  /** how far the page is scrolled through the hero, 0 at the top and 1 past it */
  setScroll(p: number): void
  /** redraw after something outside changed */
  wake(): void
  dispose(): void
}

export interface SceneOptions {
  /** stage the scene opens on, hero waits at the opening for launch */
  stage?: StageName
  onDock?: () => void
  /** every frame of a flight, so the html layer can move on the same clock */
  onExit?: (exit: number) => void
}

export function createScene(
  canvas: HTMLCanvasElement,
  options: SceneOptions = {},
): SceneHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  } catch {
    return null
  }

  const uniforms: SceneUniforms = {
    uRes: { value: new Vector2(1, 1) },
    uEnvTop: { value: new Color(ENV_TOP) },
    uEnvBot: { value: new Color(ENV_BOT) },
    uHot: { value: new Vector2(0.5, 1) },
    uLogo: { value: new Vector4(0, 0, 1, 0) },
    uCam: { value: new Vector3() },
    uRoom: { value: 1 },
    uHalfW: { value: HALF_W },
    uHalfH: { value: 0.1 },
    uDepth: { value: 1 },
    uC: { value: ANCHOR.map((a) => new Color(a.c)) },
    uP: { value: ANCHOR.map((a) => new Vector2(a.p[0], a.p[1])) },
    uR: { value: ANCHOR.map((a) => a.r) },
  }

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)

  const skyGeometry = new PlaneGeometry(2, 2)
  const skyMaterial = new ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
  })
  const sky = new Mesh(skyGeometry, skyMaterial)
  sky.frustumCulled = false
  sky.renderOrder = -1
  scene.add(sky)

  /* yaw/pitch live on the pivot, so the mesh's own axes stay untouched */
  const pivot = new Object3D()
  scene.add(pivot)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let vw = 0
  let vh = 0
  let dpr = 1
  let depth = 1
  let dirty = true
  let raf: number | null = null
  let mx = 0
  let my = 0
  let tx = 0
  let ty = 0
  let sTarget = 0
  let sNow = 0
  /* 0 until the mesh arrives, nothing to cast a contact shadow before that */
  let shadow = 0

  /* flight: u runs 0 (at `from`) to 1 (settled on `to`) */
  const initial: StageName = options.stage ?? 'hero'
  const opensOnHero = initial === 'hero'
  let toName: StageName = opensOnHero ? 'opening' : initial
  let from: Stage = STAGE[toName]
  let to: Stage = from
  let current: Stage = from
  let u = 1
  let dur = DUR
  let t0 = 0
  /* a direct load of login is already past the opening */
  let launched = !opensOnHero
  let dockedFired = false

  function fireDock() {
    if (dockedFired) return
    dockedFired = true
    options.onDock?.()
  }

  function applyStage() {
    const pose = poseOf(current, vw, vh)
    const c = solveCamera(pose, vw, vh, depth)
    const exit = current.exit + (1 - current.exit) * sNow

    /* one straight line, forward into the wordmark and a little under it. the
       pose is what the lens starts from, exit is how far along it has travelled */
    const travel = exit * c.z
    camera.position.set(c.x, c.y - AUTH_DOWN * travel, c.z - AUTH_FWD * travel)
    camera.near = c.near
    camera.far = c.far
    camera.updateProjectionMatrix()
    uniforms.uCam.value.copy(camera.position)
    uniforms.uRoom.value = current.room
    options.onExit?.(exit)
    uniforms.uLogo.value.set(
      pose.cx * dpr,
      (vh - pose.cy) * dpr,
      pose.w * dpr,
      // the shadow is pinned to the docked pose, so it goes as the lens leaves
      shadow * current.room * (1 - exit),
    )
  }

  /** always departs from the pose on screen, so a mid air turn never snaps */
  function flyTo(name: StageName) {
    if (name === toName) return // already there, or already on the way

    const leavingAuth = toName === 'auth'
    launched = true
    from = current
    toName = name
    to = STAGE[name]
    dur = name === 'auth' || leavingAuth ? AUTH_DUR : DUR
    u = reduced ? 1 : 0
    t0 = performance.now()

    if (u >= 1) {
      current = to
      applyStage()
      if (name === 'hero') fireDock()
    }
    wake()
  }

  function resize() {
    vw = window.innerWidth
    vh = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(vw, vh, false) // false: CSS owns the element size
    camera.aspect = vw / vh
    uniforms.uRes.value.set(vw * dpr, vh * dpr)
    applyStage()
    wake()
  }

  function queue() {
    if (raf === null && !document.hidden) raf = requestAnimationFrame(frame)
  }

  function wake() {
    dirty = true
    queue()
  }

  function frame() {
    raf = null

    let moved = false

    if (u < 1) {
      u = Math.min(1, (performance.now() - t0) / dur)
      current = stageAt(from, to, u)
      moved = true
      if (u >= 1 && toName === 'hero') fireDock()
    }

    if (sNow !== sTarget) {
      const d = sTarget - sNow
      sNow = Math.abs(d) < 0.0005 ? sTarget : sNow + d * 0.12
      moved = true
    }

    if (moved) {
      applyStage()
      dirty = true
    }

    mx += (tx - mx) * 0.07
    my += (ty - my) * 0.07
    pivot.rotation.y = mx * TILT_YAW
    pivot.rotation.x = my * TILT_PITCH
    uniforms.uHot.value.set(0.5 * (vw / vh) + mx * 0.09, 1 + my * 0.06)
    if (Math.abs(tx - mx) > 0.0015 || Math.abs(ty - my) > 0.0015) dirty = true

    renderer.render(scene, camera)
    if (dirty) {
      dirty = false
      queue()
    }
  }

  function launch() {
    if (launched) return
    flyTo('hero')
  }

  function setPointer(x: number, y: number) {
    tx = x
    ty = y
    wake()
  }

  function setScroll(p: number) {
    const next = Math.min(1, Math.max(0, p))
    if (next === sTarget) return
    sTarget = next
    wake()
  }

  const controller = new AbortController()
  let logo: Mesh | null = null
  let logoMaterial: ShaderMaterial | null = null

  loadLogo(undefined, controller.signal)
    .then(({ geometry, halfH, depth: d }) => {
      depth = d
      uniforms.uHalfH.value = halfH
      uniforms.uDepth.value = d
      shadow = 1 // the contact shadow has something to sit under
      logoMaterial = createLogoMaterial(uniforms)
      logo = new Mesh(geometry, logoMaterial)
      pivot.add(logo)
      resize() // re-place now that the real height and depth are known
    })
    .catch((err: unknown) => {
      if (!controller.signal.aborted) console.error(err)
    })

  function dispose() {
    controller.abort()
    if (raf !== null) cancelAnimationFrame(raf)
    logo?.geometry.dispose()
    logoMaterial?.dispose()
    skyGeometry.dispose()
    skyMaterial.dispose()
    renderer.dispose()
  }

  resize()

  // after resize, solveCamera divides by the viewport which is 0 until then
  if (reduced && opensOnHero) flyTo('hero')

  return { resize, launch, flyTo, setPointer, setScroll, wake, dispose }
}
