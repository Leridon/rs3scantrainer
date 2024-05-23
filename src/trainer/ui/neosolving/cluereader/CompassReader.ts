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
import {ewent, observe} from "../../../../lib/reactive";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {deps} from "../../../dependencies";
import {util} from "../../../../lib/util/util";
import LightButton from "../../widgets/LightButton";
import ButtonRow from "../../../../lib/ui/ButtonRow";
import ExportStringModal from "../../widgets/modals/ExportStringModal";
import ImportStringModal from "../../widgets/modals/ImportStringModal";
import {Alt1MainHotkeyEvent} from "../../../../lib/alt1/Alt1MainHotkeyEvent";
import angleDifference = Compasses.angleDifference;
import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;

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

    function getRed(x: number, y: number) {
      const i = 4 * ((CENTER_OFFSET.y + y) * buf.width + x + CENTER_OFFSET.x)

      return buf.data[i]
    }

    function isArrow(x: number, y: number) {
      return getRed(x, y) < 5
    }

    if (CompassReader.DEBUG_COMPASS_READER) {
      CompassReader.debug_overlay.clear()

      this.capture.compass_area.debugOverlay(CompassReader.debug_overlay)
    }

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

    if (circle_sampled_pixels.length == 0) return {type: "likely_closed", details: "No pixels while sampling the circle"}
    if (circle_sampled_pixels.length > 10) return {type: "likely_concealed", details: "Too many pixels while sampling the circle"}

    // Map all sample points to their respective angle
    // The angle is taken from the true center of the compass arrow, which is why we offset the samples by 0.5
    // Also, the y axis is flipped to convert from screen coordinates to the internally used coordinate system
    const angles = circle_sampled_pixels.map(p => Vector2.angle(
      ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: p.x - 0.5, y: -p.y}))
    )

    const angle_after_circle_sampling = normalizeAngle(circularMean(angles))

    if (angles.some(a => angleDifference(a, angle_after_circle_sampling) > CompassReader.CIRCLE_SAMPLE_CONCEALED_THRESHOLD)) {
      return {type: "likely_concealed", details: "Too much variance in the sampled pixels on the circumference"}
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

          if (red < 30) antialiasing_detected = true
        }
      }
    }

    if (antialiasing_detected) {
      if (rectangle_samples.length < 200) return {type: "likely_closed", details: "Not enough pixels sampled for the rectangle sample"}
      if (rectangle_samples.length < 1750) return {type: "likely_concealed", details: "Not enough pixels sampled for the rectangle sample"}
      if (rectangle_samples.length > 1950) return {type: "likely_concealed", details: "Too many pixels sampled for the rectangle sample"}
    } else {
      if (rectangle_samples.length < 200) return {type: "likely_closed", details: "Not enough pixels sampled for the rectangle sample"}
      if (rectangle_samples.length < 1950) return {type: "likely_concealed", details: "Not enough pixels sampled for the rectangle sample"}
      if (rectangle_samples.length > 2150) return {type: "likely_concealed", details: "Too many pixels sampled for the rectangle sample"}
    }

    const angle_after_rectangle_sample = normalizeAngle(Math.atan2(
      lodash.sum(rectangle_samples.map(a => a.weight * Math.sin(a.angle))),
      lodash.sum(rectangle_samples.map(a => a.weight * Math.cos(a.angle))),
    ))

    const calibration_mode = (this.disable_calibration || CompassReader.DISABLE_CALIBRATION) ? null
      : (antialiasing_detected ? "off" : "off")

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
  export const DEBUG_COMPASS_READER = true
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

  export const debug_overlay = new OverlayGeometry()

  export const calibration_tables = {
    "off": AngularKeyframeFunction.fromCalibrationSamples([
      {"position": {"x": -1, "y": 0}, "is_angle_degrees": 359.2470919365815},
      {"position": {"x": -7, "y": -1}, "is_angle_degrees": 5.583750819377806},
      {"position": {"x": -6, "y": -1}, "is_angle_degrees": 6.657386580779424},
      {"position": {"x": -5, "y": -1}, "is_angle_degrees": 8.194765793065857},
      {"position": {"x": -4, "y": -1}, "is_angle_degrees": 10.533521966139086},
      {"position": {"x": -7, "y": -2}, "is_angle_degrees": 12.029190703455825},
      {"position": {"x": -3, "y": -1}, "is_angle_degrees": 14.1293842757117},
      {"position": {"x": -5, "y": -2}, "is_angle_degrees": 17.15180613177795},
      {"position": {"x": -7, "y": -3}, "is_angle_degrees": 18.38586141682327},
      {"position": {"x": -2, "y": -1}, "is_angle_degrees": 21.533218589608754},
      {"position": {"x": -7, "y": -4}, "is_angle_degrees": 24.85722868386236},
      {"position": {"x": -5, "y": -3}, "is_angle_degrees": 26.132951041146743},
      {"position": {"x": -3, "y": -2}, "is_angle_degrees": 29.083106716121495},
      {"position": {"x": -7, "y": -5}, "is_angle_degrees": 31.335176634312912},
      {"position": {"x": -4, "y": -3}, "is_angle_degrees": 32.90572004903166},
      {"position": {"x": -5, "y": -4}, "is_angle_degrees": 35.04230063089045},
      {"position": {"x": -6, "y": -5}, "is_angle_degrees": 36.56495815001081},
      {"position": {"x": -7, "y": -6}, "is_angle_degrees": 37.641367945647694},
      {"position": {"x": -1, "y": -1}, "is_angle_degrees": 44.10648092942098},
      {"position": {"x": -6, "y": -7}, "is_angle_degrees": 50.4257931540619},
      {"position": {"x": -5, "y": -6}, "is_angle_degrees": 51.42986595566708},
      {"position": {"x": -4, "y": -5}, "is_angle_degrees": 53.045208939716304},
      {"position": {"x": -3, "y": -4}, "is_angle_degrees": 55.3785952140576},
      {"position": {"x": -5, "y": -7}, "is_angle_degrees": 56.97210076240979},
      {"position": {"x": -2, "y": -3}, "is_angle_degrees": 59.0277772496424},
      {"position": {"x": -3, "y": -5}, "is_angle_degrees": 61.98692046491022},
      {"position": {"x": -4, "y": -7}, "is_angle_degrees": 63.200057037078565},
      {"position": {"x": -1, "y": -2}, "is_angle_degrees": 66.45443779745786},
      {"position": {"x": -3, "y": -7}, "is_angle_degrees": 69.6810593257936},
      {"position": {"x": -2, "y": -5}, "is_angle_degrees": 71.02905235015835},
      {"position": {"x": -1, "y": -3}, "is_angle_degrees": 73.9306609828425},
      {"position": {"x": -2, "y": -7}, "is_angle_degrees": 76.01956852449159},
      {"position": {"x": -1, "y": -4}, "is_angle_degrees": 77.75407905008689},
      {"position": {"x": -1, "y": -5}, "is_angle_degrees": 79.84317544089502},
      {"position": {"x": -1, "y": -6}, "is_angle_degrees": 81.44750540034747},
      {"position": {"x": -1, "y": -7}, "is_angle_degrees": 82.48441966149063},
      {"position": {"x": 0, "y": -1}, "is_angle_degrees": 88.82084924914795},
      {"position": {"x": 1, "y": -7}, "is_angle_degrees": 95.48087356657864},
      {"position": {"x": 1, "y": -6}, "is_angle_degrees": 96.54992038988107},
      {"position": {"x": 1, "y": -5}, "is_angle_degrees": 98.11289746765112},
      {"position": {"x": 1, "y": -4}, "is_angle_degrees": 100.24309538286427},
      {"position": {"x": 2, "y": -7}, "is_angle_degrees": 101.93466864873331},
      {"position": {"x": 1, "y": -3}, "is_angle_degrees": 104.03069941818296},
      {"position": {"x": 2, "y": -5}, "is_angle_degrees": 107.0431309876588},
      {"position": {"x": 3, "y": -7}, "is_angle_degrees": 108.25850469340004},
      {"position": {"x": 1, "y": -2}, "is_angle_degrees": 111.2651354011189},
      {"position": {"x": 4, "y": -7}, "is_angle_degrees": 114.77329199070752},
      {"position": {"x": 3, "y": -5}, "is_angle_degrees": 116.02208051493466},
      {"position": {"x": 2, "y": -3}, "is_angle_degrees": 118.99584720269519},
      {"position": {"x": 5, "y": -7}, "is_angle_degrees": 121.07580718751679},
      {"position": {"x": 3, "y": -4}, "is_angle_degrees": 122.65259594809147},
      {"position": {"x": 4, "y": -5}, "is_angle_degrees": 124.97639050212183},
      {"position": {"x": 5, "y": -6}, "is_angle_degrees": 126.53381094328853},
      {"position": {"x": 6, "y": -7}, "is_angle_degrees": 127.58958447342077},
      {"position": {"x": 1, "y": -1}, "is_angle_degrees": 133.8884871937512},
      {"position": {"x": 7, "y": -6}, "is_angle_degrees": 140.40618862386683},
      {"position": {"x": 6, "y": -5}, "is_angle_degrees": 141.43491585363682},
      {"position": {"x": 5, "y": -4}, "is_angle_degrees": 143.05195045150174},
      {"position": {"x": 4, "y": -3}, "is_angle_degrees": 145.2018164968174},
      {"position": {"x": 7, "y": -5}, "is_angle_degrees": 146.8028510721},
      {"position": {"x": 3, "y": -2}, "is_angle_degrees": 149.05898456614378},
      {"position": {"x": 5, "y": -3}, "is_angle_degrees": 152.02329905173465},
      {"position": {"x": 7, "y": -4}, "is_angle_degrees": 153.23348339619272},
      {"position": {"x": 2, "y": -1}, "is_angle_degrees": 156.33104729251255},
      {"position": {"x": 7, "y": -3}, "is_angle_degrees": 159.75104398169702},
      {"position": {"x": 5, "y": -2}, "is_angle_degrees": 161.0587657039718},
      {"position": {"x": 3, "y": -1}, "is_angle_degrees": 164.00991249232308},
      {"position": {"x": 7, "y": -2}, "is_angle_degrees": 166.1164660790109},
      {"position": {"x": 4, "y": -1}, "is_angle_degrees": 167.682775417852},
      {"position": {"x": 5, "y": -1}, "is_angle_degrees": 169.96992076615828},
      {"position": {"x": 6, "y": -1}, "is_angle_degrees": 171.55428126467586},
      {"position": {"x": 7, "y": -1}, "is_angle_degrees": 172.59006393242916},
      {"position": {"x": 1, "y": 0}, "is_angle_degrees": 178.95137257594334},
      {"position": {"x": 7, "y": 1}, "is_angle_degrees": 185.49400008923277},
      {"position": {"x": 6, "y": 1}, "is_angle_degrees": 186.56836117350977},
      {"position": {"x": 5, "y": 1}, "is_angle_degrees": 187.9300317426681},
      {"position": {"x": 4, "y": 1}, "is_angle_degrees": 190.27825503884836},
      {"position": {"x": 7, "y": 2}, "is_angle_degrees": 191.7840335696231},
      {"position": {"x": 3, "y": 1}, "is_angle_degrees": 194.08236843131823},
      {"position": {"x": 5, "y": 2}, "is_angle_degrees": 197.10801089536818},
      {"position": {"x": 7, "y": 3}, "is_angle_degrees": 198.32978591770873},
      {"position": {"x": 2, "y": 1}, "is_angle_degrees": 201.34837967450477},
      {"position": {"x": 7, "y": 4}, "is_angle_degrees": 204.68342690581912},
      {"position": {"x": 5, "y": 3}, "is_angle_degrees": 206.12686466145837},
      {"position": {"x": 3, "y": 2}, "is_angle_degrees": 209.11278410253934},
      {"position": {"x": 7, "y": 5}, "is_angle_degrees": 211.2024912152823},
      {"position": {"x": 4, "y": 3}, "is_angle_degrees": 212.7840700125697},
      {"position": {"x": 5, "y": 4}, "is_angle_degrees": 215.11789214442754},
      {"position": {"x": 6, "y": 5}, "is_angle_degrees": 216.4656546258902},
      {"position": {"x": 7, "y": 6}, "is_angle_degrees": 217.7401159784581},
      {"position": {"x": 1, "y": 1}, "is_angle_degrees": 224.06029415911618},
      {"position": {"x": 6, "y": 7}, "is_angle_degrees": 230.59899290768948},
      {"position": {"x": 5, "y": 6}, "is_angle_degrees": 231.63202902665395},
      {"position": {"x": 4, "y": 5}, "is_angle_degrees": 233.05956483341595},
      {"position": {"x": 3, "y": 4}, "is_angle_degrees": 235.4078580477528},
      {"position": {"x": 5, "y": 7}, "is_angle_degrees": 237.01092029668504},
      {"position": {"x": 2, "y": 3}, "is_angle_degrees": 239.0810914782944},
      {"position": {"x": 3, "y": 5}, "is_angle_degrees": 242.06154579686975},
      {"position": {"x": 4, "y": 7}, "is_angle_degrees": 243.458939945989},
      {"position": {"x": 1, "y": 2}, "is_angle_degrees": 246.5550266072062},
      {"position": {"x": 3, "y": 7}, "is_angle_degrees": 249.81063685995144},
      {"position": {"x": 2, "y": 5}, "is_angle_degrees": 251.2929086467587},
      {"position": {"x": 1, "y": 3}, "is_angle_degrees": 254.25747844591407},
      {"position": {"x": 2, "y": 7}, "is_angle_degrees": 256.36643701873834},
      {"position": {"x": 1, "y": 4}, "is_angle_degrees": 257.93049314143923},
      {"position": {"x": 1, "y": 5}, "is_angle_degrees": 260.2222666479208},
      {"position": {"x": 1, "y": 6}, "is_angle_degrees": 261.64558064178766},
      {"position": {"x": 1, "y": 7}, "is_angle_degrees": 262.6893589833225},
      {"position": {"x": 0, "y": 1}, "is_angle_degrees": 269.2067515137963},
      {"position": {"x": -1, "y": 7}, "is_angle_degrees": 275.76357987864435},
      {"position": {"x": -1, "y": 6}, "is_angle_degrees": 276.8311077070858},
      {"position": {"x": -1, "y": 5}, "is_angle_degrees": 278.1953793514427},
      {"position": {"x": -1, "y": 4}, "is_angle_degrees": 280.5436627603342},
      {"position": {"x": -2, "y": 7}, "is_angle_degrees": 282.0452439502519},
      {"position": {"x": -1, "y": 3}, "is_angle_degrees": 284.15566721568814},
      {"position": {"x": -2, "y": 5}, "is_angle_degrees": 287.193447694994},
      {"position": {"x": -3, "y": 7}, "is_angle_degrees": 288.59009111734014},
      {"position": {"x": -1, "y": 2}, "is_angle_degrees": 291.5955702141729},
      {"position": {"x": -4, "y": 7}, "is_angle_degrees": 294.9375565331675},
      {"position": {"x": -3, "y": 5}, "is_angle_degrees": 296.3789823158821},
      {"position": {"x": -2, "y": 3}, "is_angle_degrees": 299.36160502431807},
      {"position": {"x": -5, "y": 7}, "is_angle_degrees": 301.44873487249106},
      {"position": {"x": -3, "y": 4}, "is_angle_degrees": 303.0252673720978},
      {"position": {"x": -4, "y": 5}, "is_angle_degrees": 305.3565562602753},
      {"position": {"x": -5, "y": 6}, "is_angle_degrees": 306.7036914313605},
      {"position": {"x": -6, "y": 7}, "is_angle_degrees": 307.77962966332586},
      {"position": {"x": -7, "y": 8}, "is_angle_degrees": 308.6738915769351},
      {"position": {"x": -1, "y": 1}, "is_angle_degrees": 314.2761363492796},
      {"position": {"x": -7, "y": 6}, "is_angle_degrees": 320.6239381851868},
      {"position": {"x": -6, "y": 5}, "is_angle_degrees": 321.82912665738695},
      {"position": {"x": -5, "y": 4}, "is_angle_degrees": 323.250910409203},
      {"position": {"x": -4, "y": 3}, "is_angle_degrees": 325.5943173425379},
      {"position": {"x": -7, "y": 5}, "is_angle_degrees": 327.1906454547702},
      {"position": {"x": -3, "y": 2}, "is_angle_degrees": 329.25077524207455},
      {"position": {"x": -5, "y": 3}, "is_angle_degrees": 332.22465069353456},
      {"position": {"x": -7, "y": 4}, "is_angle_degrees": 333.6155637127133},
      {"position": {"x": -2, "y": 1}, "is_angle_degrees": 336.6957117720198},
      {"position": {"x": -7, "y": 3}, "is_angle_degrees": 339.9435341962032},
      {"position": {"x": -5, "y": 2}, "is_angle_degrees": 341.28074605371154},
      {"position": {"x": -3, "y": 1}, "is_angle_degrees": 344.1963695911757},
      {"position": {"x": -7, "y": 2}, "is_angle_degrees": 346.4721339882767},
      {"position": {"x": -4, "y": 1}, "is_angle_degrees": 348.0262872881526},
      {"position": {"x": -5, "y": 1}, "is_angle_degrees": 350.30407438366234},
      {"position": {"x": -6, "y": 1}, "is_angle_degrees": 351.7208425501853},
      {"position": {"x": -7, "y": 1}, "is_angle_degrees": 352.7634952712645}
    ])
  }

  export class Service extends Process<void> {
    state = observe<{
      angle: number,
      spinning: boolean
    }>(null).equality((a, b) => a?.angle == b?.angle && a?.spinning == b?.spinning)

    closed = ewent<this>()

    last_read: CompassReader.AngleResult = null
    last_successful_angle: number = null

    ticks_since_stationary: number = 0

    constructor(private matched_ui: CapturedCompass,
                private show_overlay: boolean,
                private disable_calibration: boolean = false,
                private refind_after_close: boolean = false
    ) {
      super();

      this.asInterval(100)
    }

    private overlay: OverlayGeometry = new OverlayGeometry()

    async tick(): Promise<void> {
      if (this.refind_after_close && !this.matched_ui) {
        this.matched_ui = await CapturedCompass.find(CapturedImage.capture())
      }

      if (!this.matched_ui) return

      const reader = new CompassReader(this.matched_ui.recapture(), this.disable_calibration)

      this.overlay.clear()

      const read = this.last_read = reader.getAngle()

      if (read.type != "success") console.log(read)

      switch (read.type) {
        case "likely_closed":
          this.closed.trigger(this)

          if (this.refind_after_close) this.matched_ui = null

          break;
        case "likely_concealed":
          this.overlay.text("Concealed",
            Vector2.add(ScreenRectangle.center(reader.capture.body.screenRectangle()), {x: 5, y: 100}), {
              shadow: true,
              centered: true,
              width: 12,
              color: mixColor(128, 128, 128)
            })

          break;
        case "success":
          if (this.last_successful_angle == read.angle) {
            this.state.set({
              angle: read.angle,
              spinning: false
            })
            this.ticks_since_stationary = 0
          } else {
            this.ticks_since_stationary++

            if (this.ticks_since_stationary > 2) {
              this.state.set({
                angle: null,
                spinning: true
              })
            }
          }

          this.last_successful_angle = read.angle

          break;
      }

      if (this.state.value()) {
        let text: string = null

        const state = this.state.value()

        if (state.spinning) {
          text = "Spinning"
        } else if (state.angle != null) {
          text = `${radiansToDegrees(state.angle).toFixed(this.disable_calibration ? 3 : 2)}°`
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

      this.overlay?.clear()
      this.overlay?.render()
    }
  }

  export type CalibrationMode = keyof typeof calibration_tables

  export class CalibrationTool extends NisModal {
    private samples: AngularKeyframeFunction.Sample[] = []
    private reader: Service
    private layer: CalibrationTool.Layer

    handler: Alt1MainHotkeyEvent.Handler

    constructor(samples: AngularKeyframeFunction.Sample[] = []) {
      super({
        size: "fullscreen",
        fixed: true,
        disable_close_button: false
      });

      this.samples = lodash.cloneDeep(samples)

      this.handler = deps().app.main_hotkey.subscribe(0, (e) => {
        console.log("Hotkey in Calibration")
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
      if (this.reader.last_read.type == "success") {

        const entry = this.samples.find(s => Vector2.eq(s.position, this.layer.offset))

        if (entry) {
          entry.is_angle_degrees = radiansToDegrees(this.reader.last_read.angle)
        } else {
          this.samples.push({position: this.layer.offset, is_angle_degrees: radiansToDegrees(this.reader.last_read.angle)})
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

      for (let d = 1; d <= 100; d++) {
        for (let x = -d; x < d; x++) if (test({x: x, y: d})) return
        for (let y = d; y > -d; y--) if (test({x: d, y: y})) return
        for (let x = d; x > -d; x--) if (test({x: x, y: -d})) return
        for (let y = -d; y < d; y++) if (test({x: -d, y: y})) return
      }

      console.log("None found")

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
        console.log(`Setting ${Vector2.toString(offset)}`)

        this.offset = offset

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

        for (let i = 1; i <= 50; i++) {
          tilePolygon(Vector2.add(this.reference, Vector2.scale(i, this.offset))).addTo(this.overlay)
        }
      }
    }
  }
}