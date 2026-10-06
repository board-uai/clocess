export const GEO_URL = '/logo.geo'

export interface GradientAnchor {
  c: string
  /** x runs -0.5..0.5 across the width, y bottom to top */
  p: [number, number]
  /** falloff radius — bigger bleeds further */
  r: number
}

/** the four colours blended across the letter faces */
export const ANCHOR: GradientAnchor[] = [
  { c: '#ffffff', p: [-0.52, 0.30], r: 0.62 }, // top left
  { c: '#fafafa', p: [-0.10, -0.34], r: 0.58 }, // low centre-left
  { c: '#ffffff', p: [0.34, 0.36], r: 0.60 }, // top right
  { c: '#f4f4f4', p: [0.56, -0.30], r: 0.40 }, // low right
]

/** light directions, as GLSL expressions */
export const KEY_DIR = 'normalize(vec3(-0.42, 0.55, 0.72))'
export const FILL_DIR = 'normalize(vec3(0.72, -0.34, 0.55))'

/** derived from the decoder's normalisation — not a knob */
export const HALF_W = 0.5

/* ─── lattice ───────────────────────────────────────────────── */

/**
 * A cubic scaffold standing behind the wordmark. Members run on all three axes
 * through a regular grid, so it reads as one structure rather than scattered
 * bars, and the far end fades into the room instead of ending — which is what
 * makes it feel like it carries on.
 *
 * Everything is in logo units. `front` is the crucial one: the letters extrude
 * from z = 0 back to roughly -4.28, so the lattice has to start behind that or
 * it grows through them. Nothing here may be positive.
 */
export const LATTICE = {
  /** edge of one cube */
  cell: 3,
  /** half-extents across and up — wide enough to leave frame at the far end */
  spanX: 30,
  spanY: 13,
  /** nearest and furthest plane. front sits clear behind the extrusion tail */
  front: -18,
  back: -64,
  /** side of each square member */
  thick: 0.12,
  /** distance from the lens where members start and finish dissolving */
  fade: [13, 44] as [number, number],
  /* grey rather than white, and this is the legibility knob: the structure sits
     behind the wordmark and the copy, and at white it was bright enough to eat
     both. the shaded face keeps the 0.52 ratio the source art gives a pale bar,
     so the members still read as solid rather than as flat lines. */
  color: '#000000',
  dark: '#000000',
  /** every nth member picks up an accent — 0 for none, which is one tone and
      so one draw call. primes, if you turn them on, so neither lines up with
      the grid nor with the other */
  blueEvery: 0,
  limeEvery: 0,
  blue: '#7C9BFF',
  blueDark: '#3D4E86',
  lime: '#C6F05E',
  limeDark: '#69802F',
  /* ─ the damage ─────────────────────────────────────────────
     a perfect grid reads as a wireframe, not a structure. members are cut per
     cell rather than run end to end, so pieces can go missing individually. */

  /** fraction of members simply absent, scattered right through it. this is the
      lever for how much structure there is at all — it thins the grid without
      changing the size of its cubes, which raising `cell` would */
  gaps: 0.64,

  /** whole cubes knocked out — centre and half-edge, in logo units. chebyshev
      distance, so the hole is a cube rather than a sphere */
  voids: [
    { x: -8, y: 2.5, z: -26, r: 4.5 },
    { x: 10, y: -3.5, z: -37, r: 6 },
    { x: -3, y: 6, z: -48, r: 4.5 },
    { x: 16, y: 2, z: -30, r: 3.5 },
    { x: -15, y: -5, z: -44, r: 5 },
    { x: 4, y: 9, z: -33, r: 5 },
    { x: -20, y: 3, z: -34, r: 4.5 },
    { x: 20, y: -8, z: -50, r: 5.5 },
    { x: -6, y: -9, z: -28, r: 4 },
  ],

  /** how far the ragged edge reaches past a void, as a multiple of its size —
      without this the holes come out with clean cut faces, which is worse */
  fray: 1.6,

  /** how likely a member is to go inside that frayed edge, at its worst */
  frayBite: 0.6,

  /**
   * Where the structure stands out of the way so the page can be read. Measured
   * on the screen rather than carved out of the geometry, because a carve only
   * lands at one viewport shape and one scroll position — this holds at every
   * aspect, and follows the wordmark through its flight for free.
   */
  clear: {
    /** how much the nav band and the middle take away at most */
    navAmount: 0.5,
    sidesAmount: 1,

    /** the nav band across the top: how deep it reaches, and its soft edge, px */
    nav: 130,
    navFade: 170,

    /**
     * And the middle of the frame, so the structure stands on the two sides
     * only. Measured across the half-width: 0 is the centre line, 1 is either
     * edge. Cleared out to `inner`, full structure from `outer`, the gradient
     * between — which is what makes it read as two banks receding into the dark
     * rather than as a shape cut out of the middle.
     *
     * Screen-space on purpose. A gap carved into the geometry would project
     * wider the further back it went, so the deep planes would close over the
     * centre again while the near ones stood clear.
     */
    inner: 0.55,
    outer: 0.88,
  },

  /**
   * Three runs crossing the gap between the banks, jointed the whole way: short
   * legs stepping along and climbing and dropping again, so each reads as a
   * cable finding its way rather than as a bar laid across. Every leg stays on
   * an axis, so they belong to the same grid the walls do and need no turning.
   *
   * `from` is where a run starts and each move is an axis and a distance. They
   * are the one part that ignores the side clearance, or the middle would
   * swallow the very gap they cross — so the list stays short.
   */
  runs: [
    {
      from: [-23, 4, -38],
      moves: [
        ['x', 5], ['y', 3], ['x', 7], ['y', -1], ['x', 8], ['y', 4],
        ['x', 4], ['y', -3], ['x', 9], ['y', 1], ['x', 7], ['y', -4], ['x', 5],
      ],
    },
    {
      from: [-34, 5, -60],
      moves: [
        ['x', 11], ['y', 5], ['x', 9], ['y', -4], ['x', 12], ['y', 6],
        ['x', 10], ['y', -5], ['x', 11], ['y', 3], ['x', 14],
      ],
    },
  ] as { from: [number, number, number]; moves: ['x' | 'y' | 'z', number][] }[],

  /**
   * The runs carry their own fade, reaching much further than the walls'. They
   * sit deep enough that the structure's own [13, 44] would have finished with
   * them before they were ever drawn — a run at z -46 was already invisible on
   * it. Distance still thins them, just over a longer road.
   */
  runFade: [25, 85] as [number, number],

  /**
   * How much of the structure goes as the hero is scrolled past. 1 takes it
   * away entirely, 0 keeps it behind the whole page. Safe either way: the lens
   * travels about 2.3 units on that scroll and the lattice starts 18 back, so
   * it never comes closer than ~17 units however far down the page you are.
   */
  leave: 0,

  /** how far the whole structure sways — 0 holds it still, which also lets the
      render loop settle instead of redrawing every frame to move nothing */
  sway: 0,
  period: 26,
}

/**
 * A light sunk into the middle of the lattice, behind everything, throwing the
 * centre of the structure forward and leaving its edges to the dark. It is the
 * one thing in the scene that is not lit from the front.
 */
export const GLOW = {
  /** where it sits, in logo units — deep, on the centre line, behind the logo */
  at: [0, 0, -40] as [number, number, number],
  /** how far its light carries through the members. widening this lifts the
      sides without touching the centre — at the source the falloff is 1
      whatever the reach, so only the outer members change */
  reach: 40,
  /** how hard it lands on one facing it square on */
  power: 1.3,
  color: '#FFFFFF',
  /** haze around the source itself: its radius in logo units, and its strength */
  halo: 16,
  haze: 0.055,
}

/* ─── room ──────────────────────────────────────────────────── */

/** the room's upper colour */
export const ENV_TOP = '#12161A'

/** floor colour, reached toward the bottom */
export const ENV_BOT = '#000000'

/* ─── camera ────────────────────────────────────────────────── */

/** lens angle — higher is a wider lens and a more dramatic fan (try 25..60) */
export const FOV = 35

/** pointer tilts the logo up/down (0 freezes it) */
export const TILT_PITCH = 0

/** pointer turns the logo left/right (0 freezes it) */
export const TILT_YAW = 0

/* ─── animation ─────────────────────────────────────────────── */

/** opening width, as a fraction of the viewport */
export const START_CAMERA = 0.65

/** flight duration, ms */
export const DUR = 1000

/** landed width, as a fraction of t he viewport */
export const DOCK_W_DEF = 0.5

/** landed centre height — 0.5 is dead centre, lower sits higher up */
export const DOCK_Y = 0.3

/* the auth move is a straight camera travel, both legs measured in docked
   camera distances so it reads the same on any screen */

/** forward, past 1 the lens ends up through the wordmark's plane */
export const AUTH_FWD = 1.3

/** and under it, which is what lifts the logo out of the top of frame */
export const AUTH_DOWN = 0.9

/** auth flight duration, ms, longer than the opening so the climb reads */
export const AUTH_DUR = 1600

/** point in the flight where the room starts going out, the climb leads it */
export const ROOM_LATE = 0.35

/** supporting line's height, clear of the fan below the caps */
export const SAY_Y = 0.46

/* ─── stages ────────────────────────────────────────────────── */

/** a resting state for the whole scene, in viewport relative terms */
export interface Stage {
  /** logo width as a fraction of the viewport, above 1 the caps overfill it */
  w: number
  /** logo centre height, 0.5 is dead centre */
  y: number
  /** room brightness, 1 is lit and 0 is pure black */
  room: number
  /** how far through the html layer the lens is, 0 is in front of it and 1 is past */
  exit: number
}

/** every state the scene settles at, flights just interpolate between two */
export const STAGE = {
  opening: { w: START_CAMERA, y: 0.4, room: 1, exit: 0 },
  hero: { w: DOCK_W_DEF, y: DOCK_Y, room: 1, exit: 0 },
  /* same framing as hero, the camera travel is what moves, not the pose */
  auth: { w: DOCK_W_DEF, y: DOCK_Y, room: 0, exit: 1 },
} satisfies Record<string, Stage>

export type StageName = keyof typeof STAGE
