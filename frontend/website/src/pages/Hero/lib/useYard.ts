import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { clamp, usePress } from './motion'

/**
 * A yard things stay put in: pick one up, drop it anywhere, and it is still
 * there — relative to everything else — when the window changes size.
 *
 * The picking up is not here. That is `usePress`, which the machines use too;
 * what this adds is the one decision that is its own: a dropped thing keeps
 * exactly where it was left. The machines fall into slots instead, which is why
 * they place for themselves rather than sharing this hook.
 */

export interface Spot {
  id: number
  /**
   * 0..1 across and down the yard, measured to the item's top-left corner.
   * The corner and not the centre: an item's box can carry a label under it, so
   * its centre sits below the part you see and matching a layout to a picture
   * becomes guesswork.
   */
  x: number
  y: number
}

/** how far one arrow press slides an item, as a fraction of the yard */
const STEP = 0.025

export function useYard<T extends Spot>(
  /** a function when the arrangement depends on the width the page opened at */
  start: T[] | (() => T[]),
  /** fired when a press went nowhere — the caller decides what a click means */
  onTap?: (id: number, event: ReactPointerEvent<HTMLElement>) => void,
) {
  const [items, setItems] = useState<T[]>(start)
  const yard = useRef<HTMLElement | null>(null)

  function place(id: number, to: { x: number; y: number }) {
    setItems((was) => was.map((i) => (i.id === id ? { ...i, ...to } : i)))
  }

  /** the held one goes to the end of the list, which is the top of the stack */
  function raise(id: number) {
    setItems((was) => {
      const one = was.find((i) => i.id === id)
      return one ? [...was.filter((i) => i.id !== id), one] : was
    })
  }

  const { held, bind } = usePress(yard, {
    // the press hands over px inside the yard; a yard stores fractions of it
    drag: (id, at, wall) => place(id, { x: at.x / wall.w, y: at.y / wall.h }),
    lift: raise,
    tap: onTap,
  })

  /** arrows only — the caller handles any key of its own before calling this */
  function nudge(event: KeyboardEvent<HTMLElement>, item: Spot) {
    const by: Record<string, [number, number]> = {
      ArrowLeft: [-STEP, 0],
      ArrowRight: [STEP, 0],
      ArrowUp: [0, -STEP],
      ArrowDown: [0, STEP],
    }
    const step = by[event.key]
    if (!step || !yard.current) return
    event.preventDefault()

    // the same bounds the pointer gets, measured now rather than on the way down
    const wall = yard.current.getBoundingClientRect()
    const box = event.currentTarget.getBoundingClientRect()
    place(item.id, {
      x: clamp(item.x + step[0], 0, 1 - box.width / wall.width),
      y: clamp(item.y + step[1], 0, 1 - box.height / wall.height),
    })
  }

  return {
    items,
    setItems,
    held,
    /** hand this to the yard's own element, whatever kind it is */
    floor: (el: HTMLElement | null) => {
      yard.current = el
    },
    bind,
    nudge,
  }
}
