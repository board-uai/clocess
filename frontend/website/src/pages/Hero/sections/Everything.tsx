import { FileYard } from '../parts/FileYard'

/**
 * The app itself rather than a picture of one. The bezel is gone on purpose:
 * the files can be picked up, moved and thrown away, and a thing you can
 * actually use should not be sitting inside a drawing of a laptop.
 *
 * The panel below owns everything about the folder, chrome included, because
 * `delete` acts on what is selected in it.
 */

export function Everything() {
  return (
    <section className="relative z-10 px-pad">
      <div className="mx-auto max-w-page">
        <h2 className="text-[clamp(38px,7vw,86px)] leading-[1.02] font-light tracking-[-0.03em] text-ink">
          everything it does..
        </h2>

        {/* both lines sit on the container's own edges, which the panel shares —
            the copy and the thing it describes run in one column */}
        <div className="mt-[clamp(14px,2vh,24px)] text-[clamp(13px,1.4vw,17px)] leading-normal text-ink-2">
          <p>gets you a nice ui and easy access to your ssh server</p>
          <p className="mt-1 text-right">use servers storage, share files, open it on your phone</p>
        </div>

        <div className="mt-[clamp(34px,6vh,64px)]">
          <FileYard />
        </div>
      </div>
    </section>
  )
}
