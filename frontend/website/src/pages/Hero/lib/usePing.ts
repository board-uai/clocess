import { useEffect, useState } from 'react'
import { still } from './motion'

/**
 * A latency that moves. A frozen number under a beating dot reads as decoration
 * — it is the number changing that says a machine is answering.
 *
 * Shared, so every reading on the page ticks on the same idea rather than each
 * section inventing its own.
 */

/** what a ping comes back as, cycled rather than random so it stays plausible */
const PINGS = [4, 5, 4, 6, 4, 7, 5]

/** ms between readings */
const EVERY = 2200

export function usePing() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (still()) return
    const tick = window.setInterval(() => setI((n) => n + 1), EVERY)
    return () => window.clearInterval(tick)
  }, [])

  return PINGS[i % PINGS.length]
}
