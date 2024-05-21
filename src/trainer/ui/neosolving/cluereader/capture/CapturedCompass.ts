import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy, Lazy, LazyAsync} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import {util} from "../../../../../lib/util/util";
import rgbSimilarity = util.rgbSimilarity;


export class CapturedCompass {

  constructor(private body: CapturedImage) {

  }

  recapture(): CapturedCompass {
    return new CapturedCompass(this.body.recapture())
  }

  isArcCompass(): boolean {
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

  /**
   * Looks for a compass in the given {@link CapturedImage} by looking for the north-indicator.
   * @param screen The image to search for a compass interface.
   */
  static async find(screen: CapturedImage): Promise<CapturedCompass> {
    const position = screen.find(await CapturedCompass.anchor.get())[0]

    if (position) {
      const section = screen.getSubSection(
        ScreenRectangle.move(position.relativeRectangle(), CapturedCompass.origin_offset_from_anchor, CapturedCompass.UI_SIZE),
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
}