import {CapturedImage, NeedleImage} from "../ImageCapture";
import {async_lazy} from "../../properties/Lazy";
import {Process} from "../../Process";
import {OverlayGeometry} from "../OverlayGeometry";
import {angleDifference, circularMean, normalizeAngle, radiansToDegrees, Vector2} from "../../math";
import {ScreenRectangle} from "../ScreenRectangle";
import over = OverlayGeometry.over;
import * as lodash from "lodash";

const overlay = over()

export class MinimapReader extends Process.Interval {
  private capture: MinimapReader.CapturedMinimap = null

  private debug_overlay = over()

  constructor(private debug_mode: boolean = true) {
    super(300);
  }

  async tick(): Promise<void> {

    const capture = CapturedImage.capture();

    this.capture = await MinimapReader.CapturedMinimap.find(capture)

    this.debug_overlay.clear()

    if (this.capture) {
      this.capture.debugOverlay(this.debug_overlay)

      console.log(`Camera yaw: ${radiansToDegrees(this.capture.readCompass())}°`)
    }

    this.debug_overlay.render()

    return undefined;
  }
}

export namespace MinimapReader {
  export class CapturedMinimap {
    private compass: CapturedImage
    private energy: CapturedImage
    private lodestone: CapturedImage
    private worldmap: CapturedImage

    constructor(public readonly body: CapturedImage) {
      this.compass = body.getSubSection({
        origin: {x: 5, y: 6},
        size: {x: 34, y: 34}
      }).setName("Compass")

      this.energy = body.getSubSection({
        origin: {x: body.size.x - 40, y: 7},
        size: {x: 34, y: 34}
      }).setName("Run")

      this.lodestone = body.getSubSection({
        origin: {x: 11, y: body.size.y - 38},
        size: {x: 26, y: 26}
      }).setName("Lodestone")

      this.worldmap = body.getSubSection({
        origin: {x: body.size.x - 36, y: body.size.y - 37},
        size: {x: 26, y: 26}
      }).setName("Map")
    }

    debugOverlay(overlay: OverlayGeometry = new OverlayGeometry()): OverlayGeometry {
      this.body.debugOverlay(overlay)
      this.compass.debugOverlay(overlay)
      this.energy.debugOverlay(overlay)
      this.lodestone.debugOverlay(overlay)
      this.worldmap.debugOverlay(overlay)

      return overlay
    }

    center(): Vector2 {
      return Vector2.snap(ScreenRectangle.center(this.body.screen_rectangle))
    }

    static async find(img: CapturedImage): Promise<CapturedMinimap> {
      const imgs = await CapturedMinimap.anchors.get()

      const homeport = img.findNeedle(imgs.homeport)[0];

      if (!homeport) return null

      const bottom_left = Vector2.add(homeport.screen_rectangle.origin, {x: -17, y: 32})

      const MINIMAL_DISTANCE = {x: 73, y: 45}

      const energy_search_area = img.getSubSection(
        {
          origin: {x: homeport.screen_rectangle.origin.x + MINIMAL_DISTANCE.x, y: 0},
          size: {x: img.size.x - (homeport.screen_rectangle.origin.x + MINIMAL_DISTANCE.x), y: homeport.screen_rectangle.origin.y - MINIMAL_DISTANCE.y},
        }
      )

      const top_right = (() => {
        const energies: { needle: NeedleImage, offset: Vector2 }[] = [
          {needle: imgs.botrun, offset: {x: 34, y: -29}},
          //{needle: imgs.toprun, offset: {x: 34, y: -9}},
          {needle: imgs.botwalk, offset: {x: 34, y: -29}},
          //{needle: imgs.topwalk, offset: {x: 34, y: -9}},
        ];

        for (const energy of energies) {
          const results = energy_search_area.findNeedle(energy.needle)

          if (results.length > 0) return Vector2.add(results[0].screen_rectangle.origin, energy.offset)
        }

        return null
      })()

      if (!top_right) {
        console.log("Could not find top right")
        return null
      }

      return new CapturedMinimap(img.getSubSection(
        ScreenRectangle.fromPixels(
          bottom_left,
          top_right,
        )).setName("Minimap"))
    }

    readCompass(): number {
      const buf = this.compass.getData()

      const angle_samples: {
        angle: number,
        weight: number
      }[]

        /*= rectangle_samples.flatMap(v => {

        const vector = Vector2.sub(v, center_of_area)

        let angle = angleof(vector)

        if (Number.isNaN(angle)) return []

        if (angleDifference(angle, initial_angle) > Math.PI / 2)
          angle = normalizeAngle(angle - Math.PI)

        return {
          angle: angle,
          weight: Vector2.lengthSquared(vector)
        }
      })*/




      const r = 11;

      const center: Vector2 = {x: 18, y: 17}

      let sx1 = 0, sy1 = 0, m1 = 0;
      let sx2 = 0, sy2 = 0, m2 = 0;


      for (let x = Math.round(center.x) - r; x <= Math.round(center.x) + r; x++) {
        for (let y = Math.round(center.y) - r; y <= Math.round(center.y) + r; y++) {
          const i = 4 * x + 4 * buf.width * y;
          const dx = x - center.x;
          const dy = y - center.y;

          if (dx * dx + dy * dy > r * r) {
            buf.data[i] = buf.data[i + 1] = buf.data[i + 2] = 0;
            continue;
          }

          const rating1 = buf.data[i] - buf.data[i + 1];
          sx1 += dx * rating1;
          sy1 += dy * rating1;
          m1 += rating1;
          const rating2 = Math.max(0, buf.data[i] + buf.data[i + 1] + buf.data[i + 2] - 300);
          sx2 += dx * rating2;
          sy2 += dy * rating2;
          m2 += rating2;
          if (isNaN(m2)) { debugger; }
          if (isNaN(m1)) { debugger; }

          buf.data[i] = buf.data[i + 1] = buf.data[i + 2] = rating1;
        }
      }

      const angle_after_rectangle_sample = normalizeAngle(Math.atan2(
        lodash.sum(angle_samples.map(a => a.weight * Math.sin(a.angle))),
        lodash.sum(angle_samples.map(a => a.weight * Math.cos(a.angle))),
      ))

      if (m1 == 0 || m2 == 0) { return null; }

      const mx1 = sx1 / m1;
      const my1 = sy1 / m1;
      const mx2 = sx2 / m2;
      const my2 = sy2 / m2;

      let dir = Math.atan2((my2 - my1), (mx2 - mx1));
      dir += -1 / 180 * Math.PI;
      dir = (Math.PI + dir) % (Math.PI * 2);
      return dir;
    }
  }

  export namespace CapturedMinimap {
    export const anchors = async_lazy(async () => {
      return {
        botrun: await NeedleImage.fromURL("alt1anchors/minimap/botrun.png"),
        botwalk: await NeedleImage.fromURL("alt1anchors/minimap/botwalk.png"),
        homeport: await NeedleImage.fromURL("alt1anchors/minimap/homeport.png"),
        toprun: await NeedleImage.fromURL("alt1anchors/minimap/toprun.png"),
        topwalk: await NeedleImage.fromURL("alt1anchors/minimap/topwalk.png"),
      }
    })
  }
}