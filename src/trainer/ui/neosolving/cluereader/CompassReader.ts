import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {ImgRef, mixColor} from "@alt1/base";
import {circularMean, degreesToRadians, normalizeAngle, radiansToDegrees, Rectangle, Vector2} from "../../../../lib/math";
import {ClueReader} from "./ClueReader";
import * as lodash from "lodash";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
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

  import rgbSimilarity = util.rgbSimilarity;
  import angleDifference = Compasses.angleDifference;
  import MatchedUI = ClueReader.MatchedUI;
  import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;
  const DEBUG_COMPASS_READER = true
  const DISABLE_CALIBRATION = false

  export const EPSILON = (0.5 / 360) * 2 * Math.PI
  const CIRCLE_SAMPLE_CONCEALED_THRESHOLD = degreesToRadians(3)

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
  } | { type: "likely_closed", details: string }
    | { type: "likely_concealed", details: string }

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

    let isArc = CompassReader.isArcCompass(data);
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

    if (circle_sampled_pixels.length == 0) return {type: "likely_closed", details: "No pixels while sampling the circle"}
    if (circle_sampled_pixels.length > 10) return {type: "likely_concealed", details: "Too many pixels while sampling the circle"}

    // Map all sample points to their respective angle
    // The angle is taken from the true center of the compass arrow, which is why we offset the samples by 0.5
    // Also, the y axis is flipped to convert from screen coordinates to the internally used coordinate system
    const angles = circle_sampled_pixels.map(p => Vector2.angle(
      ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: p.x - 0.5, y: -p.y}))
    )

    const angle_after_circle_sampling = normalizeAngle(circularMean(angles))

    if (angles.some(a => angleDifference(a, angle_after_circle_sampling) > CIRCLE_SAMPLE_CONCEALED_THRESHOLD)) {
      return {type: "likely_concealed", details: "Too much variance in the sampled pixels on the circumference"}
    }

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

  export function isArcCompass(buf: ImageData) {
    const Y = 235
    const X_MIN = 34
    const X_MAX = 146

    const PIXEL_REQUIRED_TO_BE_CONSIDERED_ARC_COMPASS = 5

    const text_color: [number, number, number] = [51, 25, 0]

    let n = 0;
    for (let x = X_MIN; x < X_MAX; x++) {
      const i = x * 4 + Y * buf.width * 4;

      if (rgbSimilarity(text_color, [buf.data[i], buf.data[i + 1], buf.data[i + 2]]) > 0.9) {
        n++;
      }
    }

    return n > PIXEL_REQUIRED_TO_BE_CONSIDERED_ARC_COMPASS;
  }

  export const calibration_tables = {
    "off": AngularKeyframeFunction.fromCalibrationSamples([
      // Immediate neighbours (3x3)
      {position: {x: -1, y: 1}, is_angle_degrees: 314.276},
      {position: {x: 0, y: 1}, is_angle_degrees: 269.207},
      {position: {x: 1, y: 1}, is_angle_degrees: 224.060},
      {position: {x: 1, y: 0}, is_angle_degrees: 178.951},
      {position: {x: 1, y: -1}, is_angle_degrees: 133.888},
      {position: {x: 0, y: -1}, is_angle_degrees: 88.821},
      {position: {x: -1, y: -1}, is_angle_degrees: 44.106},
      {position: {x: -1, y: 0}, is_angle_degrees: 359.247},

      // Knight moves (5x5)
      {position: {x: -1, y: 2}, is_angle_degrees: 291.596},
      {position: {x: 1, y: 2}, is_angle_degrees: 246.555},

      {position: {x: 2, y: 1}, is_angle_degrees: 201.348},
      {position: {x: 2, y: -1}, is_angle_degrees: 156.331},

      {position: {x: 1, y: -2}, is_angle_degrees: 111.265},
      {position: {x: -1, y: -2}, is_angle_degrees: 66.454},

      {position: {x: -2, y: -1}, is_angle_degrees: 21.533},
      {position: {x: -2, y: 1}, is_angle_degrees: 336.696},

      // 7 by 7 area
      {position: {x: -2, y: 3}, is_angle_degrees: 299.362},
      {position: {x: -1, y: 3}, is_angle_degrees: 284.156},
      {position: {x: 1, y: 3}, is_angle_degrees: 254.257},
      {position: {x: 2, y: 3}, is_angle_degrees: 239.081},

      {position: {x: 3, y: 2}, is_angle_degrees: 209.113},
      {position: {x: 3, y: 1}, is_angle_degrees: 194.082},
      {position: {x: 3, y: -1}, is_angle_degrees: 164.010},
      {position: {x: 3, y: -2}, is_angle_degrees: 149.059},

      {position: {x: 2, y: -3}, is_angle_degrees: 118.996},
      {position: {x: 1, y: -3}, is_angle_degrees: 104.031},
      {position: {x: -1, y: -3}, is_angle_degrees: 73.931},
      {position: {x: -2, y: -3}, is_angle_degrees: 59.028},

      {position: {x: -3, y: -2}, is_angle_degrees: 29.083},
      {position: {x: -3, y: -1}, is_angle_degrees: 14.129},
      {position: {x: -3, y: 1}, is_angle_degrees: 344.196},
      {position: {x: -3, y: 2}, is_angle_degrees: 329.251},

      // 9 by 9 area
      {position: {x: -3, y: 4}, is_angle_degrees: 303.025},
      {position: {x: -1, y: 4}, is_angle_degrees: 280.544},
      {position: {x: 1, y: 4}, is_angle_degrees: 257.930},
      {position: {x: 3, y: 4}, is_angle_degrees: 235.408},

      {position: {x: 4, y: 3}, is_angle_degrees: 213.784},
      {position: {x: 4, y: 1}, is_angle_degrees: 190.278},
      {position: {x: 4, y: -1}, is_angle_degrees: 167.683},
      {position: {x: 4, y: -3}, is_angle_degrees: 145.202},

      {position: {x: 3, y: -4}, is_angle_degrees: 122.653},
      {position: {x: 1, y: -4}, is_angle_degrees: 100.243},
      {position: {x: -1, y: -4}, is_angle_degrees: 73.932},
      {position: {x: -3, y: -4}, is_angle_degrees: 55.379},

      {position: {x: -4, y: -3}, is_angle_degrees: 32.906},
      {position: {x: -4, y: -1}, is_angle_degrees: 10.543},
      {position: {x: -4, y: 1}, is_angle_degrees: 348.026},
      {position: {x: -4, y: 3}, is_angle_degrees: 325.594},

      // 11 by 11 area
      {position: {x: -4, y: 5}, is_angle_degrees: 305.357},
      {position: {x: -3, y: 5}, is_angle_degrees: 296.379},
      {position: {x: -2, y: 5}, is_angle_degrees: 287.193},
      {position: {x: -1, y: 5}, is_angle_degrees: 278.195},
      {position: {x: 1, y: 5}, is_angle_degrees: 260.222},
      {position: {x: 2, y: 5}, is_angle_degrees: 251.293},
      {position: {x: 3, y: 5}, is_angle_degrees: 242.062},
      {position: {x: 4, y: 5}, is_angle_degrees: 233.060},

      {position: {x: 5, y: 4}, is_angle_degrees: 215.118},
      {position: {x: 5, y: 3}, is_angle_degrees: 206.127},
      {position: {x: 5, y: 2}, is_angle_degrees: 197.108},
      {position: {x: 5, y: 1}, is_angle_degrees: 187.930},
      {position: {x: 5, y: -1}, is_angle_degrees: 169.970},
      {position: {x: 5, y: -2}, is_angle_degrees: 161.059},
      {position: {x: 5, y: -3}, is_angle_degrees: 152.023},
      {position: {x: 5, y: -4}, is_angle_degrees: 143.052},

      {position: {x: 4, y: -5}, is_angle_degrees: 124.976},
      {position: {x: 3, y: -5}, is_angle_degrees: 116.022},
      {position: {x: 2, y: -5}, is_angle_degrees: 107.043},
      {position: {x: 1, y: -5}, is_angle_degrees: 98.113},
      {position: {x: -1, y: -5}, is_angle_degrees: 79.843},
      {position: {x: -2, y: -5}, is_angle_degrees: 71.029},
      {position: {x: -3, y: -5}, is_angle_degrees: 61.987},
      {position: {x: -4, y: -5}, is_angle_degrees: 53.045},

      {position: {x: -5, y: -4}, is_angle_degrees: 35.042},
      {position: {x: -5, y: -3}, is_angle_degrees: 26.133},
      {position: {x: -5, y: -2}, is_angle_degrees: 17.152},
      {position: {x: -5, y: -1}, is_angle_degrees: 8.195},
      {position: {x: -5, y: 1}, is_angle_degrees: 350.304},
      {position: {x: -5, y: 2}, is_angle_degrees: 341.281},
      {position: {x: -5, y: 3}, is_angle_degrees: 332.225},
      {position: {x: -5, y: 4}, is_angle_degrees: 323.251},

    ])
  }

  export type CalibrationMode = keyof typeof calibration_tables
}