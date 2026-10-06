import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Bar } from '../parts/Bar'
import { roomLeft } from '../lib/quota'
import { ACCENT, TONE, TYPE } from '../lib/tone'
import { THROW, THROW_CSS, still, useMedia, usePress, useTimers, useVanish } from '../lib/motion'
import { usePing } from '../lib/usePing'

/**
 * Every machine you have joined. They live in slots rather than wherever you
 * drop them, which is what lets the row close up when one goes — the way a
 * phone's home screen does. Dragging moves a card and the others step aside as
 * it passes; letting go eases it into the slot it was standing in.
 *
 * A card at rest says only what it is and how full it is. Reach for one and it
 * shows the parts you can act on — the grip, the reading, the way in — so the
 * row reads as a list until the moment it has to read as controls.
 *
 * Holding one arms that card alone, and a machine you remove comes back half a
 * minute later — the demo has to survive being emptied.
 */

const { free: FREE, filled: FILLED, strike: STRIKE } = ACCENT

/** the card sits a shade off the page, so it reads as a surface on the void */
const CARD = '#0E1113'

interface Box {
  id: number
  name: string
  /** the mounted one carries an index instead of a quota */
  mounted?: boolean
  host?: string
  used?: number
  total?: number
}

const BOXES: Box[] = [
  { id: 1, name: 'server_1', host: '192.168.1.14', used: 3.2, total: 10 },
  { id: 2, name: 'nas-attic', host: '10.0.0.7', used: 4.5, total: 10 },
  { id: 3, name: 'build-01', host: 'ci.internal', used: 39.4, total: 50 },
  { id: 4, name: 'pi-hallway', host: '192.168.1.31', used: 1.9, total: 12 },
  { id: 5, name: 'media-box', mounted: true },
]

/** below this much room left, the machine is the one worth looking at */
const TIGHT = 25

/** how long a press has to hold still before it arms that card, ms */
const HOLD = 420

/** how long a card takes to reach a slot, ms */
const SETTLE = 320

/** how much nearer another slot has to be before the row steps aside for the
    card in hand, px. without it a card balanced between two slots flickers */
const GIVE = 26

/** the one width the layout turns over at. the classes below carry the same
    number, and the two have to agree or the slots and the cards disagree */
const NARROW = '(max-width: 760px)'

const shell = 'rounded-[clamp(10px,1.1vw,16px)] border'

/** shown only once a card is under the pointer: the grip, the live reading and
    the way in. a row of five of these lit at once is a control panel */
const onReach =
  'opacity-0 transition-opacity duration-200 group-hover:opacity-100 ' +
  'group-focus-visible:opacity-100 max-[760px]:opacity-100'

/** where the nth card sits, as a fraction of the yard. three across on a desk,
    one column on a phone */
function slot(i: number, narrow: boolean) {
  if (narrow) return { x: 0, y: i * 0.196 }
  return { x: 0.02 + (i % 3) * 0.33, y: 0.03 + Math.floor(i / 3) * 0.5 }
}

export function Boxes() {
  const [boxes, setBoxes] = useState(BOXES)
  const [armed, setArmed] = useState<number | null>(null)
  const narrow = useMedia(NARROW)
  const ping = usePing()
  const later = useTimers()
  const { leaving, vanish } = useVanish(setBoxes)

  const yard = useRef<HTMLUListElement>(null)

  /** the layer each card is offset on while it is in hand. React never writes
      to these, which is the point: a re-render from anywhere else — a ping, a
      timer, a card coming back — cannot land on top of a drag in progress */
  const layers = useRef(new Map<number, HTMLDivElement>())

  /** where the card in hand is, and how big the yard was when it was picked
      up. read by the frame that moves it and by the reshuffle that follows */
  const live = useRef<{ x: number; y: number } | null>(null)
  const wall = useRef({ w: 0, h: 0 })

  /* what a drag needs to know about a render it did not cause. handlers run
     between renders, so reading these from a closure is how a frame ends up
     working against a list that has already changed under it */
  const list = useRef(boxes)
  const across = useRef(narrow)

  const hold = useRef(0)
  const rest = () => window.clearTimeout(hold.current)

  /** the nth slot, in px inside the yard */
  const at = (i: number) => {
    const s = slot(i, across.current)
    return { x: s.x * wall.current.w, y: s.y * wall.current.h }
  }

  /** the card in hand, offset from the slot it currently owns. written the same
      way from the pointer and from a reshuffle, so the two cannot disagree */
  function offset(id: number) {
    const layer = layers.current.get(id)
    const now = live.current
    const i = list.current.findIndex((b) => b.id === id)
    if (!layer || !now || i < 0) return

    const home = at(i)
    layer.style.transform = `translate3d(${now.x - home.x}px, ${now.y - home.y}px, 0)`
  }

  const { held, bind } = usePress(yard, {
    lift(id, _grip, room) {
      wall.current = room
      const layer = layers.current.get(id)
      if (layer) {
        layer.style.transition = 'none'
        layer.style.willChange = 'transform'
      }

      /* this card alone, and only if the press stays put. arming on hold and
         clearing on release is the trap here — the release always undid it, so
         nothing is cleared on the way up */
      rest()
      hold.current = window.setTimeout(() => setArmed(id), HOLD)
    },

    drag(id, to, room) {
      wall.current = room
      live.current = to
      // a press that has set off somewhere is a drag, not a hold
      rest()
      offset(id)
      step(id, to)
    },

    drop(id) {
      rest()
      land(id)
    },

    tap: rest,
  })

  /* every commit, before the browser paints and long before a pointer can be
     heard from again: the drag reads the list through these rather than through
     a closure, and a reshuffle moves the card's own slot out from under it —
     re-offsetting in the same commit is what keeps the card under the hand
     rather than a frame behind it */
  useLayoutEffect(() => {
    list.current = boxes
    across.current = narrow
    if (held !== null) offset(held)
  })

  /** the row steps aside as the card passes, rather than waiting for it to land */
  function step(id: number, to: { x: number; y: number }) {
    const from = list.current.findIndex((b) => b.id === id)
    if (from < 0) return

    let best = from
    let near = Infinity
    list.current.forEach((_, i) => {
      const s = at(i)
      const d = Math.hypot(s.x - to.x, s.y - to.y)
      if (d < near) {
        near = d
        best = i
      }
    })

    const home = at(from)
    if (best === from || near > Math.hypot(home.x - to.x, home.y - to.y) - GIVE) return

    setBoxes((was) => {
      const i = was.findIndex((b) => b.id === id)
      if (i < 0 || i === best) return was
      const next = [...was]
      next.splice(best, 0, next.splice(i, 1)[0])
      return next
    })
  }

  /** let go and the offset eases back to nothing, which is the slot */
  function land(id: number) {
    live.current = null
    const layer = layers.current.get(id)
    if (!layer) return

    const clear = () => {
      layer.style.transition = ''
      layer.style.transform = ''
      layer.style.willChange = ''
    }

    if (still()) return clear()

    layer.style.transition = `transform ${SETTLE}ms ${THROW.curve}`
    layer.style.transform = 'translate3d(0, 0, 0)'

    /* cleared once it is home rather than left set: an offset of zero and no
       offset at all look the same, and only one of them keeps a layer promoted */
    later(SETTLE, clear)
  }

  /** it goes the way the files do: straight back, gone, and later returned */
  function strike(id: number) {
    const going = boxes.find((b) => b.id === id)
    const home = boxes.findIndex((b) => b.id === id)
    if (!going) return

    setArmed(null)
    /* back where it stood, so the grid settles into the shape it had rather
       than growing a tail */
    vanish(new Set([id]), [going], (was, back) => {
      const next = [...was]
      next.splice(Math.min(home, next.length), 0, ...back)
      return next
    })
  }

  return (
    <section className="relative z-10 px-pad">
      <div className="mx-auto max-w-page">
        <h2 className="text-[clamp(26px,4.2vw,52px)] leading-[1.1] font-light tracking-[-0.02em] text-ink">
          and every box you own..
        </h2>
        <p className="mt-2 text-[clamp(12px,1.3vw,16px)] text-ink-2">
          switch servers without leaving the page
        </p>

        <ul
          ref={yard}
          aria-label="Your machines — drag to reorder one, hold it to remove it"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setArmed(null)
          }}
          className="relative mt-[clamp(20px,3vw,38px)] h-[clamp(330px,33vw,430px)] w-full touch-none select-none max-[760px]:h-255"
        >
          {boxes.map((box, i) => {
            const gone = leaving.has(box.id)
            const on = armed === box.id
            const up = held === box.id
            const seat = slot(i, narrow)
            const tight = roomLeft(box.used ?? 0, box.total ?? 0) < TIGHT

            return (
              <li
                key={box.id}
                style={{ left: `${seat.x * 100}%`, top: `${seat.y * 100}%`, zIndex: up ? 2 : 1 }}
                className={`absolute w-[30%] max-[760px]:w-full motion-reduce:transition-none ${
                  /* the card in hand is handed its slot at once and the layer
                     below takes up the difference — easing it would drag the
                     card away from the hand for a third of a second */
                  up
                    ? ''
                    : 'transition-[left,top] duration-320 ease-[cubic-bezier(0.2,0.9,0.3,1)]'
                }`}
              >
                <div
                  ref={(el) => {
                    if (el) layers.current.set(box.id, el)
                    else layers.current.delete(box.id)
                  }}
                >
                  {/* the wobble animates transform, and so does the drag — they
                      cannot share an element without one eating the other */}
                  <div className={`relative ${on && !gone ? 'wobble' : ''}`}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={label(box)}
                      aria-pressed={on}
                      {...bind(box.id)}
                      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                        /* the pointer arms a card by holding it. this is the
                           same door for a keyboard, and without it the remove
                           button below can never be reached */
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setArmed((was) => (was === box.id ? null : box.id))
                        }
                        if (event.key === 'Delete' || event.key === 'Backspace') {
                          event.preventDefault()
                          strike(box.id)
                        }
                        if (event.key === 'Escape') setArmed(null)
                      }}
                      style={
                        {
                          background: CARD,
                          borderColor: box.mounted ? TONE.edge : TONE.deep,
                          transform: gone
                            ? 'scale(0.02)'
                            : on
                              ? 'scale(0.94)'
                              : up
                                ? 'scale(1.03)'
                                : undefined,
                          opacity: gone ? 0 : 1,
                          boxShadow: up ? '0 18px 40px rgba(0,0,0,0.55)' : undefined,
                          transition: gone
                            ? THROW_CSS
                            : 'transform 180ms cubic-bezier(0.2,0.8,0.3,1), box-shadow 180ms ease, border-color 180ms ease',
                        } as CSSProperties
                      }
                      className={`${shell} group block p-[clamp(11px,1.3vw,17px)] ${
                        up ? 'cursor-grabbing' : 'cursor-grab'
                      } focus-visible:outline-offset-4`}
                    >
                      <span aria-hidden="true" className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-[0.6em]">
                          <span
                            className="block h-[0.45em] w-[0.45em] shrink-0 rounded-pill"
                            style={{ background: box.mounted || !tight ? FREE : FILLED }}
                          />
                          <span className={`${TYPE.mono} truncate`} style={{ color: TONE.bright }}>
                            {box.name}
                          </span>
                        </span>
                        <Grip />
                      </span>

                      <span
                        aria-hidden="true"
                        className={`mt-[clamp(6px,0.8vw,10px)] flex items-baseline gap-[0.5em] ${TYPE.small}`}
                        style={{ color: TONE.mid }}
                      >
                        <span className="truncate">{box.mounted ? '41 GB indexed' : box.host}</span>
                        <span className={onReach} style={{ color: TONE.edge }}>
                          · {box.mounted ? '190 GB free' : `${ping} ms`}
                        </span>
                      </span>

                      {box.mounted ? (
                        <Ticks />
                      ) : (
                        <Bar
                          used={box.used ?? 0}
                          total={box.total ?? 0}
                          className="mt-[clamp(9px,1.1vw,14px)]"
                        />
                      )}

                      {/* the quota and the way in share one box, so reaching for
                          a card swaps the number for the action without the card
                          changing shape under the hand */}
                      <span
                        aria-hidden="true"
                        className="relative mt-[clamp(8px,1vw,13px)] block h-[clamp(26px,2.9vw,40px)]"
                      >
                        {!box.mounted && (
                          <span
                            style={{ color: TONE.mid }}
                            className={`${TYPE.small} absolute inset-0 flex items-center transition-opacity duration-200 group-hover:opacity-0`}
                          >
                            {box.used} / {box.total} GB
                          </span>
                        )}
                        <span
                          style={{ background: TONE.bright, color: TONE.screen }}
                          className={`${TYPE.mono} absolute inset-0 grid place-items-center rounded-[clamp(7px,0.85vw,12px)] ${
                            box.mounted ? '' : onReach
                          }`}
                        >
                          open
                        </span>
                      </span>
                    </div>

                    {/* a sibling of the card, not a child of it: a button inside
                        a button is not markup a browser will honour */}
                    {on && !gone && (
                      <button
                        type="button"
                        onClick={() => strike(box.id)}
                        aria-label={`Remove ${box.name}`}
                        style={{ background: STRIKE, color: '#fff' }}
                        className="absolute -top-2.5 -right-2.5 grid h-[clamp(22px,2.4vw,30px)] w-[clamp(22px,2.4vw,30px)] place-items-center rounded-pill text-[clamp(11px,1.2vw,15px)] leading-none shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function label(box: Box) {
  const what = box.mounted ? 'mounted, 190 GB free' : `${box.used} of ${box.total} GB used`
  return `${box.name}, ${what}. Drag to reorder, enter to arm, delete to remove.`
}

/** the six dots every window in the world uses to say "this end is the handle" */
function Grip() {
  return (
    <span className={`grid shrink-0 grid-cols-2 gap-0.5 ${onReach}`}>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          style={{ background: TONE.edge }}
          className="block h-0.5 w-0.5 rounded-pill"
        />
      ))}
    </span>
  )
}

/** ticks rather than a bar: it is being read through, not filled up */
function Ticks() {
  return (
    <span
      aria-hidden="true"
      className="mt-[clamp(9px,1.1vw,14px)] flex h-[clamp(6px,0.7vw,10px)] gap-0.5"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          style={{ background: FREE, opacity: i < 17 ? 1 : 0.28 }}
          className="h-full flex-1 rounded-[1px]"
        />
      ))}
    </span>
  )
}
