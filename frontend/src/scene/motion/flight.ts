import { ROOM_LATE } from '../config'
import type { Stage } from '../config'
import type { Pose } from '../types'

/** smootherstep, flat acceleration at both ends so nothing jolts on departure */
export function ease(u: number): number {
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** remaps progress into a window, for channels that start after the others */
function late(u: number, from: number): number {
  return ease(Math.min(1, Math.max(0, (u - from) / (1 - from))))
}

/** blends any two stages, so an interrupted flight can become the next from */
export function stageAt(from: Stage, to: Stage, u: number): Stage {
  const e = ease(u)
  const mix = (a: number, b: number) => a + (b - a) * e

  /* the lights hold while the climb leads, so the room is still lit for the
     part of the trip you can actually see */
  const r = late(u, ROOM_LATE)

  return {
    w: mix(from.w, to.w),
    y: mix(from.y, to.y),
    room: from.room + (to.room - from.room) * r,
    exit: mix(from.exit, to.exit),
  }
}

/** a stage only becomes a screen space pose once the viewport is known */
export function poseOf(stage: Stage, vw: number, vh: number): Pose {
  return {
    w: stage.w * vw,
    cx: vw / 2,
    cy: stage.y * vh,
  }
}
