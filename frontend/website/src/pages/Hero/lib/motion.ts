import { useEffect, useRef, useState } from 'react'
import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from 'react'

/**
 * How the sections move: the timings they share, the two or three lines every
 * one of them was writing for itself, and the press underneath both yards.
 *
 * The rule here is that a thing which is true of the whole page — how long a
 * thrown item takes to leave, how far a press may travel before it stops being
 * a click — is stated once. Two copies of a number like that do not stay equal;
 * one of them gets tuned and the page quietly stops agreeing with itself.
 */

/** the reader asked for stillness. checked at the moment it matters rather than
    held in state, so a preference changed mid-visit is honoured on the next use */
export const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A media query, watched. `still()` answers once and is right at that moment;
 * this is for the layout decisions a component has to keep agreeing with — a
 * breakpoint read at mount and never again is wrong the moment a phone turns.
 */
export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const answer = () => setMatches(mq.matches)
    answer()
    mq.addEventListener('change', answer)
    return () => mq.removeEventListener('change', answer)
  }, [query])

  return matches
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** a press that travels further than this was a drag, not a click */
export const SLOP = 4

/** how long a thrown-away thing stays gone before it comes back, ms. the demo
    has to survive being played with — an empty yard says nothing */
export const RESPAWN = 30_000

/** how a thing leaves when it is thrown away — the files and the machines go
    the same way, because they are the same gesture */
export const THROW = {
  ms: 260,
  /* front-loaded: half its size in the first 30ms. a thing that is thrown
     leaves at once and only appears to slow as it recedes */
  curve: 'cubic-bezier(0.2,0.9,0.3,1)',
  fade: 'cubic-bezier(0.4,0,0.9,0.6)',
}

/** the whole of it, ready for a style attribute */
export const THROW_CSS = `transform ${THROW.ms}ms ${THROW.curve}, opacity ${THROW.ms}ms ${THROW.fade}`

/**
 * Timers that cannot outlive the component that set them. Every section here
 * schedules something — a thing leaving, a thing coming back — and a timer that
 * lands after unmount sets state on nothing.
 */
export function useTimers() {
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  return (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms))
  }
}

/**
 * Throw something away and have it come back later. Both yards do this and both
 * were doing it in full: mark it leaving, wait out the flight, drop it, and a
 * while later put it back without letting a duplicate through.
 *
 * Only the last step differs — the files return to the end of the list, the
 * machines to the slot they stood in — so that step is the caller's, and the
 * rest lives here once.
 */
export function useVanish<T extends { id: number }>(setItems: Dispatch<SetStateAction<T[]>>) {
  const [leaving, setLeaving] = useState<ReadonlySet<number>>(new Set())
  const later = useTimers()

  function vanish(
    ids: ReadonlySet<number>,
    /** the ones going, read by the caller before they are gone */
    going: T[],
    /** where they stand when they return */
    back: (was: T[], home: T[]) => T[],
  ) {
    if (!ids.size) return

    /* merged, never replaced: a second thing thrown during the first one's
       flight must not take the first one's flag away mid-animation */
    setLeaving((was) => {
      const next = new Set(was)
      for (const id of ids) next.add(id)
      return next
    })

    later(still() ? 0 : THROW.ms, () => {
      setItems((was) => was.filter((i) => !ids.has(i.id)))
      setLeaving((was) => {
        const next = new Set(was)
        for (const id of ids) next.delete(id)
        return next
      })

      later(RESPAWN, () =>
        setItems((was) => {
          // guarded here rather than in both callers: one could have been put back by hand
          const home = going.filter((g) => !was.some((w) => w.id === g.id))
          return home.length ? back(was, home) : was
        }),
      )
    })
  }

  return { leaving, vanish }
}

/** where in an item the pointer took hold, and how far it has been since */
export interface Grip {
  /** the pointer, where the press began */
  ox: number
  oy: number
  /** and the item's own corner, in the yard */
  bx: number
  by: number
  w: number
  h: number
  travel: number
}

export interface Wall {
  w: number
  h: number
}

/**
 * Picking a thing up and moving it about. The fiddly parts are all here — the
 * grip and the yard measured once on the way down rather than on every frame,
 * pointer capture, telling a click from a drag, keeping the item inside the
 * walls, and one write per frame however fast the pointer reports.
 *
 * What it deliberately does not decide is where the thing ends up: the files
 * stay where they are dropped and the machines fall into slots, and that is a
 * real difference between the two rather than a setting. Callers get the
 * corner, in px inside the yard, and place it however they place things.
 */
export function usePress(
  floor: RefObject<HTMLElement | null>,
  on: {
    /** at most once a frame, with the item's corner already clamped inside */
    drag(id: number, at: { x: number; y: number }, wall: Wall): void
    lift?(id: number, grip: Grip, wall: Wall): void
    /** `moved` tells a drag that ended from a press that never really began */
    drop?(id: number, moved: boolean): void
    tap?(id: number, event: ReactPointerEvent<HTMLElement>): void
  },
) {
  const [held, setHeld] = useState<number | null>(null)

  /* the same thing as `held`, kept where a handler can read it immediately.
     state does not land until the next render, so the first moves of a drag
     were being tested against a stale value and thrown away — which is what
     made a press feel like it had missed */
  const holding = useRef<number | null>(null)

  const grip = useRef<Grip>({ ox: 0, oy: 0, bx: 0, by: 0, w: 0, h: 0, travel: 0 })
  const wall = useRef<Wall>({ w: 0, h: 0 })

  /** the newest position the pointer has reported, and the frame that will use
      it. the ones in between were never going to be seen */
  const next = useRef<{ id: number; x: number; y: number } | null>(null)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function paint() {
    frame.current = 0
    const at = next.current
    if (at) on.drag(at.id, at, wall.current)
  }

  function rest() {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    next.current = null
    holding.current = null
    setHeld(null)
  }

  function bind(id: number) {
    return {
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        const room = floor.current?.getBoundingClientRect()
        if (!room) return
        const box = event.currentTarget.getBoundingClientRect()

        wall.current = { w: room.width, h: room.height }
        grip.current = {
          ox: event.clientX,
          oy: event.clientY,
          bx: box.left - room.left,
          by: box.top - room.top,
          w: box.width,
          h: box.height,
          travel: 0,
        }

        event.currentTarget.setPointerCapture(event.pointerId)
        holding.current = id
        setHeld(id)
        on.lift?.(id, grip.current, wall.current)
      },

      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        if (holding.current !== id) return
        const g = grip.current
        const room = wall.current

        g.travel = Math.max(g.travel, Math.hypot(event.clientX - g.ox, event.clientY - g.oy))

        // a whole item's width and height of room, so none can be dragged out
        next.current = {
          id,
          x: clamp(g.bx + (event.clientX - g.ox), 0, Math.max(0, room.w - g.w)),
          y: clamp(g.by + (event.clientY - g.oy), 0, Math.max(0, room.h - g.h)),
        }

        if (!frame.current) frame.current = requestAnimationFrame(paint)
      },

      onPointerUp(event: ReactPointerEvent<HTMLElement>) {
        const moved = grip.current.travel > SLOP
        rest()
        if (moved) on.drop?.(id, true)
        else on.tap?.(id, event)
      },

      onPointerCancel() {
        rest()
        on.drop?.(id, grip.current.travel > SLOP)
      },
    }
  }

  return { held, bind, grip }
}
