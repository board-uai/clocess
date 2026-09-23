import { Callout, SectionTitle } from '../../parts/Prose'

export function Introduction() {
  return (
    <>
      <Callout title="Who is this for?">
        Anyone with a server or a spare machine who wants to reach its storage from a phone or
        laptop without opening an SSH session every time.
      </Callout>

      <SectionTitle>What clocess is</SectionTitle>
      <p>
        Clocess is a small daemon you run on a machine you own, and a web app that talks to it. It
        gives you a slice of that machine&apos;s storage, reachable from any browser.
      </p>
    </>
  )
}
