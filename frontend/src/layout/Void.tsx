import { useEffect, useRef, useState } from 'react'
import { createScene } from '@/scene'
import type { SceneHandle, StageName } from '@/scene'

interface VoidProps {
  /** where the logo should be, the url owns this */
  stage: StageName
  /** fired once when the logo finishes its flight home */
  onDock?: () => void
}

export function Void({ stage, onDock }: VoidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<SceneHandle | null>(null)
  const onDockRef = useRef(onDock)
  const stageRef = useRef(stage)
  const [launched, setLaunched] = useState(stage !== 'hero')

  useEffect(() => {
    onDockRef.current = onDock
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /* built once for the life of the app, routing must never take the webgl
       context with it, so this effect has no dependencies on purpose */
    const scene = createScene(canvas, {
      stage: stageRef.current,
      onDock: () => onDockRef.current?.(),
      /* a css var rather than react state, so the html layer tracks the flight
         frame for frame without a rerender */
      onExit: (exit) => document.documentElement.style.setProperty('--exit', String(exit)),
    })
    if (!scene) return // no webgl, the css background stands in
    sceneRef.current = scene

    const onResize = () => scene.resize()
    const onLaunch = () => {
      scene.launch()
      setLaunched(true)
    }

    const onScroll = () => scene.setScroll(window.scrollY / window.innerHeight)

    const onVisibility = () => {
      if (!document.hidden) scene.wake()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'PageDown') onLaunch()
    }

    const onPointerMove = (e: PointerEvent) => {
      scene.setPointer(
        (e.clientX / window.innerWidth - 0.5) * -2,
        (e.clientY / window.innerHeight - 0.5) * -2,
      )
    }

    onScroll() // a reload can restore the page mid hero

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onLaunch, { passive: true })
    window.addEventListener('touchmove', onLaunch, { passive: true })
    window.addEventListener('pointerdown', onLaunch, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibility)

    const canDrift =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (canDrift) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onLaunch)
      window.removeEventListener('touchmove', onLaunch)
      window.removeEventListener('pointerdown', onLaunch)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      sceneRef.current = null
      scene.dispose()
    }
  }, [])

  /* the first render already opened on the right stage, only later url
     changes are a flight */
  useEffect(() => {
    if (stage === stageRef.current) return
    stageRef.current = stage
    sceneRef.current?.flyTo(stage)
  }, [stage])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 block h-dvh w-full"
      />

      <p
        className={`pointer-events-none fixed inset-x-0 top-[53svh] z-10 mx-auto px-pad text-center text-[clamp(16px,2vw,20px)] transition-opacity duration-500 ${launched ? 'opacity-0' : 'opacity-100'}`}>
        Spare room on your server, and an SSH session every time you want to open a holiday picture?
        <span className="mt-5 block text-ink-3">scroll..</span>
      </p>
    </>
  )
}
