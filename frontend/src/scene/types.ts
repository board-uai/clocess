import type { BufferGeometry, Color, IUniform, Vector2, Vector3, Vector4 } from 'three'

/** shared by the room quad and the logo — both call envAt() */
export type SceneUniforms = {
  /** viewport size in device pixels */
  uRes: IUniform<Vector2>
  /** room's upper colour */
  uEnvTop: IUniform<Color>
  /** floor colour */
  uEnvBot: IUniform<Color>
  /** overhead light position */
  uHot: IUniform<Vector2>
  /** xy = logo centre px, z = width px, w = shadow strength */
  uLogo: IUniform<Vector4>
  uCam: IUniform<Vector3>
  /** room brightness, 1 = lit, 0 = pure black */
  uRoom: IUniform<number>
  uHalfW: IUniform<number>
  uHalfH: IUniform<number>
  uDepth: IUniform<number>
  /** gradient anchors: colour, position, radius */
  uC: IUniform<Color[]>
  uP: IUniform<Vector2[]>
  uR: IUniform<number[]>
}

/** where the logo sits on screen, in viewport pixels */
export interface Pose {
  /** width of the caps */
  w: number
  cx: number
  cy: number
}

/** width normalised to 1 unit, caps on z = 0, extrusion running to -depth */
export interface LogoGeometry {
  geometry: BufferGeometry
  /** half the cap height, in units */
  halfH: number
  /** extrusion depth, in units */
  depth: number
  /** width / cap height */
  capsAspect: number
}
