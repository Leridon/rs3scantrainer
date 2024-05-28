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
import Widget from "../../../../lib/ui/Widget";
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
    if (circle_sampled_pixels.length > 10) return {type: "likely_concealed", details: `Too many pixels while sampling the circle (${circle_sampled_pixels.length} > 10)`}

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

  export const debug_overlay = new OverlayGeometry()

  export const calibration_tables = {
    "off": AngularKeyframeFunction.fromCalibrationSamples([
      {"position": {"x": -1, "y": 0}, "is_angle_degrees": 359.2470919365815},
      {"position": {"x": -12, "y": -1}, "is_angle_degrees": 2.9485817574645634},
      {"position": {"x": -11, "y": -1}, "is_angle_degrees": 3.2898928518395834},
      {"position": {"x": -10, "y": -1}, "is_angle_degrees": 3.565661261549674},
      {"position": {"x": -9, "y": -1}, "is_angle_degrees": 4.197183547149741},
      {"position": {"x": -8, "y": -1}, "is_angle_degrees": 4.930027412370822},
      {"position": {"x": -7, "y": -1}, "is_angle_degrees": 5.583750819377806},
      {"position": {"x": -6, "y": -1}, "is_angle_degrees": 6.657386580779424},
      {"position": {"x": -11, "y": -2}, "is_angle_degrees": 7.3174870733960455},
      {"position": {"x": -5, "y": -1}, "is_angle_degrees": 8.194765793065857},
      {"position": {"x": -9, "y": -2}, "is_angle_degrees": 9.264692944323741},
      {"position": {"x": -4, "y": -1}, "is_angle_degrees": 10.533521966139086},
      {"position": {"x": -11, "y": -3}, "is_angle_degrees": 11.497405744388702},
      {"position": {"x": -7, "y": -2}, "is_angle_degrees": 12.029190703455825},
      {"position": {"x": -10, "y": -3}, "is_angle_degrees": 12.57361635726584},
      {"position": {"x": -3, "y": -1}, "is_angle_degrees": 14.1293842757117},
      {"position": {"x": -11, "y": -4}, "is_angle_degrees": 15.586489878205235},
      {"position": {"x": -8, "y": -3}, "is_angle_degrees": 16.10108454815385},
      {"position": {"x": -5, "y": -2}, "is_angle_degrees": 17.15180613177795},
      {"position": {"x": -12, "y": -5}, "is_angle_degrees": 17.844925373917302},
      {"position": {"x": -7, "y": -3}, "is_angle_degrees": 18.38586141682327},
      {"position": {"x": -9, "y": -4}, "is_angle_degrees": 19.06045963063065},
      {"position": {"x": -11, "y": -5}, "is_angle_degrees": 19.584964428125726},
      {"position": {"x": -2, "y": -1}, "is_angle_degrees": 21.533218589608754},
      {"position": {"x": -11, "y": -6}, "is_angle_degrees": 23.616045747254713},
      {"position": {"x": -9, "y": -5}, "is_angle_degrees": 24.130586058211986},
      {"position": {"x": -7, "y": -4}, "is_angle_degrees": 24.85722868386236},
      {"position": {"x": -12, "y": -7}, "is_angle_degrees": 25.386403666294264},
      {"position": {"x": -5, "y": -3}, "is_angle_degrees": 26.132951041146743},
      {"position": {"x": -8, "y": -5}, "is_angle_degrees": 27.303384759785377},
      {"position": {"x": -11, "y": -7}, "is_angle_degrees": 27.830867855037564},
      {"position": {"x": -3, "y": -2}, "is_angle_degrees": 29.083106716121495},
      {"position": {"x": -10, "y": -7}, "is_angle_degrees": 30.708220900476505},
      {"position": {"x": -7, "y": -5}, "is_angle_degrees": 31.335176634312912},
      {"position": {"x": -11, "y": -8}, "is_angle_degrees": 31.882989339192584},
      {"position": {"x": -4, "y": -3}, "is_angle_degrees": 32.90572004903166},
      {"position": {"x": -9, "y": -7}, "is_angle_degrees": 34.11405386788477},
      {"position": {"x": -5, "y": -4}, "is_angle_degrees": 35.04230063089045},
      {"position": {"x": -11, "y": -9}, "is_angle_degrees": 35.885890602679886},
      {"position": {"x": -6, "y": -5}, "is_angle_degrees": 36.56495815001081},
      {"position": {"x": -7, "y": -6}, "is_angle_degrees": 37.641367945647694},
      {"position": {"x": -8, "y": -7}, "is_angle_degrees": 38.52948337569411},
      {"position": {"x": -9, "y": -8}, "is_angle_degrees": 39.03527081463336},
      {"position": {"x": -10, "y": -9}, "is_angle_degrees": 39.58609129837786},
      {"position": {"x": -11, "y": -10}, "is_angle_degrees": 39.93925563959952},
      {"position": {"x": -12, "y": -11}, "is_angle_degrees": 40.25111466018352},
      {"position": {"y": -1, "x": -1}, "is_angle_degrees": 44.10648092942098},
      {"position": {"x": -11, "y": -12}, "is_angle_degrees": 47.81433954704945},
      {"position": {"x": -10, "y": -11}, "is_angle_degrees": 48.098936198764854},
      {"position": {"x": -9, "y": -10}, "is_angle_degrees": 48.55966474182921},
      {"position": {"x": -8, "y": -9}, "is_angle_degrees": 48.94790787502413},
      {"position": {"x": -7, "y": -8}, "is_angle_degrees": 49.69281369798007},
      {"position": {"x": -6, "y": -7}, "is_angle_degrees": 50.4257931540619},
      {"position": {"x": -5, "y": -6}, "is_angle_degrees": 51.42986595566708},
      {"position": {"x": -9, "y": -11}, "is_angle_degrees": 52.16553898630029},
      {"position": {"x": -4, "y": -5}, "is_angle_degrees": 53.045208939716304},
      {"position": {"x": -7, "y": -9}, "is_angle_degrees": 54.1397756051659},
      {"position": {"x": -3, "y": -4}, "is_angle_degrees": 55.3785952140576},
      {"position": {"x": -8, "y": -11}, "is_angle_degrees": 56.25074774654213},
      {"position": {"x": -5, "y": -7}, "is_angle_degrees": 56.97210076240979},
      {"position": {"x": -7, "y": -10}, "is_angle_degrees": 57.43903182580188},
      {"position": {"x": -2, "y": -3}, "is_angle_degrees": 59.0277772496424},
      {"position": {"x": -7, "y": -11}, "is_angle_degrees": 60.42610876344035},
      {"position": {"x": -5, "y": -8}, "is_angle_degrees": 60.9321342365702},
      {"position": {"x": -3, "y": -5}, "is_angle_degrees": 61.98692046491022},
      {"position": {"x": -7, "y": -12}, "is_angle_degrees": 62.683360397318786},
      {"position": {"x": -4, "y": -7}, "is_angle_degrees": 63.200057037078565},
      {"position": {"x": -5, "y": -9}, "is_angle_degrees": 63.93058926596792},
      {"position": {"x": -6, "y": -11}, "is_angle_degrees": 64.44339794089848},
      {"position": {"x": -1, "y": -2}, "is_angle_degrees": 66.45443779745786},
      {"position": {"x": -5, "y": -11}, "is_angle_degrees": 68.4634290271509},
      {"position": {"x": -4, "y": -9}, "is_angle_degrees": 68.98765290043875},
      {"position": {"x": -3, "y": -7}, "is_angle_degrees": 69.6810593257936},
      {"position": {"x": -5, "y": -12}, "is_angle_degrees": 70.14147722790462},
      {"position": {"x": -2, "y": -5}, "is_angle_degrees": 71.02905235015835},
      {"position": {"x": -3, "y": -8}, "is_angle_degrees": 72.17183797485148},
      {"position": {"x": -4, "y": -11}, "is_angle_degrees": 72.48326691567533},
      {"position": {"x": -1, "y": -3}, "is_angle_degrees": 73.9306609828425},
      {"position": {"x": -3, "y": -10}, "is_angle_degrees": 75.45176807641026},
      {"position": {"x": -2, "y": -7}, "is_angle_degrees": 76.01956852449159},
      {"position": {"x": -3, "y": -11}, "is_angle_degrees": 76.70478267519455},
      {"position": {"x": -1, "y": -4}, "is_angle_degrees": 77.75407905008689},
      {"position": {"x": -2, "y": -9}, "is_angle_degrees": 78.9689078283724},
      {"position": {"x": -1, "y": -5}, "is_angle_degrees": 79.84317544089502},
      {"position": {"x": -2, "y": -11}, "is_angle_degrees": 80.73028859536132},
      {"position": {"x": -1, "y": -6}, "is_angle_degrees": 81.44750540034747},
      {"position": {"x": -1, "y": -7}, "is_angle_degrees": 82.48441966149063},
      {"position": {"x": -1, "y": -8}, "is_angle_degrees": 83.39556934159475},
      {"position": {"x": -1, "y": -9}, "is_angle_degrees": 83.8806794659299},
      {"position": {"x": -1, "y": -10}, "is_angle_degrees": 84.4485187873784},
      {"position": {"x": -1, "y": -11}, "is_angle_degrees": 84.72295196347571},
      {"position": {"x": -1, "y": -12}, "is_angle_degrees": 85.17968705868408},
      {"position": {"x": 0, "y": -1}, "is_angle_degrees": 88.82084924914795},
      {"position": {"x": 1, "y": -12}, "is_angle_degrees": 92.83732966776756},
      {"position": {"x": 1, "y": -11}, "is_angle_degrees": 93.09312957937473},
      {"position": {"x": 1, "y": -10}, "is_angle_degrees": 93.62548982968671},
      {"position": {"x": 1, "y": -9}, "is_angle_degrees": 94.08658913208157},
      {"position": {"x": 1, "y": -8}, "is_angle_degrees": 94.63712473485539},
      {"position": {"x": 1, "y": -7}, "is_angle_degrees": 95.48087356657864},
      {"position": {"x": 1, "y": -6}, "is_angle_degrees": 96.54992038988107},
      {"position": {"x": 2, "y": -11}, "is_angle_degrees": 97.14652695523803},
      {"position": {"x": 1, "y": -5}, "is_angle_degrees": 98.11289746765112},
      {"position": {"x": 2, "y": -9}, "is_angle_degrees": 98.97412493826651},
      {"position": {"x": 1, "y": -4}, "is_angle_degrees": 100.24309538286427},
      {"position": {"x": 3, "y": -11}, "is_angle_degrees": 101.21152803590327},
      {"position": {"x": 2, "y": -7}, "is_angle_degrees": 101.93466864873331},
      {"position": {"x": 3, "y": -10}, "is_angle_degrees": 102.47931036155376},
      {"position": {"x": 1, "y": -3}, "is_angle_degrees": 104.03069941818296},
      {"position": {"x": 4, "y": -11}, "is_angle_degrees": 105.47562202255196},
      {"position": {"x": 3, "y": -8}, "is_angle_degrees": 105.81737240950481},
      {"position": {"x": 2, "y": -5}, "is_angle_degrees": 107.0431309876588},
      {"position": {"x": 5, "y": -12}, "is_angle_degrees": 107.73980529167865},
      {"position": {"x": 3, "y": -7}, "is_angle_degrees": 108.25850469340004},
      {"position": {"x": 4, "y": -9}, "is_angle_degrees": 108.94458725340509},
      {"position": {"x": 5, "y": -11}, "is_angle_degrees": 109.49364841981405},
      {"position": {"x": 1, "y": -2}, "is_angle_degrees": 111.2651354011189},
      {"position": {"x": 6, "y": -11}, "is_angle_degrees": 113.50143090974457},
      {"position": {"x": 5, "y": -9}, "is_angle_degrees": 114.04247186149111},
      {"position": {"x": 4, "y": -7}, "is_angle_degrees": 114.77329199070752},
      {"position": {"x": 7, "y": -12}, "is_angle_degrees": 115.23089045151022},
      {"position": {"x": 3, "y": -5}, "is_angle_degrees": 116.02208051493466},
      {"position": {"x": 5, "y": -8}, "is_angle_degrees": 117.03723603557805},
      {"position": {"x": 7, "y": -11}, "is_angle_degrees": 117.5654195389546},
      {"position": {"x": 2, "y": -3}, "is_angle_degrees": 118.99584720269519},
      {"position": {"x": 7, "y": -10}, "is_angle_degrees": 120.57362666443791},
      {"position": {"x": 5, "y": -7}, "is_angle_degrees": 121.07580718751679},
      {"position": {"x": 8, "y": -11}, "is_angle_degrees": 121.78296722022293},
      {"position": {"x": 3, "y": -4}, "is_angle_degrees": 122.65259594809147},
      {"position": {"x": 7, "y": -9}, "is_angle_degrees": 123.86624013116644},
      {"position": {"x": 4, "y": -5}, "is_angle_degrees": 124.97639050212183},
      {"position": {"x": 9, "y": -11}, "is_angle_degrees": 125.84484382816369},
      {"position": {"x": 5, "y": -6}, "is_angle_degrees": 126.53381094328853},
      {"position": {"x": 6, "y": -7}, "is_angle_degrees": 127.58958447342077},
      {"position": {"x": 7, "y": -8}, "is_angle_degrees": 128.29293253139812},
      {"position": {"x": 8, "y": -9}, "is_angle_degrees": 128.96435257589965},
      {"position": {"x": 9, "y": -10}, "is_angle_degrees": 129.5025357292532},
      {"position": {"x": 10, "y": -11}, "is_angle_degrees": 129.888980501012},
      {"position": {"x": 11, "y": -12}, "is_angle_degrees": 130.23454743250326},
      {"position": {"x": 1, "y": -1}, "is_angle_degrees": 133.8884871937512},
      {"position": {"x": 12, "y": -11}, "is_angle_degrees": 137.77693618582614},
      {"position": {"x": 11, "y": -10}, "is_angle_degrees": 138.21909622562737},
      {"position": {"x": 10, "y": -9}, "is_angle_degrees": 138.50562173683895},
      {"position": {"x": 9, "y": -8}, "is_angle_degrees": 139.07423775162258},
      {"position": {"x": 8, "y": -7}, "is_angle_degrees": 139.4959684785595},
      {"position": {"x": 7, "y": -6}, "is_angle_degrees": 140.40618862386683},
      {"position": {"x": 6, "y": -5}, "is_angle_degrees": 141.43491585363682},
      {"position": {"x": 11, "y": -9}, "is_angle_degrees": 142.13460822689953},
      {"position": {"x": 5, "y": -4}, "is_angle_degrees": 143.05195045150174},
      {"position": {"x": 9, "y": -7}, "is_angle_degrees": 143.96072308795902},
      {"position": {"x": 4, "y": -3}, "is_angle_degrees": 145.2018164968174},
      {"position": {"x": 11, "y": -8}, "is_angle_degrees": 146.2658784655469},
      {"position": {"x": 7, "y": -5}, "is_angle_degrees": 146.8028510721},
      {"position": {"x": 10, "y": -7}, "is_angle_degrees": 147.44358469268957},
      {"position": {"x": 3, "y": -2}, "is_angle_degrees": 149.05898456614378},
      {"position": {"x": 11, "y": -7}, "is_angle_degrees": 150.2735641231336},
      {"position": {"x": 8, "y": -5}, "is_angle_degrees": 150.77859154517628},
      {"position": {"x": 5, "y": -3}, "is_angle_degrees": 152.02329905173465},
      {"position": {"x": 12, "y": -7}, "is_angle_degrees": 152.75315437041036},
      {"position": {"x": 7, "y": -4}, "is_angle_degrees": 153.23348339619272},
      {"position": {"x": 9, "y": -5}, "is_angle_degrees": 153.98200169824798},
      {"position": {"x": 11, "y": -6}, "is_angle_degrees": 154.4756939500076},
      {"position": {"x": 2, "y": -1}, "is_angle_degrees": 156.33104729251255},
      {"position": {"x": 11, "y": -5}, "is_angle_degrees": 158.51495936027126},
      {"position": {"x": 9, "y": -4}, "is_angle_degrees": 159.0462465046658},
      {"position": {"x": 7, "y": -3}, "is_angle_degrees": 159.75104398169702},
      {"position": {"x": 12, "y": -5}, "is_angle_degrees": 160.20440594372408},
      {"position": {"x": 5, "y": -2}, "is_angle_degrees": 161.0587657039718},
      {"position": {"x": 8, "y": -3}, "is_angle_degrees": 162.07044878772945},
      {"position": {"x": 11, "y": -4}, "is_angle_degrees": 162.57158015815804},
      {"position": {"x": 3, "y": -1}, "is_angle_degrees": 164.00991249232308},
      {"position": {"x": 10, "y": -3}, "is_angle_degrees": 165.56399915210878},
      {"position": {"x": 7, "y": -2}, "is_angle_degrees": 166.1164660790109},
      {"position": {"x": 11, "y": -3}, "is_angle_degrees": 166.62594180207117},
      {"position": {"x": 4, "y": -1}, "is_angle_degrees": 167.682775417852},
      {"position": {"x": 9, "y": -2}, "is_angle_degrees": 168.9026855769633},
      {"position": {"x": 5, "y": -1}, "is_angle_degrees": 169.96992076615828},
      {"position": {"x": 11, "y": -2}, "is_angle_degrees": 170.79907659740638},
      {"position": {"x": 6, "y": -1}, "is_angle_degrees": 171.55428126467586},
      {"position": {"x": 7, "y": -1}, "is_angle_degrees": 172.59006393242916},
      {"position": {"x": 8, "y": -1}, "is_angle_degrees": 173.3525140441765},
      {"position": {"x": 9, "y": -1}, "is_angle_degrees": 174.0009348126906},
      {"position": {"x": 10, "y": -1}, "is_angle_degrees": 174.56935758921202},
      {"position": {"x": 11, "y": -1}, "is_angle_degrees": 174.8483370267756},
      {"position": {"x": 12, "y": -1}, "is_angle_degrees": 175.23780654390896},
      {"position": {"x": 1, "y": 0}, "is_angle_degrees": 178.95137257594334},
      {"position": {"x": 12, "y": 1}, "is_angle_degrees": 182.83873504910926},
      {"position": {"x": 11, "y": 1}, "is_angle_degrees": 183.00643559597415},
      {"position": {"x": 10, "y": 1}, "is_angle_degrees": 183.63348155788054},
      {"position": {"x": 9, "y": 1}, "is_angle_degrees": 184.09306358553195},
      {"position": {"x": 8, "y": 1}, "is_angle_degrees": 184.64585265572452},
      {"position": {"x": 7, "y": 1}, "is_angle_degrees": 185.49400008923277},
      {"position": {"x": 6, "y": 1}, "is_angle_degrees": 186.56836117350977},
      {"position": {"x": 11, "y": 2}, "is_angle_degrees": 187.17152260182664},
      {"position": {"x": 5, "y": 1}, "is_angle_degrees": 187.9300317426681},
      {"position": {"x": 9, "y": 2}, "is_angle_degrees": 189.00373261072923},
      {"position": {"x": 4, "y": 1}, "is_angle_degrees": 190.27825503884836},
      {"position": {"x": 11, "y": 3}, "is_angle_degrees": 191.25092403556343},
      {"position": {"x": 7, "y": 2}, "is_angle_degrees": 191.7840335696231},
      {"position": {"x": 10, "y": 3}, "is_angle_degrees": 192.5240348403446},
      {"position": {"x": 3, "y": 1}, "is_angle_degrees": 194.08236843131823},
      {"position": {"x": 11, "y": 4}, "is_angle_degrees": 195.3617671246671},
      {"position": {"x": 8, "y": 3}, "is_angle_degrees": 195.87739169061956},
      {"position": {"x": 5, "y": 2}, "is_angle_degrees": 197.10801089536818},
      {"position": {"x": 12, "y": 5}, "is_angle_degrees": 197.809096432055},
      {"position": {"x": 7, "y": 3}, "is_angle_degrees": 198.32978591770873},
      {"position": {"x": 9, "y": 4}, "is_angle_degrees": 199.0177733098354},
      {"position": {"x": 11, "y": 5}, "is_angle_degrees": 199.5693205400681},
      {"position": {"x": 2, "y": 1}, "is_angle_degrees": 201.34837967450477},
      {"position": {"x": 11, "y": 6}, "is_angle_degrees": 203.59532166284924},
      {"position": {"x": 9, "y": 5}, "is_angle_degrees": 203.95689422929794},
      {"position": {"x": 7, "y": 4}, "is_angle_degrees": 204.68342690581912},
      {"position": {"x": 12, "y": 7}, "is_angle_degrees": 205.2167401926206},
      {"position": {"x": 5, "y": 3}, "is_angle_degrees": 206.12686466145837},
      {"position": {"x": 8, "y": 5}, "is_angle_degrees": 207.1463291166935},
      {"position": {"x": 11, "y": 7}, "is_angle_degrees": 207.67638497114922},
      {"position": {"x": 3, "y": 2}, "is_angle_degrees": 209.11278410253934},
      {"position": {"x": 10, "y": 7}, "is_angle_degrees": 210.57127070327275},
      {"position": {"x": 7, "y": 5}, "is_angle_degrees": 211.2024912152823},
      {"position": {"x": 11, "y": 8}, "is_angle_degrees": 211.75485316837873},
      {"position": {"x": 4, "y": 3}, "is_angle_degrees": 212.7840700125697},
      {"position": {"x": 9, "y": 7}, "is_angle_degrees": 214.00154232044983},
      {"position": {"x": 5, "y": 4}, "is_angle_degrees": 215.11789214442754},
      {"position": {"x": 11, "y": 9}, "is_angle_degrees": 215.98550349961664},
      {"position": {"x": 6, "y": 5}, "is_angle_degrees": 216.4656546258902},
      {"position": {"x": 7, "y": 6}, "is_angle_degrees": 217.7401159784581},
      {"position": {"x": 8, "y": 7}, "is_angle_degrees": 218.4445488022606},
      {"position": {"x": 9, "y": 8}, "is_angle_degrees": 219.11865667355912},
      {"position": {"x": 10, "y": 9}, "is_angle_degrees": 219.6573078047522},
      {"position": {"x": 11, "y": 10}, "is_angle_degrees": 220.0492879414933},
      {"position": {"x": 12, "y": 11}, "is_angle_degrees": 220.39254143392256},
      {"position": {"y": 1, "x": 1}, "is_angle_degrees": 224.06029415911618},
      {"position": {"x": 11, "y": 12}, "is_angle_degrees": 227.79132284057724},
      {"position": {"x": 10, "y": 11}, "is_angle_degrees": 228.0798420631781},
      {"position": {"x": 9, "y": 10}, "is_angle_degrees": 228.6980818419115},
      {"position": {"x": 8, "y": 9}, "is_angle_degrees": 229.2679263345848},
      {"position": {"x": 7, "y": 8}, "is_angle_degrees": 229.68390830427361},
      {"position": {"x": 6, "y": 7}, "is_angle_degrees": 230.59899290768948},
      {"position": {"x": 5, "y": 6}, "is_angle_degrees": 231.63202902665395},
      {"position": {"x": 9, "y": 11}, "is_angle_degrees": 232.33528726002115},
      {"position": {"x": 4, "y": 5}, "is_angle_degrees": 233.05956483341595},
      {"position": {"x": 7, "y": 9}, "is_angle_degrees": 234.1610097996749},
      {"position": {"x": 3, "y": 4}, "is_angle_degrees": 235.4078580477528},
      {"position": {"x": 8, "y": 11}, "is_angle_degrees": 236.47544354281524},
      {"position": {"x": 5, "y": 7}, "is_angle_degrees": 237.01092029668504},
      {"position": {"x": 7, "y": 10}, "is_angle_degrees": 237.6552021937862},
      {"position": {"x": 2, "y": 3}, "is_angle_degrees": 239.0810914782944},
      {"position": {"x": 7, "y": 11}, "is_angle_degrees": 240.4886801271932},
      {"position": {"x": 5, "y": 8}, "is_angle_degrees": 241.000360845699},
      {"position": {"x": 3, "y": 5}, "is_angle_degrees": 242.06154579686975},
      {"position": {"x": 7, "y": 12}, "is_angle_degrees": 242.97541303648887},
      {"position": {"x": 4, "y": 7}, "is_angle_degrees": 243.458939945989},
      {"position": {"x": 5, "y": 9}, "is_angle_degrees": 244.20847343142924},
      {"position": {"x": 6, "y": 11}, "is_angle_degrees": 244.53348972415785},
      {"position": {"x": 1, "y": 2}, "is_angle_degrees": 246.5550266072062},
      {"position": {"x": 5, "y": 11}, "is_angle_degrees": 248.75396011844765},
      {"position": {"x": 4, "y": 9}, "is_angle_degrees": 249.1102841387626},
      {"position": {"x": 3, "y": 7}, "is_angle_degrees": 249.81063685995144},
      {"position": {"x": 5, "y": 12}, "is_angle_degrees": 250.27564804823248},
      {"position": {"x": 2, "y": 5}, "is_angle_degrees": 251.2929086467587},
      {"position": {"x": 3, "y": 8}, "is_angle_degrees": 252.31872501834616},
      {"position": {"x": 4, "y": 11}, "is_angle_degrees": 252.81713183761596},
      {"position": {"x": 1, "y": 3}, "is_angle_degrees": 254.25747844591407},
      {"position": {"x": 3, "y": 10}, "is_angle_degrees": 255.61146481000418},
      {"position": {"x": 2, "y": 7}, "is_angle_degrees": 256.36643701873834},
      {"position": {"x": 3, "y": 11}, "is_angle_degrees": 256.8747564437971},
      {"position": {"x": 1, "y": 4}, "is_angle_degrees": 257.93049314143923},
      {"position": {"x": 2, "y": 9}, "is_angle_degrees": 259.1583150265224},
      {"position": {"x": 1, "y": 5}, "is_angle_degrees": 260.2222666479208},
      {"position": {"x": 2, "y": 11}, "is_angle_degrees": 260.93529610006897},
      {"position": {"x": 1, "y": 6}, "is_angle_degrees": 261.64558064178766},
      {"position": {"x": 1, "y": 7}, "is_angle_degrees": 262.6893589833225},
      {"position": {"x": 1, "y": 8}, "is_angle_degrees": 263.6072840560789},
      {"position": {"x": 1, "y": 9}, "is_angle_degrees": 264.2611621429813},
      {"position": {"x": 1, "y": 10}, "is_angle_degrees": 264.6619856180908},
      {"position": {"x": 1, "y": 11}, "is_angle_degrees": 265.101322486212},
      {"position": {"x": 1, "y": 12}, "is_angle_degrees": 265.4965978618829},
      {"position": {"x": 0, "y": 1}, "is_angle_degrees": 269.2067515137963},
      {"position": {"x": -1, "y": 12}, "is_angle_degrees": 272.924450053292},
      {"position": {"x": -1, "y": 11}, "is_angle_degrees": 273.2636318757497},
      {"position": {"x": -1, "y": 10}, "is_angle_degrees": 273.9088328635495},
      {"position": {"x": -1, "y": 9}, "is_angle_degrees": 274.1777723104715},
      {"position": {"x": -1, "y": 8}, "is_angle_degrees": 274.9132857401354},
      {"position": {"x": -1, "y": 7}, "is_angle_degrees": 275.76357987864435},
      {"position": {"x": -1, "y": 6}, "is_angle_degrees": 276.8311077070858},
      {"position": {"x": -2, "y": 11}, "is_angle_degrees": 277.44461022475997},
      {"position": {"x": -1, "y": 5}, "is_angle_degrees": 278.1953793514427},
      {"position": {"x": -2, "y": 9}, "is_angle_degrees": 279.2689590371034},
      {"position": {"x": -1, "y": 4}, "is_angle_degrees": 280.5436627603342},
      {"position": {"x": -3, "y": 11}, "is_angle_degrees": 281.5113668695883},
      {"position": {"x": -2, "y": 7}, "is_angle_degrees": 282.0452439502519},
      {"position": {"x": -3, "y": 10}, "is_angle_degrees": 282.78733311029464},
      {"position": {"x": -1, "y": 3}, "is_angle_degrees": 284.15566721568814},
      {"position": {"x": -4, "y": 11}, "is_angle_degrees": 285.6201392805741},
      {"position": {"x": -3, "y": 8}, "is_angle_degrees": 286.13828635389973},
      {"position": {"x": -2, "y": 5}, "is_angle_degrees": 287.193447694994},
      {"position": {"x": -5, "y": 12}, "is_angle_degrees": 288.0740418580145},
      {"position": {"x": -3, "y": 7}, "is_angle_degrees": 288.59009111734014},
      {"position": {"x": -4, "y": 9}, "is_angle_degrees": 289.27557328374576},
      {"position": {"x": -5, "y": 11}, "is_angle_degrees": 289.63892200074946},
      {"position": {"x": -1, "y": 2}, "is_angle_degrees": 291.5955702141729},
      {"position": {"x": -6, "y": 11}, "is_angle_degrees": 293.84816836180477},
      {"position": {"x": -5, "y": 9}, "is_angle_degrees": 294.20591563301224},
      {"position": {"x": -4, "y": 7}, "is_angle_degrees": 294.9375565331675},
      {"position": {"x": -7, "y": 12}, "is_angle_degrees": 295.46859551977917},
      {"position": {"x": -3, "y": 5}, "is_angle_degrees": 296.3789823158821},
      {"position": {"x": -5, "y": 8}, "is_angle_degrees": 297.39636312556894},
      {"position": {"x": -7, "y": 11}, "is_angle_degrees": 297.92611611010136},
      {"position": {"x": -2, "y": 3}, "is_angle_degrees": 299.36160502431807},
      {"position": {"x": -7, "y": 10}, "is_angle_degrees": 300.81957838745166},
      {"position": {"x": -5, "y": 7}, "is_angle_degrees": 301.44873487249106},
      {"position": {"x": -8, "y": 11}, "is_angle_degrees": 301.9971283417191},
      {"position": {"x": -3, "y": 4}, "is_angle_degrees": 303.0252673720978},
      {"position": {"x": -7, "y": 9}, "is_angle_degrees": 304.23839346393686},
      {"position": {"x": -4, "y": 5}, "is_angle_degrees": 305.3565562602753},
      {"position": {"x": -9, "y": 11}, "is_angle_degrees": 306.0227704494913},
      {"position": {"x": -5, "y": 6}, "is_angle_degrees": 306.7036914313605},
      {"position": {"x": -6, "y": 7}, "is_angle_degrees": 307.77962966332586},
      {"position": {"x": -7, "y": 8}, "is_angle_degrees": 308.6738915769351},
      {"position": {"x": -8, "y": 9}, "is_angle_degrees": 309.183065271818},
      {"position": {"x": -9, "y": 10}, "is_angle_degrees": 309.73715526258775},
      {"position": {"x": -10, "y": 11}, "is_angle_degrees": 310.2801885926258},
      {"position": {"x": -11, "y": 12}, "is_angle_degrees": 310.61619965051375},
      {"position": {"x": -1, "y": 1}, "is_angle_degrees": 314.2761363492796},
      {"position": {"x": -12, "y": 11}, "is_angle_degrees": 317.99818109879055},
      {"position": {"x": -11, "y": 10}, "is_angle_degrees": 318.2850226019927},
      {"position": {"x": -10, "y": 9}, "is_angle_degrees": 318.75533039525806},
      {"position": {"x": -9, "y": 8}, "is_angle_degrees": 319.1349512041944},
      {"position": {"x": -8, "y": 7}, "is_angle_degrees": 319.88511803569315},
      {"position": {"x": -7, "y": 6}, "is_angle_degrees": 320.6239381851868},
      {"position": {"x": -6, "y": 5}, "is_angle_degrees": 321.82912665738695},
      {"position": {"x": -11, "y": 9}, "is_angle_degrees": 322.37124283171005},
      {"position": {"x": -5, "y": 4}, "is_angle_degrees": 323.250910409203},
      {"position": {"x": -9, "y": 7}, "is_angle_degrees": 324.34880493285954},
      {"position": {"x": -4, "y": 3}, "is_angle_degrees": 325.5943173425379},
      {"position": {"x": -11, "y": 8}, "is_angle_degrees": 326.6585289913484},
      {"position": {"x": -7, "y": 5}, "is_angle_degrees": 327.1906454547702},
      {"position": {"x": -10, "y": 7}, "is_angle_degrees": 327.8320892484853},
      {"position": {"x": -3, "y": 2}, "is_angle_degrees": 329.25077524207455},
      {"position": {"x": -11, "y": 7}, "is_angle_degrees": 330.6539263730051},
      {"position": {"x": -8, "y": 5}, "is_angle_degrees": 331.1669201117699},
      {"position": {"x": -5, "y": 3}, "is_angle_degrees": 332.22465069353456},
      {"position": {"x": -12, "y": 7}, "is_angle_degrees": 333.13253005751966},
      {"position": {"x": -7, "y": 4}, "is_angle_degrees": 333.6155637127133},
      {"position": {"x": -9, "y": 5}, "is_angle_degrees": 334.36162018150486},
      {"position": {"x": -11, "y": 6}, "is_angle_degrees": 334.6854175561626},
      {"position": {"x": -2, "y": 1}, "is_angle_degrees": 336.6957117720198},
      {"position": {"x": -11, "y": 5}, "is_angle_degrees": 338.7174840924177},
      {"position": {"x": -9, "y": 4}, "is_angle_degrees": 339.24465013850033},
      {"position": {"x": -7, "y": 3}, "is_angle_degrees": 339.9435341962032},
      {"position": {"x": -12, "y": 5}, "is_angle_degrees": 340.40609742432713},
      {"position": {"x": -5, "y": 2}, "is_angle_degrees": 341.28074605371154},
      {"position": {"x": -8, "y": 3}, "is_angle_degrees": 342.4417926905862},
      {"position": {"x": -11, "y": 4}, "is_angle_degrees": 342.93739382924537},
      {"position": {"x": -3, "y": 1}, "is_angle_degrees": 344.1963695911757},
      {"position": {"x": -10, "y": 3}, "is_angle_degrees": 345.7190947414859},
      {"position": {"x": -7, "y": 2}, "is_angle_degrees": 346.4721339882767},
      {"position": {"x": -11, "y": 3}, "is_angle_degrees": 346.9777161775668},
      {"position": {"x": -4, "y": 1}, "is_angle_degrees": 348.0262872881526},
      {"position": {"x": -9, "y": 2}, "is_angle_degrees": 349.2483022967466},
      {"position": {"x": -5, "y": 1}, "is_angle_degrees": 350.30407438366234},
      {"position": {"x": -11, "y": 2}, "is_angle_degrees": 351.01685957262094},
      {"position": {"x": -6, "y": 1}, "is_angle_degrees": 351.7208425501853},
      {"position": {"x": -7, "y": 1}, "is_angle_degrees": 352.7634952712645},
      {"position": {"x": -8, "y": 1}, "is_angle_degrees": 353.674703977298},
      {"position": {"x": -9, "y": 1}, "is_angle_degrees": 354.1643672770664},
      {"position": {"x": -10, "y": 1}, "is_angle_degrees": 354.72414730106465},
      {"position": {"x": -11, "y": 1}, "is_angle_degrees": 355.16162805417065},
      {"position": {"x": -12, "y": 1}, "is_angle_degrees": 355.4703423149864}
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

      this.overlay?.clear()
      this.overlay?.render()
    }
  }

  const WIP = [
    {"position": {"x": -1, "y": 0}, "is_angle_degrees": 359.2470919365815},
    {"position": {"x": -12, "y": -1}, "is_angle_degrees": 2.9485817574645634},
    {"position": {"x": -11, "y": -1}, "is_angle_degrees": 3.2898928518395834},
    {"position": {"x": -10, "y": -1}, "is_angle_degrees": 3.565661261549674},
    {"position": {"x": -9, "y": -1}, "is_angle_degrees": 4.197183547149741},
    {"position": {"x": -8, "y": -1}, "is_angle_degrees": 4.930027412370822},
    {"position": {"x": -7, "y": -1}, "is_angle_degrees": 5.583750819377806},
    {"position": {"x": -6, "y": -1}, "is_angle_degrees": 6.657386580779424},
    {"position": {"x": -11, "y": -2}, "is_angle_degrees": 7.3174870733960455},
    {"position": {"x": -5, "y": -1}, "is_angle_degrees": 8.194765793065857},
    {"position": {"x": -9, "y": -2}, "is_angle_degrees": 9.264692944323741},
    {"position": {"x": -4, "y": -1}, "is_angle_degrees": 10.533521966139086},
    {"position": {"x": -11, "y": -3}, "is_angle_degrees": 11.497405744388702},
    {"position": {"x": -7, "y": -2}, "is_angle_degrees": 12.029190703455825},
    {"position": {"x": -10, "y": -3}, "is_angle_degrees": 12.57361635726584},
    {"position": {"x": -3, "y": -1}, "is_angle_degrees": 14.1293842757117},
    {"position": {"x": -11, "y": -4}, "is_angle_degrees": 15.586489878205235},
    {"position": {"x": -8, "y": -3}, "is_angle_degrees": 16.10108454815385},
    {"position": {"x": -5, "y": -2}, "is_angle_degrees": 17.15180613177795},
    {"position": {"x": -12, "y": -5}, "is_angle_degrees": 17.844925373917302},
    {"position": {"x": -7, "y": -3}, "is_angle_degrees": 18.38586141682327},
    {"position": {"x": -9, "y": -4}, "is_angle_degrees": 19.06045963063065},
    {"position": {"x": -11, "y": -5}, "is_angle_degrees": 19.584964428125726},
    {"position": {"x": -2, "y": -1}, "is_angle_degrees": 21.533218589608754},
    {"position": {"x": -11, "y": -6}, "is_angle_degrees": 23.616045747254713},
    {"position": {"x": -9, "y": -5}, "is_angle_degrees": 24.130586058211986},
    {"position": {"x": -7, "y": -4}, "is_angle_degrees": 24.85722868386236},
    {"position": {"x": -12, "y": -7}, "is_angle_degrees": 25.386403666294264},
    {"position": {"x": -5, "y": -3}, "is_angle_degrees": 26.132951041146743},
    {"position": {"x": -8, "y": -5}, "is_angle_degrees": 27.303384759785377},
    {"position": {"x": -11, "y": -7}, "is_angle_degrees": 27.830867855037564},
    {"position": {"x": -3, "y": -2}, "is_angle_degrees": 29.083106716121495},
    {"position": {"x": -10, "y": -7}, "is_angle_degrees": 30.708220900476505},
    {"position": {"x": -7, "y": -5}, "is_angle_degrees": 31.335176634312912},
    {"position": {"x": -11, "y": -8}, "is_angle_degrees": 31.882989339192584},
    {"position": {"x": -4, "y": -3}, "is_angle_degrees": 32.90572004903166},
    {"position": {"x": -9, "y": -7}, "is_angle_degrees": 34.11405386788477},
    {"position": {"x": -5, "y": -4}, "is_angle_degrees": 35.04230063089045},
    {"position": {"x": -11, "y": -9}, "is_angle_degrees": 35.885890602679886},
    {"position": {"x": -6, "y": -5}, "is_angle_degrees": 36.56495815001081},
    {"position": {"x": -7, "y": -6}, "is_angle_degrees": 37.641367945647694},
    {"position": {"x": -8, "y": -7}, "is_angle_degrees": 38.52948337569411},
    {"position": {"x": -9, "y": -8}, "is_angle_degrees": 39.03527081463336},
    {"position": {"x": -10, "y": -9}, "is_angle_degrees": 39.58609129837786},
    {"position": {"x": -11, "y": -10}, "is_angle_degrees": 39.93925563959952},
    {"position": {"x": -12, "y": -11}, "is_angle_degrees": 40.25111466018352},
    {"position": {"y": -1, "x": -1}, "is_angle_degrees": 44.10648092942098},
    {"position": {"x": -11, "y": -12}, "is_angle_degrees": 47.81433954704945},
    {"position": {"x": -10, "y": -11}, "is_angle_degrees": 48.098936198764854},
    {"position": {"x": -9, "y": -10}, "is_angle_degrees": 48.55966474182921},
    {"position": {"x": -8, "y": -9}, "is_angle_degrees": 48.94790787502413},
    {"position": {"x": -7, "y": -8}, "is_angle_degrees": 49.69281369798007},
    {"position": {"x": -6, "y": -7}, "is_angle_degrees": 50.4257931540619},
    {"position": {"x": -5, "y": -6}, "is_angle_degrees": 51.42986595566708},
    {"position": {"x": -9, "y": -11}, "is_angle_degrees": 52.16553898630029},
    {"position": {"x": -4, "y": -5}, "is_angle_degrees": 53.045208939716304},
    {"position": {"x": -7, "y": -9}, "is_angle_degrees": 54.1397756051659},
    {"position": {"x": -3, "y": -4}, "is_angle_degrees": 55.3785952140576},
    {"position": {"x": -8, "y": -11}, "is_angle_degrees": 56.25074774654213},
    {"position": {"x": -5, "y": -7}, "is_angle_degrees": 56.97210076240979},
    {"position": {"x": -7, "y": -10}, "is_angle_degrees": 57.43903182580188},
    {"position": {"x": -2, "y": -3}, "is_angle_degrees": 59.0277772496424},
    {"position": {"x": -7, "y": -11}, "is_angle_degrees": 60.42610876344035},
    {"position": {"x": -5, "y": -8}, "is_angle_degrees": 60.9321342365702},
    {"position": {"x": -3, "y": -5}, "is_angle_degrees": 61.98692046491022},
    {"position": {"x": -7, "y": -12}, "is_angle_degrees": 62.683360397318786},
    {"position": {"x": -4, "y": -7}, "is_angle_degrees": 63.200057037078565},
    {"position": {"x": -5, "y": -9}, "is_angle_degrees": 63.93058926596792},
    {"position": {"x": -6, "y": -11}, "is_angle_degrees": 64.44339794089848},
    {"position": {"x": -1, "y": -2}, "is_angle_degrees": 66.45443779745786},
    {"position": {"x": -5, "y": -11}, "is_angle_degrees": 68.4634290271509},
    {"position": {"x": -4, "y": -9}, "is_angle_degrees": 68.98765290043875},
    {"position": {"x": -3, "y": -7}, "is_angle_degrees": 69.6810593257936},
    {"position": {"x": -5, "y": -12}, "is_angle_degrees": 70.14147722790462},
    {"position": {"x": -2, "y": -5}, "is_angle_degrees": 71.02905235015835},
    {"position": {"x": -3, "y": -8}, "is_angle_degrees": 72.17183797485148},
    {"position": {"x": -4, "y": -11}, "is_angle_degrees": 72.48326691567533},
    {"position": {"x": -1, "y": -3}, "is_angle_degrees": 73.9306609828425},
    {"position": {"x": -3, "y": -10}, "is_angle_degrees": 75.45176807641026},
    {"position": {"x": -2, "y": -7}, "is_angle_degrees": 76.01956852449159},
    {"position": {"x": -3, "y": -11}, "is_angle_degrees": 76.70478267519455},
    {"position": {"x": -1, "y": -4}, "is_angle_degrees": 77.75407905008689},
    {"position": {"x": -2, "y": -9}, "is_angle_degrees": 78.9689078283724},
    {"position": {"x": -1, "y": -5}, "is_angle_degrees": 79.84317544089502},
    {"position": {"x": -2, "y": -11}, "is_angle_degrees": 80.73028859536132},
    {"position": {"x": -1, "y": -6}, "is_angle_degrees": 81.44750540034747},
    {"position": {"x": -1, "y": -7}, "is_angle_degrees": 82.48441966149063},
    {"position": {"x": -1, "y": -8}, "is_angle_degrees": 83.39556934159475},
    {"position": {"x": -1, "y": -9}, "is_angle_degrees": 83.8806794659299},
    {"position": {"x": -1, "y": -10}, "is_angle_degrees": 84.4485187873784},
    {"position": {"x": -1, "y": -11}, "is_angle_degrees": 84.72295196347571},
    {"position": {"x": -1, "y": -12}, "is_angle_degrees": 85.17968705868408},
    {"position": {"x": 0, "y": -1}, "is_angle_degrees": 88.82084924914795},
    {"position": {"x": 1, "y": -12}, "is_angle_degrees": 92.83732966776756},
    {"position": {"x": 1, "y": -11}, "is_angle_degrees": 93.09312957937473},
    {"position": {"x": 1, "y": -10}, "is_angle_degrees": 93.62548982968671},
    {"position": {"x": 1, "y": -9}, "is_angle_degrees": 94.08658913208157},
    {"position": {"x": 1, "y": -8}, "is_angle_degrees": 94.63712473485539},
    {"position": {"x": 1, "y": -7}, "is_angle_degrees": 95.48087356657864},
    {"position": {"x": 1, "y": -6}, "is_angle_degrees": 96.54992038988107},
    {"position": {"x": 2, "y": -11}, "is_angle_degrees": 97.14652695523803},
    {"position": {"x": 1, "y": -5}, "is_angle_degrees": 98.11289746765112},
    {"position": {"x": 2, "y": -9}, "is_angle_degrees": 98.97412493826651},
    {"position": {"x": 1, "y": -4}, "is_angle_degrees": 100.24309538286427},
    {"position": {"x": 3, "y": -11}, "is_angle_degrees": 101.21152803590327},
    {"position": {"x": 2, "y": -7}, "is_angle_degrees": 101.93466864873331},
    {"position": {"x": 3, "y": -10}, "is_angle_degrees": 102.47931036155376},
    {"position": {"x": 1, "y": -3}, "is_angle_degrees": 104.03069941818296},
    {"position": {"x": 4, "y": -11}, "is_angle_degrees": 105.47562202255196},
    {"position": {"x": 3, "y": -8}, "is_angle_degrees": 105.81737240950481},
    {"position": {"x": 2, "y": -5}, "is_angle_degrees": 107.0431309876588},
    {"position": {"x": 5, "y": -12}, "is_angle_degrees": 107.73980529167865},
    {"position": {"x": 3, "y": -7}, "is_angle_degrees": 108.25850469340004},
    {"position": {"x": 4, "y": -9}, "is_angle_degrees": 108.94458725340509},
    {"position": {"x": 5, "y": -11}, "is_angle_degrees": 109.49364841981405},
    {"position": {"x": 1, "y": -2}, "is_angle_degrees": 111.2651354011189},
    {"position": {"x": 6, "y": -11}, "is_angle_degrees": 113.50143090974457},
    {"position": {"x": 5, "y": -9}, "is_angle_degrees": 114.04247186149111},
    {"position": {"x": 4, "y": -7}, "is_angle_degrees": 114.77329199070752},
    {"position": {"x": 7, "y": -12}, "is_angle_degrees": 115.23089045151022},
    {"position": {"x": 3, "y": -5}, "is_angle_degrees": 116.02208051493466},
    {"position": {"x": 5, "y": -8}, "is_angle_degrees": 117.03723603557805},
    {"position": {"x": 7, "y": -11}, "is_angle_degrees": 117.5654195389546},
    {"position": {"x": 2, "y": -3}, "is_angle_degrees": 118.99584720269519},
    {"position": {"x": 7, "y": -10}, "is_angle_degrees": 120.57362666443791},
    {"position": {"x": 5, "y": -7}, "is_angle_degrees": 121.07580718751679},
    {"position": {"x": 8, "y": -11}, "is_angle_degrees": 121.78296722022293},
    {"position": {"x": 3, "y": -4}, "is_angle_degrees": 122.65259594809147},
    {"position": {"x": 7, "y": -9}, "is_angle_degrees": 123.86624013116644},
    {"position": {"x": 4, "y": -5}, "is_angle_degrees": 124.97639050212183},
    {"position": {"x": 9, "y": -11}, "is_angle_degrees": 125.84484382816369},
    {"position": {"x": 5, "y": -6}, "is_angle_degrees": 126.53381094328853},
    {"position": {"x": 6, "y": -7}, "is_angle_degrees": 127.58958447342077},
    {"position": {"x": 7, "y": -8}, "is_angle_degrees": 128.29293253139812},
    {"position": {"x": 8, "y": -9}, "is_angle_degrees": 128.96435257589965},
    {"position": {"x": 9, "y": -10}, "is_angle_degrees": 129.5025357292532},
    {"position": {"x": 10, "y": -11}, "is_angle_degrees": 129.888980501012},
    {"position": {"x": 11, "y": -12}, "is_angle_degrees": 130.23454743250326},
    {"position": {"x": 1, "y": -1}, "is_angle_degrees": 133.8884871937512},
    {"position": {"x": 12, "y": -11}, "is_angle_degrees": 137.77693618582614},
    {"position": {"x": 11, "y": -10}, "is_angle_degrees": 138.21909622562737},
    {"position": {"x": 10, "y": -9}, "is_angle_degrees": 138.50562173683895},
    {"position": {"x": 9, "y": -8}, "is_angle_degrees": 139.07423775162258},
    {"position": {"x": 8, "y": -7}, "is_angle_degrees": 139.4959684785595},
    {"position": {"x": 7, "y": -6}, "is_angle_degrees": 140.40618862386683},
    {"position": {"x": 6, "y": -5}, "is_angle_degrees": 141.43491585363682},
    {"position": {"x": 11, "y": -9}, "is_angle_degrees": 142.13460822689953},
    {"position": {"x": 5, "y": -4}, "is_angle_degrees": 143.05195045150174},
    {"position": {"x": 9, "y": -7}, "is_angle_degrees": 143.96072308795902},
    {"position": {"x": 4, "y": -3}, "is_angle_degrees": 145.2018164968174},
    {"position": {"x": 11, "y": -8}, "is_angle_degrees": 146.2658784655469},
    {"position": {"x": 7, "y": -5}, "is_angle_degrees": 146.8028510721},
    {"position": {"x": 10, "y": -7}, "is_angle_degrees": 147.44358469268957},
    {"position": {"x": 3, "y": -2}, "is_angle_degrees": 149.05898456614378},
    {"position": {"x": 11, "y": -7}, "is_angle_degrees": 150.2735641231336},
    {"position": {"x": 8, "y": -5}, "is_angle_degrees": 150.77859154517628},
    {"position": {"x": 5, "y": -3}, "is_angle_degrees": 152.02329905173465},
    {"position": {"x": 12, "y": -7}, "is_angle_degrees": 152.75315437041036},
    {"position": {"x": 7, "y": -4}, "is_angle_degrees": 153.23348339619272},
    {"position": {"x": 9, "y": -5}, "is_angle_degrees": 153.98200169824798},
    {"position": {"x": 11, "y": -6}, "is_angle_degrees": 154.4756939500076},
    {"position": {"x": 2, "y": -1}, "is_angle_degrees": 156.33104729251255},
    {"position": {"x": 11, "y": -5}, "is_angle_degrees": 158.51495936027126},
    {"position": {"x": 9, "y": -4}, "is_angle_degrees": 159.0462465046658},
    {"position": {"x": 7, "y": -3}, "is_angle_degrees": 159.75104398169702},
    {"position": {"x": 12, "y": -5}, "is_angle_degrees": 160.20440594372408},
    {"position": {"x": 5, "y": -2}, "is_angle_degrees": 161.0587657039718},
    {"position": {"x": 8, "y": -3}, "is_angle_degrees": 162.07044878772945},
    {"position": {"x": 11, "y": -4}, "is_angle_degrees": 162.57158015815804},
    {"position": {"x": 3, "y": -1}, "is_angle_degrees": 164.00991249232308},
    {"position": {"x": 10, "y": -3}, "is_angle_degrees": 165.56399915210878},
    {"position": {"x": 7, "y": -2}, "is_angle_degrees": 166.1164660790109},
    {"position": {"x": 11, "y": -3}, "is_angle_degrees": 166.62594180207117},
    {"position": {"x": 4, "y": -1}, "is_angle_degrees": 167.682775417852},
    {"position": {"x": 9, "y": -2}, "is_angle_degrees": 168.9026855769633},
    {"position": {"x": 5, "y": -1}, "is_angle_degrees": 169.96992076615828},
    {"position": {"x": 11, "y": -2}, "is_angle_degrees": 170.79907659740638},
    {"position": {"x": 6, "y": -1}, "is_angle_degrees": 171.55428126467586},
    {"position": {"x": 7, "y": -1}, "is_angle_degrees": 172.59006393242916},
    {"position": {"x": 8, "y": -1}, "is_angle_degrees": 173.3525140441765},
    {"position": {"x": 9, "y": -1}, "is_angle_degrees": 174.0009348126906},
    {"position": {"x": 10, "y": -1}, "is_angle_degrees": 174.56935758921202},
    {"position": {"x": 11, "y": -1}, "is_angle_degrees": 174.8483370267756},
    {"position": {"x": 12, "y": -1}, "is_angle_degrees": 175.23780654390896},
    {"position": {"x": 1, "y": 0}, "is_angle_degrees": 178.95137257594334},
    {"position": {"x": 12, "y": 1}, "is_angle_degrees": 182.83873504910926},
    {"position": {"x": 11, "y": 1}, "is_angle_degrees": 183.00643559597415},
    {"position": {"x": 10, "y": 1}, "is_angle_degrees": 183.63348155788054},
    {"position": {"x": 9, "y": 1}, "is_angle_degrees": 184.09306358553195},
    {"position": {"x": 8, "y": 1}, "is_angle_degrees": 184.64585265572452},
    {"position": {"x": 7, "y": 1}, "is_angle_degrees": 185.49400008923277},
    {"position": {"x": 6, "y": 1}, "is_angle_degrees": 186.56836117350977},
    {"position": {"x": 11, "y": 2}, "is_angle_degrees": 187.17152260182664},
    {"position": {"x": 5, "y": 1}, "is_angle_degrees": 187.9300317426681},
    {"position": {"x": 9, "y": 2}, "is_angle_degrees": 189.00373261072923},
    {"position": {"x": 4, "y": 1}, "is_angle_degrees": 190.27825503884836},
    {"position": {"x": 11, "y": 3}, "is_angle_degrees": 191.25092403556343},
    {"position": {"x": 7, "y": 2}, "is_angle_degrees": 191.7840335696231},
    {"position": {"x": 10, "y": 3}, "is_angle_degrees": 192.5240348403446},
    {"position": {"x": 3, "y": 1}, "is_angle_degrees": 194.08236843131823},
    {"position": {"x": 11, "y": 4}, "is_angle_degrees": 195.3617671246671},
    {"position": {"x": 8, "y": 3}, "is_angle_degrees": 195.87739169061956},
    {"position": {"x": 5, "y": 2}, "is_angle_degrees": 197.10801089536818},
    {"position": {"x": 12, "y": 5}, "is_angle_degrees": 197.809096432055},
    {"position": {"x": 7, "y": 3}, "is_angle_degrees": 198.32978591770873},
    {"position": {"x": 9, "y": 4}, "is_angle_degrees": 199.0177733098354},
    {"position": {"x": 11, "y": 5}, "is_angle_degrees": 199.5693205400681},
    {"position": {"x": 2, "y": 1}, "is_angle_degrees": 201.34837967450477},
    {"position": {"x": 11, "y": 6}, "is_angle_degrees": 203.59532166284924},
    {"position": {"x": 9, "y": 5}, "is_angle_degrees": 203.95689422929794},
    {"position": {"x": 7, "y": 4}, "is_angle_degrees": 204.68342690581912},
    {"position": {"x": 12, "y": 7}, "is_angle_degrees": 205.2167401926206},
    {"position": {"x": 5, "y": 3}, "is_angle_degrees": 206.12686466145837},
    {"position": {"x": 8, "y": 5}, "is_angle_degrees": 207.1463291166935},
    {"position": {"x": 11, "y": 7}, "is_angle_degrees": 207.67638497114922},
    {"position": {"x": 3, "y": 2}, "is_angle_degrees": 209.11278410253934},
    {"position": {"x": 10, "y": 7}, "is_angle_degrees": 210.57127070327275},
    {"position": {"x": 7, "y": 5}, "is_angle_degrees": 211.2024912152823},
    {"position": {"x": 11, "y": 8}, "is_angle_degrees": 211.75485316837873},
    {"position": {"x": 4, "y": 3}, "is_angle_degrees": 212.7840700125697},
    {"position": {"x": 9, "y": 7}, "is_angle_degrees": 214.00154232044983},
    {"position": {"x": 5, "y": 4}, "is_angle_degrees": 215.11789214442754},
    {"position": {"x": 11, "y": 9}, "is_angle_degrees": 215.98550349961664},
    {"position": {"x": 6, "y": 5}, "is_angle_degrees": 216.4656546258902},
    {"position": {"x": 7, "y": 6}, "is_angle_degrees": 217.7401159784581},
    {"position": {"x": 8, "y": 7}, "is_angle_degrees": 218.4445488022606},
    {"position": {"x": 9, "y": 8}, "is_angle_degrees": 219.11865667355912},
    {"position": {"x": 10, "y": 9}, "is_angle_degrees": 219.6573078047522},
    {"position": {"x": 11, "y": 10}, "is_angle_degrees": 220.0492879414933},
    {"position": {"x": 12, "y": 11}, "is_angle_degrees": 220.39254143392256},
    {"position": {"y": 1, "x": 1}, "is_angle_degrees": 224.06029415911618},
    {"position": {"x": 11, "y": 12}, "is_angle_degrees": 227.79132284057724},
    {"position": {"x": 10, "y": 11}, "is_angle_degrees": 228.0798420631781},
    {"position": {"x": 9, "y": 10}, "is_angle_degrees": 228.6980818419115},
    {"position": {"x": 8, "y": 9}, "is_angle_degrees": 229.2679263345848},
    {"position": {"x": 7, "y": 8}, "is_angle_degrees": 229.68390830427361},
    {"position": {"x": 6, "y": 7}, "is_angle_degrees": 230.59899290768948},
    {"position": {"x": 5, "y": 6}, "is_angle_degrees": 231.63202902665395},
    {"position": {"x": 9, "y": 11}, "is_angle_degrees": 232.33528726002115},
    {"position": {"x": 4, "y": 5}, "is_angle_degrees": 233.05956483341595},
    {"position": {"x": 7, "y": 9}, "is_angle_degrees": 234.1610097996749},
    {"position": {"x": 3, "y": 4}, "is_angle_degrees": 235.4078580477528},
    {"position": {"x": 8, "y": 11}, "is_angle_degrees": 236.47544354281524},
    {"position": {"x": 5, "y": 7}, "is_angle_degrees": 237.01092029668504},
    {"position": {"x": 7, "y": 10}, "is_angle_degrees": 237.6552021937862},
    {"position": {"x": 2, "y": 3}, "is_angle_degrees": 239.0810914782944},
    {"position": {"x": 7, "y": 11}, "is_angle_degrees": 240.4886801271932},
    {"position": {"x": 5, "y": 8}, "is_angle_degrees": 241.000360845699},
    {"position": {"x": 3, "y": 5}, "is_angle_degrees": 242.06154579686975},
    {"position": {"x": 7, "y": 12}, "is_angle_degrees": 242.97541303648887},
    {"position": {"x": 4, "y": 7}, "is_angle_degrees": 243.458939945989},
    {"position": {"x": 5, "y": 9}, "is_angle_degrees": 244.20847343142924},
    {"position": {"x": 6, "y": 11}, "is_angle_degrees": 244.53348972415785},
    {"position": {"x": 1, "y": 2}, "is_angle_degrees": 246.5550266072062},
    {"position": {"x": 5, "y": 11}, "is_angle_degrees": 248.75396011844765},
    {"position": {"x": 4, "y": 9}, "is_angle_degrees": 249.1102841387626},
    {"position": {"x": 3, "y": 7}, "is_angle_degrees": 249.81063685995144},
    {"position": {"x": 5, "y": 12}, "is_angle_degrees": 250.27564804823248},
    {"position": {"x": 2, "y": 5}, "is_angle_degrees": 251.2929086467587},
    {"position": {"x": 3, "y": 8}, "is_angle_degrees": 252.31872501834616},
    {"position": {"x": 4, "y": 11}, "is_angle_degrees": 252.81713183761596},
    {"position": {"x": 1, "y": 3}, "is_angle_degrees": 254.25747844591407},
    {"position": {"x": 3, "y": 10}, "is_angle_degrees": 255.61146481000418},
    {"position": {"x": 2, "y": 7}, "is_angle_degrees": 256.36643701873834},
    {"position": {"x": 3, "y": 11}, "is_angle_degrees": 256.8747564437971},
    {"position": {"x": 1, "y": 4}, "is_angle_degrees": 257.93049314143923},
    {"position": {"x": 2, "y": 9}, "is_angle_degrees": 259.1583150265224},
    {"position": {"x": 1, "y": 5}, "is_angle_degrees": 260.2222666479208},
    {"position": {"x": 2, "y": 11}, "is_angle_degrees": 260.93529610006897},
    {"position": {"x": 1, "y": 6}, "is_angle_degrees": 261.64558064178766},
    {"position": {"x": 1, "y": 7}, "is_angle_degrees": 262.6893589833225},
    {"position": {"x": 1, "y": 8}, "is_angle_degrees": 263.6072840560789},
    {"position": {"x": 1, "y": 9}, "is_angle_degrees": 264.2611621429813},
    {"position": {"x": 1, "y": 10}, "is_angle_degrees": 264.6619856180908},
    {"position": {"x": 1, "y": 11}, "is_angle_degrees": 265.101322486212},
    {"position": {"x": 1, "y": 12}, "is_angle_degrees": 265.4965978618829},
    {"position": {"x": 0, "y": 1}, "is_angle_degrees": 269.2067515137963},
    {"position": {"x": -1, "y": 12}, "is_angle_degrees": 272.924450053292},
    {"position": {"x": -1, "y": 11}, "is_angle_degrees": 273.2636318757497},
    {"position": {"x": -1, "y": 10}, "is_angle_degrees": 273.9088328635495},
    {"position": {"x": -1, "y": 9}, "is_angle_degrees": 274.1777723104715},
    {"position": {"x": -1, "y": 8}, "is_angle_degrees": 274.9132857401354},
    {"position": {"x": -1, "y": 7}, "is_angle_degrees": 275.76357987864435},
    {"position": {"x": -1, "y": 6}, "is_angle_degrees": 276.8311077070858},
    {"position": {"x": -2, "y": 11}, "is_angle_degrees": 277.44461022475997},
    {"position": {"x": -1, "y": 5}, "is_angle_degrees": 278.1953793514427},
    {"position": {"x": -2, "y": 9}, "is_angle_degrees": 279.2689590371034},
    {"position": {"x": -1, "y": 4}, "is_angle_degrees": 280.5436627603342},
    {"position": {"x": -3, "y": 11}, "is_angle_degrees": 281.5113668695883},
    {"position": {"x": -2, "y": 7}, "is_angle_degrees": 282.0452439502519},
    {"position": {"x": -3, "y": 10}, "is_angle_degrees": 282.78733311029464},
    {"position": {"x": -1, "y": 3}, "is_angle_degrees": 284.15566721568814},
    {"position": {"x": -4, "y": 11}, "is_angle_degrees": 285.6201392805741},
    {"position": {"x": -3, "y": 8}, "is_angle_degrees": 286.13828635389973},
    {"position": {"x": -2, "y": 5}, "is_angle_degrees": 287.193447694994},
    {"position": {"x": -5, "y": 12}, "is_angle_degrees": 288.0740418580145},
    {"position": {"x": -3, "y": 7}, "is_angle_degrees": 288.59009111734014},
    {"position": {"x": -4, "y": 9}, "is_angle_degrees": 289.27557328374576},
    {"position": {"x": -5, "y": 11}, "is_angle_degrees": 289.63892200074946},
    {"position": {"x": -1, "y": 2}, "is_angle_degrees": 291.5955702141729},
    {"position": {"x": -6, "y": 11}, "is_angle_degrees": 293.84816836180477},
    {"position": {"x": -5, "y": 9}, "is_angle_degrees": 294.20591563301224},
    {"position": {"x": -4, "y": 7}, "is_angle_degrees": 294.9375565331675},
    {"position": {"x": -7, "y": 12}, "is_angle_degrees": 295.46859551977917},
    {"position": {"x": -3, "y": 5}, "is_angle_degrees": 296.3789823158821},
    {"position": {"x": -5, "y": 8}, "is_angle_degrees": 297.39636312556894},
    {"position": {"x": -7, "y": 11}, "is_angle_degrees": 297.92611611010136},
    {"position": {"x": -2, "y": 3}, "is_angle_degrees": 299.36160502431807},
    {"position": {"x": -7, "y": 10}, "is_angle_degrees": 300.81957838745166},
    {"position": {"x": -5, "y": 7}, "is_angle_degrees": 301.44873487249106},
    {"position": {"x": -8, "y": 11}, "is_angle_degrees": 301.9971283417191},
    {"position": {"x": -3, "y": 4}, "is_angle_degrees": 303.0252673720978},
    {"position": {"x": -7, "y": 9}, "is_angle_degrees": 304.23839346393686},
    {"position": {"x": -4, "y": 5}, "is_angle_degrees": 305.3565562602753},
    {"position": {"x": -9, "y": 11}, "is_angle_degrees": 306.0227704494913},
    {"position": {"x": -5, "y": 6}, "is_angle_degrees": 306.7036914313605},
    {"position": {"x": -6, "y": 7}, "is_angle_degrees": 307.77962966332586},
    {"position": {"x": -7, "y": 8}, "is_angle_degrees": 308.6738915769351},
    {"position": {"x": -8, "y": 9}, "is_angle_degrees": 309.183065271818},
    {"position": {"x": -9, "y": 10}, "is_angle_degrees": 309.73715526258775},
    {"position": {"x": -10, "y": 11}, "is_angle_degrees": 310.2801885926258},
    {"position": {"x": -11, "y": 12}, "is_angle_degrees": 310.61619965051375},
    {"position": {"x": -1, "y": 1}, "is_angle_degrees": 314.2761363492796},
    {"position": {"x": -12, "y": 11}, "is_angle_degrees": 317.99818109879055},
    {"position": {"x": -11, "y": 10}, "is_angle_degrees": 318.2850226019927},
    {"position": {"x": -10, "y": 9}, "is_angle_degrees": 318.75533039525806},
    {"position": {"x": -9, "y": 8}, "is_angle_degrees": 319.1349512041944},
    {"position": {"x": -8, "y": 7}, "is_angle_degrees": 319.88511803569315},
    {"position": {"x": -7, "y": 6}, "is_angle_degrees": 320.6239381851868},
    {"position": {"x": -6, "y": 5}, "is_angle_degrees": 321.82912665738695},
    {"position": {"x": -11, "y": 9}, "is_angle_degrees": 322.37124283171005},
    {"position": {"x": -5, "y": 4}, "is_angle_degrees": 323.250910409203},
    {"position": {"x": -9, "y": 7}, "is_angle_degrees": 324.34880493285954},
    {"position": {"x": -4, "y": 3}, "is_angle_degrees": 325.5943173425379},
    {"position": {"x": -11, "y": 8}, "is_angle_degrees": 326.6585289913484},
    {"position": {"x": -7, "y": 5}, "is_angle_degrees": 327.1906454547702},
    {"position": {"x": -10, "y": 7}, "is_angle_degrees": 327.8320892484853},
    {"position": {"x": -3, "y": 2}, "is_angle_degrees": 329.25077524207455},
    {"position": {"x": -11, "y": 7}, "is_angle_degrees": 330.6539263730051},
    {"position": {"x": -8, "y": 5}, "is_angle_degrees": 331.1669201117699},
    {"position": {"x": -5, "y": 3}, "is_angle_degrees": 332.22465069353456},
    {"position": {"x": -12, "y": 7}, "is_angle_degrees": 333.13253005751966},
    {"position": {"x": -7, "y": 4}, "is_angle_degrees": 333.6155637127133},
    {"position": {"x": -9, "y": 5}, "is_angle_degrees": 334.36162018150486},
    {"position": {"x": -11, "y": 6}, "is_angle_degrees": 334.6854175561626},
    {"position": {"x": -2, "y": 1}, "is_angle_degrees": 336.6957117720198},
    {"position": {"x": -11, "y": 5}, "is_angle_degrees": 338.7174840924177},
    {"position": {"x": -9, "y": 4}, "is_angle_degrees": 339.24465013850033},
    {"position": {"x": -7, "y": 3}, "is_angle_degrees": 339.9435341962032},
    {"position": {"x": -12, "y": 5}, "is_angle_degrees": 340.40609742432713},
    {"position": {"x": -5, "y": 2}, "is_angle_degrees": 341.28074605371154},
    {"position": {"x": -8, "y": 3}, "is_angle_degrees": 342.4417926905862},
    {"position": {"x": -11, "y": 4}, "is_angle_degrees": 342.93739382924537},
    {"position": {"x": -3, "y": 1}, "is_angle_degrees": 344.1963695911757},
    {"position": {"x": -10, "y": 3}, "is_angle_degrees": 345.7190947414859},
    {"position": {"x": -7, "y": 2}, "is_angle_degrees": 346.4721339882767},
    {"position": {"x": -11, "y": 3}, "is_angle_degrees": 346.9777161775668},
    {"position": {"x": -4, "y": 1}, "is_angle_degrees": 348.0262872881526},
    {"position": {"x": -9, "y": 2}, "is_angle_degrees": 349.2483022967466},
    {"position": {"x": -5, "y": 1}, "is_angle_degrees": 350.30407438366234},
    {"position": {"x": -11, "y": 2}, "is_angle_degrees": 351.01685957262094},
    {"position": {"x": -6, "y": 1}, "is_angle_degrees": 351.7208425501853},
    {"position": {"x": -7, "y": 1}, "is_angle_degrees": 352.7634952712645},
    {"position": {"x": -8, "y": 1}, "is_angle_degrees": 353.674703977298},
    {"position": {"x": -9, "y": 1}, "is_angle_degrees": 354.1643672770664},
    {"position": {"x": -10, "y": 1}, "is_angle_degrees": 354.72414730106465},
    {"position": {"x": -11, "y": 1}, "is_angle_degrees": 355.16162805417065},
    {"position": {"x": -12, "y": 1}, "is_angle_degrees": 355.4703423149864}
  ]

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

      console.log("No more eligible spots")

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
        console.log(`Setting ${Vector2.toString(offset)}`)

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