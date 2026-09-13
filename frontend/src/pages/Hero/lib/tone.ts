/**
 * The page's hardware greys, taken off the scene rather than picked fresh: the
 * lit and shaded tones here are the ones the lattice and the wordmark are built
 * from, so a flat panel on the page and a lit solid in the void read as the
 * same material under the same light.
 *
 * There is no colour in here on purpose. The void is black, the mark is white,
 * and everything between them is one ramp — anything that needs to stand out
 * does it by being lighter, not by being another hue.
 */
export const TONE = {
  /** the brightest face, the wordmark's own — used sparingly, it draws the eye */
  bright: '#F2F5F4',
  /** an ordinary lit face */
  face: '#C9CDD0',
  /** the lattice's lit tone, for anything that should sit back */
  mid: '#8A9095',
  /** the shaded side of a solid — the same relationship the lattice uses */
  edge: '#5A6064',
  /** a recess: a track, a groove, a hairline */
  deep: '#2A2E31',
  /** the black behind glass, a shade under the page so the screen reads as lit */
  screen: '#050607',
} as const

/**
 * The only colours on the page, and what each one is for. They live beside the
 * greys rather than in the components that use them: the same green means free
 * on a bar in one section and healthy on a dot in another, and it is only worth
 * anything if it is the same green.
 */
export const ACCENT = {
  /** a live reading — a machine answering */
  blue: '#7C9BFF',
  /** the way in: the one action worth taking */
  lime: '#C6F05E',
  /** room left, and room used. pale, because a quota is not a warning */
  free: '#AEDDA4',
  filled: '#E5A6A0',
  /** the same red carried far enough to read as an action */
  strike: '#D9564C',
} as const

/**
 * One radius across everything inside the screen, so the files, the buttons and
 * the glass all share a corner. Scaled with the viewport like the type is —
 * a fixed pixel radius reads sharp on a small screen and mean on a large one.
 */
export const ROUND = {
  screen: 'rounded-[clamp(3px,0.5vw,7px)]',
  chip: 'rounded-[clamp(5px,0.75vw,10px)]',
  fileTop: 'rounded-t-[clamp(4px,0.65vw,9px)]',
  fileBase: 'rounded-b-[clamp(4px,0.65vw,9px)]',
} as const

/**
 * The two type sizes the sections are built from. Both are mono, both scale
 * with the viewport, and both were being written out by hand in three files —
 * where they had already started to disagree in the last digit.
 */
export const TYPE = {
  /** a reading: a name, a host, a control */
  mono: 'font-mono text-[clamp(9px,1.05vw,14px)]',
  /** and its footnote — a quota, a size, a unit */
  small: 'font-mono text-[clamp(8px,0.9vw,12px)]',
} as const

/**
 * Per-side border colours miter at the corners on their own, which is the whole
 * bezel: four bevels meeting on a diagonal. Lit from above, so the top face is
 * brightest and the underside sits in its own shadow.
 *
 * Nothing uses this since the screen lost its frame — the files are handled
 * directly now, and a frame around them read as a picture of an app rather than
 * one you can use. Kept because it is the only bevel in the codebase.
 */
export const BEZEL =
  'border-[length:clamp(14px,2.4vw,32px)] border-solid ' +
  'border-t-[#B3B9BD] border-l-[#969CA1] border-r-[#6B7075] border-b-[#7C8287]'
