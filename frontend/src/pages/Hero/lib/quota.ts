/**
 * The one measurement the page makes. Two sections read a machine's quota — the
 * claim and the row of cards — and a bar that rounds one way beside a dot that
 * rounds the other is two answers to the same question.
 */

/** how much room is left, as a whole percent */
export const roomLeft = (used: number, total: number) =>
  total > 0 ? Math.round(((total - used) / total) * 100) : 100
