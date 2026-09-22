import { useEffect, useState } from 'react'
import { ACCENT, TONE } from '../lib/tone'
import { still } from '../lib/motion'

/**
 * A small window on the hero that plays the join out by itself: name a machine,
 * ping it, take the token, run one line on the box, watch it come up.
 *
 * It never accepts input. Every field fills itself, so this is a picture that
 * moves rather than a form — which is why the whole panel is hidden from
 * assistive tech and a single sentence stands in for it.
 */

const LIME = ACCENT.lime

/** what the machine turns out to be */
const HOST = 'atlas'
const IP = '192.168.1.14'
const PORT = '22'
const TOKEN = 'a3f9-2b71-c8de'

/** one real line, not a prop — anyone reading it should be able to run it */
const RUN = `curl -fsSL clocess.dev/join | sh -s ${TOKEN}`

/** ms per character, and the beats between steps */
const KEY = 55
const BEAT = { settle: 700, ping: 1400, copy: 1100, wait: 1800, done: 2600 }

interface Shot {
  host: string
  ip: string
  port: string
  ping: 'off' | 'working' | 'done'
  token: string
  copied: boolean
  run: string
  link: 'off' | 'waiting' | 'up'
}

const BLANK: Shot = {
  host: '',
  ip: '',
  port: '',
  ping: 'off',
  token: '',
  copied: false,
  run: '',
  link: 'off',
}

const DONE: Shot = {
  host: HOST,
  ip: IP,
  port: PORT,
  ping: 'done',
  token: TOKEN,
  copied: false,
  run: RUN,
  link: 'up',
}

export function Handshake() {
  /* settled from the first paint when motion is unwanted, rather than starting
     blank and being corrected — there is no frame where it shows the wrong one */
  const [shot, setShot] = useState<Shot>(() => (still() ? DONE : BLANK))

  useEffect(() => {
    if (still()) return

    let alive = true
    let timer = 0

    /* one promise-shaped wait, so the script below reads as the sequence it is
       rather than as a nest of callbacks. every step re-checks `alive`, because
       a timer can always land after the panel has gone */
    const hold = (ms: number) =>
      new Promise<void>((go) => {
        timer = window.setTimeout(go, ms)
      })

    async function type(text: string, put: (s: string) => void) {
      for (let i = 1; i <= text.length; i++) {
        if (!alive) return
        put(text.slice(0, i))
        await hold(KEY)
      }
    }

    const set = (patch: Partial<Shot>) => setShot((was) => ({ ...was, ...patch }))

    async function play() {
      while (alive) {
        setShot(BLANK)
        await hold(BEAT.settle)

        await type(HOST, (host) => set({ host }))
        await type(IP, (ip) => set({ ip }))
        await type(PORT, (port) => set({ port }))
        if (!alive) return

        set({ ping: 'working' })
        await hold(BEAT.ping)
        if (!alive) return
        set({ ping: 'done' })

        await type(TOKEN, (token) => set({ token }))
        if (!alive) return

        set({ copied: true })
        await hold(BEAT.copy)
        if (!alive) return
        set({ copied: false })

        await type(RUN, (run) => set({ run }))
        if (!alive) return

        set({ link: 'waiting' })
        await hold(BEAT.wait)
        if (!alive) return

        set({ link: 'up' })
        await hold(BEAT.done)
      }
    }

    void play()
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {/* the panel moves too much to be read aloud, so this stands for it */}
      <p className="sr-only">
        To add a machine: give clocess its address, take the token it hands back, and run one line
        on the machine. It appears here when it connects.
      </p>

      <div
        aria-hidden="true"
        className="pointer-events-none w-[min(620px,100%)] text-[clamp(10px,1.05vw,13px)]"
      >
        <div className="grid grid-cols-[1fr_1.4fr_0.6fr] gap-x-[3%] gap-y-1">
          <Label>host</Label>
          <Label>ip address</Label>
          <Label>port</Label>

          <Field value={shot.host} />
          <Field value={shot.ip} />
          <Field value={shot.port} />
        </div>

        <div className="mt-[clamp(8px,1.1vw,14px)] flex items-center justify-between gap-4">
          {/* the ping's own dots, rather than three anonymous rows of them —
              one indicator that belongs to the thing it is reporting on */}
          <span className="flex h-[1.6em] items-center gap-[0.45em]">
            {shot.ping === 'working' &&
              [0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="beat-tick block h-[0.42em] w-[0.42em] rounded-pill"
                  style={{ background: TONE.mid, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            {shot.ping === 'done' && (
              <span style={{ color: TONE.mid }}>{IP} answered in 12 ms</span>
            )}
          </span>

          <span
            style={{
              borderColor: shot.ping === 'off' ? TONE.edge : LIME,
              color: shot.ping === 'off' ? TONE.edge : LIME,
            }}
            className="rounded-md border px-[2.4em] py-[0.5em] transition-colors duration-300"
          >
            ping
          </span>
        </div>

        <Label className="mt-[clamp(10px,1.4vw,18px)] block">
          give this token to a machine you own
        </Label>
        <div className="mt-1 flex gap-[2%]">
          <Field value={shot.token} className="flex-1" />
          <span
            style={{
              background: TONE.bright,
              color: TONE.screen,
              opacity: shot.token ? 1 : 0.35,
            }}
            className="grid w-[26%] place-items-center rounded-md transition-opacity duration-300"
          >
            {shot.copied ? 'copied' : 'copy'}
          </span>
        </div>

        <Label className="mt-[clamp(10px,1.4vw,18px)] block">run this on your machine</Label>
        <Field value={shot.run} className="mt-1" caret={Boolean(shot.run) && shot.link === 'off'} />

        <p className="mt-[clamp(8px,1.1vw,14px)] flex items-center gap-[0.6em]">
          <span
            className={shot.link === 'waiting' ? 'beat' : 'block h-[0.34em] w-[0.34em] rounded-pill'}
            style={{
              ['--beat' as string]: LIME,
              background: shot.link === 'off' ? TONE.edge : LIME,
            }}
          />
          <span style={{ color: shot.link === 'up' ? TONE.bright : TONE.mid }}>
            {shot.link === 'up'
              ? `${HOST} connected · 4 GB free`
              : shot.link === 'waiting'
                ? 'waiting for the machine to connect'
                : 'no machine yet'}
          </span>
        </p>
      </div>
    </>
  )
}

function Label({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span style={{ color: TONE.mid }} className={className}>
      {children}
    </span>
  )
}

/** a drawn field: white, and tall enough to hold a line of mono */
function Field({
  value,
  className = '',
  caret = false,
}: {
  value: string
  className?: string
  caret?: boolean
}) {
  return (
    <span
      style={{ background: TONE.bright, color: TONE.screen }}
      className={`block truncate rounded-md px-[0.9em] py-[0.55em] font-mono ${className}`}
    >
      {value || ' '}
      {caret && <span className="beat-tick ml-px inline-block w-[0.5em]">▌</span>}
    </span>
  )
}
