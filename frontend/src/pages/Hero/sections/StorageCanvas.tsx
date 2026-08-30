import { useEffect, useRef } from 'react'
import {
  GROW,
  MAX_PIXELS,
  SPAWN_MS,
  START,
  TOTAL,
  createMotes,
  drawBar,
  drawLaptop,
  drawMotes,
  layoutFor,
  palette,
  spawn,
  stepPixels,
} from './draw'
import type { Mote, Pixel } from './draw'

export function StorageCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const readout = useRef<HTMLElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ink = palette()

    let w = 0
    let h = 0
    let motes: Mote[] = []
    const pixels: Pixel[] = []
    let glow = 0
    let last = performance.now()
    let since = 0
    let frame = 0
    let used = START

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      motes = createMotes(w, h)
    }

    const draw = (now: number) => {
      const dt = Math.min(now - last, 48)
      last = now
      const l = layoutFor(w, h)

      c.clearRect(0, 0, w, h)
      drawMotes(c, motes, ink, now)

      if (!reduced) {
        since += dt
        while (since > SPAWN_MS && pixels.length < MAX_PIXELS) {
          since -= SPAWN_MS
          pixels.push(spawn(l))
          glow = Math.min(glow + 0.18, 1)

          used += GROW
          if (used >= TOTAL) used = START

          const shown = used.toFixed(2)
          if (readout.current && readout.current.textContent !== shown) {
            readout.current.textContent = shown
          }
        }
      }

      stepPixels(c, pixels, ink, dt)
      glow = Math.max(0, glow - dt * 0.0018)

      drawBar(c, l, ink, used)
      drawLaptop(c, l, ink, glow)

      frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <figure className="relative w-full">
      <canvas ref={ref} aria-hidden="true" className="block h-[min(24rem,38svh)] w-full" />

      <figcaption className="mt-2 text-center text-[15px] tabular-nums text-ink-3">
        <b ref={readout} className="font-normal text-ink-2">
          {START.toFixed(2)}
        </b>{' '}
        / {TOTAL} GB
      </figcaption>
    </figure>
  )
}
