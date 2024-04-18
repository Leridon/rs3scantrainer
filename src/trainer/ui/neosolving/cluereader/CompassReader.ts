import {coldiff} from "../../../../skillbertssolver/oldlib";
import {posmod} from "../../../../skillbertssolver/util";
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {ImgRef, mixColor} from "@alt1/base";
import {circularMean, degreesToRadians, normalizeAngle, radiansToDegrees, Rectangle, Vector2} from "../../../../lib/math";
import {ClueReader} from "./ClueReader";
import * as lodash from "lodash";
import {OverlayGeometry} from "../../../../lib/util/OverlayGeometry";
import {DomEvent} from "leaflet";

export namespace CompassReader {

  import angleDifference = Compasses.angleDifference;
  import MatchedUI = ClueReader.MatchedUI;
  import ANGLE_REFERENCE_VECTOR = Compasses.ANGLE_REFERENCE_VECTOR;
  import off = DomEvent.off;


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

  export function readCompassState(ui: MatchedUI.Compass): CompassState {
    let data = ui.image.toData(
      Rectangle.screenOrigin(ui.rect).x,
      Rectangle.screenOrigin(ui.rect).y,
      UI_SIZE.x - 1,
      UI_SIZE.y - 1);

    let dir = getCompassAngle(data, Rectangle.screenOrigin(ui.rect));

    if (dir == null) { return null; }

    let isArc = CompassReader.isArcClue(data);
    return {angle: dir, isArc: isArc};
  }

  const debug_overlay = new OverlayGeometry()

  const CALIBRATION_TABLE: { offset: number; angle: number }[] = (() => {
    const data: {
      position: Vector2,
      offset: number
    }[] = [
      {position: {x: 2, y: 0}, offset: 0.73},
      {position: {x: 2, y: 1}, offset: 4.56},
      {position: {x: 2, y: 2}, offset: 0.25},
      {position: {x: 1, y: 2}, offset: -4.23},
      {position: {x: 0, y: 2}, offset: -0.73},
      {position: {x: -1, y: 2}, offset: 3.23},
      {position: {x: -2, y: 2}, offset: -1.27},
      {position: {x: -2, y: 1}, offset: -5.38},
      {position: {x: -2, y: 0}, offset: -1.46},
      {position: {x: -2, y: -1}, offset: 2.56},
      {position: {x: -2, y: -2}, offset: -1.39},
      {position: {x: -1, y: -2}, offset: -4.77},
      {position: {x: 0, y: -2}, offset: -0.37},
      {position: {x: 1, y: -2}, offset: 4.02},
      {position: {x: 2, y: -2}, offset: 0.26},
      {position: {x: 2, y: -1}, offset: -3.68}
    ]

    return lodash.sortBy(data.map(({position, offset}) => {
      return {
        angle: Vector2.angle(Compasses.ANGLE_REFERENCE_VECTOR, Vector2.scale(-1, Vector2.normalize(position))),
        offset: degreesToRadians(offset)
      }
    }), e => e.angle)
  })()

  function getCompassAngle(buf: ImageData, origin: Vector2): number {
    const CENTER_OFFSET = {x: 88, y: 138}
    const CENTER_SIZE = 2
    const OFFSET = CENTER_SIZE - 1
    const SAMPLING_RADIUS: number = 77

    debug_overlay.clear()

    const sampled_pixels: Vector2[] = (() => {
      const sampled: Vector2[] = []
      const r = SAMPLING_RADIUS

      function sample(x: number, y: number): void {
        const i = 4 * ((CENTER_OFFSET.y + y) * buf.width + x + CENTER_OFFSET.x)

        if (buf.data[i] < 5 && buf.data[i + 1] < 5 && buf.data[i + 2] < 5) {
          sampled.push({x, y})
          debug_overlay.rect(Rectangle.centeredOn(Vector2.add(origin, CENTER_OFFSET, {x, y}), 1), {color: mixColor(255, 0, 0), width: 1})
        } else {
          debug_overlay.rect(Rectangle.centeredOn(Vector2.add(origin, CENTER_OFFSET, {x, y}), 1), {color: mixColor(0, 255, 0), width: 1})
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

    for (let p of sampled_pixels) {
      debug_overlay.line(
        Vector2.add(origin, CENTER_OFFSET),
        Vector2.add(origin, CENTER_OFFSET, p),
        {width: 1, color: mixColor(255, 0, 0)}
      )
    }

    debug_overlay.render()


    if (sampled_pixels.length == 0) return null


    // Map all sample points to their respective angle
    // The angle is taken from the true center of the compass arrow, which is why we offset the samples by 0.5
    // Also, the y axis is flipped to convert from screen coordinates to the internally used coordinate system
    const angles = sampled_pixels.map(p => Vector2.angle(
      ANGLE_REFERENCE_VECTOR, Vector2.normalize({x: p.x - 0.5, y: -p.y}))
    )

    const angle = normalizeAngle(circularMean(angles))

    const index_a = lodash.findLastIndex(CALIBRATION_TABLE, e => e.angle < angle)
    const index_b = (index_a + 1) % CALIBRATION_TABLE.length

    const previous = CALIBRATION_TABLE[index_a]
    const next = CALIBRATION_TABLE[index_b]

    const t = normalizeAngle(angle - previous.angle) / angleDifference(next.angle, previous.angle)

    const offset = (1 - t) * previous.offset + t * next.offset

    console.log(`Fixing by ${radiansToDegrees(offset).toFixed(2)}° at t=${t.toFixed(2)}`)

    return normalizeAngle(angle + offset)
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