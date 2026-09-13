import { useLocation } from 'react-router-dom'
import { Footer } from '@/layout/Footer'
import { Boxes } from './sections/Boxes'
import { Everything } from './sections/Everything'
import { Handshake } from './sections/Handshake'
import { KeepNone } from './sections/KeepNone'
import { SAY_Y } from '@/scene'

const GAP = 'h-[clamp(320px,42vh,560px)]'

export function Hero() {
  const atHome = useLocation().pathname === '/'

  return (
    <>
      <p
        style={{ top: `${SAY_Y * 100}svh` }}
        className="exit-fade pointer-events-none absolute inset-x-0 z-10 mx-auto max-w-[60ch] px-pad text-center text-[clamp(13.5px,1.6vw,16px)] text-balance text-ink-2"
      >
        A slice of your own server, reachable from your phone
      </p>


      {atHome && (
        <>
          <div className="hero-sink pointer-events-none absolute inset-x-0 top-[57svh] z-10 flex justify-center px-pad">
            <Handshake />
          </div>

          <section className="h-svh" />
          <div className={GAP} />
          <KeepNone />

          <div className={GAP} />

          <Everything />

          <div className={GAP} />

          <Boxes />


          <div className={GAP} />

          <Footer />
        </>
      )}
    </>
  )
}
