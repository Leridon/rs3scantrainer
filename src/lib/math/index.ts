export {Rectangle} from "./Rectangle"
export {Vector2} from "./Vector2"
export {Transform} from "./Transform"

export function radiansToDegrees(radians: number): number {
  return radians / (2 * Math.PI) * 360
}