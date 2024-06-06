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
  export const CALIBRATION_INACCURACY_DEGREES = 0.25
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
      {"position":{"x":-2,"y":11},"is_angle_degrees":273.3659906609871},
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
      {"position": {"x": -1, "y": 0}, "is_angle_degrees": 359.2672883559899},
      {"position": {"x": -12, "y": -1}, "is_angle_degrees": 2.9324056255786197},
      {"position": {"x": -11, "y": -1}, "is_angle_degrees": 3.249476525033047},
      {"position": {"x": -10, "y": -1}, "is_angle_degrees": 3.6818080691763493},
      {"position": {"x": -9, "y": -1}, "is_angle_degrees": 4.044612198981016},
      {"position": {"x": -8, "y": -1}, "is_angle_degrees": 4.816358462704728},
      {"position": {"x": -7, "y": -1}, "is_angle_degrees": 5.563371853557039},
      {"position": {"x": -6, "y": -1}, "is_angle_degrees": 6.586267775191192},
      {"position": {"x": -11, "y": -2}, "is_angle_degrees": 7.272176642892902},
      {"position": {"x": -5, "y": -1}, "is_angle_degrees": 8.203777458516525},
      {"position": {"x": -9, "y": -2}, "is_angle_degrees": 9.24689926705523},
      {"position": {"x": -4, "y": -1}, "is_angle_degrees": 10.464629210136312},
      {"position": {"x": -11, "y": -3}, "is_angle_degrees": 11.55062156150395},
      {"position": {"x": -7, "y": -2}, "is_angle_degrees": 12.103568970999998},
      {"position": {"x": -10, "y": -3}, "is_angle_degrees": 12.614888110147144},
      {"position": {"x": -3, "y": -1}, "is_angle_degrees": 14.18535463717353},
      {"position": {"x": -11, "y": -4}, "is_angle_degrees": 15.541914452110708},
      {"position": {"x": -8, "y": -3}, "is_angle_degrees": 16.09780625073931},
      {"position": {"x": -5, "y": -2}, "is_angle_degrees": 17.153800770482178},
      {"position": {"x": -12, "y": -5}, "is_angle_degrees": 17.82697890331174},
      {"position": {"x": -7, "y": -3}, "is_angle_degrees": 18.389583598778994},
      {"position": {"x": -9, "y": -4}, "is_angle_degrees": 19.082909974285712},
      {"position": {"x": -11, "y": -5}, "is_angle_degrees": 19.591062350926727},
      {"position": {"x": -2, "y": -1}, "is_angle_degrees": 21.764078398250383},
      {"position": {"x": -11, "y": -6}, "is_angle_degrees": 23.656895756202537},
      {"position": {"x": -9, "y": -5}, "is_angle_degrees": 24.172173648844776},
      {"position": {"x": -7, "y": -4}, "is_angle_degrees": 24.87684526029619},
      {"position": {"x": -12, "y": -7}, "is_angle_degrees": 25.405823471548352},
      {"position": {"x": -5, "y": -3}, "is_angle_degrees": 26.200129433888932},
      {"position": {"x": -8, "y": -5}, "is_angle_degrees": 27.325608162677007},
      {"position": {"x": -11, "y": -7}, "is_angle_degrees": 27.852507155892102},
      {"position": {"x": -3, "y": -2}, "is_angle_degrees": 29.118720765078926},
      {"position": {"x": -10, "y": -7}, "is_angle_degrees": 30.734076319594124},
      {"position": {"x": -7, "y": -5}, "is_angle_degrees": 31.362526967907318},
      {"position": {"x": -11, "y": -8}, "is_angle_degrees": 31.900024260256554},
      {"position": {"x": -4, "y": -3}, "is_angle_degrees": 32.945334189506056},
      {"position": {"x": -9, "y": -7}, "is_angle_degrees": 34.16104896221948},
      {"position": {"x": -5, "y": -4}, "is_angle_degrees": 35.02925253608887},
      {"position": {"x": -11, "y": -9}, "is_angle_degrees": 35.89608114364972},
      {"position": {"x": -6, "y": -5}, "is_angle_degrees": 36.65194790428639},
      {"position": {"x": -7, "y": -6}, "is_angle_degrees": 37.71193533823808},
      {"position": {"x": -8, "y": -7}, "is_angle_degrees": 38.580293120125624},
      {"position": {"x": -9, "y": -8}, "is_angle_degrees": 39.07335912146491},
      {"position": {"x": -10, "y": -9}, "is_angle_degrees": 39.617184073203504},
      {"position": {"x": -11, "y": -10}, "is_angle_degrees": 39.919333432227006},
      {"position": {"x": -12, "y": -11}, "is_angle_degrees": 40.34072163763604},
      {"position": {"y": -1, "x": -1}, "is_angle_degrees": 44.09413190598668},
      {"position": {"x": -11, "y": -12}, "is_angle_degrees": 47.82782618088865},
      {"position": {"x": -10, "y": -11}, "is_angle_degrees": 48.1125118868869},
      {"position": {"x": -9, "y": -10}, "is_angle_degrees": 48.484237315924744},
      {"position": {"x": -8, "y": -9}, "is_angle_degrees": 49.03043497970486},
      {"position": {"x": -7, "y": -8}, "is_angle_degrees": 49.75126003662967},
      {"position": {"x": -6, "y": -7}, "is_angle_degrees": 50.433084118603944},
      {"position": {"x": -5, "y": -6}, "is_angle_degrees": 51.521875846958125},
      {"position": {"x": -9, "y": -11}, "is_angle_degrees": 52.25088810681366},
      {"position": {"x": -4, "y": -5}, "is_angle_degrees": 53.06225661196584},
      {"position": {"x": -7, "y": -9}, "is_angle_degrees": 54.10359766089965},
      {"position": {"x": -3, "y": -4}, "is_angle_degrees": 55.21400575646887},
      {"position": {"x": -8, "y": -11}, "is_angle_degrees": 56.161459235927374},
      {"position": {"x": -5, "y": -7}, "is_angle_degrees": 56.86989673804566},
      {"position": {"x": -7, "y": -10}, "is_angle_degrees": 57.389431708166065},
      {"position": {"x": -2, "y": -3}, "is_angle_degrees": 58.98897625622534},
      {"position": {"x": -7, "y": -11}, "is_angle_degrees": 60.38197976906217},
      {"position": {"x": -5, "y": -8}, "is_angle_degrees": 60.91396831932939},
      {"position": {"x": -3, "y": -5}, "is_angle_degrees": 61.957200601414385},
      {"position": {"x": -7, "y": -12}, "is_angle_degrees": 62.66772989184853},
      {"position": {"x": -4, "y": -7}, "is_angle_degrees": 63.20347336008912},
      {"position": {"x": -5, "y": -9}, "is_angle_degrees": 63.876768273325474},
      {"position": {"x": -6, "y": -11}, "is_angle_degrees": 64.39293892317814},
      {"position": {"x": -1, "y": -2}, "is_angle_degrees": 66.61894315131003},
      {"position": {"x": -5, "y": -11}, "is_angle_degrees": 68.4117183668898},
      {"position": {"x": -4, "y": -9}, "is_angle_degrees": 68.9426938897301},
      {"position": {"x": -3, "y": -7}, "is_angle_degrees": 69.63538753089313},
      {"position": {"x": -5, "y": -12}, "is_angle_degrees": 70.23592018261469},
      {"position": {"x": -2, "y": -5}, "is_angle_degrees": 70.7760467321044},
      {"position": {"x": -3, "y": -8}, "is_angle_degrees": 72.09663572982919},
      {"position": {"x": -4, "y": -11}, "is_angle_degrees": 72.42688824260067},
      {"position": {"x": -1, "y": -3}, "is_angle_degrees": 73.85092948092988},
      {"position": {"x": -3, "y": -10}, "is_angle_degrees": 75.43830704321262},
      {"position": {"x": -2, "y": -7}, "is_angle_degrees": 75.92033007554002},
      {"position": {"x": -3, "y": -11}, "is_angle_degrees": 76.62621869637913},
      {"position": {"x": -1, "y": -4}, "is_angle_degrees": 77.68865535310108},
      {"position": {"x": -2, "y": -9}, "is_angle_degrees": 78.86485130527575},
      {"position": {"x": -1, "y": -5}, "is_angle_degrees": 79.78193721509095},
      {"position": {"x": -2, "y": -11}, "is_angle_degrees": 80.65089445180026},
      {"position": {"x": -1, "y": -6}, "is_angle_degrees": 81.36523642762232},
      {"position": {"x": -1, "y": -7}, "is_angle_degrees": 82.3936967069063},
      {"position": {"x": -1, "y": -8}, "is_angle_degrees": 83.27885333880157},
      {"position": {"x": -1, "y": -9}, "is_angle_degrees": 83.81825197808476},
      {"position": {"x": -1, "y": -10}, "is_angle_degrees": 84.33620525168688},
      {"position": {"x": -1, "y": -11}, "is_angle_degrees": 84.65313810126753},
      {"position": {"x": -1, "y": -12}, "is_angle_degrees": 85.1256358392583},
      {"position": {"x": 0, "y": -1}, "is_angle_degrees": 88.69909614705074},
      {"position": {"x": 1, "y": -12}, "is_angle_degrees": 92.73537250450477},
      {"position": {"x": 1, "y": -11}, "is_angle_degrees": 93.18704634154192},
      {"position": {"x": 1, "y": -10}, "is_angle_degrees": 93.44511662892249},
      {"position": {"x": 1, "y": -9}, "is_angle_degrees": 94.02353215226796},
      {"position": {"x": 1, "y": -8}, "is_angle_degrees": 94.47322591161074},
      {"position": {"x": 1, "y": -7}, "is_angle_degrees": 95.39181275168883},
      {"position": {"x": 1, "y": -6}, "is_angle_degrees": 96.4388104776936},
      {"position": {"x": 2, "y": -11}, "is_angle_degrees": 97.13468837975726},
      {"position": {"x": 1, "y": -5}, "is_angle_degrees": 98.03866414824581},
      {"position": {"x": 2, "y": -9}, "is_angle_degrees": 98.9138597991021},
      {"position": {"x": 1, "y": -4}, "is_angle_degrees": 100.1534729881156},
      {"position": {"x": 3, "y": -11}, "is_angle_degrees": 101.20503204813224},
      {"position": {"x": 2, "y": -7}, "is_angle_degrees": 101.87667396606608},
      {"position": {"x": 3, "y": -10}, "is_angle_degrees": 102.44260634819233},
      {"position": {"x": 1, "y": -3}, "is_angle_degrees": 104.01640337163894},
      {"position": {"x": 4, "y": -11}, "is_angle_degrees": 105.40040268359783},
      {"position": {"x": 3, "y": -8}, "is_angle_degrees": 105.74393670966337},
      {"position": {"x": 2, "y": -5}, "is_angle_degrees": 106.99969304774233},
      {"position": {"x": 5, "y": -12}, "is_angle_degrees": 107.64500894469943},
      {"position": {"x": 3, "y": -7}, "is_angle_degrees": 108.24030763319652},
      {"position": {"x": 4, "y": -9}, "is_angle_degrees": 108.94069343457306},
      {"position": {"x": 5, "y": -11}, "is_angle_degrees": 109.45626733373997},
      {"position": {"x": 1, "y": -2}, "is_angle_degrees": 111.42998055854314},
      {"position": {"x": 6, "y": -11}, "is_angle_degrees": 113.47750657450449},
      {"position": {"x": 5, "y": -9}, "is_angle_degrees": 113.99488422823404},
      {"position": {"x": 4, "y": -7}, "is_angle_degrees": 114.71224026948487},
      {"position": {"x": 7, "y": -12}, "is_angle_degrees": 115.2395660549162},
      {"position": {"x": 3, "y": -5}, "is_angle_degrees": 115.95551057240083},
      {"position": {"x": 5, "y": -8}, "is_angle_degrees": 116.98824472233709},
      {"position": {"x": 7, "y": -11}, "is_angle_degrees": 117.51585591981704},
      {"position": {"x": 2, "y": -3}, "is_angle_degrees": 118.89582670929002},
      {"position": {"x": 7, "y": -10}, "is_angle_degrees": 120.49400447949093},
      {"position": {"x": 5, "y": -7}, "is_angle_degrees": 121.00955533658956},
      {"position": {"x": 8, "y": -11}, "is_angle_degrees": 121.72664400962931},
      {"position": {"x": 3, "y": -4}, "is_angle_degrees": 122.62444929455496},
      {"position": {"x": 7, "y": -9}, "is_angle_degrees": 123.84975396881991},
      {"position": {"x": 4, "y": -5}, "is_angle_degrees": 124.89636996258038},
      {"position": {"x": 9, "y": -11}, "is_angle_degrees": 125.77739456111237},
      {"position": {"x": 5, "y": -6}, "is_angle_degrees": 126.49218005436886},
      {"position": {"x": 6, "y": -7}, "is_angle_degrees": 127.50375594509437},
      {"position": {"x": 7, "y": -8}, "is_angle_degrees": 128.2229592857698},
      {"position": {"x": 8, "y": -9}, "is_angle_degrees": 128.9348650019174},
      {"position": {"x": 9, "y": -10}, "is_angle_degrees": 129.4521370837307},
      {"position": {"x": 10, "y": -11}, "is_angle_degrees": 129.81018749083415},
      {"position": {"x": 11, "y": -12}, "is_angle_degrees": 130.1478675512497},
      {"position": {"x": 1, "y": -1}, "is_angle_degrees": 133.85386477701073},
      {"position": {"x": 12, "y": -11}, "is_angle_degrees": 137.7516330044958},
      {"position": {"x": 11, "y": -10}, "is_angle_degrees": 138.19366222209348},
      {"position": {"x": 10, "y": -9}, "is_angle_degrees": 138.3744182634083},
      {"position": {"x": 9, "y": -8}, "is_angle_degrees": 138.9622278408157},
      {"position": {"x": 8, "y": -7}, "is_angle_degrees": 139.54242592417162},
      {"position": {"x": 7, "y": -6}, "is_angle_degrees": 140.38971934588645},
      {"position": {"x": 6, "y": -5}, "is_angle_degrees": 141.48493480379727},
      {"position": {"x": 11, "y": -9}, "is_angle_degrees": 142.24118303069503},
      {"position": {"x": 5, "y": -4}, "is_angle_degrees": 143.01992391918967},
      {"position": {"x": 9, "y": -7}, "is_angle_degrees": 143.90317913554497},
      {"position": {"x": 4, "y": -3}, "is_angle_degrees": 145.03367325002566},
      {"position": {"x": 11, "y": -8}, "is_angle_degrees": 146.1525352343854},
      {"position": {"x": 7, "y": -5}, "is_angle_degrees": 146.7059488653272},
      {"position": {"x": 10, "y": -7}, "is_angle_degrees": 147.41639891111777},
      {"position": {"x": 3, "y": -2}, "is_angle_degrees": 149.01514782367184},
      {"position": {"x": 11, "y": -7}, "is_angle_degrees": 150.21381259833734},
      {"position": {"x": 8, "y": -5}, "is_angle_degrees": 150.80474654746837},
      {"position": {"x": 5, "y": -3}, "is_angle_degrees": 152.0506314844657},
      {"position": {"x": 12, "y": -7}, "is_angle_degrees": 152.73655067990526},
      {"position": {"x": 7, "y": -4}, "is_angle_degrees": 153.27767691892024},
      {"position": {"x": 9, "y": -5}, "is_angle_degrees": 153.97763551072362},
      {"position": {"x": 11, "y": -6}, "is_angle_degrees": 154.52155506585396},
      {"position": {"x": 2, "y": -1}, "is_angle_degrees": 156.503789461738},
      {"position": {"x": 11, "y": -5}, "is_angle_degrees": 158.54911614395078},
      {"position": {"x": 9, "y": -4}, "is_angle_degrees": 159.082789303796},
      {"position": {"x": 7, "y": -3}, "is_angle_degrees": 159.80211703000293},
      {"position": {"x": 12, "y": -5}, "is_angle_degrees": 160.3715434672552},
      {"position": {"x": 5, "y": -2}, "is_angle_degrees": 160.91868485629254},
      {"position": {"x": 8, "y": -3}, "is_angle_degrees": 162.0787129934473},
      {"position": {"x": 11, "y": -4}, "is_angle_degrees": 162.61298975399893},
      {"position": {"x": 3, "y": -1}, "is_angle_degrees": 164.02577038508406},
      {"position": {"x": 10, "y": -3}, "is_angle_degrees": 165.56242435194386},
      {"position": {"x": 7, "y": -2}, "is_angle_degrees": 166.1235936132884},
      {"position": {"x": 11, "y": -3}, "is_angle_degrees": 166.6576630931064},
      {"position": {"x": 4, "y": -1}, "is_angle_degrees": 167.66547022855943},
      {"position": {"x": 9, "y": -2}, "is_angle_degrees": 168.9401908238989},
      {"position": {"x": 5, "y": -1}, "is_angle_degrees": 169.96449210374067},
      {"position": {"x": 11, "y": -2}, "is_angle_degrees": 170.84173774897914},
      {"position": {"x": 6, "y": -1}, "is_angle_degrees": 171.59526816269735},
      {"position": {"x": 7, "y": -1}, "is_angle_degrees": 172.66402240067373},
      {"position": {"x": 8, "y": -1}, "is_angle_degrees": 173.28839225362532},
      {"position": {"x": 9, "y": -1}, "is_angle_degrees": 174.04690465027173},
      {"position": {"x": 10, "y": -1}, "is_angle_degrees": 174.53387083420125},
      {"position": {"x": 11, "y": -1}, "is_angle_degrees": 174.94204425792745},
      {"position": {"x": 12, "y": -1}, "is_angle_degrees": 175.25289422667723},
      {"position": {"x": 1, "y": 0}, "is_angle_degrees": 178.94317534388756},
      {"position": {"x": 12, "y": 1}, "is_angle_degrees": 182.8055550200824},
      {"position": {"x": 11, "y": 1}, "is_angle_degrees": 183.01580445311384},
      {"position": {"x": 10, "y": 1}, "is_angle_degrees": 183.5627543771376},
      {"position": {"x": 9, "y": 1}, "is_angle_degrees": 184.11549889908068},
      {"position": {"x": 8, "y": 1}, "is_angle_degrees": 184.59466805775892},
      {"position": {"x": 7, "y": 1}, "is_angle_degrees": 185.49362803064798},
      {"position": {"x": 6, "y": 1}, "is_angle_degrees": 186.55322165143278},
      {"position": {"x": 11, "y": 2}, "is_angle_degrees": 187.21316279420088},
      {"position": {"x": 5, "y": 1}, "is_angle_degrees": 187.9550347514025},
      {"position": {"x": 9, "y": 2}, "is_angle_degrees": 189.0151026140672},
      {"position": {"x": 4, "y": 1}, "is_angle_degrees": 190.30605316619142},
      {"position": {"x": 11, "y": 3}, "is_angle_degrees": 191.33541531283797},
      {"position": {"x": 7, "y": 2}, "is_angle_degrees": 191.86777521083064},
      {"position": {"x": 10, "y": 3}, "is_angle_degrees": 192.56867320250794},
      {"position": {"x": 3, "y": 1}, "is_angle_degrees": 194.1649290451058},
      {"position": {"x": 11, "y": 4}, "is_angle_degrees": 195.38098073468353},
      {"position": {"x": 8, "y": 3}, "is_angle_degrees": 195.90170110181742},
      {"position": {"x": 5, "y": 2}, "is_angle_degrees": 197.1336965116818},
      {"position": {"x": 12, "y": 5}, "is_angle_degrees": 197.83070363935406},
      {"position": {"x": 7, "y": 3}, "is_angle_degrees": 198.33908107519213},
      {"position": {"x": 9, "y": 4}, "is_angle_degrees": 199.06909906042358},
      {"position": {"x": 11, "y": 5}, "is_angle_degrees": 199.5868844866603},
      {"position": {"x": 2, "y": 1}, "is_angle_degrees": 201.57587381370593},
      {"position": {"x": 11, "y": 6}, "is_angle_degrees": 203.61018740782492},
      {"position": {"x": 9, "y": 5}, "is_angle_degrees": 203.9559373803319},
      {"position": {"x": 7, "y": 4}, "is_angle_degrees": 204.67502348180864},
      {"position": {"x": 12, "y": 7}, "is_angle_degrees": 205.21747284480458},
      {"position": {"x": 5, "y": 3}, "is_angle_degrees": 206.11785393654566},
      {"position": {"x": 8, "y": 5}, "is_angle_degrees": 207.1394408132597},
      {"position": {"x": 11, "y": 7}, "is_angle_degrees": 207.650777031387},
      {"position": {"x": 3, "y": 2}, "is_angle_degrees": 209.09602735155696},
      {"position": {"x": 10, "y": 7}, "is_angle_degrees": 210.50282414760701},
      {"position": {"x": 7, "y": 5}, "is_angle_degrees": 211.17388728432908},
      {"position": {"x": 11, "y": 8}, "is_angle_degrees": 211.71160613422933},
      {"position": {"x": 4, "y": 3}, "is_angle_degrees": 212.77829499980868},
      {"position": {"x": 9, "y": 7}, "is_angle_degrees": 214.03958775563297},
      {"position": {"x": 5, "y": 4}, "is_angle_degrees": 215.04538894425778},
      {"position": {"x": 11, "y": 9}, "is_angle_degrees": 215.92955786092298},
      {"position": {"x": 6, "y": 5}, "is_angle_degrees": 216.48204707673423},
      {"position": {"x": 7, "y": 6}, "is_angle_degrees": 217.70175800996867},
      {"position": {"x": 8, "y": 7}, "is_angle_degrees": 218.3766554285262},
      {"position": {"x": 9, "y": 8}, "is_angle_degrees": 219.09372170946827},
      {"position": {"x": 10, "y": 9}, "is_angle_degrees": 219.61479283237657},
      {"position": {"x": 11, "y": 10}, "is_angle_degrees": 219.98181655210163},
      {"position": {"x": 12, "y": 11}, "is_angle_degrees": 220.3495089062835},
      {"position": {"y": 1, "x": 1}, "is_angle_degrees": 224.03928896881797},
      {"position": {"x": 11, "y": 12}, "is_angle_degrees": 227.68773401400736},
      {"position": {"x": 10, "y": 11}, "is_angle_degrees": 228.0666231934711},
      {"position": {"x": 9, "y": 10}, "is_angle_degrees": 228.68489410847198},
      {"position": {"x": 8, "y": 9}, "is_angle_degrees": 229.0427683405817},
      {"position": {"x": 7, "y": 8}, "is_angle_degrees": 229.63678702933473},
      {"position": {"x": 6, "y": 7}, "is_angle_degrees": 230.5460309827638},
      {"position": {"x": 5, "y": 6}, "is_angle_degrees": 231.63663660846336},
      {"position": {"x": 9, "y": 11}, "is_angle_degrees": 232.31746416078386},
      {"position": {"x": 4, "y": 5}, "is_angle_degrees": 232.96891224962263},
      {"position": {"x": 7, "y": 9}, "is_angle_degrees": 234.05228570250503},
      {"position": {"x": 3, "y": 4}, "is_angle_degrees": 235.1979490403989},
      {"position": {"x": 8, "y": 11}, "is_angle_degrees": 236.2686973954353},
      {"position": {"x": 5, "y": 7}, "is_angle_degrees": 236.82152182709885},
      {"position": {"x": 7, "y": 10}, "is_angle_degrees": 237.55851303625542},
      {"position": {"x": 2, "y": 3}, "is_angle_degrees": 238.98156423615782},
      {"position": {"x": 7, "y": 11}, "is_angle_degrees": 240.37078727220612},
      {"position": {"x": 5, "y": 8}, "is_angle_degrees": 240.94087431311658},
      {"position": {"x": 3, "y": 5}, "is_angle_degrees": 241.98302044071193},
      {"position": {"x": 7, "y": 12}, "is_angle_degrees": 242.87426595992747},
      {"position": {"x": 4, "y": 7}, "is_angle_degrees": 243.4064861078933},
      {"position": {"x": 5, "y": 9}, "is_angle_degrees": 244.10972818222976},
      {"position": {"x": 6, "y": 11}, "is_angle_degrees": 244.46662061843966},
      {"position": {"x": 1, "y": 2}, "is_angle_degrees": 246.45309726954324},
      {"position": {"x": 5, "y": 11}, "is_angle_degrees": 248.70496044634024},
      {"position": {"x": 4, "y": 9}, "is_angle_degrees": 249.04308255205402},
      {"position": {"x": 3, "y": 7}, "is_angle_degrees": 249.7344006750175},
      {"position": {"x": 5, "y": 12}, "is_angle_degrees": 250.32813798453867},
      {"position": {"x": 2, "y": 5}, "is_angle_degrees": 251.06923510377524},
      {"position": {"x": 3, "y": 8}, "is_angle_degrees": 252.21412442320664},
      {"position": {"x": 4, "y": 11}, "is_angle_degrees": 252.77078568183282},
      {"position": {"x": 1, "y": 3}, "is_angle_degrees": 254.1609494249183},
      {"position": {"x": 3, "y": 10}, "is_angle_degrees": 255.5296204419944},
      {"position": {"x": 2, "y": 7}, "is_angle_degrees": 256.2626143479147},
      {"position": {"x": 3, "y": 11}, "is_angle_degrees": 256.80390004158875},
      {"position": {"x": 1, "y": 4}, "is_angle_degrees": 257.82226628071083},
      {"position": {"x": 2, "y": 9}, "is_angle_degrees": 259.0750632973678},
      {"position": {"x": 1, "y": 5}, "is_angle_degrees": 260.1494716232567},
      {"position": {"x": 2, "y": 11}, "is_angle_degrees": 260.83947873523533},
      {"position": {"x": 1, "y": 6}, "is_angle_degrees": 261.58555729279806},
      {"position": {"x": 1, "y": 7}, "is_angle_degrees": 262.66713528281025},
      {"position": {"x": 1, "y": 8}, "is_angle_degrees": 263.50489389767387},
      {"position": {"x": 1, "y": 9}, "is_angle_degrees": 264.21349990595814},
      {"position": {"x": 1, "y": 10}, "is_angle_degrees": 264.54172574485654},
      {"position": {"x": 1, "y": 11}, "is_angle_degrees": 265.11849959257256},
      {"position": {"x": 1, "y": 12}, "is_angle_degrees": 265.4854651740846},
      {"position": {"x": 0, "y": 1}, "is_angle_degrees": 269.1229530418862},
      {"position": {"x": -1, "y": 12}, "is_angle_degrees": 272.79351384464996},
      {"position": {"x": -1, "y": 11}, "is_angle_degrees": 273.18237882880265},
      {"position": {"x": -1, "y": 10}, "is_angle_degrees": 273.70282708490066},
      {"position": {"x": -1, "y": 9}, "is_angle_degrees": 273.92625994662967},
      {"position": {"x": -1, "y": 8}, "is_angle_degrees": 274.74392224265716},
      {"position": {"x": -1, "y": 7}, "is_angle_degrees": 275.6288593359226},
      {"position": {"x": -1, "y": 6}, "is_angle_degrees": 276.6852245889158},
      {"position": {"x": -2, "y": 11}, "is_angle_degrees": 277.37446051499774},
      {"position": {"x": -1, "y": 5}, "is_angle_degrees": 278.1066125726701},
      {"position": {"x": -2, "y": 9}, "is_angle_degrees": 279.16609032202575},
      {"position": {"x": -1, "y": 4}, "is_angle_degrees": 280.431696019716},
      {"position": {"x": -3, "y": 11}, "is_angle_degrees": 281.5074301061567},
      {"position": {"x": -2, "y": 7}, "is_angle_degrees": 282.004516420385},
      {"position": {"x": -3, "y": 10}, "is_angle_degrees": 282.69708982892746},
      {"position": {"x": -1, "y": 3}, "is_angle_degrees": 284.12681133119867},
      {"position": {"x": -4, "y": 11}, "is_angle_degrees": 285.50877082608065},
      {"position": {"x": -3, "y": 8}, "is_angle_degrees": 286.0469065361943},
      {"position": {"x": -2, "y": 5}, "is_angle_degrees": 287.0874586235085},
      {"position": {"x": -5, "y": 12}, "is_angle_degrees": 287.97533623247136},
      {"position": {"x": -3, "y": 7}, "is_angle_degrees": 288.51246941497993},
      {"position": {"x": -4, "y": 9}, "is_angle_degrees": 289.2359102731909},
      {"position": {"x": -5, "y": 11}, "is_angle_degrees": 289.57647822958086},
      {"position": {"x": -1, "y": 2}, "is_angle_degrees": 291.74876273694645},
      {"position": {"x": -6, "y": 11}, "is_angle_degrees": 293.7976078693465},
      {"position": {"x": -5, "y": 9}, "is_angle_degrees": 294.1685441460391},
      {"position": {"x": -4, "y": 7}, "is_angle_degrees": 294.86821918835483},
      {"position": {"x": -7, "y": 12}, "is_angle_degrees": 295.44021943552696},
      {"position": {"x": -3, "y": 5}, "is_angle_degrees": 296.22316541987226},
      {"position": {"x": -5, "y": 8}, "is_angle_degrees": 297.34408899802344},
      {"position": {"x": -7, "y": 11}, "is_angle_degrees": 297.8712248515872},
      {"position": {"x": -2, "y": 3}, "is_angle_degrees": 299.3551392261109},
      {"position": {"x": -7, "y": 10}, "is_angle_degrees": 300.65623313190775},
      {"position": {"x": -5, "y": 7}, "is_angle_degrees": 301.40527092960355},
      {"position": {"x": -8, "y": 11}, "is_angle_degrees": 301.9808517009499},
      {"position": {"x": -3, "y": 4}, "is_angle_degrees": 303.02536939963034},
      {"position": {"x": -7, "y": 9}, "is_angle_degrees": 304.251099925705},
      {"position": {"x": -4, "y": 5}, "is_angle_degrees": 305.3196383758023},
      {"position": {"x": -9, "y": 11}, "is_angle_degrees": 306.1049709966531},
      {"position": {"x": -5, "y": 6}, "is_angle_degrees": 306.77426875481785},
      {"position": {"x": -6, "y": 7}, "is_angle_degrees": 307.7803231815263},
      {"position": {"x": -7, "y": 8}, "is_angle_degrees": 308.6811018559266},
      {"position": {"x": -8, "y": 9}, "is_angle_degrees": 309.2307464605776},
      {"position": {"x": -9, "y": 10}, "is_angle_degrees": 309.70945484699564},
      {"position": {"x": -10, "y": 11}, "is_angle_degrees": 310.3084284758316},
      {"position": {"x": -11, "y": 12}, "is_angle_degrees": 310.60014227899535},
      {"position": {"x": -1, "y": 1}, "is_angle_degrees": 314.3312842823595},
      {"position": {"x": -12, "y": 11}, "is_angle_degrees": 317.98373364773994},
      {"position": {"x": -11, "y": 10}, "is_angle_degrees": 318.29974472193175},
      {"position": {"x": -10, "y": 9}, "is_angle_degrees": 318.6243086571405},
      {"position": {"x": -9, "y": 8}, "is_angle_degrees": 319.1990552992696},
      {"position": {"x": -8, "y": 7}, "is_angle_degrees": 319.93850947692647},
      {"position": {"x": -7, "y": 6}, "is_angle_degrees": 320.6075314548711},
      {"position": {"x": -6, "y": 5}, "is_angle_degrees": 321.90402078378366},
      {"position": {"x": -11, "y": 9}, "is_angle_degrees": 322.4167535011881},
      {"position": {"x": -5, "y": 4}, "is_angle_degrees": 323.25542313713436},
      {"position": {"x": -9, "y": 7}, "is_angle_degrees": 324.3009117303891},
      {"position": {"x": -4, "y": 3}, "is_angle_degrees": 325.3857285515695},
      {"position": {"x": -11, "y": 8}, "is_angle_degrees": 326.5184395869641},
      {"position": {"x": -7, "y": 5}, "is_angle_degrees": 327.0588454810512},
      {"position": {"x": -10, "y": 7}, "is_angle_degrees": 327.7639323311696},
      {"position": {"x": -3, "y": 2}, "is_angle_degrees": 329.1974795085055},
      {"position": {"x": -11, "y": 7}, "is_angle_degrees": 330.59860988977437},
      {"position": {"x": -8, "y": 5}, "is_angle_degrees": 331.1074173220168},
      {"position": {"x": -5, "y": 3}, "is_angle_degrees": 332.20509938647785},
      {"position": {"x": -12, "y": 7}, "is_angle_degrees": 333.0819509336206},
      {"position": {"x": -7, "y": 4}, "is_angle_degrees": 333.607544296348},
      {"position": {"x": -9, "y": 5}, "is_angle_degrees": 334.2926276241968},
      {"position": {"x": -11, "y": 6}, "is_angle_degrees": 334.64964984401263},
      {"position": {"x": -2, "y": 1}, "is_angle_degrees": 336.8958958066863},
      {"position": {"x": -11, "y": 5}, "is_angle_degrees": 338.70323170658287},
      {"position": {"x": -9, "y": 4}, "is_angle_degrees": 339.2355490989241},
      {"position": {"x": -7, "y": 3}, "is_angle_degrees": 339.91890309909047},
      {"position": {"x": -12, "y": 5}, "is_angle_degrees": 340.5468246945146},
      {"position": {"x": -5, "y": 2}, "is_angle_degrees": 341.09873648912753},
      {"position": {"x": -8, "y": 3}, "is_angle_degrees": 342.3675987512482},
      {"position": {"x": -11, "y": 4}, "is_angle_degrees": 342.9424105894221},
      {"position": {"x": -3, "y": 1}, "is_angle_degrees": 344.1349335319393},
      {"position": {"x": -10, "y": 3}, "is_angle_degrees": 345.7336786687156},
      {"position": {"x": -7, "y": 2}, "is_angle_degrees": 346.4357026612094},
      {"position": {"x": -11, "y": 3}, "is_angle_degrees": 346.9664831253768},
      {"position": {"x": -4, "y": 1}, "is_angle_degrees": 348.0370143415067},
      {"position": {"x": -9, "y": 2}, "is_angle_degrees": 349.2233585122398},
      {"position": {"x": -5, "y": 1}, "is_angle_degrees": 350.3055252462805},
      {"position": {"x": -11, "y": 2}, "is_angle_degrees": 350.9864268056591},
      {"position": {"x": -6, "y": 1}, "is_angle_degrees": 351.7226614435446},
      {"position": {"x": -7, "y": 1}, "is_angle_degrees": 352.78036747595587},
      {"position": {"x": -8, "y": 1}, "is_angle_degrees": 353.63690744293746},
      {"position": {"x": -9, "y": 1}, "is_angle_degrees": 354.1711713718732},
      {"position": {"x": -10, "y": 1}, "is_angle_degrees": 354.6991780220601},
      {"position": {"x": -11, "y": 1}, "is_angle_degrees": 355.1929453130554},
      {"position": {"x": -12, "y": 1}, "is_angle_degrees": 355.5101854972229}
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