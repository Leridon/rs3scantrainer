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
    console.log(this.keyframes)
  }

  sample(angle: number): number {
    let index_a = lodash.findLastIndex(this.keyframes, e => e.angle < angle)
    if (index_a < 0) index_a = this.keyframes.length - 1

    const index_b = (index_a + 1) % this.keyframes.length

    const previous = this.keyframes[index_a]
    const next = this.keyframes[index_b]

    const t = angleDifference(angle, previous.angle) / angleDifference(next.angle, previous.angle)

    let res = (1 - t) * previous.value + t * next.value  // Linearly interpolate between keyframes

    //console.log(`Correcting by ${res.toFixed(2)}`)

    return res
  }

  static fromCalibrationSamples(samples: {
    position: Vector2, is_angle_degrees: number
  }[]): AngularKeyframeFunction {
    console.log(samples)

    return new AngularKeyframeFunction(
      samples.map(({position, is_angle_degrees}) => {
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

  // Calibrated without Antialiasing
  const CALIBRATION_TABLE = AngularKeyframeFunction.fromCalibrationSamples([

    // Immediate neighbours (3x3)
    {position: {x: 1, y: 0}, is_angle_degrees: 178.65},
    {position: {x: 1, y: 1}, is_angle_degrees: 223.87},
    {position: {x: 0, y: 1}, is_angle_degrees: 269.20},
    {position: {x: -1, y: 1}, is_angle_degrees: 314.42},
    {position: {x: -1, y: 0}, is_angle_degrees: 359.54},
    {position: {x: -1, y: -1}, is_angle_degrees: 44.35},
    {position: {x: 0, y: -1}, is_angle_degrees: 88.74},
    {position: {x: 1, y: -1}, is_angle_degrees: 133.69},

    // Knight moves (5x5)
    {position: {x: -2, y: 1}, is_angle_degrees: 336.92},
    {position: {x: -2, y: -1}, is_angle_degrees: 21.82},
    {position: {x: -1, y: -2}, is_angle_degrees: 66.56},
    {position: {x: 1, y: -2}, is_angle_degrees: 111.15},
    {position: {x: 2, y: -1}, is_angle_degrees: 156.08},
    {position: {x: 2, y: 1}, is_angle_degrees: 201.11},
    {position: {x: -1, y: 2}, is_angle_degrees: 291.64},
    {position: {x: 1, y: 2}, is_angle_degrees: 246.43},

    // Tiles in the 7 by 7
    {position: {x: -3, y: 1}, is_angle_degrees: 344.44},
    {position: {x: -3, y: 2}, is_angle_degrees: 329.45},
    {position: {x: -3, y: -1}, is_angle_degrees: 14.43},
    {position: {x: -3, y: -2}, is_angle_degrees: 29.37},

    {position: {x: -2, y: 3}, is_angle_degrees: 299.44},
    {position: {x: -1, y: 3}, is_angle_degrees: 284.20},
    {position: {x: 1, y: 3}, is_angle_degrees: 254.16},
    {position: {x: 2, y: 3}, is_angle_degrees: 238.93},

    {position: {x: 3, y: -1}, is_angle_degrees: 163.72},
    {position: {x: 3, y: -2}, is_angle_degrees: 148.82},
    // TODO: Two missing calibration spots

    {position: {x: 2, y: -3}, is_angle_degrees: 118.86},
    {position: {x: 1, y: -3}, is_angle_degrees: 103.92},
    {position: {x: -1, y: -3}, is_angle_degrees: 73.95},
    {position: {x: -2, y: -3}, is_angle_degrees: 59.20},

    // 9 by 9 area

  ])

  const DEBUG_COMPASS_READER = true
  const DISABLE_CALIBRATION = false

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

  export function readCompassState(ui: MatchedUI.Compass): CompassReadResult {
    let data = ui.image.toData(
      Rectangle.screenOrigin(ui.rect).x,
      Rectangle.screenOrigin(ui.rect).y,
      UI_SIZE.x - 1,
      UI_SIZE.y - 1);

    let dir = getCompassAngle(data, Rectangle.screenOrigin(ui.rect));

    if (dir.type != "success") return {type: dir.type}

    let isArc = CompassReader.isArcClue(data);
    return {type: "success", state: {angle: dir.angle, isArc: isArc}};
  }

  const debug_overlay = new OverlayGeometry()

  function getCompassAngle(buf: ImageData, origin: Vector2): AngleResult {
    const CENTER_OFFSET = {x: 88, y: 138}
    const CENTER_SIZE = 2
    const OFFSET = CENTER_SIZE - 1
    const SAMPLING_RADIUS: number = 77

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
      const r = SAMPLING_RADIUS

      function sample(x: number, y: number): void {
        if (isArrow(x, y)) {
          sampled.push({x, y})
          if (DEBUG_COMPASS_READER) debug_overlay.rect(Rectangle.centeredOn(Vector2.add(origin, CENTER_OFFSET, {x, y}), 1), {color: mixColor(255, 0, 0), width: 1})
        } else {
          if (DEBUG_COMPASS_READER) debug_overlay.rect(Rectangle.centeredOn(Vector2.add(origin, CENTER_OFFSET, {x, y}), 1), {color: mixColor(0, 255, 0), width: 1})
        }
      }

      let x = CENTER_SIZE + SAMPLING_RADIUS
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

    if (circle_sampled_pixels.length == 0) return {type: "likely_concealed"}

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

    for (let x = -SAMPLING_RADIUS + 5; x <= SAMPLING_RADIUS + 5; x++) {
      for (let y = -SAMPLING_RADIUS + 5; y <= SAMPLING_RADIUS + 5; y++) {
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

    const final_angle = DISABLE_CALIBRATION
      ? angle_after_rectangle_sample
      : normalizeAngle(angle_after_rectangle_sample + CALIBRATION_TABLE.sample(angle_after_rectangle_sample))

    return {
      type: "success",
      angle: final_angle
    }

    /*
    const index_a = lodash.findLastIndex(CALIBRATION_TABLE, e => e.angle < angle_after_circle_sampling)
    const index_b = (index_a + 1) % CALIBRATION_TABLE.length

    const previous = CALIBRATION_TABLE[index_a]
    const next = CALIBRATION_TABLE[index_b]

    const t = normalizeAngle(angle_after_circle_sampling - previous.angle) / angleDifference(next.angle, previous.angle)

    const offset = (1 - t) * previous.offset + t * next.offset

    return {type: "success", angle: normalizeAngle(angle_after_circle_sampling + offset)}
     */
  }


  export function isArcClue(buf: ImageData) {

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
}