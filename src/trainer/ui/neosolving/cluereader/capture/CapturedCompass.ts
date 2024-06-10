import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy, lazy} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import {util} from "../../../../../lib/util/util";
import {Vector2} from "../../../../../lib/math";
import {Log} from "../../../../../lib/util/Log";
import * as lodash from "lodash";
import rgbSimilarity = util.rgbSimilarity;
import sampleImage = util.sampleImage;
import log = Log.log;
import rgbContrast = util.rgbContrast;


export class CapturedCompass {

  public readonly arc_line: CapturedImage
  public readonly compass_area: CapturedImage

  constructor(public readonly body: CapturedImage) {
    body.setName("compass")

    this.arc_line = body.getSubSection({
      origin: {x: 34, y: 235},
      size: {x: 112, y: 1},
    }).setName("arc line")

    this.compass_area = body.getSubSection(CapturedCompass.ARROW_RECT_FROM_BODY).setName("compass body")
  }

  recapture(): CapturedCompass {
    return new CapturedCompass(this.body.recapture())
  }

  private _is_arc_lines = lazy(() => {
    const PIXEL_REQUIRED_TO_BE_CONSIDERED_ARC_COMPASS = 5
    const buf = this.arc_line.getData()

    const text_color: [number, number, number] = [51, 25, 0]
    let n = 0;
    for (let x = 0; x < buf.width; x++) {
      if (rgbSimilarity(text_color, sampleImage(buf, {x: x, y: 0})) > 0.9) {
        n++;
      }
    }

    return n > PIXEL_REQUIRED_TO_BE_CONSIDERED_ARC_COMPASS;
  })

  isArcCompass(): boolean {
    return this._is_arc_lines.get()
  }

  /**
   * Looks for a compass in the given {@link CapturedImage} by looking for the north-indicator.
   * @param screen The image to search for a compass interface.
   */
  static async find(screen: CapturedImage): Promise<CapturedCompass> {
    const position = screen.find(await CapturedCompass.anchor.get())[0]

    if (position) {

      // This is where it gets weird, so pay attention:
      // The position of the north indicator is nondeterministic. It varies by a pixel to the left/right.
      // We need to fix or the compass readings will be extremely off.

      // We (try to) fix this, by checking for checking the contrast between 2 specific pixels that are part of the little arrow below the north-indicator.
      // We sample three consecutive pixels, and depending on which pair has the higher contrast, we move the position a pixel to the right (or not).

      const contrast_check_image = screen.getSubSection(
        ScreenRectangle.move(position.relativeRectangle(),
          {x: 8, y: 18},
          {x: 3, y: 3}),
      ).getData()

      const correction_candidates: Vector2[] = [
        {x: 0, y: 0},
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: 1, y: -1},
      ]

      const correction = {x: 0, y: 0}/*lodash.minBy(correction_candidates, correction => {
        const bl_index: Vector2 = {
          x: 0 + correction.x,
          y: 2 + correction.y,
        }

        const bl = sampleImage(contrast_check_image, bl_index)
        const br = sampleImage(contrast_check_image, {x: bl_index.x + 1, y: bl_index.y})
        const tl = sampleImage(contrast_check_image, {x: bl_index.x, y: bl_index.y + 1})
        const tr = sampleImage(contrast_check_image, {x: bl_index.x + 1, y: bl_index.y + 1})

        return rgbContrast(bl, tl) + rgbContrast(br, tr) - rgbContrast(tl, tr)
      })*/

      /*const a = sampleImage(contrast_check_image, {x: 0, y: 0})
      const b = sampleImage(contrast_check_image, {x: 1, y: 0})
      const c = sampleImage(contrast_check_image, {x: 2, y: 0})

      const contrast_ab = 1 - rgbSimilarity(a, b)
      const contrast_bc = 1 - rgbSimilarity(b, c)

      if (correction.x != 0 || correction.y != 0) log().log(`Correcting compass reader by ${correction.x}|${correction.y}`, "Compass Reader")
      else log().log("No need for correction", "Compass Reader")*/

      // If the contrast of the right 2 pixels is larger than the constrast on the left, we need to move the entire interface 1 pixel to the right because the north-indicator is in the left position
      /*const weirdness_correction =
        contrast_bc > contrast_ab
          ? {x: 1, y: 0}
          : {x: 0, y: 0}*/

      const section = screen.getSubSection(
        ScreenRectangle.move(position.relativeRectangle(),
          Vector2.add(CapturedCompass.origin_offset_from_anchor, correction),
          CapturedCompass.UI_SIZE),
      )

      return new CapturedCompass(section)
    }

    return null
  }
}

export namespace CapturedCompass {
  export const anchor = async_lazy(async () => await ImageDetect.imageDataFromUrl("alt1anchors/compassnorth.png"))
  export const origin_offset_from_anchor = {x: -78, y: -20}
  export const UI_SIZE = {x: 172, y: 259}


  export const ARROW_CENTER_OFFSET_FROM_BODY_TL = {x: 88, y: 137}
  export const INNER_COMPASS_RADIUS: number = 75
  export const TOTAL_COMPASS_RADIUS: number = 80

  export const ARROW_RECT_FROM_BODY: ScreenRectangle = {
    origin: Vector2.sub(ARROW_CENTER_OFFSET_FROM_BODY_TL, {x: TOTAL_COMPASS_RADIUS, y: TOTAL_COMPASS_RADIUS}),
    size: {x: 2 * TOTAL_COMPASS_RADIUS + 1, y: 2 * TOTAL_COMPASS_RADIUS + 1}
  }

}