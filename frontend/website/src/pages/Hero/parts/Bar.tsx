import { ACCENT, TONE } from '../lib/tone'
import { roomLeft } from '../lib/quota'

/**
 * Room left against room used. The machines carry one and so does the claim
 * above them, and they have to be the same bar — a quota drawn two ways reads
 * as two different measurements of two different things.
 *
 * No labels on it: whatever stands under it says which number this is, and a
 * bar this thin has no room for words anyway.
 */
export function Bar({
  used,
  total,
  className = '',
}: {
  used: number
  total: number
  className?: string
}) {
  const free = roomLeft(used, total)

  return (
    <span
      aria-hidden="true"
      style={{ background: TONE.deep }}
      className={`flex h-[clamp(6px,0.7vw,10px)] overflow-hidden rounded-pill ${className}`}
    >
      <span style={{ width: `${free}%`, background: ACCENT.free }} className="block h-full" />
      <span style={{ width: `${100 - free}%`, background: ACCENT.filled }} className="block h-full" />
    </span>
  )
}
