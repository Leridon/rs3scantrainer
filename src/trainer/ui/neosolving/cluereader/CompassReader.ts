import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {mixColor} from "@alt1/base";
import {circularMean, degreesToRadians, normalizeAngle, radiansToDegrees, Rectangle, Vector2} from "../../../../lib/math";
import * as lodash from "lodash";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {CapturedCompass} from "./capture/CapturedCompass";
import {lazy, Lazy} from "../../../../lib/properties/Lazy";
import {NisModal} from "../../../../lib/ui/NisModal";
import {GameMapMiniWidget, levelIcon} from "../../../../lib/gamemap/GameMap";
import {GameLayer} from "../../../../lib/gamemap/GameLayer";
import {clue_data} from "../../../../data/clues";
import * as leaflet from "leaflet";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {tilePolygon} from "../../polygon_helpers";
import {Process} from "../../../../lib/Process";
import {EwentHandler, observe} from "../../../../lib/reactive";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {deps} from "../../../dependencies";
import {util} from "../../../../lib/util/util";
import LightButton from "../../widgets/LightButton";
import ButtonRow from "../../../../lib/ui/ButtonRow";
import ExportStringModal from "../../widgets/modals/ExportStringModal";
import ImportStringModal from "../../widgets/modals/ImportStringModal";
import {Alt1MainHotkeyEvent} from "../../../../lib/alt1/Alt1MainHotkeyEvent";
import Widget from "../../../../lib/ui/Widget";
import {Log} from "../../../../lib/util/Log";
import angleDifference = Compasses.angleDifference;
import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;
import log = Log.log;
import avg = util.avg;

class AngularKeyframeFunction {
  private constructor(private readonly keyframes: {
                        original?: Vector2,
                        angle: number,
                        value: number
                      }[],
                      private base_f: (_: number) => number = () => 0) {
    this.keyframes = lodash.sortBy(keyframes, e => e.angle)
  }

  withBaseline(f: (_: number) => number): this {
    this.base_f = f

    return this
  }

  getSampleTable(): number[] {
    const samples: number[] = []

    const FRAMES = 5000

    for (let i = 0; i <= FRAMES; i++) {
      samples.push(this.sample(i * (2 * Math.PI / FRAMES)))
    }

    return samples
  }

  getCSV(): string {
    return this.keyframes.map((keyframe) => {
      return [keyframe.angle, keyframe.value, this.base_f(keyframe.angle), keyframe.value + this.base_f(keyframe.angle)]
        .map(radiansToDegrees).join(",") + `,${keyframe.original?.x}|${keyframe.original?.y}`
    }).join("\n")
  }

  sample(angle: number): number {
    if (this.keyframes.length == 0) return 0
    if (this.keyframes.length == 1) return this.keyframes[0].value

    // TODO: Optimize with binary search instead

    let index_a = lodash.findLastIndex(this.keyframes, e => e.angle < angle)
    if (index_a < 0) index_a = this.keyframes.length - 1

    const index_b = (index_a + 1) % this.keyframes.length

    const previous = this.keyframes[index_a]
    const next = this.keyframes[index_b]

    const t = angleDifference(angle, previous.angle) / angleDifference(next.angle, previous.angle)

    // Linearly interpolate between keyframes
    return (1 - t) * previous.value + t * next.value + this.base_f(angle)
  }

  static fromCalibrationSamples(samples: {
                                  position: Vector2, is_angle_degrees: number
                                }[],
                                baseline_type: "cosine" | null = null,
  ): AngularKeyframeFunction {

    const keyframes = samples.filter(s => s.is_angle_degrees != undefined).map(({position, is_angle_degrees}) => {
      const should_angle = Vector2.angle(ANGLE_REFERENCE_VECTOR, {x: -position.x, y: -position.y})
      const is_angle = degreesToRadians(is_angle_degrees)

      let dif = should_angle - is_angle
      if (dif < -Math.PI) dif += 2 * Math.PI

      return {
        original: position,
        angle: is_angle,
        value: dif
      }
    })

    const baseline_function = (() => {
      switch (baseline_type) {
        case null:
          return () => 0
        case "cosine":
          // This would probably be the place for a fourier transform tbh, but this simplified version should be enough

          const PHASES = 4

          const max = Math.max(...keyframes.map(f => f.value))
          const min = Math.min(...keyframes.map(f => f.value))

          const offset = (max + min) / 2
          const amplitude = (max - min) / 2

          const hill_samples = keyframes.filter(k => Math.abs(max - k.value) < amplitude / 10).map(k => k.angle % (2 * Math.PI / PHASES))

          console.log(`${hill_samples.length} hills`)

          const phase = circularMean(hill_samples)

          //const phase = lodash.maxBy(keyframes, k => k.value).angle

          return (x) => amplitude * Math.cos(PHASES * (x - phase)) + offset
      }
    })()

    const reduced_keyframes = keyframes.map(f => ({...f, value: f.value - baseline_function(f.angle)}))

    return new AngularKeyframeFunction(
      reduced_keyframes, baseline_function
    ).withBaseline(baseline_function)
  }
}

namespace AngularKeyframeFunction {
  export type Sample = {
    position: Vector2, is_angle_degrees: number
  }
}

export class CompassReader {
  constructor(public readonly capture: CapturedCompass, private disable_calibration: boolean = false) {

  }

  private _angle: Lazy<CompassReader.AngleResult> = lazy(() => {
    const CENTER_SIZE = 2
    const OFFSET = CENTER_SIZE - 1
    const CENTER_OFFSET = {x: CapturedCompass.TOTAL_COMPASS_RADIUS, y: CapturedCompass.TOTAL_COMPASS_RADIUS}

    const buf = this.capture.compass_area.getData()

    const buf_center = {
      x: buf.width / 2,
      y: buf.height / 2
    }

    function getRed(x: number, y: number) {
      const i = 4 * ((CENTER_OFFSET.y + y) * buf.width + x + CENTER_OFFSET.x)

      return buf.data[i]
    }

    function isArrow(x: number, y: number) {
      const [r, g, b, _] = buf.getPixel(x, y)

      return r < 5 && g < 5 && b < 5
    }

    if (CompassReader.DEBUG_COMPASS_READER) {
      CompassReader.debug_overlay.clear()

      this.capture.compass_area.debugOverlay(CompassReader.debug_overlay)
    }

    const TARGET_X_SAMPLE_OFFSETS: Vector2[] = [
      {x: -15, y: -15},
      {x: -14, y: -14},
      {x: -13, y: -13},
      {x: -12, y: -12},
      {x: 12, y: 12},
      {x: 11, y: 11},
      {x: 10, y: 10},
      {x: 9, y: 9},
      {x: 13, y: -16},
      {x: 12, y: -15},
      {x: 11, y: -14},
      {x: 10, y: -13},
      {x: -15, y: 10},
      {x: -14, y: 9},
      {x: -13, y: 8},
      {x: -12, y: 7},
    ]

    if (TARGET_X_SAMPLE_OFFSETS.every(coords => {
      const red = getRed(coords.x, coords.y)

      const res = red >= 75 && red <= 110

      // console.log(`${red} at ${coords.x}|${coords.y}`)

      return res
    })) return {type: "likely_solved"}

    /*
    const circle_sampled_pixels: Vector2[] = (() => {
      const sampled: Vector2[] = []
      const r = CapturedCompass.INNER_COMPASS_RADIUS

      const self = this

      function sample(x: number, y: number): void {
        if (isArrow(x, y)) {
          sampled.push({x, y})
        }

        if (CompassReader.DEBUG_COMPASS_READER) {
          CompassReader.debug_overlay.rect(
            Rectangle.centeredOn(Vector2.add(self.capture.compass_area.screenRectangle().origin, CENTER_OFFSET, {x, y}), 0),
            {color: isArrow(x, y) ? mixColor(255, 0, 0) : mixColor(0, 255, 0), width: 1})
        }

      }

      let x = CENTER_SIZE + CapturedCompass.INNER_COMPASS_RADIUS
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

    if (CompassReader.DEBUG_COMPASS_READER) {
      for (let p of circle_sampled_pixels) {
        CompassReader.debug_overlay.line(
          Vector2.add(this.capture.compass_area.screenRectangle().origin, CENTER_OFFSET),
          Vector2.add(this.capture.compass_area.screenRectangle().origin, CENTER_OFFSET, p),
          {width: 1, color: mixColor(255, 0, 0)}
        )
      }

      CompassReader.debug_overlay.render()
    }

    let circle_failure_reason: AngleResult = null

    if (circle_sampled_pixels.length == 0) return {type: "likely_closed", details: "No pixels while sampling the circle"}
    if (circle_sampled_pixels.length > 10) {
      circle_failure_reason = {type: "likely_concealed", details: `Too many pixels while sampling the circle (${circle_sampled_pixels.length} > 10)`}
    }

    // Map all sample points to their respective angle
    // The angle is taken from the true center of the compass arrow, which is why we offset the samples by 0.5
    // Also, the y axis is flipped to convert from screen coordinates to the internally used coordinate system
    const angles = circle_sampled_pixels.map(p => Vector2.angle(
      ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: p.x - 0.5, y: -p.y}))
    )

    const angle_after_circle_sampling = !circle_failure_reason ? normalizeAngle(circularMean(angles)) : 0

    if (angles.some(a => angleDifference(a, angle_after_circle_sampling) > CompassReader.CIRCLE_SAMPLE_CONCEALED_THRESHOLD)) {
      circle_failure_reason = {type: "likely_concealed", details: "Too much variance in the sampled pixels on the circumference"}
    }
*/

    const rectangle_samples: Vector2[] = []

    let antialiasing_detected = false

    const ANTIALIASING_SEARCH_RADIUS = 40

    for (let y = 0; y < buf.height; y++) {
      for (let x = 0; x < buf.width; x++) {
        if (isArrow(x, y)) {
          rectangle_samples.push({x, y})
        } else if (!antialiasing_detected && Vector2.max_axis(Vector2.sub({x, y}, buf_center)) <= ANTIALIASING_SEARCH_RADIUS) {
          const red = buf.getPixel(x, y)[0]

          if (red < 40) antialiasing_detected = true
        }
      }
    }

    if (antialiasing_detected) {
      if (rectangle_samples.length < 400) return {type: "likely_closed", details: `Not enough pixels (${rectangle_samples.length}) sampled for the rectangle sample. [MSAA]`}
      if (rectangle_samples.length < 1700) return {type: "likely_concealed", details: `Not enough pixels (${rectangle_samples.length}) sampled for the rectangle sample. [MSAA]`}
      if (rectangle_samples.length > 2050) return {type: "likely_concealed", details: `Too many pixels (${rectangle_samples.length}) sampled for the rectangle sample. [MSAA]`}
    } else {
      if (rectangle_samples.length < 400) return {type: "likely_closed", details: `Not enough pixels (${rectangle_samples.length}) sampled for the rectangle sample.`}
      if (rectangle_samples.length < 1900) return {type: "likely_concealed", details: `Not enough pixels (${rectangle_samples.length}) sampled for the rectangle sample.`}
      if (rectangle_samples.length > 2250) return {type: "likely_concealed", details: `Too many pixels (${rectangle_samples.length}) sampled for the rectangle sample.`}
    }

    const center_of_mass: Vector2 = {
      x: lodash.sumBy(rectangle_samples, v => v.x) / rectangle_samples.length,
      y: lodash.sumBy(rectangle_samples, v => v.y) / rectangle_samples.length
    }

    const center_of_area: Vector2 = Rectangle.center(Rectangle.from(...rectangle_samples), false)

    const angleof = (v: Vector2): number => {
      return Vector2.angle(ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: v.x, y: -v.y}))
    }

    const initial_angle = angleof(Vector2.sub(center_of_mass, center_of_area))

    const angle_samples: {
      angle: number,
      weight: number
    }[] = rectangle_samples.flatMap(v => {

      const vector = Vector2.sub(v, center_of_area)

      let angle = angleof(vector)

      if (Number.isNaN(angle)) return []

      if (angleDifference(angle, initial_angle) > Math.PI / 2)
        angle = normalizeAngle(angle - Math.PI)

      return {
        angle: angle,
        weight: Vector2.lengthSquared(vector)
      }
    })

    const angle_after_rectangle_sample = normalizeAngle(Math.atan2(
      lodash.sum(angle_samples.map(a => a.weight * Math.sin(a.angle))),
      lodash.sum(angle_samples.map(a => a.weight * Math.cos(a.angle))),
    ))

    const calibration_mode = (this.disable_calibration || CompassReader.DISABLE_CALIBRATION) ? null
      : (antialiasing_detected ? "msaa" : "off")

    const final_angle = calibration_mode
      ? normalizeAngle(angle_after_rectangle_sample + CompassReader.calibration_tables[calibration_mode].sample(angle_after_rectangle_sample))
      : angle_after_rectangle_sample

    if (CompassReader.DEBUG_COMPASS_READER) {
      log().log(`Angle: ${radiansToDegrees(initial_angle).toFixed(3)}° (CoM), ${radiansToDegrees(angle_after_rectangle_sample).toFixed(3)}° (rect), ${radiansToDegrees(final_angle).toFixed(3)}° (final)`,
        "Compass Reader"
      )

      CompassReader.debug_overlay.render()
    }

    return {
      type: "success",
      angle: final_angle,
      antialiasing: antialiasing_detected
    }
  })

  getAngle(): CompassReader.AngleResult {
    return this._angle.get()
  }
}

export namespace CompassReader {
  import greatestCommonDivisor = util.greatestCommonDivisor;
  import cleanedJSON = util.cleanedJSON;
  import log = Log.log;
  export const DEBUG_COMPASS_READER = false
  export const DISABLE_CALIBRATION = false

  export const RESOLUTION_INACCURACY_DEGREES = 0.2 // Calculated on a napkin, so might not be completely accurate
  export const CALIBRATION_INACCURACY_DEGREES = 0.1
  export const EPSILON = degreesToRadians(RESOLUTION_INACCURACY_DEGREES + CALIBRATION_INACCURACY_DEGREES)
  export const CIRCLE_SAMPLE_CONCEALED_THRESHOLD = degreesToRadians(3)

  export type AngleResult = {
    type: "success",
    angle: number,
    antialiasing: boolean,
  } | { type: "likely_closed", details: string }
    | { type: "likely_concealed", details: string }
    | { type: "likely_solved" }

  export const debug_overlay = new OverlayGeometry()

  export const calibration_tables = {
    "off": AngularKeyframeFunction.fromCalibrationSamples([
        {"position":{"x":-1,"y":0},"is_angle_degrees":358.97548361371},
        {"position":{"x":-10,"y":-1},"is_angle_degrees":3.0915850765454644},
        {"position":{"x":-9,"y":-1},"is_angle_degrees":3.6243978639386847},
        {"position":{"x":-8,"y":-1},"is_angle_degrees":4.2740649320954125},
        {"position":{"x":-7,"y":-1},"is_angle_degrees":4.943912355929411},
        {"position":{"x":-6,"y":-1},"is_angle_degrees":5.9502482933470295},
        {"position":{"x":-5,"y":-1},"is_angle_degrees":7.5132324018603756},
        {"position":{"x":-9,"y":-2},"is_angle_degrees":8.424254191266932},
        {"position":{"x":-4,"y":-1},"is_angle_degrees":9.533531319479852},
        {"position":{"x":-7,"y":-2},"is_angle_degrees":11.25501316445402},
        {"position":{"x":-10,"y":-3},"is_angle_degrees":11.799394482103063},
        {"position":{"x":-3,"y":-1},"is_angle_degrees":13.542012421869865},
        {"position":{"x":-8,"y":-3},"is_angle_degrees":15.628595494232096},
        {"position":{"x":-5,"y":-2},"is_angle_degrees":16.697241942175143},
        {"position":{"x":-7,"y":-3},"is_angle_degrees":18.109935497202898},
        {"position":{"x":-9,"y":-4},"is_angle_degrees":18.774155031273363},
        {"position":{"x":-2,"y":-1},"is_angle_degrees":21.561442482587285},
        {"position":{"x":-9,"y":-5},"is_angle_degrees":24.191451389629563},
        {"position":{"x":-7,"y":-4},"is_angle_degrees":24.79365104945731},
        {"position":{"x":-5,"y":-3},"is_angle_degrees":25.976762815159063},
        {"position":{"x":-8,"y":-5},"is_angle_degrees":27.197789443178184},
        {"position":{"x":-3,"y":-2},"is_angle_degrees":28.864414114670076},
        {"position":{"x":-10,"y":-7},"is_angle_degrees":30.50935413319901},
        {"position":{"x":-7,"y":-5},"is_angle_degrees":31.143675854268547},
        {"position":{"x":-4,"y":-3},"is_angle_degrees":32.686018586961616},
        {"position":{"x":-9,"y":-7},"is_angle_degrees":33.8521592566474},
        {"position":{"x":-5,"y":-4},"is_angle_degrees":34.785374033080494},
        {"position":{"x":-6,"y":-5},"is_angle_degrees":36.15311641904172},
        {"position":{"x":-7,"y":-6},"is_angle_degrees":37.251947329520604},
        {"position":{"x":-8,"y":-7},"is_angle_degrees":38.14663407012484},
        {"position":{"x":-9,"y":-8},"is_angle_degrees":38.67345995185955},
        {"position":{"x":-10,"y":-9},"is_angle_degrees":39.21630511981937},
        {"position":{"y":-1,"x":-1},"is_angle_degrees":43.61960030459728},
        {"position":{"x":-9,"y":-10},"is_angle_degrees":47.90406441239121},
        {"position":{"x":-8,"y":-9},"is_angle_degrees":48.26401621257827},
        {"position":{"x":-7,"y":-8},"is_angle_degrees":49.01093035602379},
        {"position":{"x":-6,"y":-7},"is_angle_degrees":49.74368797148861},
        {"position":{"x":-5,"y":-6},"is_angle_degrees":50.76736678868917},
        {"position":{"x":-4,"y":-5},"is_angle_degrees":52.24306240574763},
        {"position":{"x":-7,"y":-9},"is_angle_degrees":53.354777279488026},
        {"position":{"x":-3,"y":-4},"is_angle_degrees":54.482207281985765},
        {"position":{"x":-5,"y":-7},"is_angle_degrees":55.986496449727134},
        {"position":{"x":-7,"y":-10},"is_angle_degrees":56.55164864969998},
        {"position":{"x":-2,"y":-3},"is_angle_degrees":58.21159214357648},
        {"position":{"x":-5,"y":-8},"is_angle_degrees":59.996464967912566},
        {"position":{"x":-3,"y":-5},"is_angle_degrees":60.941347237890895},
        {"position":{"x":-4,"y":-7},"is_angle_degrees":62.30115088364926},
        {"position":{"x":-5,"y":-9},"is_angle_degrees":63.05030110535739},
        {"position":{"x":-1,"y":-2},"is_angle_degrees":65.3972229459928},
        {"position":{"x":-4,"y":-9},"is_angle_degrees":67.9381924609354},
        {"position":{"x":-3,"y":-7},"is_angle_degrees":68.63531796270765},
        {"position":{"x":-2,"y":-5},"is_angle_degrees":69.93855280359594},
        {"position":{"x":-3,"y":-8},"is_angle_degrees":71.30162959036313},
        {"position":{"x":-1,"y":-3},"is_angle_degrees":73.34657713754882},
        {"position":{"x":-3,"y":-10},"is_angle_degrees":74.99221499403964},
        {"position":{"x":-2,"y":-7},"is_angle_degrees":75.65052612412218},
        {"position":{"x":-1,"y":-4},"is_angle_degrees":77.4976879484156},
        {"position":{"x":-2,"y":-9},"is_angle_degrees":78.9091931688932},
        {"position":{"x":-1,"y":-5},"is_angle_degrees":79.87351008276288},
        {"position":{"x":-1,"y":-6},"is_angle_degrees":81.57231676838403},
        {"position":{"x":-1,"y":-7},"is_angle_degrees":82.71948916286081},
        {"position":{"x":-1,"y":-8},"is_angle_degrees":83.65512262278655},
        {"position":{"x":-1,"y":-9},"is_angle_degrees":84.15716308021892},
        {"position":{"x":-1,"y":-10},"is_angle_degrees":84.72127405207037},
        {"position":{"x":0,"y":-1},"is_angle_degrees":88.81969121931886},
        {"position":{"x":1,"y":-10},"is_angle_degrees":93.44415500445876},
        {"position":{"x":1,"y":-9},"is_angle_degrees":93.82836112012463},
        {"position":{"x":1,"y":-8},"is_angle_degrees":94.29809632316037},
        {"position":{"x":1,"y":-7},"is_angle_degrees":95.06947700454371},
        {"position":{"x":1,"y":-6},"is_angle_degrees":96.16780558595977},
        {"position":{"x":1,"y":-5},"is_angle_degrees":97.58977886721772},
        {"position":{"x":2,"y":-9},"is_angle_degrees":98.46634764544287},
        {"position":{"x":1,"y":-4},"is_angle_degrees":99.5840229047626},
        {"position":{"x":2,"y":-7},"is_angle_degrees":101.37254723330575},
        {"position":{"x":3,"y":-10},"is_angle_degrees":102.0417318219204},
        {"position":{"x":1,"y":-3},"is_angle_degrees":103.73657745745831},
        {"position":{"x":3,"y":-8},"is_angle_degrees":105.62859549423209},
        {"position":{"x":2,"y":-5},"is_angle_degrees":106.84382873101586},
        {"position":{"x":3,"y":-7},"is_angle_degrees":108.24790833191284},
        {"position":{"x":4,"y":-9},"is_angle_degrees":109.03305369040385},
        {"position":{"x":1,"y":-2},"is_angle_degrees":111.56144248258734},
        {"position":{"x":5,"y":-9},"is_angle_degrees":114.17025803688227},
        {"position":{"x":4,"y":-7},"is_angle_degrees":114.90794888539249},
        {"position":{"x":3,"y":-5},"is_angle_degrees":116.13918305040671},
        {"position":{"x":5,"y":-8},"is_angle_degrees":117.19778944317821},
        {"position":{"x":2,"y":-3},"is_angle_degrees":119.1425984804859},
        {"position":{"x":7,"y":-10},"is_angle_degrees":120.63452506540716},
        {"position":{"x":5,"y":-7},"is_angle_degrees":121.14367585426854},
        {"position":{"x":3,"y":-4},"is_angle_degrees":122.68601858696164},
        {"position":{"x":7,"y":-9},"is_angle_degrees":123.8521592566474},
        {"position":{"x":4,"y":-5},"is_angle_degrees":124.96838479956568},
        {"position":{"x":5,"y":-6},"is_angle_degrees":126.44628903768498},
        {"position":{"x":6,"y":-7},"is_angle_degrees":127.60227097408769},
        {"position":{"x":7,"y":-8},"is_angle_degrees":128.1466340701248},
        {"position":{"x":8,"y":-9},"is_angle_degrees":128.82196032664805},
        {"position":{"x":9,"y":-10},"is_angle_degrees":129.3660359438609},
        {"position":{"x":1,"y":-1},"is_angle_degrees":133.61960030459727},
        {"position":{"x":10,"y":-9},"is_angle_degrees":138.17144963663821},
        {"position":{"x":9,"y":-8},"is_angle_degrees":138.67713160080982},
        {"position":{"x":8,"y":-7},"is_angle_degrees":139.0109303560238},
        {"position":{"x":7,"y":-6},"is_angle_degrees":139.92487782495525},
        {"position":{"x":6,"y":-5},"is_angle_degrees":140.96074988145998},
        {"position":{"x":5,"y":-4},"is_angle_degrees":142.47975023747753},
        {"position":{"x":9,"y":-7},"is_angle_degrees":143.35477727948808},
        {"position":{"x":4,"y":-3},"is_angle_degrees":144.48220728198572},
        {"position":{"x":7,"y":-5},"is_angle_degrees":145.98649644972713},
        {"position":{"x":10,"y":-7},"is_angle_degrees":146.83852648423527},
        {"position":{"x":3,"y":-2},"is_angle_degrees":148.41189959121326},
        {"position":{"x":8,"y":-5},"is_angle_degrees":149.99646496791254},
        {"position":{"x":5,"y":-3},"is_angle_degrees":151.23110249069535},
        {"position":{"x":7,"y":-4},"is_angle_degrees":152.36472837101428},
        {"position":{"x":9,"y":-5},"is_angle_degrees":153.1069843794491},
        {"position":{"x":2,"y":-1},"is_angle_degrees":155.3972229459928},
        {"position":{"x":9,"y":-4},"is_angle_degrees":158.11428899635948},
        {"position":{"x":7,"y":-3},"is_angle_degrees":158.82739948470518},
        {"position":{"x":5,"y":-2},"is_angle_degrees":160.062970095961},
        {"position":{"x":8,"y":-3},"is_angle_degrees":161.3016295903631},
        {"position":{"x":3,"y":-1},"is_angle_degrees":163.5033282727502},
        {"position":{"x":10,"y":-3},"is_angle_degrees":165.2612094402138},
        {"position":{"x":7,"y":-2},"is_angle_degrees":165.82765228852304},
        {"position":{"x":4,"y":-1},"is_angle_degrees":167.48803697142048},
        {"position":{"x":9,"y":-2},"is_angle_degrees":168.88465955024463},
        {"position":{"x":5,"y":-1},"is_angle_degrees":170.03444123017778},
        {"position":{"x":6,"y":-1},"is_angle_degrees":171.70537931037876},
        {"position":{"x":7,"y":-1},"is_angle_degrees":172.85534104418582},
        {"position":{"x":8,"y":-1},"is_angle_degrees":173.6391145845945},
        {"position":{"x":9,"y":-1},"is_angle_degrees":174.29046341543932},
        {"position":{"x":10,"y":-1},"is_angle_degrees":174.89986177694306},
        {"position":{"x":1,"y":0},"is_angle_degrees":178.9454106464548},
        {"position":{"x":10,"y":1},"is_angle_degrees":183.46500054547502},
        {"position":{"x":9,"y":1},"is_angle_degrees":183.8451728388274},
        {"position":{"x":8,"y":1},"is_angle_degrees":184.3402314808313},
        {"position":{"x":7,"y":1},"is_angle_degrees":185.09664795446173},
        {"position":{"x":6,"y":1},"is_angle_degrees":186.2222018600384},
        {"position":{"x":5,"y":1},"is_angle_degrees":187.6006155768384},
        {"position":{"x":9,"y":2},"is_angle_degrees":188.5063293429787},
        {"position":{"x":4,"y":1},"is_angle_degrees":189.63145560451437},
        {"position":{"x":7,"y":2},"is_angle_degrees":191.2988014247723},
        {"position":{"x":10,"y":3},"is_angle_degrees":192.04173182192037},
        {"position":{"x":3,"y":1},"is_angle_degrees":193.7365774574583},
        {"position":{"x":8,"y":3},"is_angle_degrees":195.62859549423206},
        {"position":{"x":5,"y":2},"is_angle_degrees":196.84382873101583},
        {"position":{"x":7,"y":3},"is_angle_degrees":198.2479083319128},
        {"position":{"x":9,"y":4},"is_angle_degrees":199.03305369040382},
        {"position":{"x":2,"y":1},"is_angle_degrees":201.5614424825873},
        {"position":{"x":9,"y":5},"is_angle_degrees":204.1914513896296},
        {"position":{"x":7,"y":4},"is_angle_degrees":204.7936510494573},
        {"position":{"x":5,"y":3},"is_angle_degrees":206.1391830504067},
        {"position":{"x":8,"y":5},"is_angle_degrees":207.19778944317824},
        {"position":{"x":3,"y":2},"is_angle_degrees":209.14259848048587},
        {"position":{"x":10,"y":7},"is_angle_degrees":210.50935413319908},
        {"position":{"x":7,"y":5},"is_angle_degrees":211.14367585426857},
        {"position":{"x":4,"y":3},"is_angle_degrees":212.68601858696158},
        {"position":{"x":9,"y":7},"is_angle_degrees":213.8521592566474},
        {"position":{"x":5,"y":4},"is_angle_degrees":214.9683847995657},
        {"position":{"x":6,"y":5},"is_angle_degrees":216.1531164190416},
        {"position":{"x":7,"y":6},"is_angle_degrees":217.60227097408762},
        {"position":{"x":8,"y":7},"is_angle_degrees":218.14663407012475},
        {"position":{"x":9,"y":8},"is_angle_degrees":218.82196032664802},
        {"position":{"x":10,"y":9},"is_angle_degrees":219.36603594386088},
        {"position":{"y":1,"x":1},"is_angle_degrees":223.61960030459727},
        {"position":{"x":9,"y":10},"is_angle_degrees":228.17144963663827},
        {"position":{"x":8,"y":9},"is_angle_degrees":228.6771316008098},
        {"position":{"x":7,"y":8},"is_angle_degrees":229.01093035602378},
        {"position":{"x":6,"y":7},"is_angle_degrees":229.92487782495525},
        {"position":{"x":5,"y":6},"is_angle_degrees":230.96074988145992},
        {"position":{"x":4,"y":5},"is_angle_degrees":232.24306240574765},
        {"position":{"x":7,"y":9},"is_angle_degrees":233.35477727948802},
        {"position":{"x":3,"y":4},"is_angle_degrees":234.48220728198575},
        {"position":{"x":5,"y":7},"is_angle_degrees":235.98649644972707},
        {"position":{"x":7,"y":10},"is_angle_degrees":236.83852648423527},
        {"position":{"x":2,"y":3},"is_angle_degrees":238.21159214357647},
        {"position":{"x":5,"y":8},"is_angle_degrees":239.99646496791257},
        {"position":{"x":3,"y":5},"is_angle_degrees":240.94134723789088},
        {"position":{"x":4,"y":7},"is_angle_degrees":242.36472837101428},
        {"position":{"x":5,"y":9},"is_angle_degrees":243.10698437944907},
        {"position":{"x":1,"y":2},"is_angle_degrees":245.39722294599275},
        {"position":{"x":4,"y":9},"is_angle_degrees":247.93819246093537},
        {"position":{"x":3,"y":7},"is_angle_degrees":248.63531796270763},
        {"position":{"x":2,"y":5},"is_angle_degrees":250.062970095961},
        {"position":{"x":3,"y":8},"is_angle_degrees":251.30162959036312},
        {"position":{"x":1,"y":3},"is_angle_degrees":253.50332827275014},
        {"position":{"x":3,"y":10},"is_angle_degrees":254.99221499403959},
        {"position":{"x":2,"y":7},"is_angle_degrees":255.82765228852304},
        {"position":{"x":1,"y":4},"is_angle_degrees":257.48803697142046},
        {"position":{"x":2,"y":9},"is_angle_degrees":258.88465955024463},
        {"position":{"x":1,"y":5},"is_angle_degrees":260.0344412301777},
        {"position":{"x":1,"y":6},"is_angle_degrees":261.5414743063807},
        {"position":{"x":1,"y":7},"is_angle_degrees":262.70418106028814},
        {"position":{"x":1,"y":8},"is_angle_degrees":263.6438870226672},
        {"position":{"x":1,"y":9},"is_angle_degrees":264.2950487518362},
        {"position":{"x":1,"y":10},"is_angle_degrees":264.71882322839576},
        {"position":{"x":0,"y":1},"is_angle_degrees":268.9574622056212},
        {"position":{"x":-1,"y":10},"is_angle_degrees":273.4535523780269},
        {"position":{"x":-1,"y":9},"is_angle_degrees":273.6585928958727},
        {"position":{"x":-1,"y":8},"is_angle_degrees":274.3202088854179},
        {"position":{"x":-1,"y":7},"is_angle_degrees":275.09664795446173},
        {"position":{"x":-1,"y":6},"is_angle_degrees":276.1960778097401},
        {"position":{"x":-1,"y":5},"is_angle_degrees":277.5738361587578},
        {"position":{"x":-2,"y":9},"is_angle_degrees":278.5063293429787},
        {"position":{"x":-1,"y":4},"is_angle_degrees":279.6314556045144},
        {"position":{"x":-2,"y":7},"is_angle_degrees":281.2988014247723},
        {"position":{"x":-3,"y":10},"is_angle_degrees":282.0417318219204},
        {"position":{"x":-1,"y":3},"is_angle_degrees":283.54201242186986},
        {"position":{"x":-3,"y":8},"is_angle_degrees":285.62859549423206},
        {"position":{"x":-2,"y":5},"is_angle_degrees":286.6972419421751},
        {"position":{"x":-3,"y":7},"is_angle_degrees":288.24790833191287},
        {"position":{"x":-4,"y":9},"is_angle_degrees":289.03305369040385},
        {"position":{"x":-1,"y":2},"is_angle_degrees":291.56144248258727},
        {"position":{"x":-5,"y":9},"is_angle_degrees":294.1914513896296},
        {"position":{"x":-4,"y":7},"is_angle_degrees":294.7936510494573},
        {"position":{"x":-3,"y":5},"is_angle_degrees":296.1391830504067},
        {"position":{"x":-5,"y":8},"is_angle_degrees":297.19778944317824},
        {"position":{"x":-2,"y":3},"is_angle_degrees":299.1425984804859},
        {"position":{"x":-7,"y":10},"is_angle_degrees":300.5093541331991},
        {"position":{"x":-5,"y":7},"is_angle_degrees":301.14367585426857},
        {"position":{"x":-3,"y":4},"is_angle_degrees":302.6860185869616},
        {"position":{"x":-7,"y":9},"is_angle_degrees":303.85215925664744},
        {"position":{"x":-4,"y":5},"is_angle_degrees":304.96838479956574},
        {"position":{"x":-5,"y":6},"is_angle_degrees":306.1531164190416},
        {"position":{"x":-6,"y":7},"is_angle_degrees":307.2519473295205},
        {"position":{"x":-7,"y":8},"is_angle_degrees":308.1466340701247},
        {"position":{"x":-8,"y":9},"is_angle_degrees":308.67345995185957},
        {"position":{"x":-9,"y":10},"is_angle_degrees":309.2163051198193},
        {"position":{"x":-1,"y":1},"is_angle_degrees":313.6196003045972},
        {"position":{"x":-10,"y":9},"is_angle_degrees":317.90406441239116},
        {"position":{"x":-9,"y":8},"is_angle_degrees":318.2640162125783},
        {"position":{"x":-8,"y":7},"is_angle_degrees":319.01093035602383},
        {"position":{"x":-7,"y":6},"is_angle_degrees":319.7436879714886},
        {"position":{"x":-6,"y":5},"is_angle_degrees":320.96074988145995},
        {"position":{"x":-5,"y":4},"is_angle_degrees":322.24306240574754},
        {"position":{"x":-9,"y":7},"is_angle_degrees":323.354777279488},
        {"position":{"x":-4,"y":3},"is_angle_degrees":324.48220728198584},
        {"position":{"x":-7,"y":5},"is_angle_degrees":325.9864964497272},
        {"position":{"x":-10,"y":7},"is_angle_degrees":326.8385264842353},
        {"position":{"x":-3,"y":2},"is_angle_degrees":328.21159214357647},
        {"position":{"x":-8,"y":5},"is_angle_degrees":329.9964649679126},
        {"position":{"x":-5,"y":3},"is_angle_degrees":330.94134723789085},
        {"position":{"x":-7,"y":4},"is_angle_degrees":332.3647283710143},
        {"position":{"x":-9,"y":5},"is_angle_degrees":333.10698437944905},
        {"position":{"x":-2,"y":1},"is_angle_degrees":335.3972229459928},
        {"position":{"x":-9,"y":4},"is_angle_degrees":337.93819246093534},
        {"position":{"x":-7,"y":3},"is_angle_degrees":338.6353179627076},
        {"position":{"x":-5,"y":2},"is_angle_degrees":339.93855280359594},
        {"position":{"x":-8,"y":3},"is_angle_degrees":341.3016295903631},
        {"position":{"x":-3,"y":1},"is_angle_degrees":343.3465771375488},
        {"position":{"x":-10,"y":3},"is_angle_degrees":344.9954729437606},
        {"position":{"x":-7,"y":2},"is_angle_degrees":345.8364433506414},
        {"position":{"x":-4,"y":1},"is_angle_degrees":347.50804883835036},
        {"position":{"x":-9,"y":2},"is_angle_degrees":348.930281257497},
        {"position":{"x":-5,"y":1},"is_angle_degrees":350.08925994058677},
        {"position":{"x":-6,"y":1},"is_angle_degrees":351.605980234129},
        {"position":{"x":-7,"y":1},"is_angle_degrees":352.7440875549545},
        {"position":{"x":-8,"y":1},"is_angle_degrees":353.66974667281113},
        {"position":{"x":-9,"y":1},"is_angle_degrees":354.17074283320943},
        {"position":{"x":-10,"y":1},"is_angle_degrees":354.74060261085043}
      ],
      "cosine"
    )
    ,
    "msaa": AngularKeyframeFunction.fromCalibrationSamples([
        {"position": {"x": -1, "y": 0}, "is_angle_degrees": 358.8967520409248},
        {"position": {"x": -12, "y": -1}, "is_angle_degrees": 2.591332317545632},
        {"position": {"x": -11, "y": -1}, "is_angle_degrees": 2.899199030998234},
        {"position": {"x": -10, "y": -1}, "is_angle_degrees": 3.3027910217341945},
        {"position": {"x": -9, "y": -1}, "is_angle_degrees": 3.7569228037770737},
        {"position": {"x": -8, "y": -1}, "is_angle_degrees": 4.507186719624604},
        {"position": {"x": -7, "y": -1}, "is_angle_degrees": 5.22019256437474},
        {"position": {"x": -6, "y": -1}, "is_angle_degrees": 6.260940776960469},
        {"position": {"x": -11, "y": -2}, "is_angle_degrees": 6.998783944605685},
        {"position": {"x": -5, "y": -1}, "is_angle_degrees": 7.865391398658294},
        {"position": {"x": -9, "y": -2}, "is_angle_degrees": 8.894939418228827},
        {"position": {"x": -4, "y": -1}, "is_angle_degrees": 10.157441825373601},
        {"position": {"x": -11, "y": -3}, "is_angle_degrees": 11.211672861429957},
        {"position": {"x": -7, "y": -2}, "is_angle_degrees": 11.763469485752193},
        {"position": {"x": -10, "y": -3}, "is_angle_degrees": 12.25121541752335},
        {"position": {"x": -3, "y": -1}, "is_angle_degrees": 13.84663041827886},
        {"position": {"x": -11, "y": -4}, "is_angle_degrees": 15.235905226259181},
        {"position": {"x": -8, "y": -3}, "is_angle_degrees": 15.782945684262547},
        {"position": {"x": -5, "y": -2}, "is_angle_degrees": 16.80547224803966},
        {"position": {"x": -12, "y": -5}, "is_angle_degrees": 17.513105499040563},
        {"position": {"x": -7, "y": -3}, "is_angle_degrees": 18.038648958653397},
        {"position": {"x": -9, "y": -4}, "is_angle_degrees": 18.756057585244584},
        {"position": {"x": -11, "y": -5}, "is_angle_degrees": 19.309952638404173},
        {"position": {"x": -2, "y": -1}, "is_angle_degrees": 21.425370190203342},
        {"position": {"x": -11, "y": -6}, "is_angle_degrees": 23.320209697991846},
        {"position": {"x": -9, "y": -5}, "is_angle_degrees": 23.854053473089127},
        {"position": {"x": -7, "y": -4}, "is_angle_degrees": 24.581119064758482},
        {"position": {"x": -12, "y": -7}, "is_angle_degrees": 25.106869645534356},
        {"position": {"x": -5, "y": -3}, "is_angle_degrees": 25.695204098111653},
        {"position": {"x": -8, "y": -5}, "is_angle_degrees": 26.99846953088355},
        {"position": {"x": -11, "y": -7}, "is_angle_degrees": 27.526984077208258},
        {"position": {"x": -3, "y": -2}, "is_angle_degrees": 28.779850318412944},
        {"position": {"x": -10, "y": -7}, "is_angle_degrees": 30.329312413448196},
        {"position": {"x": -7, "y": -5}, "is_angle_degrees": 31.043685268303882},
        {"position": {"x": -11, "y": -8}, "is_angle_degrees": 31.583341736695928},
        {"position": {"x": -4, "y": -3}, "is_angle_degrees": 32.63607595539084},
        {"position": {"x": -9, "y": -7}, "is_angle_degrees": 33.8233442971928},
        {"position": {"x": -5, "y": -4}, "is_angle_degrees": 34.754584048064096},
        {"position": {"x": -11, "y": -9}, "is_angle_degrees": 35.66556782680724},
        {"position": {"x": -6, "y": -5}, "is_angle_degrees": 36.35975366496272},
        {"position": {"x": -7, "y": -6}, "is_angle_degrees": 37.35422421288253},
        {"position": {"x": -8, "y": -7}, "is_angle_degrees": 38.247427794143455},
        {"position": {"x": -9, "y": -8}, "is_angle_degrees": 38.81229315352396},
        {"position": {"x": -10, "y": -9}, "is_angle_degrees": 39.30853489599356},
        {"position": {"x": -11, "y": -10}, "is_angle_degrees": 39.698550693631226},
        {"position": {"x": -12, "y": -11}, "is_angle_degrees": 39.992315723406975},
        {"position": {"y": -1, "x": -1}, "is_angle_degrees": 43.93658719459389},
        {"position": {"x": -11, "y": -12}, "is_angle_degrees": 47.62527989151435},
        {"position": {"x": -10, "y": -11}, "is_angle_degrees": 48.034312114877316},
        {"position": {"x": -9, "y": -10}, "is_angle_degrees": 48.26720073000818},
        {"position": {"x": -8, "y": -9}, "is_angle_degrees": 48.86152558857321},
        {"position": {"x": -7, "y": -8}, "is_angle_degrees": 49.60054321381496},
        {"position": {"x": -6, "y": -7}, "is_angle_degrees": 50.269789574263946},
        {"position": {"x": -5, "y": -6}, "is_angle_degrees": 51.35214369439912},
        {"position": {"x": -9, "y": -11}, "is_angle_degrees": 52.061953603999044},
        {"position": {"x": -4, "y": -5}, "is_angle_degrees": 52.84938627109907},
        {"position": {"x": -7, "y": -9}, "is_angle_degrees": 53.94249668897837},
        {"position": {"x": -3, "y": -4}, "is_angle_degrees": 55.18367232486804},
        {"position": {"x": -8, "y": -11}, "is_angle_degrees": 55.958793051877514},
        {"position": {"x": -5, "y": -7}, "is_angle_degrees": 56.66609224144232},
        {"position": {"x": -7, "y": -10}, "is_angle_degrees": 57.24839519034971},
        {"position": {"x": -2, "y": -3}, "is_angle_degrees": 58.84415908466447},
        {"position": {"x": -7, "y": -11}, "is_angle_degrees": 60.27092203605553},
        {"position": {"x": -5, "y": -8}, "is_angle_degrees": 60.798344798797544},
        {"position": {"x": -3, "y": -5}, "is_angle_degrees": 61.8271341001371},
        {"position": {"x": -7, "y": -12}, "is_angle_degrees": 62.5572381506578},
        {"position": {"x": -4, "y": -7}, "is_angle_degrees": 63.07771134242024},
        {"position": {"x": -5, "y": -9}, "is_angle_degrees": 63.764714839893344},
        {"position": {"x": -6, "y": -11}, "is_angle_degrees": 64.2871929297977},
        {"position": {"x": -1, "y": -2}, "is_angle_degrees": 66.4761991039282},
        {"position": {"x": -5, "y": -11}, "is_angle_degrees": 68.34112418131713},
        {"position": {"x": -4, "y": -9}, "is_angle_degrees": 68.86652780247016},
        {"position": {"x": -3, "y": -7}, "is_angle_degrees": 69.57439017293358},
        {"position": {"x": -5, "y": -12}, "is_angle_degrees": 70.14394883358433},
        {"position": {"x": -2, "y": -5}, "is_angle_degrees": 70.75476991309486},
        {"position": {"x": -3, "y": -8}, "is_angle_degrees": 72.0297538128151},
        {"position": {"x": -4, "y": -11}, "is_angle_degrees": 72.39578332879678},
        {"position": {"x": -1, "y": -3}, "is_angle_degrees": 73.81538492433555},
        {"position": {"x": -3, "y": -10}, "is_angle_degrees": 75.40883886227626},
        {"position": {"x": -2, "y": -7}, "is_angle_degrees": 75.9126640423916},
        {"position": {"x": -3, "y": -11}, "is_angle_degrees": 76.59732721459359},
        {"position": {"x": -1, "y": -4}, "is_angle_degrees": 77.63605321351721},
        {"position": {"x": -2, "y": -9}, "is_angle_degrees": 78.86293248737695},
        {"position": {"x": -1, "y": -5}, "is_angle_degrees": 79.7986804934156},
        {"position": {"x": -2, "y": -11}, "is_angle_degrees": 80.66593408903243},
        {"position": {"x": -1, "y": -6}, "is_angle_degrees": 81.36650064267744},
        {"position": {"x": -1, "y": -7}, "is_angle_degrees": 82.43287639829296},
        {"position": {"x": -1, "y": -8}, "is_angle_degrees": 83.29038440237088},
        {"position": {"x": -1, "y": -9}, "is_angle_degrees": 83.82674286465866},
        {"position": {"x": -1, "y": -10}, "is_angle_degrees": 84.31897044780835},
        {"position": {"x": -1, "y": -11}, "is_angle_degrees": 84.682028094125},
        {"position": {"x": -1, "y": -12}, "is_angle_degrees": 85.12644390784976},
        {"position": {"x": 0, "y": -1}, "is_angle_degrees": 88.73491086894897},
        {"position": {"x": 1, "y": -12}, "is_angle_degrees": 92.73939230084645},
        {"position": {"x": 1, "y": -11}, "is_angle_degrees": 93.18907377770044},
        {"position": {"x": 1, "y": -10}, "is_angle_degrees": 93.4956489181956},
        {"position": {"x": 1, "y": -9}, "is_angle_degrees": 93.9314242288695},
        {"position": {"x": 1, "y": -8}, "is_angle_degrees": 94.517088773063},
        {"position": {"x": 1, "y": -7}, "is_angle_degrees": 95.40123902844564},
        {"position": {"x": 1, "y": -6}, "is_angle_degrees": 96.43811014390428},
        {"position": {"x": 2, "y": -11}, "is_angle_degrees": 97.20013920589216},
        {"position": {"x": 1, "y": -5}, "is_angle_degrees": 98.07075510356755},
        {"position": {"x": 2, "y": -9}, "is_angle_degrees": 98.9270351323033},
        {"position": {"x": 1, "y": -4}, "is_angle_degrees": 100.1913617684011},
        {"position": {"x": 3, "y": -11}, "is_angle_degrees": 101.25032429042467},
        {"position": {"x": 2, "y": -7}, "is_angle_degrees": 101.9483615945883},
        {"position": {"x": 3, "y": -10}, "is_angle_degrees": 102.4805826982213},
        {"position": {"x": 1, "y": -3}, "is_angle_degrees": 104.06938372440761},
        {"position": {"x": 4, "y": -11}, "is_angle_degrees": 105.45733151831253},
        {"position": {"x": 3, "y": -8}, "is_angle_degrees": 105.84244493262267},
        {"position": {"x": 2, "y": -5}, "is_angle_degrees": 107.04230952126227},
        {"position": {"x": 5, "y": -12}, "is_angle_degrees": 107.75773817927526},
        {"position": {"x": 3, "y": -7}, "is_angle_degrees": 108.31614739656303},
        {"position": {"x": 4, "y": -9}, "is_angle_degrees": 109.02265711844053},
        {"position": {"x": 5, "y": -11}, "is_angle_degrees": 109.5212863922167},
        {"position": {"x": 1, "y": -2}, "is_angle_degrees": 111.50832102180311},
        {"position": {"x": 6, "y": -11}, "is_angle_degrees": 113.58176054431821},
        {"position": {"x": 5, "y": -9}, "is_angle_degrees": 114.12035950711444},
        {"position": {"x": 4, "y": -7}, "is_angle_degrees": 114.84577325760073},
        {"position": {"x": 7, "y": -12}, "is_angle_degrees": 115.39243767299807},
        {"position": {"x": 3, "y": -5}, "is_angle_degrees": 116.01620815672818},
        {"position": {"x": 5, "y": -8}, "is_angle_degrees": 117.1023688900224},
        {"position": {"x": 7, "y": -11}, "is_angle_degrees": 117.63374298681289},
        {"position": {"x": 2, "y": -3}, "is_angle_degrees": 119.06935121504254},
        {"position": {"x": 7, "y": -10}, "is_angle_degrees": 120.67302218994995},
        {"position": {"x": 5, "y": -7}, "is_angle_degrees": 121.16384170118934},
        {"position": {"x": 8, "y": -11}, "is_angle_degrees": 121.87318179583583},
        {"position": {"x": 3, "y": -4}, "is_angle_degrees": 122.76212877182628},
        {"position": {"x": 7, "y": -9}, "is_angle_degrees": 123.9540013437959},
        {"position": {"x": 4, "y": -5}, "is_angle_degrees": 125.04203535556826},
        {"position": {"x": 9, "y": -11}, "is_angle_degrees": 125.9540096427328},
        {"position": {"x": 5, "y": -6}, "is_angle_degrees": 126.66997240502319},
        {"position": {"x": 6, "y": -7}, "is_angle_degrees": 127.7012323351388},
        {"position": {"x": 7, "y": -8}, "is_angle_degrees": 128.39923915165352},
        {"position": {"x": 8, "y": -9}, "is_angle_degrees": 129.12059594547486},
        {"position": {"x": 9, "y": -10}, "is_angle_degrees": 129.6314425900806},
        {"position": {"x": 10, "y": -11}, "is_angle_degrees": 130.0499534939311},
        {"position": {"x": 11, "y": -12}, "is_angle_degrees": 130.37407302966673},
        {"position": {"x": 1, "y": -1}, "is_angle_degrees": 134.10290230661028},
        {"position": {"x": 12, "y": -11}, "is_angle_degrees": 137.9452634277638},
        {"position": {"x": 11, "y": -10}, "is_angle_degrees": 138.38005470389197},
        {"position": {"x": 10, "y": -9}, "is_angle_degrees": 138.6107724487288},
        {"position": {"x": 9, "y": -8}, "is_angle_degrees": 139.1744316508328},
        {"position": {"x": 8, "y": -7}, "is_angle_degrees": 139.78886990900975},
        {"position": {"x": 7, "y": -6}, "is_angle_degrees": 140.64588234453834},
        {"position": {"x": 6, "y": -5}, "is_angle_degrees": 141.738669925974},
        {"position": {"x": 11, "y": -9}, "is_angle_degrees": 142.34891014038726},
        {"position": {"x": 5, "y": -4}, "is_angle_degrees": 143.2245790723287},
        {"position": {"x": 9, "y": -7}, "is_angle_degrees": 144.14800654809005},
        {"position": {"x": 4, "y": -3}, "is_angle_degrees": 145.39238728989557},
        {"position": {"x": 11, "y": -8}, "is_angle_degrees": 146.36085003270242},
        {"position": {"x": 7, "y": -5}, "is_angle_degrees": 146.87619785167928},
        {"position": {"x": 10, "y": -7}, "is_angle_degrees": 147.62537850535554},
        {"position": {"x": 3, "y": -2}, "is_angle_degrees": 149.25184375770183},
        {"position": {"x": 11, "y": -7}, "is_angle_degrees": 150.49191512394916},
        {"position": {"x": 8, "y": -5}, "is_angle_degrees": 151.0215345193759},
        {"position": {"x": 5, "y": -3}, "is_angle_degrees": 152.2297441972992},
        {"position": {"x": 12, "y": -7}, "is_angle_degrees": 152.94963929042055},
        {"position": {"x": 7, "y": -4}, "is_angle_degrees": 153.48940533584212},
        {"position": {"x": 9, "y": -5}, "is_angle_degrees": 154.1523739734932},
        {"position": {"x": 11, "y": -6}, "is_angle_degrees": 154.70439405116397},
        {"position": {"x": 2, "y": -1}, "is_angle_degrees": 156.71634341257067},
        {"position": {"x": 11, "y": -5}, "is_angle_degrees": 158.7581099391528},
        {"position": {"x": 9, "y": -4}, "is_angle_degrees": 159.2679225365154},
        {"position": {"x": 7, "y": -3}, "is_angle_degrees": 159.9913020945242},
        {"position": {"x": 12, "y": -5}, "is_angle_degrees": 160.57989686165172},
        {"position": {"x": 5, "y": -2}, "is_angle_degrees": 161.1568927510187},
        {"position": {"x": 8, "y": -3}, "is_angle_degrees": 162.27515461384746},
        {"position": {"x": 11, "y": -4}, "is_angle_degrees": 162.8161004544172},
        {"position": {"x": 3, "y": -1}, "is_angle_degrees": 164.24658598283887},
        {"position": {"x": 10, "y": -3}, "is_angle_degrees": 165.76163915439042},
        {"position": {"x": 7, "y": -2}, "is_angle_degrees": 166.31857327436816},
        {"position": {"x": 11, "y": -3}, "is_angle_degrees": 166.85189711996634},
        {"position": {"x": 4, "y": -1}, "is_angle_degrees": 167.89649385247628},
        {"position": {"x": 9, "y": -2}, "is_angle_degrees": 169.11790592496854},
        {"position": {"x": 5, "y": -1}, "is_angle_degrees": 170.16259981771205},
        {"position": {"x": 11, "y": -2}, "is_angle_degrees": 171.0933684499066},
        {"position": {"x": 6, "y": -1}, "is_angle_degrees": 171.77464286765573},
        {"position": {"x": 7, "y": -1}, "is_angle_degrees": 172.87965595642922},
        {"position": {"x": 8, "y": -1}, "is_angle_degrees": 173.5491959880133},
        {"position": {"x": 9, "y": -1}, "is_angle_degrees": 174.26676451286153},
        {"position": {"x": 10, "y": -1}, "is_angle_degrees": 174.74291804683986},
        {"position": {"x": 11, "y": -1}, "is_angle_degrees": 175.09023806184373},
        {"position": {"x": 12, "y": -1}, "is_angle_degrees": 175.49803116255504},
        {"position": {"x": 1, "y": 0}, "is_angle_degrees": 179.13856376622869},
        {"position": {"x": 12, "y": 1}, "is_angle_degrees": 182.9984977203518},
        {"position": {"x": 11, "y": 1}, "is_angle_degrees": 183.16035169205986},
        {"position": {"x": 10, "y": 1}, "is_angle_degrees": 183.75775167549753},
        {"position": {"x": 9, "y": 1}, "is_angle_degrees": 184.18396218380158},
        {"position": {"x": 8, "y": 1}, "is_angle_degrees": 184.7822860508111},
        {"position": {"x": 7, "y": 1}, "is_angle_degrees": 185.66328686154193},
        {"position": {"x": 6, "y": 1}, "is_angle_degrees": 186.70154295959617},
        {"position": {"x": 11, "y": 2}, "is_angle_degrees": 187.45525945685915},
        {"position": {"x": 5, "y": 1}, "is_angle_degrees": 188.14654806092986},
        {"position": {"x": 9, "y": 2}, "is_angle_degrees": 189.19112248030098},
        {"position": {"x": 4, "y": 1}, "is_angle_degrees": 190.45533345798538},
        {"position": {"x": 11, "y": 3}, "is_angle_degrees": 191.51296262982524},
        {"position": {"x": 7, "y": 2}, "is_angle_degrees": 192.0683236956544},
        {"position": {"x": 10, "y": 3}, "is_angle_degrees": 192.74307332917996},
        {"position": {"x": 3, "y": 1}, "is_angle_degrees": 194.33126016805255},
        {"position": {"x": 11, "y": 4}, "is_angle_degrees": 195.55228308128355},
        {"position": {"x": 8, "y": 3}, "is_angle_degrees": 196.10040584138213},
        {"position": {"x": 5, "y": 2}, "is_angle_degrees": 197.2963962887222},
        {"position": {"x": 12, "y": 5}, "is_angle_degrees": 198.00755938412377},
        {"position": {"x": 7, "y": 3}, "is_angle_degrees": 198.56814435223558},
        {"position": {"x": 9, "y": 4}, "is_angle_degrees": 199.28042349665475},
        {"position": {"x": 11, "y": 5}, "is_angle_degrees": 199.77547755661016},
        {"position": {"x": 2, "y": 1}, "is_angle_degrees": 201.761375887434},
        {"position": {"x": 11, "y": 6}, "is_angle_degrees": 203.82860163673246},
        {"position": {"x": 9, "y": 5}, "is_angle_degrees": 204.19334840874365},
        {"position": {"x": 7, "y": 4}, "is_angle_degrees": 204.92410847707674},
        {"position": {"x": 12, "y": 7}, "is_angle_degrees": 205.44850040595313},
        {"position": {"x": 5, "y": 3}, "is_angle_degrees": 206.2606088845934},
        {"position": {"x": 8, "y": 5}, "is_angle_degrees": 207.34584052960884},
        {"position": {"x": 11, "y": 7}, "is_angle_degrees": 207.87816354469788},
        {"position": {"x": 3, "y": 2}, "is_angle_degrees": 209.31676671450884},
        {"position": {"x": 10, "y": 7}, "is_angle_degrees": 210.6814314501053},
        {"position": {"x": 7, "y": 5}, "is_angle_degrees": 211.40218604611255},
        {"position": {"x": 11, "y": 8}, "is_angle_degrees": 211.9420018182248},
        {"position": {"x": 4, "y": 3}, "is_angle_degrees": 212.99738648394447},
        {"position": {"x": 9, "y": 7}, "is_angle_degrees": 214.18720315926535},
        {"position": {"x": 5, "y": 4}, "is_angle_degrees": 215.2708837389539},
        {"position": {"x": 11, "y": 9}, "is_angle_degrees": 216.18686045206837},
        {"position": {"x": 6, "y": 5}, "is_angle_degrees": 216.72406957543623},
        {"position": {"x": 7, "y": 6}, "is_angle_degrees": 217.92937404632818},
        {"position": {"x": 8, "y": 7}, "is_angle_degrees": 218.6285196799818},
        {"position": {"x": 9, "y": 8}, "is_angle_degrees": 219.34520847657805},
        {"position": {"x": 10, "y": 9}, "is_angle_degrees": 219.86096889990324},
        {"position": {"x": 11, "y": 10}, "is_angle_degrees": 220.27391365974643},
        {"position": {"x": 12, "y": 11}, "is_angle_degrees": 220.60041275529616},
        {"position": {"y": 1, "x": 1}, "is_angle_degrees": 224.31740020862097},
        {"position": {"x": 11, "y": 12}, "is_angle_degrees": 228.01572649403474},
        {"position": {"x": 10, "y": 11}, "is_angle_degrees": 228.42547710802882},
        {"position": {"x": 9, "y": 10}, "is_angle_degrees": 228.8120530641703},
        {"position": {"x": 8, "y": 9}, "is_angle_degrees": 229.38066083089097},
        {"position": {"x": 7, "y": 8}, "is_angle_degrees": 229.99182640663085},
        {"position": {"x": 6, "y": 7}, "is_angle_degrees": 230.84356530921895},
        {"position": {"x": 5, "y": 6}, "is_angle_degrees": 231.9343684636144},
        {"position": {"x": 9, "y": 11}, "is_angle_degrees": 232.54746259886866},
        {"position": {"x": 4, "y": 5}, "is_angle_degrees": 233.25310161190623},
        {"position": {"x": 7, "y": 9}, "is_angle_degrees": 234.33940998925726},
        {"position": {"x": 3, "y": 4}, "is_angle_degrees": 235.57901386886647},
        {"position": {"x": 8, "y": 11}, "is_angle_degrees": 236.54263871039927},
        {"position": {"x": 5, "y": 7}, "is_angle_degrees": 237.0556412787696},
        {"position": {"x": 7, "y": 10}, "is_angle_degrees": 237.80506538040387},
        {"position": {"x": 2, "y": 3}, "is_angle_degrees": 239.2384614508864},
        {"position": {"x": 7, "y": 11}, "is_angle_degrees": 240.66175895372203},
        {"position": {"x": 5, "y": 8}, "is_angle_degrees": 241.1893671019898},
        {"position": {"x": 3, "y": 5}, "is_angle_degrees": 242.21591563662784},
        {"position": {"x": 7, "y": 12}, "is_angle_degrees": 243.10840230514316},
        {"position": {"x": 4, "y": 7}, "is_angle_degrees": 243.64844318687088},
        {"position": {"x": 5, "y": 9}, "is_angle_degrees": 244.30834057948704},
        {"position": {"x": 6, "y": 11}, "is_angle_degrees": 244.67468430767647},
        {"position": {"x": 1, "y": 2}, "is_angle_degrees": 246.86622961467404},
        {"position": {"x": 5, "y": 11}, "is_angle_degrees": 248.89623287598292},
        {"position": {"x": 4, "y": 9}, "is_angle_degrees": 249.24022544736272},
        {"position": {"x": 3, "y": 7}, "is_angle_degrees": 249.94957672179203},
        {"position": {"x": 5, "y": 12}, "is_angle_degrees": 250.51863967975643},
        {"position": {"x": 2, "y": 5}, "is_angle_degrees": 251.28850943140387},
        {"position": {"x": 3, "y": 8}, "is_angle_degrees": 252.39899301695226},
        {"position": {"x": 4, "y": 11}, "is_angle_degrees": 252.93774257825774},
        {"position": {"x": 1, "y": 3}, "is_angle_degrees": 254.36202366181803},
        {"position": {"x": 3, "y": 10}, "is_angle_degrees": 255.77582757180045},
        {"position": {"x": 2, "y": 7}, "is_angle_degrees": 256.42442746027183},
        {"position": {"x": 3, "y": 11}, "is_angle_degrees": 256.9559321328725},
        {"position": {"x": 1, "y": 4}, "is_angle_degrees": 257.9923216155314},
        {"position": {"x": 2, "y": 9}, "is_angle_degrees": 259.211090819349},
        {"position": {"x": 1, "y": 5}, "is_angle_degrees": 260.25265231767105},
        {"position": {"x": 2, "y": 11}, "is_angle_degrees": 261.0034628291378},
        {"position": {"x": 1, "y": 6}, "is_angle_degrees": 261.6912896772781},
        {"position": {"x": 1, "y": 7}, "is_angle_degrees": 262.76101671942877},
        {"position": {"x": 1, "y": 8}, "is_angle_degrees": 263.62045466610243},
        {"position": {"x": 1, "y": 9}, "is_angle_degrees": 264.3336655511919},
        {"position": {"x": 1, "y": 10}, "is_angle_degrees": 264.6492808192487},
        {"position": {"x": 1, "y": 11}, "is_angle_degrees": 265.1535754029703},
        {"position": {"x": 1, "y": 12}, "is_angle_degrees": 265.5595800690632},
        {"position": {"x": 0, "y": 1}, "is_angle_degrees": 269.18252281788943},
        {"position": {"x": -1, "y": 12}, "is_angle_degrees": 272.8783379216949},
        {"position": {"x": -1, "y": 11}, "is_angle_degrees": 273.18404436369565},
        {"position": {"x": -1, "y": 10}, "is_angle_degrees": 273.7822665226945},
        {"position": {"x": -1, "y": 9}, "is_angle_degrees": 274.0342296232624},
        {"position": {"x": -1, "y": 8}, "is_angle_degrees": 274.79850049549617},
        {"position": {"x": -1, "y": 7}, "is_angle_degrees": 275.6759770174907},
        {"position": {"x": -1, "y": 6}, "is_angle_degrees": 276.7114020540849},
        {"position": {"x": -2, "y": 11}, "is_angle_degrees": 277.463121427433},
        {"position": {"x": -1, "y": 5}, "is_angle_degrees": 278.1504762797393},
        {"position": {"x": -2, "y": 9}, "is_angle_degrees": 279.18519183503565},
        {"position": {"x": -1, "y": 4}, "is_angle_degrees": 280.44729036743064},
        {"position": {"x": -3, "y": 11}, "is_angle_degrees": 281.4997069286953},
        {"position": {"x": -2, "y": 7}, "is_angle_degrees": 282.0522663148089},
        {"position": {"x": -3, "y": 10}, "is_angle_degrees": 282.7232234028453},
        {"position": {"x": -1, "y": 3}, "is_angle_degrees": 284.130191576007},
        {"position": {"x": -4, "y": 11}, "is_angle_degrees": 285.5192967413193},
        {"position": {"x": -3, "y": 8}, "is_angle_degrees": 286.06455342791156},
        {"position": {"x": -2, "y": 5}, "is_angle_degrees": 287.08508416642854},
        {"position": {"x": -5, "y": 12}, "is_angle_degrees": 287.96389463125877},
        {"position": {"x": -3, "y": 7}, "is_angle_degrees": 288.5223240452783},
        {"position": {"x": -4, "y": 9}, "is_angle_degrees": 289.22864925370845},
        {"position": {"x": -5, "y": 11}, "is_angle_degrees": 289.5814919301791},
        {"position": {"x": -1, "y": 2}, "is_angle_degrees": 291.6984903456128},
        {"position": {"x": -6, "y": 11}, "is_angle_degrees": 293.75701891588005},
        {"position": {"x": -5, "y": 9}, "is_angle_degrees": 294.1197123396859},
        {"position": {"x": -4, "y": 7}, "is_angle_degrees": 294.8467120481688},
        {"position": {"x": -7, "y": 12}, "is_angle_degrees": 295.37010688254577},
        {"position": {"x": -3, "y": 5}, "is_angle_degrees": 296.17732273832786},
        {"position": {"x": -5, "y": 8}, "is_angle_degrees": 297.25823871780614},
        {"position": {"x": -7, "y": 11}, "is_angle_degrees": 297.7873461411438},
        {"position": {"x": -2, "y": 3}, "is_angle_degrees": 299.21642871011875},
        {"position": {"x": -7, "y": 10}, "is_angle_degrees": 300.5797168359438},
        {"position": {"x": -5, "y": 7}, "is_angle_degrees": 301.29515391257934},
        {"position": {"x": -8, "y": 11}, "is_angle_degrees": 301.8323594628894},
        {"position": {"x": -3, "y": 4}, "is_angle_degrees": 302.88273726611897},
        {"position": {"x": -7, "y": 9}, "is_angle_degrees": 304.0669567999951},
        {"position": {"x": -4, "y": 5}, "is_angle_degrees": 305.1481884810815},
        {"position": {"x": -9, "y": 11}, "is_angle_degrees": 305.90474757463573},
        {"position": {"x": -5, "y": 6}, "is_angle_degrees": 306.5953954554787},
        {"position": {"x": -6, "y": 7}, "is_angle_degrees": 307.5875865121705},
        {"position": {"x": -7, "y": 8}, "is_angle_degrees": 308.4845547616143},
        {"position": {"x": -8, "y": 9}, "is_angle_degrees": 309.0430295611872},
        {"position": {"x": -9, "y": 10}, "is_angle_degrees": 309.5420206088996},
        {"position": {"x": -10, "y": 11}, "is_angle_degrees": 310.1250691037786},
        {"position": {"x": -11, "y": 12}, "is_angle_degrees": 310.4478233418726},
        {"position": {"x": -1, "y": 1}, "is_angle_degrees": 314.1518232195383},
        {"position": {"x": -12, "y": 11}, "is_angle_degrees": 317.8297817771944},
        {"position": {"x": -11, "y": 10}, "is_angle_degrees": 318.238608702456},
        {"position": {"x": -10, "y": 9}, "is_angle_degrees": 318.46467468197415},
        {"position": {"x": -9, "y": 8}, "is_angle_degrees": 319.0680870364064},
        {"position": {"x": -8, "y": 7}, "is_angle_degrees": 319.79905467920645},
        {"position": {"x": -7, "y": 6}, "is_angle_degrees": 320.4654435330122},
        {"position": {"x": -6, "y": 5}, "is_angle_degrees": 321.7380554352474},
        {"position": {"x": -11, "y": 9}, "is_angle_degrees": 322.25037660397084},
        {"position": {"x": -5, "y": 4}, "is_angle_degrees": 323.04041972328406},
        {"position": {"x": -9, "y": 7}, "is_angle_degrees": 324.1269728249081},
        {"position": {"x": -4, "y": 3}, "is_angle_degrees": 325.36181093674423},
        {"position": {"x": -11, "y": 8}, "is_angle_degrees": 326.3240505689787},
        {"position": {"x": -7, "y": 5}, "is_angle_degrees": 326.8357729737181},
        {"position": {"x": -10, "y": 7}, "is_angle_degrees": 327.5802099213551},
        {"position": {"x": -3, "y": 2}, "is_angle_degrees": 329.00744000902995},
        {"position": {"x": -11, "y": 7}, "is_angle_degrees": 330.4276418875332},
        {"position": {"x": -8, "y": 5}, "is_angle_degrees": 330.95262492950746},
        {"position": {"x": -5, "y": 3}, "is_angle_degrees": 331.9774234663359},
        {"position": {"x": -12, "y": 7}, "is_angle_degrees": 332.8708822822816},
        {"position": {"x": -7, "y": 4}, "is_angle_degrees": 333.4057877199358},
        {"position": {"x": -9, "y": 5}, "is_angle_degrees": 334.06377917069074},
        {"position": {"x": -11, "y": 6}, "is_angle_degrees": 334.4268915434322},
        {"position": {"x": -2, "y": 1}, "is_angle_degrees": 336.6083991497292},
        {"position": {"x": -11, "y": 5}, "is_angle_degrees": 338.45915246427796},
        {"position": {"x": -9, "y": 4}, "is_angle_degrees": 338.9818904754534},
        {"position": {"x": -7, "y": 3}, "is_angle_degrees": 339.68781104888666},
        {"position": {"x": -12, "y": 5}, "is_angle_degrees": 340.25598382731897},
        {"position": {"x": -5, "y": 2}, "is_angle_degrees": 340.8646588687204},
        {"position": {"x": -8, "y": 3}, "is_angle_degrees": 342.13162979955257},
        {"position": {"x": -11, "y": 4}, "is_angle_degrees": 342.6694658210219},
        {"position": {"x": -3, "y": 1}, "is_angle_degrees": 343.9086035777634},
        {"position": {"x": -10, "y": 3}, "is_angle_degrees": 345.4970517603252},
        {"position": {"x": -7, "y": 2}, "is_angle_degrees": 346.1480930787289},
        {"position": {"x": -11, "y": 3}, "is_angle_degrees": 346.6778644984361},
        {"position": {"x": -4, "y": 1}, "is_angle_degrees": 347.71225370335253},
        {"position": {"x": -9, "y": 2}, "is_angle_degrees": 348.9323640641163},
        {"position": {"x": -5, "y": 1}, "is_angle_degrees": 349.97048016623563},
        {"position": {"x": -11, "y": 2}, "is_angle_degrees": 350.72593557936096},
        {"position": {"x": -6, "y": 1}, "is_angle_degrees": 351.4204536170094},
        {"position": {"x": -7, "y": 1}, "is_angle_degrees": 352.48107479456826},
        {"position": {"x": -8, "y": 1}, "is_angle_degrees": 353.3360841690405},
        {"position": {"x": -9, "y": 1}, "is_angle_degrees": 353.8680300694102},
        {"position": {"x": -10, "y": 1}, "is_angle_degrees": 354.35953729415},
        {"position": {"x": -11, "y": 1}, "is_angle_degrees": 354.8765335083275},
        {"position": {"x": -12, "y": 1}, "is_angle_degrees": 355.16178324256697}
      ],
      "cosine"
    )
  }

  export class Service extends Process<void> {
    private committed_state = observe<Service.State>(null).equality((a, b) => a?.angle == b?.angle && a?.state == b?.state)

    last_read: CompassReader.AngleResult = null


    constructor(private matched_ui: CapturedCompass,
                private show_overlay: boolean,
                private disable_calibration: boolean = false,
                private refind_after_close: boolean = false
    ) {
      super();

      this.asInterval(100)
    }

    private overlay: OverlayGeometry = new OverlayGeometry()

    private tick_counter = 0
    private last_ticks: Record<AngleResult["type"], number> = {
      success: -2,
      likely_closed: -2,
      likely_solved: -2,
      likely_concealed: -2,
    }

    private closed() {
      this.committed_state.set({angle: null, state: "closed"})

      if (this.refind_after_close) this.matched_ui = null

    }

    private previous_state: {
      since: number,
      last_confirmed: number,
      state: CompassReader.AngleResult
    } = null

    private buffered_state: {
      since: number,
      last_confirmed: number,
      state: CompassReader.AngleResult
    } = null

    private last_stationary_tick: number = -1

    async tick(): Promise<void> {
      const tick = this.tick_counter++

      if (this.refind_after_close && !this.matched_ui) {
        this.matched_ui = await CapturedCompass.find(CapturedImage.capture())
      }

      if (!this.matched_ui) return

      const reader = new CompassReader(this.matched_ui.recapture(), this.disable_calibration)

      this.overlay.clear()

      {
        const read = this.last_read = reader.getAngle()
        const now = Date.now()

        if (lodash.isEqual(this.buffered_state?.state, read)) {
          this.buffered_state.last_confirmed = now
        } else {
          this.previous_state = this.buffered_state

          this.buffered_state = {
            since: now,
            last_confirmed: now,
            state: read
          }
        }
      }

      const state = this.buffered_state.state
      const state_active_time = this.buffered_state.last_confirmed - this.buffered_state.since

      if (state.type == "likely_concealed" || state.type == "likely_closed") log().log(`${state.type}: ${state.details}`, "Compass Reader")

      const BUFFER_CONFIRMATION_TIME = 200

      const was_ever_solved = this.last_ticks["likely_solved"] >= 0

      if (state.type == "likely_closed" && (state_active_time > BUFFER_CONFIRMATION_TIME || was_ever_solved)) this.closed()
      else if (state.type == "likely_concealed" && (state_active_time > 5000 || was_ever_solved)) this.closed()
      else if (state.type == "likely_concealed" || state.type == "likely_closed") {
        this.overlay.text("Concealed",
          Vector2.add(ScreenRectangle.center(reader.capture.body.screenRectangle()), {x: 5, y: 100}), {
            shadow: true,
            centered: true,
            width: 12,
            color: mixColor(128, 128, 128)
          })
      } else if (state.type == "likely_solved") {

        this.overlay.rect2(
          ScreenRectangle.move(
            reader.capture.body.screenRectangle(),
            {x: 59, y: 172},
            {x: 55, y: 52}
          ), {
            width: 2,
            color: mixColor(0, 255, 0),
          }
        )

        this.overlay.text("Solved",
          Vector2.add(ScreenRectangle.center(reader.capture.body.screenRectangle()), {x: 5, y: 100}), {
            shadow: true,
            centered: true,
            width: 12,
            color: mixColor(0, 255, 0),
          })

        this.committed_state.set({angle: null, state: "solved"})
      } else if (state.type == "success") {
        if (state_active_time > 0.1) {

          this.committed_state.set({
            angle: state.angle,
            state: "normal",
          })

          this.last_stationary_tick = tick
        } else if (this.previous_state?.state.type == "success" && tick - this.last_stationary_tick > 2) {
          this.committed_state.set({
            angle: null,
            state: "spinning"
          })
        }
      }

      this.last_ticks[state.type] = tick

      if (this.committed_state.value()) {
        let text: string = null

        const state = this.committed_state.value()

        if (state.state == "spinning") {
          text = "Spinning"
        } else if (state.angle != null) {
          text = `${radiansToDegrees(state.angle).toFixed(this.disable_calibration ? 3 : 1)}°`
        }

        if (text) {
          this.overlay.text(text,
            Vector2.add(ScreenRectangle.center(reader.capture.body.screenRectangle()), {x: 5, y: 8}), {
              shadow: true,
              centered: true,
              width: 15,
              color: mixColor(255, 255, 255)
            })
        }
      }

      if (this.show_overlay) this.overlay.render()
    }

    async implementation(): Promise<void> {

      while (!this.should_stop) {
        try {
          await this.tick()
        } catch (e) {
          // Catch errors to avoid crashing on rare errors.
        }
        await this.checkTime()
      }

      this.overlay?.clear()?.render()
    }

    onChange(handler: (new_value: Service.State, old: Service.State) => any, handler_f?: (_: EwentHandler<any>) => void): this {
      this.committed_state.subscribe(handler, false, handler_f)

      return this
    }

    state(): Service.State {
      return this.committed_state.value()
    }
  }

  export namespace Service {
    export type State = {
      angle: number,
      state: "normal" | "solved" | "spinning" | "closed"
    }
  }

  export type CalibrationMode = keyof typeof calibration_tables

  export class CalibrationTool extends NisModal {
    private samples: AngularKeyframeFunction.Sample[] = []
    private reader: Service
    private layer: CalibrationTool.Layer

    handler: Alt1MainHotkeyEvent.Handler

    expected: Widget

    constructor(samples: AngularKeyframeFunction.Sample[] = []) {
      super({
        size: "fullscreen",
        fixed: true,
        disable_close_button: false
      });

      this.samples = lodash.cloneDeep(samples)

      this.handler = deps().app.main_hotkey.subscribe(0, (e) => {
        this.commit()
      })

      this.hidden.on(() => {
        this.reader.stop()
        this.handler.remove()
      })

      this.reader = new Service(null, true, true, true)

      this.reader.run()
    }

    delete() {
      const entry_index = this.samples.findIndex(s => Vector2.eq(s.position, this.layer.offset))

      this.samples.splice(entry_index, 1)
    }

    commit() {
      const state = this.reader.state()

      if (state.state == "normal") {

        const entry = this.samples.find(s => Vector2.eq(s.position, this.layer.offset))

        if (entry) {
          entry.is_angle_degrees = radiansToDegrees(state.angle)
        } else {
          this.samples.push({position: this.layer.offset, is_angle_degrees: radiansToDegrees(state.angle)})
        }

        this.autoNextSpot()
      }
    }

    autoNextSpot() {
      const test = (offset: Vector2): boolean => {
        const gcd = greatestCommonDivisor(offset.x, offset.y)

        if (gcd > 1) return false

        const entry = this.samples.find(s => Vector2.eq(s.position, offset))

        if (entry) return false

        this.layer.setOffset(offset)

        return true
      }

      if (test({x: 0, y: 1})) return
      if (test({x: 1, y: 0})) return
      if (test({x: 0, y: -1})) return
      if (test({x: -1, y: 0})) return

      for (let d = 3; d <= 15; d++) {
        const iterations = Math.pow(2, d)

        for (let i = 1; i < iterations; i++) { // Only iterate odds to avoid duplication
          const angle = i * (Math.PI * 2) / iterations

          function farey(limit: number, R: number): Vector2 {
            if (R > 1) {
              const res = farey(limit, 1 / R)

              return {
                x: res.y,
                y: res.x
              }
            }

            let lower: Vector2 = {y: 0, x: 1}
            let higher: Vector2 = {y: 1, x: 1}

            while (true) {
              let c = Vector2.add(lower, higher) // interestingly c is already in reduced form

              // if the numbers are too big, return the closest of a and b
              if (c.x > limit || c.y > limit) {
                if (R - lower.y / lower.x < higher.y / higher.x - R) return lower
                else return higher
              }

              // adjust the interval:
              if (c.y / c.x < R) lower = c
              else higher = c
            }
          }

          const v = farey((d * d) / 10, Math.abs(Math.sin(angle)) / Math.abs(Math.cos(angle)))

          if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) v.x *= -1
          if (angle > Math.PI) v.y *= -1

          if (test(v)) return
        }
      }

      /*
            for (let d = 1; d <= 100; d++) {
              for (let x = -d; x < d; x++) if (test({x: x, y: d})) return
              for (let y = d; y > -d; y--) if (test({x: d, y: y})) return
              for (let x = d; x > -d; x--) if (test({x: x, y: -d})) return
              for (let y = -d; y < d; y++) if (test({x: -d, y: y})) return
            }*/
    }

    render() {
      super.render();

      this.body.css("display", "flex")
        .css("flex-direction", "column")

      const map = new GameMapMiniWidget()
        .css2({
          "width": "100%",
          "height": "500px"
        })
        .appendTo(this.body)

      setTimeout(() => map.map.invalidateSize(), 1000)

      this.expected = c().appendTo(this.body)

      new ButtonRow().buttons(
          new LightButton("Auto")
            .onClick(() => this.autoNextSpot()),
          new LightButton("Commit")
            .onClick(() => this.commit()),
          new LightButton("Delete")
            .onClick(() => this.delete())
        )
        .appendTo(this.body)

      new ButtonRow().buttons(
        new LightButton("Import").onClick(async () => {
          this.samples = (await new ImportStringModal(input => {
            return JSON.parse(input)
          }).do()).imported
          this.autoNextSpot()
        }),
        new LightButton("Export JSON").onClick(() => {
          new ExportStringModal(
            "[\n" +
            lodash.sortBy(this.samples, s => Vector2.angle(ANGLE_REFERENCE_VECTOR, {x: -s.position.x, y: -s.position.y})).map(s => cleanedJSON(s, undefined)).join(",\n")
            + "\n]"
          ).show()
        }),
        new LightButton("Export CSV").onClick(() => {
          new ExportStringModal(AngularKeyframeFunction.fromCalibrationSamples(this.samples, "cosine").getCSV()).show()
        }),
      ).appendTo(this.body)

      map.map.addGameLayer(this.layer = new CalibrationTool.Layer(this))

      this.autoNextSpot()
    }
  }

  export namespace CalibrationTool {
    import gielinor_compass = clue_data.gielinor_compass;

    export class KnownMarker extends MapEntity {
      constructor(public spot: TileCoordinates) {
        super()

        this.setInteractive()
      }

      private active: boolean = false

      setActive(v: boolean): this {
        if (v != this.active) {
          this.active = v
          this.requestRendering()
        }

        return this
      }

      bounds(): Rectangle {
        return Rectangle.from(this.spot)
      }

      protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
        const opacity = this.active ? 1 : 0.5

        const scale = (this.active ? 1 : 0.5) * (props.highlight ? 1.5 : 1)

        const marker = leaflet.marker(Vector2.toLatLong(this.spot), {
          icon: levelIcon(this.spot.level, scale),
          opacity: opacity,
          interactive: true,
          bubblingMouseEvents: true,
        }).addTo(this)

        return marker.getElement()
      }
    }

    export class Layer extends GameLayer {
      markers: KnownMarker[]

      reference: TileCoordinates
      offset: Vector2 = {x: -1, y: 1}

      constructor(public tool: CalibrationTool) {
        super()

        this.markers = gielinor_compass.spots.map(spot =>
          new KnownMarker(spot).addTo(this)
        )

        this.setReference(gielinor_compass.spots[0])
      }

      eventClick(event: GameMapMouseEvent) {
        event.onPost(() => {
          if (event.active_entity instanceof KnownMarker) {
            this.setReference(event.active_entity.spot)
          } else {
            this.setOffset(Vector2.sub(event.tile(), this.reference))
          }
        })
      }

      setOffset(offset: Vector2) {
        this.offset = offset

        this.tool.expected.text(`Expected: ${radiansToDegrees(normalizeAngle(Math.atan2(-offset.y, -offset.x))).toFixed(3)}°`)

        this.updateTileOverlays()
      }

      setReference(reference: TileCoordinates) {
        this.reference = reference

        this.markers.forEach(marker => {
          marker.setActive(TileCoordinates.equals(marker.spot, reference))
        })

        this.updateTileOverlays()
      }

      private overlay: leaflet.FeatureGroup = null

      updateTileOverlays() {
        if (this.overlay) {
          this.overlay.remove()
          this.overlay = null
        }

        this.overlay = leaflet.featureGroup().addTo(this)

        for (let i = 1; i <= 100; i++) {
          tilePolygon(Vector2.add(this.reference, Vector2.scale(i, this.offset))).addTo(this.overlay)
        }
      }
    }
  }
}