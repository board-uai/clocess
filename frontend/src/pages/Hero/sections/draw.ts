export const START = 0.4
export const TOTAL = 5
export const GROW = 0.006

export const MAX_PIXELS = 120
export const SPAWN_MS = 90

const DASH = 10
const GAP = 7
const MOTES = 60

export interface Palette {
  ink: string
  ink2: string
  ink3: string
}

export interface Pixel {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  ttl: number
  size: number
}

export interface Mote {
  x: number
  y: number
  size: number
  base: number
  phase: number
}

export interface Layout {
  cx: number
  deviceY: number
  barX: number
  barY: number
  barW: number
  scale: number
}

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function palette(): Palette {
  const s = getComputedStyle(document.documentElement)
  const pick = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback
  return {
    ink: pick('--ink', '#F6F7F7'),
    ink2: pick('--ink-2', '#9BA2AA'),
    ink3: pick('--ink-3', '#5E656E'),
  }
}

export function layoutFor(w: number, h: number): Layout {
  const barW = Math.min(w * 0.24, 320)
  return {
    cx: w / 2,
    deviceY: h * 0.42,
    barW,
    barX: (w - barW) / 2,
    barY: h * 0.86,
    scale: Math.min(1, w / 900),
  }
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

export function createMotes(w: number, h: number): Mote[] {
  return Array.from({ length: MOTES }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() < 0.85 ? 1 : 1.8,
    base: 0.05 + Math.random() * 0.13,
    phase: Math.random() * Math.PI * 2,
  }))
}

export function drawMotes(c: CanvasRenderingContext2D, motes: Mote[], p: Palette, now: number) {
  for (const m of motes) {
    c.fillStyle = rgba(p.ink, m.base * (0.55 + 0.45 * Math.sin(now / 1400 + m.phase)))
    c.fillRect(m.x, m.y, m.size, m.size)
  }
}

/** leaves through one side of the screen, out sideways, never to return */
export function spawn(l: Layout): Pixel {
  const w = 186 * l.scale
  const h = 118 * l.scale
  const dir = Math.random() < 0.5 ? -1 : 1

  /* fans about 25 degrees off level, so the stream reads horizontal */
  const tilt = (Math.random() - 0.5) * 0.9
  const speed = 0.018 + Math.random() * 0.03

  return {
    x: l.cx + dir * Math.random() * w * 0.4,
    y: l.deviceY + (Math.random() - 0.5) * h * 0.6,
    vx: Math.cos(tilt) * speed * dir,
    vy: Math.sin(tilt) * speed,
    age: 0,
    ttl: 2600 + Math.random() * 2600,
    size: 1.2 + Math.random() * 1.7,
  }
}

export function stepPixels(
  c: CanvasRenderingContext2D,
  pixels: Pixel[],
  p: Palette,
  dt: number,
) {
  for (let i = pixels.length - 1; i >= 0; i--) {
    const pixel = pixels[i]
    pixel.age += dt

    if (pixel.age >= pixel.ttl) {
      pixels.splice(i, 1)
      continue
    }

    pixel.x += pixel.vx * dt
    pixel.y += pixel.vy * dt

    const t = pixel.age / pixel.ttl
    const a = Math.min(pixel.age / 220, 1) * Math.min((1 - t) / 0.4, 1)
    c.fillStyle = rgba(p.ink, a * 0.95)
    c.fillRect(pixel.x, pixel.y, pixel.size, pixel.size)
  }
}

export function drawBar(c: CanvasRenderingContext2D, l: Layout, p: Palette, used: number) {
  const filled = l.barW * (used / TOTAL)

  c.lineWidth = 2.5
  c.lineCap = 'butt'
  c.setLineDash([DASH, GAP])

  c.beginPath()
  c.moveTo(l.barX, l.barY)
  c.lineTo(l.barX + l.barW, l.barY)
  c.strokeStyle = rgba(p.ink3, 0.34)
  c.stroke()

  c.beginPath()
  c.moveTo(l.barX, l.barY)
  c.lineTo(l.barX + filled, l.barY)
  c.strokeStyle = rgba(p.ink, 0.85)
  c.stroke()

  c.setLineDash([])
}

export function drawLaptop(
  c: CanvasRenderingContext2D,
  l: Layout,
  p: Palette,
  glow: number,
) {
  const x = l.cx
  const y = l.deviceY
  const s = l.scale
  const w = 186 * s
  const h = 118 * s

  c.lineWidth = 1.5
  c.strokeStyle = rgba(p.ink2, 1)
  roundRect(c, x - w / 2, y - h / 2, w, h, 8 * s)
  c.stroke()

  roundRect(c, x - w / 2 + 9 * s, y - h / 2 + 9 * s, w - 18 * s, h - 18 * s, 3 * s)
  c.fillStyle = rgba(p.ink, 0.1 + glow * 0.26)
  c.fill()
  c.strokeStyle = rgba(p.ink2, 0.8)
  c.lineWidth = 1
  c.stroke()

  const baseY = y + h / 2 + 12 * s
  c.beginPath()
  c.moveTo(x - w / 2 - 20 * s, baseY)
  c.lineTo(x + w / 2 + 20 * s, baseY)
  c.strokeStyle = rgba(p.ink2, 1)
  c.lineWidth = 1.5
  c.stroke()

  c.beginPath()
  c.moveTo(x - w / 2, y + h / 2)
  c.lineTo(x - w / 2 - 20 * s, baseY)
  c.moveTo(x + w / 2, y + h / 2)
  c.lineTo(x + w / 2 + 20 * s, baseY)
  c.strokeStyle = rgba(p.ink2, 0.85)
  c.stroke()
}
