import type { CSSProperties } from 'react'
import { Button } from '@clocess/shared/ui'
import { Bar } from '../parts/Bar'
import { roomLeft } from '../lib/quota'
import { ACCENT, TONE, TYPE } from '../lib/tone'
import { usePing } from '../lib/usePing'

/** the machine the line is about, so the claim has something standing behind it */
const BOX = { name: 'server_1', at: '192.168.1.14:22', used: 3.2, total: 10 }

/**
 * Both actions carry the same width so the pair reads as one control. Only the
 * width and the centring live here — padding and type size stay with Button,
 * because setting them in both places is a fight decided by stylesheet order
 * rather than by which class is written last.
 */
const SIZE = 'min-w-[clamp(140px,18%,200px)] justify-center'

export function KeepNone() {
  const used = 100 - roomLeft(BOX.used, BOX.total)
  const ping = usePing()

  return (
    <section className="relative z-10 px-pad">
      <div className="mx-auto max-w-page">
        <h2 className="text-[clamp(30px,5.8vw,74px)] leading-[1.2] font-light tracking-[-0.02em] text-ink">
          Your server keeps the files
          {/* the second line steps well in, so the pair reads as one thought
              falling across the page rather than two stacked sentences */}
          <span className="block pl-[20%]">We keep none of them</span>
        </h2>

        <div className="mt-[clamp(24px,4vh,48px)] text-[clamp(13px,1.45vw,18px)] leading-[1.9] text-ink-2">
          <p>Clocess holds the accounts, the sessions and the quota.</p>
          <p>Every byte stays on hardware you own</p>
          <p className="pl-[34%]">there is no upload to us, because there is no us.</p>
        </div>

        {/* one machine, reading itself out. it is the claim above with something
            standing behind it, rather than a second sentence saying the same */}
        <div
          className={`mt-[clamp(26px,4.4vh,54px)] grid grid-cols-[auto_1fr] items-start gap-x-[4%] gap-y-3 sm:grid-cols-[22%_24%_1fr_auto] ${TYPE.mono}`}
        >
          <span className="flex items-center gap-[0.7em]">
            <span
              aria-hidden="true"
              className="beat"
              style={{ ['--beat' as string]: ACCENT.blue } as CSSProperties}
            />
            <span style={{ color: TONE.bright }}>{BOX.name}</span>
          </span>

          <span style={{ color: TONE.mid }}>{BOX.at}</span>

          <span className="col-span-2 sm:col-span-1">
            <Bar used={BOX.used} total={BOX.total} />
            <span
              className="mt-[0.7em] block text-[clamp(8px,0.9vw,12px)]"
              style={{ color: TONE.mid }}
            >
              {BOX.used} / {BOX.total} GB · {used}% used
            </span>
          </span>

          {/* the number moves, which is the whole point of a latency */}
          <span className="text-right sm:text-left" style={{ color: TONE.mid }}>
            {ping} ms
          </span>
        </div>

        <div className="mt-[clamp(24px,4vh,46px)] flex flex-wrap gap-[clamp(8px,1.2vw,14px)]">
          <Button href="#" className={SIZE}>
            read docs
          </Button>

          {/* dashed on purpose: it is the unfinished half of the pair, the one
              that hands you the thing rather than the reading about it */}
          <Button to="/register" variant="dashed" className={SIZE}>
            try it
          </Button>
        </div>
      </div>
    </section>
  )
}

