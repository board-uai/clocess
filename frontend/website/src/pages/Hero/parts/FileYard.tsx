import { useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, KeyboardEvent } from 'react'
import { FileIcon } from '@clocess/shared/files'
import { ROUND, TONE, TYPE } from '../lib/tone'
import { THROW_CSS, useVanish } from '../lib/motion'
import { useYard } from '../lib/useYard'
import type { Spot } from '../lib/useYard'

/**
 * A folder you can actually use: pick files up, drop them anywhere, select
 * them, and delete the ones you chose. The chrome above the yard lives here
 * too rather than with the section, because `delete` acts on the selection —
 * splitting the two would mean threading that state up through the page.
 *
 * Positions are fractions of the yard rather than pixels, so a file stays where
 * you left it relative to everything else when the window changes size.
 */

interface Placed extends Spot {
  name: string
  size: string
}

/** read off the reference: the nine cards, as fractions of the yard */
const START: Placed[] = [
  { id: 1, name: 'report.txt', size: '1.2 MB', x: 0.337, y: 0.04 },
  { id: 2, name: 'file.md', size: '3 MB', x: 0.581, y: 0.043 },
  { id: 3, name: 'picture.png', size: '34.5 MB', x: 0.705, y: 0.043 },
  { id: 4, name: 'notes.md', size: '18 KB', x: 0.825, y: 0.043 },
  { id: 5, name: 'backup.zip', size: '1.4 GB', x: 0.092, y: 0.276 },
  { id: 6, name: 'holiday.jpg', size: '8.1 MB', x: 0.412, y: 0.3 },
  { id: 7, name: 'keys.pem', size: '2 KB', x: 0.825, y: 0.437 },
  { id: 8, name: 'export.csv', size: '96 MB', x: 0.544, y: 0.576 },
  { id: 9, name: 'draft.pdf', size: '4.7 MB', x: 0.188, y: 0.745 },
]

export function FileYard() {
  const [picked, setPicked] = useState<ReadonlySet<number>>(new Set())

  /** a press that went nowhere is a click, and a click is a selection */
  const { items: files, setItems: setFiles, held, floor, bind, nudge } = useYard<Placed>(
    START,
    (id, event: ReactPointerEvent<HTMLElement>) => {
      const add = event.metaKey || event.ctrlKey || event.shiftKey
      setPicked((was) => {
        if (!add) return was.size === 1 && was.has(id) ? new Set() : new Set([id])
        const next = new Set(was)
        if (!next.delete(id)) next.add(id)
        return next
      })
    },
  )

  /** they go straight back and they are gone — and then, later, they return */
  const { leaving, vanish } = useVanish(setFiles)

  const send = (ids: ReadonlySet<number>) => {
    if (!ids.size) return
    setPicked(new Set())
    // back at the end of the list, which is where a file returning belongs
    vanish(ids, files.filter((f) => ids.has(f.id)), (was, home) => [...was, ...home])
  }

  function keys(event: KeyboardEvent<HTMLElement>, file: Placed) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      send(picked.has(file.id) ? picked : new Set([file.id]))
      return
    }
    nudge(event, file)
  }

  const armed = picked.size > 0
  const chip = `${ROUND.chip} px-[clamp(10px,1.4vw,20px)] py-[clamp(3px,0.55vw,7px)] text-[clamp(8px,0.95vw,13px)]`

  return (
    <div>
      <div aria-hidden="true">
        <p style={{ color: TONE.face }} className={TYPE.mono}>
          root/user/main/folder
        </p>
        <div style={{ borderColor: TONE.mid }} className="mt-[clamp(4px,0.7vw,9px)] border-t" />
      </div>

      <div className="mt-[clamp(10px,1.6vw,20px)] flex justify-end gap-[clamp(6px,0.9vw,12px)] font-mono">
        {/* the one control that does something. it dims with nothing chosen, so
            the row says what it is waiting for */}
        <button
          type="button"
          onClick={() => send(picked)}
          disabled={!armed}
          style={{ background: TONE.bright, color: TONE.screen, opacity: armed ? 1 : 0.4 }}
          className={`${chip} transition-opacity disabled:cursor-default`}
        >
          delete
        </button>

        {/* still only drawn, so they stay out of the accessibility tree rather
            than reading as controls that do nothing */}
        <span aria-hidden="true" className="flex gap-[clamp(6px,0.9vw,12px)]">
          {['download', 'share'].map((action) => (
            <span
              key={action}
              style={{ background: TONE.bright, color: TONE.screen }}
              className={chip}
            >
              {action}
            </span>
          ))}
        </span>
      </div>

      <div aria-hidden="true" className="mt-[clamp(8px,1.3vw,16px)] flex justify-center">
        <div
          style={{ borderColor: TONE.face, color: TONE.mid }}
          className={`flex w-full items-center gap-[clamp(6px,0.9vw,12px)] ${ROUND.chip} border px-[clamp(12px,1.6vw,22px)] py-[clamp(7px,1.1vw,14px)]`}
        >
          <svg
            viewBox="0 0 16 16"
            className="h-[clamp(13px,1.6vw,21px)] w-[clamp(13px,1.6vw,21px)] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.4 10.4 14 14" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <ul
        ref={floor}
        aria-label="Files — drag to move, click to select, delete to send them into the void"
        onPointerDown={(event) => {
          // a press on bare floor lets everything go
          if (event.target === event.currentTarget) setPicked(new Set())
        }}
        className="relative mt-[clamp(14px,2.4vw,30px)] h-[clamp(320px,44vw,560px)] w-full touch-none select-none"
      >
        {files.map((file) => {
          const up = held === file.id
          const on = picked.has(file.id)
          const gone = leaving.has(file.id)

          return (
            <li
              key={file.id}
              /* it goes straight back from wherever it stands — no drift to the
                 middle, so the only thing that changes is its distance */
              style={{ left: `${file.x * 100}%`, top: `${file.y * 100}%` }}
              className="absolute"
            >
              <button
                type="button"
                aria-pressed={on}
                {...bind(file.id)}
                onKeyDown={(e) => keys(e, file)}
                style={
                  {
                    '--w': 'clamp(50px,6.4vw,86px)',
                    '--r': 'clamp(5px,0.8vw,11px)',
                    /* straight back to nothing: no turn, no drift, and gone
                       from the first frame. the curve is front-loaded on
                       purpose — half its size in the first 30ms — because a
                       thing that is thrown leaves at once and only appears to
                       slow as it recedes. an ease-in would hold it still and
                       then snap, which reads as a delay rather than a throw */
                    transform: gone ? 'scale(0.02)' : up ? 'scale(1.06)' : undefined,
                    opacity: gone ? 0 : 1,
                    filter: up ? 'drop-shadow(0 12px 20px rgba(0,0,0,0.85))' : undefined,
                    transition: gone
                      ? THROW_CSS
                      : undefined,
                  } as CSSProperties
                }
                className={`relative block w-[var(--w)] text-center transition-[transform,filter] duration-150
                            ${up ? 'cursor-grabbing' : 'cursor-grab'} focus-visible:outline-offset-[6px]`}
              >
                {/* the selection sits behind the whole file, label and all — the
                    outline is already white, so the ground behind it is the
                    only thing left to light */}
                <span
                  aria-hidden="true"
                  style={{ background: on ? TONE.deep : 'transparent' }}
                  className="pointer-events-none absolute -inset-x-[10%] -inset-y-[6%] rounded-[var(--r)] transition-colors duration-150"
                />

                <FileIcon name={file.name} className="relative block h-auto w-full" />

                <span
                  style={{ color: on || up ? TONE.bright : TONE.face }}
                  className="relative mt-[0.55em] block font-mono text-[clamp(7px,0.85vw,12px)] leading-tight whitespace-nowrap transition-colors duration-150"
                >
                  {file.name}
                </span>
                <span className="relative block font-mono text-[clamp(6px,0.7vw,10px)] leading-tight whitespace-nowrap text-ink-3">
                  {file.size}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
