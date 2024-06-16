import {TileCoordinates} from "../runescape/coordinates";
import {Transform, Vector2} from "../math";
import {posmod} from "../../skillbertssolver/util";
import {CompassReader} from "../../trainer/ui/neosolving/cluereader/CompassReader";
import {TileArea} from "../runescape/coordinates/TileArea";
import {angleDifference, rectangleCrossSection} from "lib/math";

export namespace Compasses {

  export type TriangulationPoint = {
    position: TileArea.ActiveTileArea,
    angle_radians: number,
    direction: Vector2,
    area_center: Vector2,
    modified_origin: Vector2,
    origin_uncertainty: number
  }

  export namespace TriangulationPoint {


    export function construct(position: TileArea.ActiveTileArea, angle: number): TriangulationPoint {

      const size = Vector2.sub(position.size, {x: 0.975, y: 0.975})

      const direction_vector = Vector2.transform(Compasses.ANGLE_REFERENCE_VECTOR, Transform.rotationRadians(angle))

      const location_uncertainty = rectangleCrossSection(size, angle) / 2

      const l = location_uncertainty / Math.tan(CompassReader.EPSILON)

      const center = Vector2.sub(position.center(false), Vector2.scale(0.5 * rectangleCrossSection(size, angle + Math.PI / 2), direction_vector))

      const uncertainty_origin = Vector2.sub(center, Vector2.scale(l, direction_vector))

      return {
        position: position,
        angle_radians: angle,
        direction: direction_vector,
        area_center: center,
        modified_origin: uncertainty_origin,
        origin_uncertainty: location_uncertainty
      }
    }
  }

  export const ANGLE_REFERENCE_VECTOR = {x: 1, y: 0}


  /**
   * Gets the expected compass angle for a given player spot and a target compass spot in radians
   * @param position
   * @param spot
   */
  export function getExpectedAngle(position: Vector2, spot: Vector2): number {
    const offset = Vector2.normalize(Vector2.sub(spot, position))

    const a = ANGLE_REFERENCE_VECTOR
    const b = offset

    const res = Math.atan2(Vector2.det(a, b), Vector2.dot(a, b))

    if (res < 0) return res + 2 * Math.PI
    else return res
  }

  export function isPossible(information: TriangulationPoint[], spot: TileCoordinates): boolean {
    return information.every(i => {
        const modified_expected = getExpectedAngle(i.modified_origin, spot)

        if (angleDifference(modified_expected, i.angle_radians) >= CompassReader.EPSILON) return false

        const expected = getExpectedAngle(i.area_center, spot)

        return angleDifference(modified_expected, expected) < (Math.PI / 2)
      }
    )
  }
}