import { useState, type CSSProperties, type ReactNode } from 'react'

interface Row {
  tab: string
  x: string
  w: string
  copy?: ReactNode
}

const ROWS: Row[] = [
  { tab: '', x: '12%', w: '108px' },
  {
    tab: 'why clocess',
    x: '30%',
    w: 'min(220px, 40%)',
    copy: (
      <>
        You have a server running, but getting one file off it means a cable or SSH session, or a share that dies at
        the front door &mdash; and none of those exist on a phone. So the photos go to someone else&rsquo;s cloud
        instead: <b>fifteen free gigabytes, then a monthly bill</b>, and a copy of everything you own sitting on
        hardware you will never see.
      </>
    ),
  },
  {
    tab: 'what clocess',
    x: '52%',
    w: 'min(220px, 40%)',
    copy: (
      <>
        Clocess carves <b>one folder</b> off that machine and puts it behind a login. Register, sign in from any
        device, drop files in, pull them back out. The whole thing is a single web page &mdash; nothing to install on
        the phone, nothing to set up twice, no client to keep current.
      </>
    ),
  },
  { tab: '', x: '8%', w: '116px' },
  {
    tab: 'how clocess',
    x: '26%',
    w: 'min(220px, 40%)',
    copy: (
      <>
        Clocess keeps the accounts, the sessions and the
        quota; <b>your server keeps the bytes</b>. Nothing is uploaded to us, because there is no us &mdash; all of it
        runs on hardware you control. Every device you sign in from gets its own session, and you can revoke one
        without touching the others.
      </>
    ),
  },
  {
    tab: 'how to start',
    x: '54%',
    w: 'min(220px, 40%)',
    copy: (
      <>
        
      </>
    ),
  },
  { tab: '', x: '14%', w: '100px' },
  {
    tab: 'what for',
    x: '32%',
    w: 'min(220px, 40%)',
    copy: (
      <>
        A camera roll that has been full since spring. A folder two people need and neither wants to email. The 4 GB
        export that bounces off every inbox. <b>Anything you would hand to a cloud drive</b>, on a drive you already
        pay for.
      </>
    ),
  },
]

const COPY =
  'max-w-[62ch] p-[clamp(22px,3vw,34px)] text-[clamp(16px,1.5vw,18px)] leading-[1.66] text-ink-2 [&_b]:font-normal [&_b]:text-ink'

export function StoryFolder() {
  const [open, setOpen] = useState(1)

  return (
    <section className="sf-story relative z-10 px-pad pb-[clamp(80px,12vh,130px)]">
      <div className="mx-auto max-w-page">
        <h2 className="mt-6 mb-[clamp(52px,9vh,92px)] text-[clamp(30px,4.6vw,56px)] font-light leading-[1.08] tracking-[-0.015em] text-balance text-ink text-center">
          The same server - 
          <span className="text-ink-3"> one login away</span>
        </h2>

        <div className="sf-stack">
          {ROWS.map(({ tab, x, w, copy }, i) => (
            <article
              key={i}
              style={{ '--x': x, '--w': w, '--i': i + 1 } as CSSProperties}
              className={`sf-folder${copy ? '' : ' sf-divider'}${open === i ? ' sf-open' : ''}`}
              onClick={copy ? () => setOpen(i) : undefined}
            >
              {copy ? (
                <button
                  type="button"
                  className="sf-tab"
                  aria-expanded={open === i}
                  onClick={(event) => {
                    event.stopPropagation()
                    setOpen(open === i ? -1 : i)
                  }}
                >
                  {tab}
                </button>
              ) : (
                <p className="sf-tab">{tab}</p>
              )}

              {copy && (
                <div className="sf-reveal">
                  <div>
                    <div className="m-4 mb-5 bg-ground max-[720px]:m-3">
                      <p className={COPY}>{copy}</p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
