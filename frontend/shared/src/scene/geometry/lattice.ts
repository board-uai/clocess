import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import { FILL_DIR, GLOW, KEY_DIR, LATTICE } from '../config'
import { ENV } from '../shaders/env'
import type { SceneUniforms } from '../types'

export interface LatticeHandle {
  group: Group
  /** members placed — one draw call per tone actually used */
  count: number
  sway(now: number): void
  dispose(): void
}

/** one member: where its centre sits and how the unit cube stretches to fill it */
interface Member {
  pos: [number, number, number]
  scale: [number, number, number]
}

const LATTICE_VERT = `
varying vec3 vN; varying vec3 vW;

void main(){
  vN = normalize(normalMatrix * normal);

  /* every member is an axis-aligned stretch of the same cube, so the instance
     matrix carries no rotation and the face normals come through untouched */
#ifdef USE_INSTANCING
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
#else
  vec4 wp = modelMatrix * vec4(position, 1.0);
#endif

  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

/**
 * Same two flat tones as the columns, plus the one thing the structure needs
 * that they did not: distance. Without the fade the far planes stack into a
 * solid mat of lines; with it they thin into the room and the scaffold reads as
 * carrying on past where it actually stops.
 */
const LATTICE_FRAG = `
uniform vec3 uCam; uniform vec3 uColor; uniform vec3 uDark; uniform vec2 uFade;
uniform vec3 uLightAt; uniform vec3 uLightCol; uniform vec2 uLight;
uniform vec2 uClearNav;   // how deep the nav band reaches, and its soft edge, px
uniform vec2 uClearSides; // where the middle stops being cleared, and resumes
uniform vec2 uClearAmt;   // how much each takes away — either at 0 turns it off
uniform float uHero;      // ENV has the rest of the room, but not this one
varying vec3 vN; varying vec3 vW;
${ENV}

void main(){
  vec3 Ng = normalize(vN);
  vec3 V = normalize(uCam - vW);
  vec3 N = dot(Ng, V) < 0.0 ? -Ng : Ng;

  float key  = max(dot(N, ${KEY_DIR}), 0.0);
  float fill = max(dot(N, ${FILL_DIR}), 0.0);

  float shade = smoothstep(0.35, 0.65, 0.85 * key + 0.35 * fill);
  vec3 col = mix(uDark, uColor, shade);

  vec3 room = envAt(gl_FragCoord.xy);

  // into the room with distance, so the back of it has no edge to see
  float away = smoothstep(uFade.x, uFade.y, length(uCam - vW));
  col = mix(col, room, away);

  /* the deep light, added after the fade rather than before it. the source sits
     where the haze is thickest, so folding it in first would dissolve almost
     all of it — light carries through the murk, it does not get averaged into
     it. the floor keeps edge-on members catching something too. */
  vec3 toLight = uLightAt - vW;
  float reach = length(toLight);
  float drop = max(0.0, 1.0 - reach / uLight.x);
  float lambert = max(dot(N, toLight / max(reach, 1e-4)), 0.0);
  col += uLightCol * uLight.y * drop * drop * (0.25 + 0.75 * lambert);

  /* and then it gets out of the way. the band under the nav, an area around the
     wordmark that reaches down over the line beneath it, and the whole thing
     once the hero has been scrolled past. all measured on the screen, so it
     holds at any viewport and follows the wordmark as it flies. */
  float fromTop = uRes.y - gl_FragCoord.y;
  float nav = (1.0 - smoothstep(uClearNav.x, uClearNav.x + uClearNav.y, fromTop)) * uClearAmt.x;

  /* out from the centre line, so the structure holds the two sides and lets go
     of the middle. no vertical term — it runs the full height on both sides */
  float fromMid = abs(gl_FragCoord.x / uRes.x - 0.5) * 2.0;
  float middle = (1.0 - smoothstep(uClearSides.x, uClearSides.y, fromMid)) * uClearAmt.y;

  float hide = max(max(nav, middle), 1.0 - uHero);

  /* a member cleared away has to stop existing, not just stop being seen. left
     alive it still writes depth, and every one of them punches its own shape
     out of whatever stands behind — which is what put beam-shaped holes in the
     runs crossing the middle. the threshold is high enough that only members
     already down to a few percent of themselves are dropped. */
  if (hide > 0.94) discard;

  col = mix(col, room, hide);

  gl_FragColor = vec4(col * uRoom, 1.0);
}`

/** grid line positions from -half to +half, always landing on 0 */
function lines(half: number, cell: number): number[] {
  const n = Math.floor(half / cell)
  const out: number[] = []
  for (let i = -n; i <= n; i++) out.push(i * cell)
  return out
}

/** deterministic 0..1 from a handful of integers — same structure every load */
function hash(a: number, b: number, c: number, d: number): number {
  let h = 2166136261
  for (const v of [a, b, c, d]) {
    h = Math.imul(h ^ (v + 0x9e3779b9), 0x85ebca6b)
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  }
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** is this member gone: inside a hole, chewed off its edge, or just missing */
function missing(pos: [number, number, number], roll: number): boolean {
  for (const v of LATTICE.voids) {
    // chebyshev, so the hole has flat faces and corners like the cells do
    const d = Math.max(Math.abs(pos[0] - v.x), Math.abs(pos[1] - v.y), Math.abs(pos[2] - v.z))
    if (d < v.r) return true

    const out = (d - v.r) / (v.r * LATTICE.fray)
    if (out < 1 && roll < (1 - out) * LATTICE.frayBite) return true
  }
  return roll < LATTICE.gaps
}

function build(): Member[][] {
  const { cell, spanX, spanY, front, back, thick, blueEvery, limeEvery } = LATTICE

  const xs = lines(spanX, cell)
  const ys = lines(spanY, cell)

  const zs: number[] = []
  for (let z = front; z >= back; z -= cell) zs.push(z)

  /* one piece per cell edge rather than one bar end to end. that is the whole
     trick: a full-width member can only be there or not, and losing one takes
     a line right across the frame. cut per cell, the structure can lose a
     handful of pieces anywhere and just look broken. the overlap fills the
     corners where three of them meet. */
  const seg = cell + thick

  const members: Member[] = []
  const mid = (a: number, b: number) => (a + b) / 2

  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length; j++) for (let k = 0; k < zs.length; k++) {
    const pos: [number, number, number] = [mid(xs[i], xs[i + 1]), ys[j], zs[k]]
    if (!missing(pos, hash(i, j, k, 1))) members.push({ pos, scale: [seg, thick, thick] })
  }

  for (let i = 0; i < xs.length; i++) for (let j = 0; j < ys.length - 1; j++) for (let k = 0; k < zs.length; k++) {
    const pos: [number, number, number] = [xs[i], mid(ys[j], ys[j + 1]), zs[k]]
    if (!missing(pos, hash(i, j, k, 2))) members.push({ pos, scale: [thick, seg, thick] })
  }

  for (let i = 0; i < xs.length; i++) for (let j = 0; j < ys.length; j++) for (let k = 0; k < zs.length - 1; k++) {
    const pos: [number, number, number] = [xs[i], ys[j], mid(zs[k], zs[k + 1])]
    if (!missing(pos, hash(i, j, k, 3))) members.push({ pos, scale: [thick, thick, seg] })
  }

  /* a fixed rule rather than a random one, so the structure comes out the same
     on every load. either count at 0 means that accent is off entirely, and an
     empty group never becomes a mesh — all-white is a single draw call */
  const groups: Member[][] = [[], [], []]
  members.forEach((m, i) => {
    const blue = blueEvery > 0 && i % blueEvery === 0
    const lime = limeEvery > 0 && i % limeEvery === 0
    groups[blue ? 1 : lime ? 2 : 0].push(m)
  })
  return groups
}

/**
 * One run walked out into its legs. Each leg overlaps the next by a whole
 * thickness, so the corners fill in solid rather than leaving a notch where two
 * boxes meet at right angles.
 */
function walk(run: (typeof LATTICE.runs)[number]): Member[] {
  const { thick } = LATTICE
  const at = [...run.from] as [number, number, number]
  const legs: Member[] = []

  for (const [axis, dist] of run.moves) {
    const k = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    const pos = [...at] as [number, number, number]
    pos[k] += dist / 2

    const scale: [number, number, number] = [thick, thick, thick]
    scale[k] = Math.abs(dist) + thick

    legs.push({ pos, scale })
    at[k] += dist
  }

  return legs
}

/**
 * The scaffold behind the wordmark. One InstancedMesh per tone in use, over a
 * single unit cube, so hundreds of members cost a draw call each and one shared
 * buffer. Nothing here is placed by hand; it all falls out of LATTICE.
 */
export function createLattice(uniforms: SceneUniforms): LatticeHandle {
  const group = new Group()

  const geometry = new BoxGeometry(1, 1, 1).toNonIndexed()
  geometry.computeVertexNormals()

  const tones: [string, string][] = [
    [LATTICE.color, LATTICE.dark],
    [LATTICE.blue, LATTICE.blueDark],
    [LATTICE.lime, LATTICE.limeDark],
  ]

  const materials: ShaderMaterial[] = []
  const meshes: InstancedMesh[] = []
  const matrix = new Matrix4()
  let count = 0

  /** sides: how much of the middle clearance this material obeys. fade: how far
      off it dissolves, which the deep runs need to be told separately */
  function surface(lit: string, dark: string, sides: number, fade = LATTICE.fade) {
    const material = new ShaderMaterial({
      uniforms: {
        ...uniforms,
        uColor: { value: new Color(lit) },
        uDark: { value: new Color(dark) },
        uFade: { value: new Vector2(...fade) },
        uLightAt: { value: new Vector3(...GLOW.at) },
        uLightCol: { value: new Color(GLOW.color) },
        uLight: { value: new Vector2(GLOW.reach, GLOW.power) },
        uClearNav: { value: new Vector2(LATTICE.clear.nav, LATTICE.clear.navFade) },
        uClearSides: { value: new Vector2(LATTICE.clear.inner, LATTICE.clear.outer) },
        uClearAmt: { value: new Vector2(LATTICE.clear.navAmount, sides) },
      },
      vertexShader: LATTICE_VERT,
      fragmentShader: LATTICE_FRAG,
    })
    materials.push(material)
    return material
  }

  function stand(members: Member[], material: ShaderMaterial) {
    const mesh = new InstancedMesh(geometry, material, members.length)
    members.forEach((m, i) => {
      matrix.makeScale(...m.scale)
      matrix.setPosition(...m.pos)
      mesh.setMatrixAt(i, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    // it spans the whole room and never moves far, culling it per-frame is waste
    mesh.frustumCulled = false
    meshes.push(mesh)
    group.add(mesh)
    count += members.length
  }

  build().forEach((members, i) => {
    if (members.length) stand(members, surface(tones[i][0], tones[i][1], LATTICE.clear.sidesAmount))
  })

  /* the crossings, on their own material because they are the one thing that
     has to survive the middle being cleared away */
  stand(LATTICE.runs.flatMap(walk), surface(LATTICE.color, LATTICE.dark, 0, LATTICE.runFade))

  return {
    group,
    count,

    sway(now) {
      const t = (now / 1000) * ((Math.PI * 2) / LATTICE.period)
      /* the whole structure breathes as one — hundreds of separate phases would
         read as noise and cost a matrix rewrite every frame */
      group.position.set(
        Math.sin(t) * LATTICE.sway,
        Math.sin(t * 0.68) * LATTICE.sway * 0.6,
        0,
      )
    },

    dispose() {
      geometry.dispose()
      for (const material of materials) material.dispose()
      for (const mesh of meshes) mesh.dispose()
    },
  }
}
