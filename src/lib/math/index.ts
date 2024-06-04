import * as lodash from "lodash";

export {Rectangle} from "./Rectangle"
export {Vector2} from "./Vector2"
export {Transform} from "./Transform"

export function radiansToDegrees(radians: number): number {
  return radians / (2 * Math.PI) * 360
}

export function degreesToRadians(degrees: number): number{
  return (degrees / 360) * (2 * Math.PI)
}

export function normalizeAngle(radians: number): number {
  while (radians < 0) radians += 2 * Math.PI

  return radians
}

export function circularMean(angles: number[]): number {
  return Math.atan2(lodash.sum(angles.map(Math.sin)), lodash.sum(angles.map(Math.cos)))
}