import {TileCoordinates} from "../runescape/coordinates";
import {Vector2} from "../math";
import {posmod} from "../../skillbertssolver/util";

export namespace Compasses {

  export type TriangulationPoint = {
    position: TileCoordinates,
    angle_radians: number
  }

  export const ANGLE_REFERENCE_VECTOR = {x: 1, y: 0}
  export const RESOLUTION = 32
  export const EPSILON = (2 * Math.PI) / RESOLUTION / 2

  export function angleDifference(a: number, b: number) {
    return posmod(b - a + Math.PI, 2 * Math.PI) - Math.PI;
  }

  /**
   * Gets the expected compass angle for a given player spot and a target compass spot in radians
   * @param position
   * @param spot
   */
  export function getExpectedAngle(position: TileCoordinates, spot: TileCoordinates): number {
    const offset = Vector2.normalize(Vector2.sub(spot, position))

    const a = ANGLE_REFERENCE_VECTOR
    const b = offset

    const res = Math.atan2(Vector2.det(a, b), Vector2.dot(a, b))

    if (res < 0) return res + 2 * Math.PI
    else return res
  }

  export function isPossible(information: TriangulationPoint[], spot: TileCoordinates): boolean {



    return information.every(i =>
      Math.abs(angleDifference(getExpectedAngle(i.position, spot), i.angle_radians)) < EPSILON
    )
  }
}