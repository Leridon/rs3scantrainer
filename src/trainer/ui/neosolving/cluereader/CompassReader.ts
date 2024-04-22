import {coldiff} from "../../../../skillbertssolver/oldlib";
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {ImgRef, mixColor} from "@alt1/base";
import {circularMean, degreesToRadians, normalizeAngle, Rectangle, Vector2} from "../../../../lib/math";
import {ClueReader} from "./ClueReader";
import * as lodash from "lodash";
import {OverlayGeometry} from "../../../../lib/util/OverlayGeometry";
import angleDifference = Compasses.angleDifference;
import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;


class AngularKeyframeFunction {
  private constructor(private readonly keyframes: {
    angle: number,
    value: number
  }[]) {
    this.keyframes = lodash.sortBy(keyframes, e => e.angle)
  }

  sample(angle: number): number {
    if (this.keyframes.length == 0) return 0
    if (this.keyframes.length == 1) return this.keyframes[0].value

    let index_a = lodash.findLastIndex(this.keyframes, e => e.angle < angle)
    if (index_a < 0) index_a = this.keyframes.length - 1

    const index_b = (index_a + 1) % this.keyframes.length

    const previous = this.keyframes[index_a]
    const next = this.keyframes[index_b]

    const t = angleDifference(angle, previous.angle) / angleDifference(next.angle, previous.angle)

    // Linearly interpolate between keyframes
    return (1 - t) * previous.value + t * next.value
  }

  static fromCalibrationSamples(samples: {
    position: Vector2, is_angle_degrees: number
  }[]): AngularKeyframeFunction {
    return new AngularKeyframeFunction(
      samples.filter(s => s.is_angle_degrees != undefined).map(({position, is_angle_degrees}) => {
        const should_angle = Vector2.angle(ANGLE_REFERENCE_VECTOR, {x: -position.x, y: -position.y})
        const is_angle = degreesToRadians(is_angle_degrees)

        let dif = should_angle - is_angle
        if (dif < -Math.PI) dif += 2 * Math.PI

        return {
          angle: is_angle,
          value: dif
        }
      })
    )

  }
}

export namespace CompassReader {

  const DEBUG_COMPASS_READER = true
  const DISABLE_CALIBRATION = true

  import angleDifference = Compasses.angleDifference;
  import MatchedUI = ClueReader.MatchedUI;
  import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;

  export const EPSILON = (2 / 360) * 2 * Math.PI // About two degrees in either direction

  export type CompassState = {
    angle: number,
    isArc: boolean
  }

  export function find(img: ImgRef,
                       origin: Vector2
  ): MatchedUI.Compass {
    return {
      type: "compass",
      image: img,
      rect: Rectangle.fromOriginAndSize(origin, {x: 172, y: 259})
    }
  }

  export const UI_SIZE = {x: 172, y: 259}

  export type CompassReadResult = {
    type: "success",
    state: CompassState,
  } | { type: "likely_closed" }
    | { type: "likely_concealed" }

  export type AngleResult = {
    type: "success",
    angle: number,
  } | { type: "likely_closed" }
    | { type: "likely_concealed" }

  export function readCompassState(ui: MatchedUI.Compass,
                                   calibration_mode: CompassReader.CalibrationMode = "off"
  ): CompassReadResult {
    let data = ui.image.toData(
      Rectangle.screenOrigin(ui.rect).x,
      Rectangle.screenOrigin(ui.rect).y,
      UI_SIZE.x - 1,
      UI_SIZE.y - 1);

    let dir = getCompassAngle(data, Rectangle.screenOrigin(ui.rect), calibration_mode);

    if (dir.type != "success") return {type: dir.type}

    let isArc = CompassReader.isArcClue(data);
    return {type: "success", state: {angle: dir.angle, isArc: isArc}};
  }

  const debug_overlay = new OverlayGeometry()

  function getCompassAngle(buf: ImageData, origin: Vector2,
                           calibration_mode: CompassReader.CalibrationMode = "off"
  ): AngleResult {
    const CENTER_OFFSET = {x: 88, y: 137}
    const CENTER_SIZE = 2
    const OFFSET = CENTER_SIZE - 1
    const INITIAL_SAMPLING_RADIUS: number = 75
    const TOTAL_SAMPLING_RADIUS: number = 80

    function isArrow(x: number, y: number) {
      const i = 4 * ((CENTER_OFFSET.y + y) * buf.width + x + CENTER_OFFSET.x)

      return buf.data[i] < 5
      //&& buf.data[i + 1] < 5
      //&& buf.data[i + 2] < 5
    }

    if (DEBUG_COMPASS_READER) {
      debug_overlay.clear()
    }

    const circle_sampled_pixels: Vector2[] = (() => {
      const sampled: Vector2[] = []
      const r = INITIAL_SAMPLING_RADIUS

      function sample(x: number, y: number): void {
        if (isArrow(x, y)) {
          sampled.push({x, y})
        }

        if (DEBUG_COMPASS_READER) {
          /*debug_overlay.line(
            Vector2.add(origin, CENTER_OFFSET, {x, y}),
            Vector2.add(origin, CENTER_OFFSET, {x, y}),
            {color: isArrow(x, y) ? mixColor(255, 0, 0) : mixColor(0, 255, 0), width: 0}
          )*/

          debug_overlay.rect(
            Rectangle.centeredOn(Vector2.add(origin, CENTER_OFFSET, {x, y}), 0),
            {color: isArrow(x, y) ? mixColor(255, 0, 0) : mixColor(0, 255, 0), width: 1})
        }

      }

      let x = CENTER_SIZE + INITIAL_SAMPLING_RADIUS
      let y = 0;

      // Initialising the value of P
      let P = 1 - r;
      while (x > y) {
        if (P <= 0) {
          // Mid-point is inside or on the perimeter
          P = P + 2 * y + 1;
        } else { // Mid-point is outside the perimeter
          x--;
          P = P + 2 * y - 2 * x + 1;
        }

        // All the perimeter points have already been printed
        if (x < y) break;

        // Printing the generated point and its reflection
        // in the other octants after translation

        sample(x, y + OFFSET) // Octant 1
        sample(-x + OFFSET, y + OFFSET) // Octant 4
        sample(-x + OFFSET, -y) // Octant 5
        sample(x, -y) // Octant 8

        // If the generated point is on the line x = y then
        // the perimeter points have already been printed
        if (x != y) {
          sample(y + OFFSET, x)       // Octant 2
          sample(-y, x)                   // Octant 3
          sample(-y, -x + OFFSET)        // Octant 6
          sample(y + OFFSET, -x + OFFSET) // Octant 7
        }

        y++;
      }

      return sampled
    })()

    if (DEBUG_COMPASS_READER) {
      for (let p of circle_sampled_pixels) {
        debug_overlay.line(
          Vector2.add(origin, CENTER_OFFSET),
          Vector2.add(origin, CENTER_OFFSET, p),
          {width: 1, color: mixColor(255, 0, 0)}
        )
      }

      debug_overlay.render()
    }

    if (circle_sampled_pixels.length == 0) return {type: "likely_closed"}
    if (circle_sampled_pixels.length > 5) return {type: "likely_concealed"}

    // Map all sample points to their respective angle
    // The angle is taken from the true center of the compass arrow, which is why we offset the samples by 0.5
    // Also, the y axis is flipped to convert from screen coordinates to the internally used coordinate system
    const angles = circle_sampled_pixels.map(p => Vector2.angle(
      ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: p.x - 0.5, y: -p.y}))
    )

    const angle_after_circle_sampling = normalizeAngle(circularMean(angles))

    const rectangle_samples: {
      angle: number,
      weight: number
    }[] = []

    for (let x = -TOTAL_SAMPLING_RADIUS; x <= TOTAL_SAMPLING_RADIUS; x++) {
      for (let y = -TOTAL_SAMPLING_RADIUS; y <= TOTAL_SAMPLING_RADIUS; y++) {
        if (isArrow(x, y)) {
          let angle = Vector2.angle(ANGLE_REFERENCE_VECTOR, Vector2.normalize({x, y: -y}))

          const weight = x * x + y * y // Length squared

          if (weight <= 64) continue // Ignore pixels closer than 8 pixels completely to the center to avoid some bias

          if (angleDifference(angle, angle_after_circle_sampling) > Math.PI / 2)
            angle = normalizeAngle(angle - Math.PI)

          rectangle_samples.push({
            angle: angle,
            weight: weight
          })
        }
      }
    }

    const angle_after_rectangle_sample = normalizeAngle(Math.atan2(
      lodash.sum(rectangle_samples.map(a => a.weight * Math.sin(a.angle))),
      lodash.sum(rectangle_samples.map(a => a.weight * Math.cos(a.angle))),
    ))

    const final_angle = calibration_mode && !DISABLE_CALIBRATION
      ? normalizeAngle(angle_after_rectangle_sample + CompassReader.calibration_tables[calibration_mode].sample(angle_after_rectangle_sample))
      : angle_after_rectangle_sample

    return {
      type: "success",
      angle: final_angle
    }
  }

  export function isArcClue(buf: ImageData) {
    return false

    // TODO: Reimplement.
    let n = 0;
    for (let a = 20; a < 120; a++) {
      const i = a * 4 + 163 * buf.width * 4;
      if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 52, 31, 5) < 50) {
        n++;
      }
    }
    return n > 5;
  }

  export const calibration_tables = {
    "off": AngularKeyframeFunction.fromCalibrationSamples([
      // Immediate neighbours (3x3)
      {position: {x: -1, y: 1}, is_angle_degrees: undefined},
      {position: {x: 0, y: 1}, is_angle_degrees: undefined},
      {position: {x: 1, y: 1}, is_angle_degrees: undefined},
      {position: {x: 1, y: 0}, is_angle_degrees: undefined},
      {position: {x: 1, y: -1}, is_angle_degrees: undefined},
      {position: {x: 0, y: -1}, is_angle_degrees: undefined},
      {position: {x: -1, y: -1}, is_angle_degrees: undefined},
      {position: {x: -1, y: 0}, is_angle_degrees: undefined},

      // Knight moves (5x5)
      {position: {x: -1, y: 2}, is_angle_degrees: undefined},
      {position: {x: 1, y: 2}, is_angle_degrees: undefined},
      {position: {x: 2, y: 1}, is_angle_degrees: undefined},
      {position: {x: 2, y: -1}, is_angle_degrees: undefined},
      {position: {x: 1, y: -2}, is_angle_degrees: undefined},
      {position: {x: -1, y: -2}, is_angle_degrees: undefined},
      {position: {x: -2, y: -1}, is_angle_degrees: undefined},
      {position: {x: -2, y: 1}, is_angle_degrees: undefined},

      // 7 by 7 area
      {position: {x: -2, y: 3}, is_angle_degrees: undefined},
      {position: {x: -1, y: 3}, is_angle_degrees: undefined},
      {position: {x: 1, y: 3}, is_angle_degrees: undefined},
      {position: {x: 2, y: 3}, is_angle_degrees: undefined},

      {position: {x: 3, y: -2}, is_angle_degrees: undefined},
      {position: {x: 3, y: -1}, is_angle_degrees: undefined},
      {position: {x: 3, y: 1}, is_angle_degrees: undefined},
      {position: {x: 3, y: 2}, is_angle_degrees: undefined},

      {position: {x: 2, y: -3}, is_angle_degrees: undefined},
      {position: {x: 1, y: -3}, is_angle_degrees: undefined},
      {position: {x: -1, y: -3}, is_angle_degrees: undefined},
      {position: {x: -2, y: -3}, is_angle_degrees: undefined},

      {position: {x: -3, y: -2}, is_angle_degrees: undefined},
      {position: {x: -3, y: -1}, is_angle_degrees: undefined},
      {position: {x: -3, y: 1}, is_angle_degrees: undefined},
      {position: {x: -3, y: 2}, is_angle_degrees: undefined},

      // 9 by 9 area
      {position: {x: -3, y: 4}, is_angle_degrees: undefined},
      {position: {x: -1, y: 4}, is_angle_degrees: undefined},
      {position: {x: 1, y: 4}, is_angle_degrees: undefined},
      {position: {x: 3, y: 4}, is_angle_degrees: undefined},

      {position: {x: 4, y: -3}, is_angle_degrees: undefined},
      {position: {x: 4, y: -1}, is_angle_degrees: undefined},
      {position: {x: 4, y: 1}, is_angle_degrees: undefined},
      {position: {x: 4, y: 3}, is_angle_degrees: undefined},

      {position: {x: 3, y: -4}, is_angle_degrees: undefined},
      {position: {x: 1, y: -4}, is_angle_degrees: undefined},
      {position: {x: -1, y: -4}, is_angle_degrees: undefined},
      {position: {x: -3, y: -4}, is_angle_degrees: undefined},

      {position: {x: -4, y: -3}, is_angle_degrees: undefined},
      {position: {x: -4, y: -1}, is_angle_degrees: undefined},
      {position: {x: -4, y: 1}, is_angle_degrees: undefined},
      {position: {x: -4, y: 3}, is_angle_degrees: undefined},

      // 11 by 11 area
      {position: {x: -4, y: 5}, is_angle_degrees: undefined},
      {position: {x: -3, y: 5}, is_angle_degrees: undefined},
      {position: {x: -2, y: 5}, is_angle_degrees: undefined},
      {position: {x: -1, y: 5}, is_angle_degrees: undefined},
      {position: {x: 1, y: 5}, is_angle_degrees: undefined},
      {position: {x: 2, y: 5}, is_angle_degrees: undefined},
      {position: {x: 3, y: 5}, is_angle_degrees: undefined},
      {position: {x: 4, y: 5}, is_angle_degrees: undefined},

      {position: {x: 5, y: 4}, is_angle_degrees: undefined},
      {position: {x: 5, y: 3}, is_angle_degrees: undefined},
      {position: {x: 5, y: 2}, is_angle_degrees: undefined},
      {position: {x: 5, y: 1}, is_angle_degrees: undefined},
      {position: {x: 5, y: -1}, is_angle_degrees: undefined},
      {position: {x: 5, y: -2}, is_angle_degrees: undefined},
      {position: {x: 5, y: -3}, is_angle_degrees: undefined},
      {position: {x: 5, y: -4}, is_angle_degrees: undefined},

      {position: {x: 4, y: -5}, is_angle_degrees: undefined},
      {position: {x: 3, y: -5}, is_angle_degrees: undefined},
      {position: {x: 2, y: -5}, is_angle_degrees: undefined},
      {position: {x: 1, y: -5}, is_angle_degrees: undefined},
      {position: {x: -1, y: -5}, is_angle_degrees: undefined},
      {position: {x: -2, y: -5}, is_angle_degrees: undefined},
      {position: {x: -3, y: -5}, is_angle_degrees: undefined},
      {position: {x: -4, y: -5}, is_angle_degrees: undefined},

      {position: {x: -5, y: -4}, is_angle_degrees: undefined},
      {position: {x: -5, y: -3}, is_angle_degrees: undefined},
      {position: {x: -5, y: -2}, is_angle_degrees: undefined},
      {position: {x: -5, y: -1}, is_angle_degrees: undefined},
      {position: {x: -5, y: 1}, is_angle_degrees: undefined},
      {position: {x: -5, y: 2}, is_angle_degrees: undefined},
      {position: {x: -5, y: 3}, is_angle_degrees: undefined},
      {position: {x: -5, y: 4}, is_angle_degrees: undefined},

    ])
  }

  export type CalibrationMode = keyof typeof calibration_tables
}