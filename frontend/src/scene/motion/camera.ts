import { FOV } from '../config'
import type { Pose } from '../types'

export interface CameraSolution {
  x: number
  y: number
  z: number
  near: number
  far: number
}

/**
 * Solve for the camera rather than scaling the object: the caps are 1 unit
 * across on z = 0, so the distance that makes them pose.w pixels wide falls
 * out of the frustum. Sliding the camera (never rotating it) keeps the
 * vanishing point on the principal point.
 */
export function solveCamera(pose: Pose, vw: number, vh: number, depth: number): CameraSolution {
  const tan = Math.tan((FOV * Math.PI) / 360)
  const aspect = vw / vh
  const z = vw / pose.w / (2 * tan * aspect)

  return {
    x: -((pose.cx / vw) * 2 - 1) * z * tan * aspect,
    y: ((pose.cy / vh) * 2 - 1) * z * tan,
    z,
    near: Math.max(0.01, z * 0.04),
    far: z + depth * 1.4 + 1,
  }
}
