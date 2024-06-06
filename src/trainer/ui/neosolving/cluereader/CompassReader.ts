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
import angleDifference = Compasses.angleDifference;
import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;
import AngleResult = CompassReader.AngleResult;
import {Log} from "../../../../lib/util/Log";

class AngularKeyframeFunction {
  private constructor(private readonly keyframes: {
    original?: Vector2,
    angle: number,
    value: number
  }[]) {
    this.keyframes = lodash.sortBy(keyframes, e => e.angle)
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
      return `${keyframe.angle},${keyframe.value},"${keyframe.original?.x}|${keyframe.original?.y}"`
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
          original: position,
          angle: is_angle,
          value: dif
        }
      })
    )
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

    function sample(x: number, y: number) {
      return buf.getPixel(x + CENTER_OFFSET.x, y + CENTER_OFFSET.y)
    }

    function getRed(x: number, y: number) {
      const i = 4 * ((CENTER_OFFSET.y + y) * buf.width + x + CENTER_OFFSET.x)

      return buf.data[i]
    }

    function isArrow(x: number, y: number) {
      const [r, g, b, _] = sample(x, y)

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

    const rectangle_samples: {
      angle: number,
      weight: number
    }[] = []

    let antialiasing_detected = false

    const ANTIALIASING_SEARCH_RADIUS = 40

    for (let y = -CapturedCompass.TOTAL_COMPASS_RADIUS; y <= CapturedCompass.TOTAL_COMPASS_RADIUS; y++) {
      for (let x = -CapturedCompass.TOTAL_COMPASS_RADIUS; x <= CapturedCompass.TOTAL_COMPASS_RADIUS; x++) {
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
        } else if (!antialiasing_detected && Math.abs(y) <= ANTIALIASING_SEARCH_RADIUS && Math.abs(x) <= ANTIALIASING_SEARCH_RADIUS) {
          const red = getRed(x, y)

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

    if (circle_failure_reason) return circle_failure_reason

    const angle_after_rectangle_sample = normalizeAngle(Math.atan2(
      lodash.sum(rectangle_samples.map(a => a.weight * Math.sin(a.angle))),
      lodash.sum(rectangle_samples.map(a => a.weight * Math.cos(a.angle))),
    ))

    const calibration_mode = (this.disable_calibration || CompassReader.DISABLE_CALIBRATION) ? null
      : (antialiasing_detected ? "msaa" : "off")

    const final_angle = calibration_mode
      ? normalizeAngle(angle_after_rectangle_sample + CompassReader.calibration_tables[calibration_mode].sample(angle_after_rectangle_sample))
      : angle_after_rectangle_sample

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
      {"position":{"x":-1,"y":0},"is_angle_degrees":358.9657466412032},
      {"position":{"x":-12,"y":-1},"is_angle_degrees":2.6617766329427583},
      {"position":{"x":-11,"y":-1},"is_angle_degrees":3.006872345401127},
      {"position":{"x":-10,"y":-1},"is_angle_degrees":3.2849483529531125},
      {"position":{"x":-9,"y":-1},"is_angle_degrees":3.9044458072423516},
      {"position":{"x":-8,"y":-1},"is_angle_degrees":4.637124734855373},
      {"position":{"x":-7,"y":-1},"is_angle_degrees":5.292392593355138},
      {"position":{"x":-6,"y":-1},"is_angle_degrees":6.367582492301499},
      {"position":{"x":-11,"y":-2},"is_angle_degrees":7.02751834953284},
      {"position":{"x":-5,"y":-1},"is_angle_degrees":7.90377492604354},
      {"position":{"x":-9,"y":-2},"is_angle_degrees":8.97412493826651},
      {"position":{"x":-4,"y":-1},"is_angle_degrees":10.243095382864254},
      {"position":{"x":-11,"y":-3},"is_angle_degrees":11.211528035903267},
      {"position":{"x":-7,"y":-2},"is_angle_degrees":11.742930885715417},
      {"position":{"x":-10,"y":-3},"is_angle_degrees":12.28551870600355},
      {"position":{"x":-3,"y":-1},"is_angle_degrees":13.842635719621958},
      {"position":{"x":-11,"y":-4},"is_angle_degrees":15.305051070524389},
      {"position":{"x":-8,"y":-3},"is_angle_degrees":15.817372409504776},
      {"position":{"x":-5,"y":-2},"is_angle_degrees":16.8707157880385},
      {"position":{"x":-12,"y":-5},"is_angle_degrees":17.56142126126491},
      {"position":{"x":-7,"y":-3},"is_angle_degrees":18.104847499196875},
      {"position":{"x":-9,"y":-4},"is_angle_degrees":18.781330164512408},
      {"position":{"x":-11,"y":-5},"is_angle_degrees":19.30586032347935},
      {"position":{"x":-2,"y":-1},"is_angle_degrees":21.265135401118865},
      {"position":{"x":-11,"y":-6},"is_angle_degrees":23.34534090276835},
      {"position":{"x":-9,"y":-5},"is_angle_degrees":23.862547258211467},
      {"position":{"x":-7,"y":-4},"is_angle_degrees":24.584541286788355},
      {"position":{"x":-12,"y":-7},"is_angle_degrees":25.11636858242653},
      {"position":{"x":-5,"y":-3},"is_angle_degrees":25.86660493004437},
      {"position":{"x":-8,"y":-5},"is_angle_degrees":27.037236035578005},
      {"position":{"x":-11,"y":-7},"is_angle_degrees":27.56541953895454},
      {"position":{"x":-3,"y":-2},"is_angle_degrees":28.820201060477068},
      {"position":{"x":-10,"y":-7},"is_angle_degrees":30.44688756835468},
      {"position":{"x":-7,"y":-5},"is_angle_degrees":31.075807187516723},
      {"position":{"x":-11,"y":-8},"is_angle_degrees":31.627978308186986},
      {"position":{"x":-4,"y":-3},"is_angle_degrees":32.65259594809146},
      {"position":{"x":-9,"y":-7},"is_angle_degrees":33.86624013116647},
      {"position":{"x":-5,"y":-4},"is_angle_degrees":34.793016910512065},
      {"position":{"x":-11,"y":-9},"is_angle_degrees":35.63522403733063},
      {"position":{"x":-6,"y":-5},"is_angle_degrees":36.31797685793417},
      {"position":{"x":-7,"y":-6},"is_angle_degrees":37.40369491952948},
      {"position":{"x":-8,"y":-7},"is_angle_degrees":38.29293253139817},
      {"position":{"x":-9,"y":-8},"is_angle_degrees":38.80018508781584},
      {"position":{"x":-10,"y":-9},"is_angle_degrees":39.353659542951355},
      {"position":{"x":-11,"y":-10},"is_angle_degrees":39.70875141425591},
      {"position":{"x":-12,"y":-11},"is_angle_degrees":40.024915014313486},
      {"position":{"y":-1,"x":-1},"is_angle_degrees":43.88848719375129},
      {"position":{"x":-11,"y":-12},"is_angle_degrees":47.60878682916819},
      {"position":{"x":-10,"y":-11},"is_angle_degrees":47.89530015515587},
      {"position":{"x":-9,"y":-10},"is_angle_degrees":48.3512997433645},
      {"position":{"x":-8,"y":-9},"is_angle_degrees":48.74988442916844},
      {"position":{"x":-7,"y":-8},"is_angle_degrees":49.49596847855949},
      {"position":{"x":-6,"y":-7},"is_angle_degrees":50.229787782224776},
      {"position":{"x":-5,"y":-6},"is_angle_degrees":51.23950264801879},
      {"position":{"x":-9,"y":-11},"is_angle_degrees":51.976776083834885},
      {"position":{"x":-4,"y":-5},"is_angle_degrees":52.86170576692719},
      {"position":{"x":-7,"y":-9},"is_angle_degrees":53.960723087959025},
      {"position":{"x":-3,"y":-4},"is_angle_degrees":55.201816496817386},
      {"position":{"x":-8,"y":-11},"is_angle_degrees":56.07846438219908},
      {"position":{"x":-5,"y":-7},"is_angle_degrees":56.802851072099934},
      {"position":{"x":-7,"y":-10},"is_angle_degrees":57.27257321898703},
      {"position":{"x":-2,"y":-3},"is_angle_degrees":58.869673963905285},
      {"position":{"x":-7,"y":-11},"is_angle_degrees":60.27356412313356},
      {"position":{"x":-5,"y":-8},"is_angle_degrees":60.77859154517624},
      {"position":{"x":-3,"y":-5},"is_angle_degrees":61.83849036770313},
      {"position":{"x":-7,"y":-12},"is_angle_degrees":62.538219449017895},
      {"position":{"x":-4,"y":-7},"is_angle_degrees":63.05962927289403},
      {"position":{"x":-5,"y":-9},"is_angle_degrees":63.79350972671453},
      {"position":{"x":-6,"y":-11},"is_angle_degrees":64.3079328673355},
      {"position":{"x":-1,"y":-2},"is_angle_degrees":66.33104729251254},
      {"position":{"x":-5,"y":-11},"is_angle_degrees":68.34567741746373},
      {"position":{"x":-4,"y":-9},"is_angle_degrees":68.87191170687701},
      {"position":{"x":-3,"y":-7},"is_angle_degrees":69.56776032161015},
      {"position":{"x":-5,"y":-12},"is_angle_degrees":70.03097914574947},
      {"position":{"x":-2,"y":-5},"is_angle_degrees":70.9242775267025},
      {"position":{"x":-3,"y":-8},"is_angle_degrees":72.07044878772945},
      {"position":{"x":-4,"y":-11},"is_angle_degrees":72.38504592762442},
      {"position":{"x":-1,"y":-3},"is_angle_degrees":73.83948520533345},
      {"position":{"x":-3,"y":-10},"is_angle_degrees":75.36777827452268},
      {"position":{"x":-2,"y":-7},"is_angle_degrees":75.93733469252254},
      {"position":{"x":-3,"y":-11},"is_angle_degrees":76.62594180207117},
      {"position":{"x":-1,"y":-4},"is_angle_degrees":77.682775417852},
      {"position":{"x":-2,"y":-9},"is_angle_degrees":78.90268557696331},
      {"position":{"x":-1,"y":-5},"is_angle_degrees":79.78077991746731},
      {"position":{"x":-2,"y":-11},"is_angle_degrees":80.67235510662387},
      {"position":{"x":-1,"y":-6},"is_angle_degrees":81.39612200004912},
      {"position":{"x":-1,"y":-7},"is_angle_degrees":82.43518081525274},
      {"position":{"x":-1,"y":-8},"is_angle_degrees":83.35251404417649},
      {"position":{"x":-1,"y":-9},"is_angle_degrees":83.83752563336203},
      {"position":{"x":-1,"y":-10},"is_angle_degrees":84.41095908272568},
      {"position":{"x":-1,"y":-11},"is_angle_degrees":84.68747694389126},
      {"position":{"x":-1,"y":-12},"is_angle_degrees":85.14157799983323},
      {"position":{"x":0,"y":-1},"is_angle_degrees":88.80270164159076},
      {"position":{"x":1,"y":-12},"is_angle_degrees":92.8387350491093},
      {"position":{"x":1,"y":-11},"is_angle_degrees":93.09225082296825},
      {"position":{"x":1,"y":-10},"is_angle_degrees":93.63348155788057},
      {"position":{"x":1,"y":-9},"is_angle_degrees":94.093063585532},
      {"position":{"x":1,"y":-8},"is_angle_degrees":94.64585265572455},
      {"position":{"x":1,"y":-7},"is_angle_degrees":95.49400008923276},
      {"position":{"x":1,"y":-6},"is_angle_degrees":96.56836117350979},
      {"position":{"x":2,"y":-11},"is_angle_degrees":97.17152260182662},
      {"position":{"x":1,"y":-5},"is_angle_degrees":98.13931688689819},
      {"position":{"x":2,"y":-9},"is_angle_degrees":99.00373261072919},
      {"position":{"x":1,"y":-4},"is_angle_degrees":100.27825503884834},
      {"position":{"x":3,"y":-11},"is_angle_degrees":101.25092403556344},
      {"position":{"x":2,"y":-7},"is_angle_degrees":101.97589182392574},
      {"position":{"x":3,"y":-10},"is_angle_degrees":102.52403484034463},
      {"position":{"x":1,"y":-3},"is_angle_degrees":104.08236843131829},
      {"position":{"x":4,"y":-11},"is_angle_degrees":105.53384203259479},
      {"position":{"x":3,"y":-8},"is_angle_degrees":105.87739169061959},
      {"position":{"x":2,"y":-5},"is_angle_degrees":107.1080108953682},
      {"position":{"x":5,"y":-12},"is_angle_degrees":107.809096432055},
      {"position":{"x":3,"y":-7},"is_angle_degrees":108.32978591770879},
      {"position":{"x":4,"y":-9},"is_angle_degrees":109.01777330983545},
      {"position":{"x":5,"y":-11},"is_angle_degrees":109.56932054006813},
      {"position":{"x":1,"y":-2},"is_angle_degrees":111.34837967450477},
      {"position":{"x":6,"y":-11},"is_angle_degrees":113.59532166284926},
      {"position":{"x":5,"y":-9},"is_angle_degrees":114.13906402094943},
      {"position":{"x":4,"y":-7},"is_angle_degrees":114.87245673869411},
      {"position":{"x":7,"y":-12},"is_angle_degrees":115.3339652695301},
      {"position":{"x":3,"y":-5},"is_angle_degrees":116.12686466145841},
      {"position":{"x":5,"y":-8},"is_angle_degrees":117.14632911669348},
      {"position":{"x":7,"y":-11},"is_angle_degrees":117.67638497114926},
      {"position":{"x":2,"y":-3},"is_angle_degrees":119.1127841025394},
      {"position":{"x":7,"y":-10},"is_angle_degrees":120.69560995252385},
      {"position":{"x":5,"y":-7},"is_angle_degrees":121.20249121528232},
      {"position":{"x":8,"y":-11},"is_angle_degrees":121.91065937286898},
      {"position":{"x":3,"y":-4},"is_angle_degrees":122.78407001256977},
      {"position":{"x":7,"y":-9},"is_angle_degrees":124.00154232044986},
      {"position":{"x":4,"y":-5},"is_angle_degrees":125.11789214442756},
      {"position":{"x":9,"y":-11},"is_angle_degrees":125.98550349961666},
      {"position":{"x":5,"y":-6},"is_angle_degrees":126.67694452532982},
      {"position":{"x":6,"y":-7},"is_angle_degrees":127.74011597845812},
      {"position":{"x":7,"y":-8},"is_angle_degrees":128.44454880226064},
      {"position":{"x":8,"y":-9},"is_angle_degrees":129.11865667355912},
      {"position":{"x":9,"y":-10},"is_angle_degrees":129.65730780475226},
      {"position":{"x":10,"y":-11},"is_angle_degrees":130.04928794149336},
      {"position":{"x":11,"y":-12},"is_angle_degrees":130.39254143392262},
      {"position":{"x":1,"y":-1},"is_angle_degrees":134.0602941591161},
      {"position":{"x":12,"y":-11},"is_angle_degrees":137.96557291464808},
      {"position":{"x":11,"y":-10},"is_angle_degrees":138.4122835675914},
      {"position":{"x":10,"y":-9},"is_angle_degrees":138.6980818419114},
      {"position":{"x":9,"y":-8},"is_angle_degrees":139.26792633458479},
      {"position":{"x":8,"y":-7},"is_angle_degrees":139.68390830427361},
      {"position":{"x":7,"y":-6},"is_angle_degrees":140.5989929076895},
      {"position":{"x":6,"y":-5},"is_angle_degrees":141.632029026654},
      {"position":{"x":11,"y":-9},"is_angle_degrees":142.3352872600212},
      {"position":{"x":5,"y":-4},"is_angle_degrees":143.25247528779465},
      {"position":{"x":9,"y":-7},"is_angle_degrees":144.16100979967499},
      {"position":{"x":4,"y":-3},"is_angle_degrees":145.40785804775277},
      {"position":{"x":11,"y":-8},"is_angle_degrees":146.47544354281516},
      {"position":{"x":7,"y":-5},"is_angle_degrees":147.01092029668501},
      {"position":{"x":10,"y":-7},"is_angle_degrees":147.65520219378615},
      {"position":{"x":3,"y":-2},"is_angle_degrees":149.26822804231767},
      {"position":{"x":11,"y":-7},"is_angle_degrees":150.48868012719316},
      {"position":{"x":8,"y":-5},"is_angle_degrees":151.00036084569894},
      {"position":{"x":5,"y":-3},"is_angle_degrees":152.24845211760558},
      {"position":{"x":12,"y":-7},"is_angle_degrees":152.97541303648887},
      {"position":{"x":7,"y":-4},"is_angle_degrees":153.458939945989},
      {"position":{"x":9,"y":-5},"is_angle_degrees":154.20847343142924},
      {"position":{"x":11,"y":-6},"is_angle_degrees":154.70421144473107},
      {"position":{"x":2,"y":-1},"is_angle_degrees":156.55502660720623},
      {"position":{"x":11,"y":-5},"is_angle_degrees":158.75396011844768},
      {"position":{"x":9,"y":-4},"is_angle_degrees":159.28481785013784},
      {"position":{"x":7,"y":-3},"is_angle_degrees":159.99190429768746},
      {"position":{"x":12,"y":-5},"is_angle_degrees":160.45276921846283},
      {"position":{"x":5,"y":-2},"is_angle_degrees":161.2929086467587},
      {"position":{"x":8,"y":-3},"is_angle_degrees":162.31872501834616},
      {"position":{"x":11,"y":-4},"is_angle_degrees":162.81713183761596},
      {"position":{"x":3,"y":-1},"is_angle_degrees":164.2574784459141},
      {"position":{"x":10,"y":-3},"is_angle_degrees":165.8155137836355},
      {"position":{"x":7,"y":-2},"is_angle_degrees":166.36643701873837},
      {"position":{"x":11,"y":-3},"is_angle_degrees":166.8747564437971},
      {"position":{"x":4,"y":-1},"is_angle_degrees":167.93049314143926},
      {"position":{"x":9,"y":-2},"is_angle_degrees":169.15831502652247},
      {"position":{"x":5,"y":-1},"is_angle_degrees":170.22226664792078},
      {"position":{"x":11,"y":-2},"is_angle_degrees":171.06454982212455},
      {"position":{"x":6,"y":-1},"is_angle_degrees":171.81029569285383},
      {"position":{"x":7,"y":-1},"is_angle_degrees":172.8500710947027},
      {"position":{"x":8,"y":-1},"is_angle_degrees":173.60728405607892},
      {"position":{"x":9,"y":-1},"is_angle_degrees":174.2611621429813},
      {"position":{"x":10,"y":-1},"is_angle_degrees":174.82127554041864},
      {"position":{"x":11,"y":-1},"is_angle_degrees":175.10132248621204},
      {"position":{"x":12,"y":-1},"is_angle_degrees":175.49659786188298},
      {"position":{"x":1,"y":0},"is_angle_degrees":179.20675151379632},
      {"position":{"x":12,"y":1},"is_angle_degrees":183.10305246752802},
      {"position":{"x":11,"y":1},"is_angle_degrees":183.26363187574975},
      {"position":{"x":10,"y":1},"is_angle_degrees":183.90883286354952},
      {"position":{"x":9,"y":1},"is_angle_degrees":184.3521208347935},
      {"position":{"x":8,"y":1},"is_angle_degrees":184.91328574013536},
      {"position":{"x":7,"y":1},"is_angle_degrees":185.76357987864432},
      {"position":{"x":6,"y":1},"is_angle_degrees":186.8311077070858},
      {"position":{"x":11,"y":2},"is_angle_degrees":187.44461022475997},
      {"position":{"x":5,"y":1},"is_angle_degrees":188.19537935144268},
      {"position":{"x":9,"y":2},"is_angle_degrees":189.26895903710343},
      {"position":{"x":4,"y":1},"is_angle_degrees":190.54366276033423},
      {"position":{"x":11,"y":3},"is_angle_degrees":191.51136686958833},
      {"position":{"x":7,"y":2},"is_angle_degrees":192.04524395025197},
      {"position":{"x":10,"y":3},"is_angle_degrees":192.78733311029467},
      {"position":{"x":3,"y":1},"is_angle_degrees":194.34385420447308},
      {"position":{"x":11,"y":4},"is_angle_degrees":195.62013928057414},
      {"position":{"x":8,"y":3},"is_angle_degrees":196.13828635389973},
      {"position":{"x":5,"y":2},"is_angle_degrees":197.3670298545029},
      {"position":{"x":12,"y":5},"is_angle_degrees":198.07404185801448},
      {"position":{"x":7,"y":3},"is_angle_degrees":198.5900911173402},
      {"position":{"x":9,"y":4},"is_angle_degrees":199.2755732837458},
      {"position":{"x":11,"y":5},"is_angle_degrees":199.8260930315718},
      {"position":{"x":2,"y":1},"is_angle_degrees":201.59557021417294},
      {"position":{"x":11,"y":6},"is_angle_degrees":203.84816836180477},
      {"position":{"x":9,"y":5},"is_angle_degrees":204.20591563301224},
      {"position":{"x":7,"y":4},"is_angle_degrees":204.93755653316754},
      {"position":{"x":12,"y":7},"is_angle_degrees":205.46859551977906},
      {"position":{"x":5,"y":3},"is_angle_degrees":206.3789823158821},
      {"position":{"x":8,"y":5},"is_angle_degrees":207.3963631255689},
      {"position":{"x":11,"y":7},"is_angle_degrees":207.92611611010136},
      {"position":{"x":3,"y":2},"is_angle_degrees":209.36160502431807},
      {"position":{"x":10,"y":7},"is_angle_degrees":210.81957838745168},
      {"position":{"x":7,"y":5},"is_angle_degrees":211.44873487249106},
      {"position":{"x":11,"y":8},"is_angle_degrees":211.99712834171913},
      {"position":{"x":4,"y":3},"is_angle_degrees":213.02526737209786},
      {"position":{"x":9,"y":7},"is_angle_degrees":214.23839346393686},
      {"position":{"x":5,"y":4},"is_angle_degrees":215.35655626027534},
      {"position":{"x":11,"y":9},"is_angle_degrees":216.21543401995086},
      {"position":{"x":6,"y":5},"is_angle_degrees":216.70369143136057},
      {"position":{"x":7,"y":6},"is_angle_degrees":217.97197439928817},
      {"position":{"x":8,"y":7},"is_angle_degrees":218.67389157693515},
      {"position":{"x":9,"y":8},"is_angle_degrees":219.34750695055968},
      {"position":{"x":10,"y":9},"is_angle_degrees":219.88297597534208},
      {"position":{"x":11,"y":10},"is_angle_degrees":220.28018859262582},
      {"position":{"x":12,"y":11},"is_angle_degrees":220.6161996505138},
      {"position":{"y":1,"x":1},"is_angle_degrees":224.2761363492797},
      {"position":{"x":11,"y":12},"is_angle_degrees":227.9981810987906},
      {"position":{"x":10,"y":11},"is_angle_degrees":228.28502260199278},
      {"position":{"x":9,"y":10},"is_angle_degrees":228.90613505786305},
      {"position":{"x":8,"y":9},"is_angle_degrees":229.47506998193222},
      {"position":{"x":7,"y":8},"is_angle_degrees":229.88511803569324},
      {"position":{"x":6,"y":7},"is_angle_degrees":230.79898379575644},
      {"position":{"x":5,"y":6},"is_angle_degrees":231.82912665738698},
      {"position":{"x":9,"y":11},"is_angle_degrees":232.5310718265193},
      {"position":{"x":4,"y":5},"is_angle_degrees":233.25091040920304},
      {"position":{"x":7,"y":9},"is_angle_degrees":234.34880493285945},
      {"position":{"x":3,"y":4},"is_angle_degrees":235.59431734253792},
      {"position":{"x":8,"y":11},"is_angle_degrees":236.65852899134836},
      {"position":{"x":5,"y":7},"is_angle_degrees":237.1906454547702},
      {"position":{"x":7,"y":10},"is_angle_degrees":237.8320892484853},
      {"position":{"x":2,"y":3},"is_angle_degrees":239.25077524207452},
      {"position":{"x":7,"y":11},"is_angle_degrees":240.65392637300505},
      {"position":{"x":5,"y":8},"is_angle_degrees":241.16692011176988},
      {"position":{"x":3,"y":5},"is_angle_degrees":242.2246506935345},
      {"position":{"x":7,"y":12},"is_angle_degrees":243.1325300575197},
      {"position":{"x":4,"y":7},"is_angle_degrees":243.6155637127133},
      {"position":{"x":5,"y":9},"is_angle_degrees":244.3616201815049},
      {"position":{"x":6,"y":11},"is_angle_degrees":244.68541755616255},
      {"position":{"x":1,"y":2},"is_angle_degrees":246.69571177201982},
      {"position":{"x":5,"y":11},"is_angle_degrees":248.8902005162235},
      {"position":{"x":4,"y":9},"is_angle_degrees":249.24465013850036},
      {"position":{"x":3,"y":7},"is_angle_degrees":249.94353419620313},
      {"position":{"x":5,"y":12},"is_angle_degrees":250.40609742432707},
      {"position":{"x":2,"y":5},"is_angle_degrees":251.41820199466014},
      {"position":{"x":3,"y":8},"is_angle_degrees":252.4417926905862},
      {"position":{"x":4,"y":11},"is_angle_degrees":252.93739382924534},
      {"position":{"x":1,"y":3},"is_angle_degrees":254.37264356365733},
      {"position":{"x":3,"y":10},"is_angle_degrees":255.71909474148586},
      {"position":{"x":2,"y":7},"is_angle_degrees":256.4721339882767},
      {"position":{"x":3,"y":11},"is_angle_degrees":256.9777161775668},
      {"position":{"x":1,"y":4},"is_angle_degrees":258.0262872881526},
      {"position":{"x":2,"y":9},"is_angle_degrees":259.2483022967466},
      {"position":{"x":1,"y":5},"is_angle_degrees":260.30407438366234},
      {"position":{"x":2,"y":11},"is_angle_degrees":261.01685957262094},
      {"position":{"x":1,"y":6},"is_angle_degrees":261.72084255018524},
      {"position":{"x":1,"y":7},"is_angle_degrees":262.76349527126445},
      {"position":{"x":1,"y":8},"is_angle_degrees":263.67470397729795},
      {"position":{"x":1,"y":9},"is_angle_degrees":264.32636217018546},
      {"position":{"x":1,"y":10},"is_angle_degrees":264.72414730106465},
      {"position":{"x":1,"y":11},"is_angle_degrees":265.16162805417065},
      {"position":{"x":1,"y":12},"is_angle_degrees":265.5593722217778},
      {"position":{"x":0,"y":1},"is_angle_degrees":269.24709193658146},
      {"position":{"x":-1,"y":12},"is_angle_degrees":272.9485817574645},
      {"position":{"x":-1,"y":11},"is_angle_degrees":273.28989285183957},
      {"position":{"x":-1,"y":10},"is_angle_degrees":273.9257301095206},
      {"position":{"x":-1,"y":9},"is_angle_degrees":274.19718354714973},
      {"position":{"x":-1,"y":8},"is_angle_degrees":274.93002741237086},
      {"position":{"x":-1,"y":7},"is_angle_degrees":275.77591836398847},
      {"position":{"x":-1,"y":6},"is_angle_degrees":276.8385896107829},
      {"position":{"x":-2,"y":11},"is_angle_degrees":277.4453285458801},
      {"position":{"x":-1,"y":5},"is_angle_degrees":278.19476579306587},
      {"position":{"x":-2,"y":9},"is_angle_degrees":279.2646929443237},
      {"position":{"x":-1,"y":4},"is_angle_degrees":280.53352196613906},
      {"position":{"x":-3,"y":11},"is_angle_degrees":281.4974057443887},
      {"position":{"x":-2,"y":7},"is_angle_degrees":282.0291907034558},
      {"position":{"x":-3,"y":10},"is_angle_degrees":282.7674057785431},
      {"position":{"x":-1,"y":3},"is_angle_degrees":284.1293842757117},
      {"position":{"x":-4,"y":11},"is_angle_degrees":285.5864898782052},
      {"position":{"x":-3,"y":8},"is_angle_degrees":286.1010845481538},
      {"position":{"x":-2,"y":5},"is_angle_degrees":287.15180613177796},
      {"position":{"x":-5,"y":12},"is_angle_degrees":288.0260365268746},
      {"position":{"x":-3,"y":7},"is_angle_degrees":288.5399614741964},
      {"position":{"x":-4,"y":9},"is_angle_degrees":289.2231905130873},
      {"position":{"x":-5,"y":11},"is_angle_degrees":289.58496442812566},
      {"position":{"x":-1,"y":2},"is_angle_degrees":291.53321858960874},
      {"position":{"x":-6,"y":11},"is_angle_degrees":293.7734600871011},
      {"position":{"x":-5,"y":9},"is_angle_degrees":294.13058605821203},
      {"position":{"x":-4,"y":7},"is_angle_degrees":294.8572286838624},
      {"position":{"x":-7,"y":12},"is_angle_degrees":295.38640366629426},
      {"position":{"x":-3,"y":5},"is_angle_degrees":296.29094480241855},
      {"position":{"x":-5,"y":8},"is_angle_degrees":297.30338475978544},
      {"position":{"x":-7,"y":11},"is_angle_degrees":297.83086785503764},
      {"position":{"x":-2,"y":3},"is_angle_degrees":299.25875843344676},
      {"position":{"x":-7,"y":10},"is_angle_degrees":300.70822090047653},
      {"position":{"x":-5,"y":7},"is_angle_degrees":301.3351766343129},
      {"position":{"x":-8,"y":11},"is_angle_degrees":301.8829893391926},
      {"position":{"x":-3,"y":4},"is_angle_degrees":302.9057200490316},
      {"position":{"x":-7,"y":9},"is_angle_degrees":304.1140538678847},
      {"position":{"x":-4,"y":5},"is_angle_degrees":305.2250892257076},
      {"position":{"x":-9,"y":11},"is_angle_degrees":305.8858906026797},
      {"position":{"x":-5,"y":6},"is_angle_degrees":306.5649581500107},
      {"position":{"x":-6,"y":7},"is_angle_degrees":307.6413679456475},
      {"position":{"x":-7,"y":8},"is_angle_degrees":308.529483375694},
      {"position":{"x":-8,"y":9},"is_angle_degrees":309.0352708146332},
      {"position":{"x":-9,"y":10},"is_angle_degrees":309.5860912983777},
      {"position":{"x":-10,"y":11},"is_angle_degrees":310.12480051048664},
      {"position":{"x":-11,"y":12},"is_angle_degrees":310.46277515931104},
      {"position":{"x":-1,"y":1},"is_angle_degrees":314.1064809294209},
      {"position":{"x":-12,"y":11},"is_angle_degrees":317.8143395470494},
      {"position":{"x":-11,"y":10},"is_angle_degrees":318.09893619876476},
      {"position":{"x":-10,"y":9},"is_angle_degrees":318.5596647418292},
      {"position":{"x":-9,"y":8},"is_angle_degrees":318.9479078750241},
      {"position":{"x":-8,"y":7},"is_angle_degrees":319.69281369798006},
      {"position":{"x":-7,"y":6},"is_angle_degrees":320.42579315406186},
      {"position":{"x":-6,"y":5},"is_angle_degrees":321.6259626808339},
      {"position":{"x":-11,"y":9},"is_angle_degrees":322.16553898630025},
      {"position":{"x":-5,"y":4},"is_angle_degrees":323.0452089397163},
      {"position":{"x":-9,"y":7},"is_angle_degrees":324.13977560516594},
      {"position":{"x":-4,"y":3},"is_angle_degrees":325.3785952140576},
      {"position":{"x":-11,"y":8},"is_angle_degrees":326.4383888325593},
      {"position":{"x":-7,"y":5},"is_angle_degrees":326.97210076240987},
      {"position":{"x":-10,"y":7},"is_angle_degrees":327.60954475935387},
      {"position":{"x":-3,"y":2},"is_angle_degrees":329.0277772496425},
      {"position":{"x":-11,"y":7},"is_angle_degrees":330.4261087634404},
      {"position":{"x":-8,"y":5},"is_angle_degrees":330.9321342365703},
      {"position":{"x":-5,"y":3},"is_angle_degrees":331.98692046491027},
      {"position":{"x":-12,"y":7},"is_angle_degrees":332.8948908731558},
      {"position":{"x":-7,"y":4},"is_angle_degrees":333.3743835072426},
      {"position":{"x":-9,"y":5},"is_angle_degrees":334.11894768857684},
      {"position":{"x":-11,"y":6},"is_angle_degrees":334.4433979408984},
      {"position":{"x":-2,"y":1},"is_angle_degrees":336.4544377974578},
      {"position":{"x":-11,"y":5},"is_angle_degrees":338.46342902715094},
      {"position":{"x":-9,"y":4},"is_angle_degrees":338.9876529004387},
      {"position":{"x":-7,"y":3},"is_angle_degrees":339.6810593257936},
      {"position":{"x":-12,"y":5},"is_angle_degrees":340.1414772279046},
      {"position":{"x":-5,"y":2},"is_angle_degrees":341.02905235015834},
      {"position":{"x":-8,"y":3},"is_angle_degrees":342.1718379748514},
      {"position":{"x":-11,"y":4},"is_angle_degrees":342.66980226925455},
      {"position":{"x":-3,"y":1},"is_angle_degrees":343.93066098284254},
      {"position":{"x":-10,"y":3},"is_angle_degrees":345.4517680764103},
      {"position":{"x":-7,"y":2},"is_angle_degrees":346.19830488089616},
      {"position":{"x":-11,"y":3},"is_angle_degrees":346.7047826751946},
      {"position":{"x":-4,"y":1},"is_angle_degrees":347.7540790500869},
      {"position":{"x":-9,"y":2},"is_angle_degrees":348.96890782837244},
      {"position":{"x":-5,"y":1},"is_angle_degrees":350.0282933793908},
      {"position":{"x":-11,"y":2},"is_angle_degrees":350.7302885953613},
      {"position":{"x":-6,"y":1},"is_angle_degrees":351.44750540034744},
      {"position":{"x":-7,"y":1},"is_angle_degrees":352.4844196614906},
      {"position":{"x":-8,"y":1},"is_angle_degrees":353.39556934159475},
      {"position":{"x":-9,"y":1},"is_angle_degrees":353.88067946592986},
      {"position":{"x":-10,"y":1},"is_angle_degrees":354.4485187873784},
      {"position":{"x":-11,"y":1},"is_angle_degrees":354.88396178103494},
      {"position":{"x":-12,"y":1},"is_angle_degrees":355.1796870586841}
    ]),
    "msaa": AngularKeyframeFunction.fromCalibrationSamples([
      {"position":{"x":-1,"y":0},"is_angle_degrees":358.8967520409248},
      {"position":{"x":-12,"y":-1},"is_angle_degrees":2.591332317545632},
      {"position":{"x":-11,"y":-1},"is_angle_degrees":2.899199030998234},
      {"position":{"x":-10,"y":-1},"is_angle_degrees":3.3027910217341945},
      {"position":{"x":-9,"y":-1},"is_angle_degrees":3.7569228037770737},
      {"position":{"x":-8,"y":-1},"is_angle_degrees":4.507186719624604},
      {"position":{"x":-7,"y":-1},"is_angle_degrees":5.22019256437474},
      {"position":{"x":-6,"y":-1},"is_angle_degrees":6.260940776960469},
      {"position":{"x":-11,"y":-2},"is_angle_degrees":6.998783944605685},
      {"position":{"x":-5,"y":-1},"is_angle_degrees":7.865391398658294},
      {"position":{"x":-9,"y":-2},"is_angle_degrees":8.894939418228827},
      {"position":{"x":-4,"y":-1},"is_angle_degrees":10.157441825373601},
      {"position":{"x":-11,"y":-3},"is_angle_degrees":11.211672861429957},
      {"position":{"x":-7,"y":-2},"is_angle_degrees":11.763469485752193},
      {"position":{"x":-10,"y":-3},"is_angle_degrees":12.25121541752335},
      {"position":{"x":-3,"y":-1},"is_angle_degrees":13.84663041827886},
      {"position":{"x":-11,"y":-4},"is_angle_degrees":15.235905226259181},
      {"position":{"x":-8,"y":-3},"is_angle_degrees":15.782945684262547},
      {"position":{"x":-5,"y":-2},"is_angle_degrees":16.80547224803966},
      {"position":{"x":-12,"y":-5},"is_angle_degrees":17.513105499040563},
      {"position":{"x":-7,"y":-3},"is_angle_degrees":18.038648958653397},
      {"position":{"x":-9,"y":-4},"is_angle_degrees":18.756057585244584},
      {"position":{"x":-11,"y":-5},"is_angle_degrees":19.309952638404173},
      {"position":{"x":-2,"y":-1},"is_angle_degrees":21.425370190203342},
      {"position":{"x":-11,"y":-6},"is_angle_degrees":23.320209697991846},
      {"position":{"x":-9,"y":-5},"is_angle_degrees":23.854053473089127},
      {"position":{"x":-7,"y":-4},"is_angle_degrees":24.581119064758482},
      {"position":{"x":-12,"y":-7},"is_angle_degrees":25.106869645534356},
      {"position":{"x":-5,"y":-3},"is_angle_degrees":25.695204098111653},
      {"position":{"x":-8,"y":-5},"is_angle_degrees":26.99846953088355},
      {"position":{"x":-11,"y":-7},"is_angle_degrees":27.526984077208258},
      {"position":{"x":-3,"y":-2},"is_angle_degrees":28.779850318412944},
      {"position":{"x":-10,"y":-7},"is_angle_degrees":30.329312413448196},
      {"position":{"x":-7,"y":-5},"is_angle_degrees":31.043685268303882},
      {"position":{"x":-11,"y":-8},"is_angle_degrees":31.583341736695928},
      {"position":{"x":-4,"y":-3},"is_angle_degrees":32.63607595539084},
      {"position":{"x":-9,"y":-7},"is_angle_degrees":33.8233442971928},
      {"position":{"x":-5,"y":-4},"is_angle_degrees":34.754584048064096},
      {"position":{"x":-11,"y":-9},"is_angle_degrees":35.66556782680724},
      {"position":{"x":-6,"y":-5},"is_angle_degrees":36.35975366496272},
      {"position":{"x":-7,"y":-6},"is_angle_degrees":37.35422421288253},
      {"position":{"x":-8,"y":-7},"is_angle_degrees":38.247427794143455},
      {"position":{"x":-9,"y":-8},"is_angle_degrees":38.81229315352396},
      {"position":{"x":-10,"y":-9},"is_angle_degrees":39.30853489599356},
      {"position":{"x":-11,"y":-10},"is_angle_degrees":39.698550693631226},
      {"position":{"x":-12,"y":-11},"is_angle_degrees":39.992315723406975},
      {"position":{"y":-1,"x":-1},"is_angle_degrees":43.93658719459389},
      {"position":{"x":-11,"y":-12},"is_angle_degrees":47.62527989151435},
      {"position":{"x":-10,"y":-11},"is_angle_degrees":48.034312114877316},
      {"position":{"x":-9,"y":-10},"is_angle_degrees":48.26720073000818},
      {"position":{"x":-8,"y":-9},"is_angle_degrees":48.86152558857321},
      {"position":{"x":-7,"y":-8},"is_angle_degrees":49.60054321381496},
      {"position":{"x":-6,"y":-7},"is_angle_degrees":50.269789574263946},
      {"position":{"x":-5,"y":-6},"is_angle_degrees":51.35214369439912},
      {"position":{"x":-9,"y":-11},"is_angle_degrees":52.061953603999044},
      {"position":{"x":-4,"y":-5},"is_angle_degrees":52.84938627109907},
      {"position":{"x":-7,"y":-9},"is_angle_degrees":53.94249668897837},
      {"position":{"x":-3,"y":-4},"is_angle_degrees":55.18367232486804},
      {"position":{"x":-8,"y":-11},"is_angle_degrees":55.958793051877514},
      {"position":{"x":-5,"y":-7},"is_angle_degrees":56.66609224144232},
      {"position":{"x":-7,"y":-10},"is_angle_degrees":57.24839519034971},
      {"position":{"x":-2,"y":-3},"is_angle_degrees":58.84415908466447},
      {"position":{"x":-7,"y":-11},"is_angle_degrees":60.27092203605553},
      {"position":{"x":-5,"y":-8},"is_angle_degrees":60.798344798797544},
      {"position":{"x":-3,"y":-5},"is_angle_degrees":61.8271341001371},
      {"position":{"x":-7,"y":-12},"is_angle_degrees":62.5572381506578},
      {"position":{"x":-4,"y":-7},"is_angle_degrees":63.07771134242024},
      {"position":{"x":-5,"y":-9},"is_angle_degrees":63.764714839893344},
      {"position":{"x":-6,"y":-11},"is_angle_degrees":64.2871929297977},
      {"position":{"x":-1,"y":-2},"is_angle_degrees":66.4761991039282},
      {"position":{"x":-5,"y":-11},"is_angle_degrees":68.34112418131713},
      {"position":{"x":-4,"y":-9},"is_angle_degrees":68.86652780247016},
      {"position":{"x":-3,"y":-7},"is_angle_degrees":69.57439017293358},
      {"position":{"x":-5,"y":-12},"is_angle_degrees":70.14394883358433},
      {"position":{"x":-2,"y":-5},"is_angle_degrees":70.75476991309486},
      {"position":{"x":-3,"y":-8},"is_angle_degrees":72.0297538128151},
      {"position":{"x":-4,"y":-11},"is_angle_degrees":72.39578332879678},
      {"position":{"x":-1,"y":-3},"is_angle_degrees":73.81538492433555},
      {"position":{"x":-3,"y":-10},"is_angle_degrees":75.40883886227626},
      {"position":{"x":-2,"y":-7},"is_angle_degrees":75.9126640423916},
      {"position":{"x":-3,"y":-11},"is_angle_degrees":76.59732721459359},
      {"position":{"x":-1,"y":-4},"is_angle_degrees":77.63605321351721},
      {"position":{"x":-2,"y":-9},"is_angle_degrees":78.86293248737695},
      {"position":{"x":-1,"y":-5},"is_angle_degrees":79.7986804934156},
      {"position":{"x":-2,"y":-11},"is_angle_degrees":80.66593408903243},
      {"position":{"x":-1,"y":-6},"is_angle_degrees":81.36650064267744},
      {"position":{"x":-1,"y":-7},"is_angle_degrees":82.43287639829296},
      {"position":{"x":-1,"y":-8},"is_angle_degrees":83.29038440237088},
      {"position":{"x":-1,"y":-9},"is_angle_degrees":83.82674286465866},
      {"position":{"x":-1,"y":-10},"is_angle_degrees":84.31897044780835},
      {"position":{"x":-1,"y":-11},"is_angle_degrees":84.682028094125},
      {"position":{"x":-1,"y":-12},"is_angle_degrees":85.12644390784976},
      {"position":{"x":0,"y":-1},"is_angle_degrees":88.73491086894897},
      {"position":{"x":1,"y":-12},"is_angle_degrees":92.73939230084645},
      {"position":{"x":1,"y":-11},"is_angle_degrees":93.18907377770044},
      {"position":{"x":1,"y":-10},"is_angle_degrees":93.4956489181956},
      {"position":{"x":1,"y":-9},"is_angle_degrees":93.9314242288695},
      {"position":{"x":1,"y":-8},"is_angle_degrees":94.517088773063},
      {"position":{"x":1,"y":-7},"is_angle_degrees":95.40123902844564},
      {"position":{"x":1,"y":-6},"is_angle_degrees":96.43811014390428},
      {"position":{"x":2,"y":-11},"is_angle_degrees":97.20013920589216},
      {"position":{"x":1,"y":-5},"is_angle_degrees":98.07075510356755},
      {"position":{"x":2,"y":-9},"is_angle_degrees":98.9270351323033},
      {"position":{"x":1,"y":-4},"is_angle_degrees":100.1913617684011},
      {"position":{"x":3,"y":-11},"is_angle_degrees":101.25032429042467},
      {"position":{"x":2,"y":-7},"is_angle_degrees":101.9483615945883},
      {"position":{"x":3,"y":-10},"is_angle_degrees":102.4805826982213},
      {"position":{"x":1,"y":-3},"is_angle_degrees":104.06938372440761},
      {"position":{"x":4,"y":-11},"is_angle_degrees":105.45733151831253},
      {"position":{"x":3,"y":-8},"is_angle_degrees":105.84244493262267},
      {"position":{"x":2,"y":-5},"is_angle_degrees":107.04230952126227},
      {"position":{"x":5,"y":-12},"is_angle_degrees":107.75773817927526},
      {"position":{"x":3,"y":-7},"is_angle_degrees":108.31614739656303},
      {"position":{"x":4,"y":-9},"is_angle_degrees":109.02265711844053},
      {"position":{"x":5,"y":-11},"is_angle_degrees":109.5212863922167},
      {"position":{"x":1,"y":-2},"is_angle_degrees":111.50832102180311},
      {"position":{"x":6,"y":-11},"is_angle_degrees":113.58176054431821},
      {"position":{"x":5,"y":-9},"is_angle_degrees":114.12035950711444},
      {"position":{"x":4,"y":-7},"is_angle_degrees":114.84577325760073},
      {"position":{"x":7,"y":-12},"is_angle_degrees":115.39243767299807},
      {"position":{"x":3,"y":-5},"is_angle_degrees":116.01620815672818},
      {"position":{"x":5,"y":-8},"is_angle_degrees":117.1023688900224},
      {"position":{"x":7,"y":-11},"is_angle_degrees":117.63374298681289},
      {"position":{"x":2,"y":-3},"is_angle_degrees":119.06935121504254},
      {"position":{"x":7,"y":-10},"is_angle_degrees":120.67302218994995},
      {"position":{"x":5,"y":-7},"is_angle_degrees":121.16384170118934},
      {"position":{"x":8,"y":-11},"is_angle_degrees":121.87318179583583},
      {"position":{"x":3,"y":-4},"is_angle_degrees":122.76212877182628},
      {"position":{"x":7,"y":-9},"is_angle_degrees":123.9540013437959},
      {"position":{"x":4,"y":-5},"is_angle_degrees":125.04203535556826},
      {"position":{"x":9,"y":-11},"is_angle_degrees":125.9540096427328},
      {"position":{"x":5,"y":-6},"is_angle_degrees":126.66997240502319},
      {"position":{"x":6,"y":-7},"is_angle_degrees":127.7012323351388},
      {"position":{"x":7,"y":-8},"is_angle_degrees":128.39923915165352},
      {"position":{"x":8,"y":-9},"is_angle_degrees":129.12059594547486},
      {"position":{"x":9,"y":-10},"is_angle_degrees":129.6314425900806},
      {"position":{"x":10,"y":-11},"is_angle_degrees":130.0499534939311},
      {"position":{"x":11,"y":-12},"is_angle_degrees":130.37407302966673},
      {"position":{"x":1,"y":-1},"is_angle_degrees":134.10290230661028},
      {"position":{"x":12,"y":-11},"is_angle_degrees":137.9452634277638},
      {"position":{"x":11,"y":-10},"is_angle_degrees":138.38005470389197},
      {"position":{"x":10,"y":-9},"is_angle_degrees":138.6107724487288},
      {"position":{"x":9,"y":-8},"is_angle_degrees":139.1744316508328},
      {"position":{"x":8,"y":-7},"is_angle_degrees":139.78886990900975},
      {"position":{"x":7,"y":-6},"is_angle_degrees":140.64588234453834},
      {"position":{"x":6,"y":-5},"is_angle_degrees":141.738669925974},
      {"position":{"x":11,"y":-9},"is_angle_degrees":142.34891014038726},
      {"position":{"x":5,"y":-4},"is_angle_degrees":143.2245790723287},
      {"position":{"x":9,"y":-7},"is_angle_degrees":144.14800654809005},
      {"position":{"x":4,"y":-3},"is_angle_degrees":145.39238728989557},
      {"position":{"x":11,"y":-8},"is_angle_degrees":146.36085003270242},
      {"position":{"x":7,"y":-5},"is_angle_degrees":146.87619785167928},
      {"position":{"x":10,"y":-7},"is_angle_degrees":147.62537850535554},
      {"position":{"x":3,"y":-2},"is_angle_degrees":149.25184375770183},
      {"position":{"x":11,"y":-7},"is_angle_degrees":150.49191512394916},
      {"position":{"x":8,"y":-5},"is_angle_degrees":151.0215345193759},
      {"position":{"x":5,"y":-3},"is_angle_degrees":152.2297441972992},
      {"position":{"x":12,"y":-7},"is_angle_degrees":152.94963929042055},
      {"position":{"x":7,"y":-4},"is_angle_degrees":153.48940533584212},
      {"position":{"x":9,"y":-5},"is_angle_degrees":154.1523739734932},
      {"position":{"x":11,"y":-6},"is_angle_degrees":154.70439405116397},
      {"position":{"x":2,"y":-1},"is_angle_degrees":156.71634341257067},
      {"position":{"x":11,"y":-5},"is_angle_degrees":158.7581099391528},
      {"position":{"x":9,"y":-4},"is_angle_degrees":159.2679225365154},
      {"position":{"x":7,"y":-3},"is_angle_degrees":159.9913020945242},
      {"position":{"x":12,"y":-5},"is_angle_degrees":160.57989686165172},
      {"position":{"x":5,"y":-2},"is_angle_degrees":161.1568927510187},
      {"position":{"x":8,"y":-3},"is_angle_degrees":162.27515461384746},
      {"position":{"x":11,"y":-4},"is_angle_degrees":162.8161004544172},
      {"position":{"x":3,"y":-1},"is_angle_degrees":164.24658598283887},
      {"position":{"x":10,"y":-3},"is_angle_degrees":165.76163915439042},
      {"position":{"x":7,"y":-2},"is_angle_degrees":166.31857327436816},
      {"position":{"x":11,"y":-3},"is_angle_degrees":166.85189711996634},
      {"position":{"x":4,"y":-1},"is_angle_degrees":167.89649385247628},
      {"position":{"x":9,"y":-2},"is_angle_degrees":169.11790592496854},
      {"position":{"x":5,"y":-1},"is_angle_degrees":170.16259981771205},
      {"position":{"x":11,"y":-2},"is_angle_degrees":171.0933684499066},
      {"position":{"x":6,"y":-1},"is_angle_degrees":171.77464286765573},
      {"position":{"x":7,"y":-1},"is_angle_degrees":172.87965595642922},
      {"position":{"x":8,"y":-1},"is_angle_degrees":173.5491959880133},
      {"position":{"x":9,"y":-1},"is_angle_degrees":174.26676451286153},
      {"position":{"x":10,"y":-1},"is_angle_degrees":174.74291804683986},
      {"position":{"x":11,"y":-1},"is_angle_degrees":175.09023806184373},
      {"position":{"x":12,"y":-1},"is_angle_degrees":175.49803116255504},
      {"position":{"x":1,"y":0},"is_angle_degrees":179.13856376622869},
      {"position":{"x":12,"y":1},"is_angle_degrees":182.9984977203518},
      {"position":{"x":11,"y":1},"is_angle_degrees":183.16035169205986},
      {"position":{"x":10,"y":1},"is_angle_degrees":183.75775167549753},
      {"position":{"x":9,"y":1},"is_angle_degrees":184.18396218380158},
      {"position":{"x":8,"y":1},"is_angle_degrees":184.7822860508111},
      {"position":{"x":7,"y":1},"is_angle_degrees":185.66328686154193},
      {"position":{"x":6,"y":1},"is_angle_degrees":186.70154295959617},
      {"position":{"x":11,"y":2},"is_angle_degrees":187.45525945685915},
      {"position":{"x":5,"y":1},"is_angle_degrees":188.14654806092986},
      {"position":{"x":9,"y":2},"is_angle_degrees":189.19112248030098},
      {"position":{"x":4,"y":1},"is_angle_degrees":190.45533345798538},
      {"position":{"x":11,"y":3},"is_angle_degrees":191.51296262982524},
      {"position":{"x":7,"y":2},"is_angle_degrees":192.0683236956544},
      {"position":{"x":10,"y":3},"is_angle_degrees":192.74307332917996},
      {"position":{"x":3,"y":1},"is_angle_degrees":194.33126016805255},
      {"position":{"x":11,"y":4},"is_angle_degrees":195.55228308128355},
      {"position":{"x":8,"y":3},"is_angle_degrees":196.10040584138213},
      {"position":{"x":5,"y":2},"is_angle_degrees":197.2963962887222},
      {"position":{"x":12,"y":5},"is_angle_degrees":198.00755938412377},
      {"position":{"x":7,"y":3},"is_angle_degrees":198.56814435223558},
      {"position":{"x":9,"y":4},"is_angle_degrees":199.28042349665475},
      {"position":{"x":11,"y":5},"is_angle_degrees":199.77547755661016},
      {"position":{"x":2,"y":1},"is_angle_degrees":201.761375887434},
      {"position":{"x":11,"y":6},"is_angle_degrees":203.82860163673246},
      {"position":{"x":9,"y":5},"is_angle_degrees":204.19334840874365},
      {"position":{"x":7,"y":4},"is_angle_degrees":204.92410847707674},
      {"position":{"x":12,"y":7},"is_angle_degrees":205.44850040595313},
      {"position":{"x":5,"y":3},"is_angle_degrees":206.2606088845934},
      {"position":{"x":8,"y":5},"is_angle_degrees":207.34584052960884},
      {"position":{"x":11,"y":7},"is_angle_degrees":207.87816354469788},
      {"position":{"x":3,"y":2},"is_angle_degrees":209.31676671450884},
      {"position":{"x":10,"y":7},"is_angle_degrees":210.6814314501053},
      {"position":{"x":7,"y":5},"is_angle_degrees":211.40218604611255},
      {"position":{"x":11,"y":8},"is_angle_degrees":211.9420018182248},
      {"position":{"x":4,"y":3},"is_angle_degrees":212.99738648394447},
      {"position":{"x":9,"y":7},"is_angle_degrees":214.18720315926535},
      {"position":{"x":5,"y":4},"is_angle_degrees":215.2708837389539},
      {"position":{"x":11,"y":9},"is_angle_degrees":216.18686045206837},
      {"position":{"x":6,"y":5},"is_angle_degrees":216.72406957543623},
      {"position":{"x":7,"y":6},"is_angle_degrees":217.92937404632818},
      {"position":{"x":8,"y":7},"is_angle_degrees":218.6285196799818},
      {"position":{"x":9,"y":8},"is_angle_degrees":219.34520847657805},
      {"position":{"x":10,"y":9},"is_angle_degrees":219.86096889990324},
      {"position":{"x":11,"y":10},"is_angle_degrees":220.27391365974643},
      {"position":{"x":12,"y":11},"is_angle_degrees":220.60041275529616},
      {"position":{"y":1,"x":1},"is_angle_degrees":224.31740020862097},
      {"position":{"x":11,"y":12},"is_angle_degrees":228.01572649403474},
      {"position":{"x":10,"y":11},"is_angle_degrees":228.42547710802882},
      {"position":{"x":9,"y":10},"is_angle_degrees":228.8120530641703},
      {"position":{"x":8,"y":9},"is_angle_degrees":229.38066083089097},
      {"position":{"x":7,"y":8},"is_angle_degrees":229.99182640663085},
      {"position":{"x":6,"y":7},"is_angle_degrees":230.84356530921895},
      {"position":{"x":5,"y":6},"is_angle_degrees":231.9343684636144},
      {"position":{"x":9,"y":11},"is_angle_degrees":232.54746259886866},
      {"position":{"x":4,"y":5},"is_angle_degrees":233.25310161190623},
      {"position":{"x":7,"y":9},"is_angle_degrees":234.33940998925726},
      {"position":{"x":3,"y":4},"is_angle_degrees":235.57901386886647},
      {"position":{"x":8,"y":11},"is_angle_degrees":236.54263871039927},
      {"position":{"x":5,"y":7},"is_angle_degrees":237.0556412787696},
      {"position":{"x":7,"y":10},"is_angle_degrees":237.80506538040387},
      {"position":{"x":2,"y":3},"is_angle_degrees":239.2384614508864},
      {"position":{"x":7,"y":11},"is_angle_degrees":240.66175895372203},
      {"position":{"x":5,"y":8},"is_angle_degrees":241.1893671019898},
      {"position":{"x":3,"y":5},"is_angle_degrees":242.21591563662784},
      {"position":{"x":7,"y":12},"is_angle_degrees":243.10840230514316},
      {"position":{"x":4,"y":7},"is_angle_degrees":243.64844318687088},
      {"position":{"x":5,"y":9},"is_angle_degrees":244.30834057948704},
      {"position":{"x":6,"y":11},"is_angle_degrees":244.67468430767647},
      {"position":{"x":1,"y":2},"is_angle_degrees":246.86622961467404},
      {"position":{"x":5,"y":11},"is_angle_degrees":248.89623287598292},
      {"position":{"x":4,"y":9},"is_angle_degrees":249.24022544736272},
      {"position":{"x":3,"y":7},"is_angle_degrees":249.94957672179203},
      {"position":{"x":5,"y":12},"is_angle_degrees":250.51863967975643},
      {"position":{"x":2,"y":5},"is_angle_degrees":251.28850943140387},
      {"position":{"x":3,"y":8},"is_angle_degrees":252.39899301695226},
      {"position":{"x":4,"y":11},"is_angle_degrees":252.93774257825774},
      {"position":{"x":1,"y":3},"is_angle_degrees":254.36202366181803},
      {"position":{"x":3,"y":10},"is_angle_degrees":255.77582757180045},
      {"position":{"x":2,"y":7},"is_angle_degrees":256.42442746027183},
      {"position":{"x":3,"y":11},"is_angle_degrees":256.9559321328725},
      {"position":{"x":1,"y":4},"is_angle_degrees":257.9923216155314},
      {"position":{"x":2,"y":9},"is_angle_degrees":259.211090819349},
      {"position":{"x":1,"y":5},"is_angle_degrees":260.25265231767105},
      {"position":{"x":2,"y":11},"is_angle_degrees":261.0034628291378},
      {"position":{"x":1,"y":6},"is_angle_degrees":261.6912896772781},
      {"position":{"x":1,"y":7},"is_angle_degrees":262.76101671942877},
      {"position":{"x":1,"y":8},"is_angle_degrees":263.62045466610243},
      {"position":{"x":1,"y":9},"is_angle_degrees":264.3336655511919},
      {"position":{"x":1,"y":10},"is_angle_degrees":264.6492808192487},
      {"position":{"x":1,"y":11},"is_angle_degrees":265.1535754029703},
      {"position":{"x":1,"y":12},"is_angle_degrees":265.5595800690632},
      {"position":{"x":0,"y":1},"is_angle_degrees":269.18252281788943},
      {"position":{"x":-1,"y":12},"is_angle_degrees":272.8783379216949},
      {"position":{"x":-1,"y":11},"is_angle_degrees":273.18404436369565},
      {"position":{"x":-1,"y":10},"is_angle_degrees":273.7822665226945},
      {"position":{"x":-1,"y":9},"is_angle_degrees":274.0342296232624},
      {"position":{"x":-1,"y":8},"is_angle_degrees":274.79850049549617},
      {"position":{"x":-1,"y":7},"is_angle_degrees":275.6759770174907},
      {"position":{"x":-1,"y":6},"is_angle_degrees":276.7114020540849},
      {"position":{"x":-2,"y":11},"is_angle_degrees":277.463121427433},
      {"position":{"x":-1,"y":5},"is_angle_degrees":278.1504762797393},
      {"position":{"x":-2,"y":9},"is_angle_degrees":279.18519183503565},
      {"position":{"x":-1,"y":4},"is_angle_degrees":280.44729036743064},
      {"position":{"x":-3,"y":11},"is_angle_degrees":281.4997069286953},
      {"position":{"x":-2,"y":7},"is_angle_degrees":282.0522663148089},
      {"position":{"x":-3,"y":10},"is_angle_degrees":282.7232234028453},
      {"position":{"x":-1,"y":3},"is_angle_degrees":284.130191576007},
      {"position":{"x":-4,"y":11},"is_angle_degrees":285.5192967413193},
      {"position":{"x":-3,"y":8},"is_angle_degrees":286.06455342791156},
      {"position":{"x":-2,"y":5},"is_angle_degrees":287.08508416642854},
      {"position":{"x":-5,"y":12},"is_angle_degrees":287.96389463125877},
      {"position":{"x":-3,"y":7},"is_angle_degrees":288.5223240452783},
      {"position":{"x":-4,"y":9},"is_angle_degrees":289.22864925370845},
      {"position":{"x":-5,"y":11},"is_angle_degrees":289.5814919301791},
      {"position":{"x":-1,"y":2},"is_angle_degrees":291.6984903456128},
      {"position":{"x":-6,"y":11},"is_angle_degrees":293.75701891588005},
      {"position":{"x":-5,"y":9},"is_angle_degrees":294.1197123396859},
      {"position":{"x":-4,"y":7},"is_angle_degrees":294.8467120481688},
      {"position":{"x":-7,"y":12},"is_angle_degrees":295.37010688254577},
      {"position":{"x":-3,"y":5},"is_angle_degrees":296.17732273832786},
      {"position":{"x":-5,"y":8},"is_angle_degrees":297.25823871780614},
      {"position":{"x":-7,"y":11},"is_angle_degrees":297.7873461411438},
      {"position":{"x":-2,"y":3},"is_angle_degrees":299.21642871011875},
      {"position":{"x":-7,"y":10},"is_angle_degrees":300.5797168359438},
      {"position":{"x":-5,"y":7},"is_angle_degrees":301.29515391257934},
      {"position":{"x":-8,"y":11},"is_angle_degrees":301.8323594628894},
      {"position":{"x":-3,"y":4},"is_angle_degrees":302.88273726611897},
      {"position":{"x":-7,"y":9},"is_angle_degrees":304.0669567999951},
      {"position":{"x":-4,"y":5},"is_angle_degrees":305.1481884810815},
      {"position":{"x":-9,"y":11},"is_angle_degrees":305.90474757463573},
      {"position":{"x":-5,"y":6},"is_angle_degrees":306.5953954554787},
      {"position":{"x":-6,"y":7},"is_angle_degrees":307.5875865121705},
      {"position":{"x":-7,"y":8},"is_angle_degrees":308.4845547616143},
      {"position":{"x":-8,"y":9},"is_angle_degrees":309.0430295611872},
      {"position":{"x":-9,"y":10},"is_angle_degrees":309.5420206088996},
      {"position":{"x":-10,"y":11},"is_angle_degrees":310.1250691037786},
      {"position":{"x":-11,"y":12},"is_angle_degrees":310.4478233418726},
      {"position":{"x":-1,"y":1},"is_angle_degrees":314.1518232195383},
      {"position":{"x":-12,"y":11},"is_angle_degrees":317.8297817771944},
      {"position":{"x":-11,"y":10},"is_angle_degrees":318.238608702456},
      {"position":{"x":-10,"y":9},"is_angle_degrees":318.46467468197415},
      {"position":{"x":-9,"y":8},"is_angle_degrees":319.0680870364064},
      {"position":{"x":-8,"y":7},"is_angle_degrees":319.79905467920645},
      {"position":{"x":-7,"y":6},"is_angle_degrees":320.4654435330122},
      {"position":{"x":-6,"y":5},"is_angle_degrees":321.7380554352474},
      {"position":{"x":-11,"y":9},"is_angle_degrees":322.25037660397084},
      {"position":{"x":-5,"y":4},"is_angle_degrees":323.04041972328406},
      {"position":{"x":-9,"y":7},"is_angle_degrees":324.1269728249081},
      {"position":{"x":-4,"y":3},"is_angle_degrees":325.36181093674423},
      {"position":{"x":-11,"y":8},"is_angle_degrees":326.3240505689787},
      {"position":{"x":-7,"y":5},"is_angle_degrees":326.8357729737181},
      {"position":{"x":-10,"y":7},"is_angle_degrees":327.5802099213551},
      {"position":{"x":-3,"y":2},"is_angle_degrees":329.00744000902995},
      {"position":{"x":-11,"y":7},"is_angle_degrees":330.4276418875332},
      {"position":{"x":-8,"y":5},"is_angle_degrees":330.95262492950746},
      {"position":{"x":-5,"y":3},"is_angle_degrees":331.9774234663359},
      {"position":{"x":-12,"y":7},"is_angle_degrees":332.8708822822816},
      {"position":{"x":-7,"y":4},"is_angle_degrees":333.4057877199358},
      {"position":{"x":-9,"y":5},"is_angle_degrees":334.06377917069074},
      {"position":{"x":-11,"y":6},"is_angle_degrees":334.4268915434322},
      {"position":{"x":-2,"y":1},"is_angle_degrees":336.6083991497292},
      {"position":{"x":-11,"y":5},"is_angle_degrees":338.45915246427796},
      {"position":{"x":-9,"y":4},"is_angle_degrees":338.9818904754534},
      {"position":{"x":-7,"y":3},"is_angle_degrees":339.68781104888666},
      {"position":{"x":-12,"y":5},"is_angle_degrees":340.25598382731897},
      {"position":{"x":-5,"y":2},"is_angle_degrees":340.8646588687204},
      {"position":{"x":-8,"y":3},"is_angle_degrees":342.13162979955257},
      {"position":{"x":-11,"y":4},"is_angle_degrees":342.6694658210219},
      {"position":{"x":-3,"y":1},"is_angle_degrees":343.9086035777634},
      {"position":{"x":-10,"y":3},"is_angle_degrees":345.4970517603252},
      {"position":{"x":-7,"y":2},"is_angle_degrees":346.1480930787289},
      {"position":{"x":-11,"y":3},"is_angle_degrees":346.6778644984361},
      {"position":{"x":-4,"y":1},"is_angle_degrees":347.71225370335253},
      {"position":{"x":-9,"y":2},"is_angle_degrees":348.9323640641163},
      {"position":{"x":-5,"y":1},"is_angle_degrees":349.97048016623563},
      {"position":{"x":-11,"y":2},"is_angle_degrees":350.72593557936096},
      {"position":{"x":-6,"y":1},"is_angle_degrees":351.4204536170094},
      {"position":{"x":-7,"y":1},"is_angle_degrees":352.48107479456826},
      {"position":{"x":-8,"y":1},"is_angle_degrees":353.3360841690405},
      {"position":{"x":-9,"y":1},"is_angle_degrees":353.8680300694102},
      {"position":{"x":-10,"y":1},"is_angle_degrees":354.35953729415},
      {"position":{"x":-11,"y":1},"is_angle_degrees":354.8765335083275},
      {"position":{"x":-12,"y":1},"is_angle_degrees":355.16178324256697}
    ])
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
          new ExportStringModal(AngularKeyframeFunction.fromCalibrationSamples(this.samples).getCSV()).show()
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