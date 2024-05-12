import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import * as OCR from "@alt1/ocr";
import {Vector2} from "../../../../../lib/math";
import {LazyAsync} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {CapturedImage, imageSize} from "../../../../../lib/alt1/ImageCapture";

export class CapturedModal {
  private _title: string = null

  constructor(
    public readonly body: CapturedImage,
    public readonly isLegacy: boolean) {
  }

  title(): string {
    if (!this._title && this.body.parent) {
      const TITLE_BAR_OFFSET_FROM_BODY = {x: 0, y: -24}
      const TITLE_BAR_SIZE = {x: 250, y: 20}

      const title_bar = this.body.parent.getSubSection(
        ScreenRectangle.move(this.body.relativeRectangle(), TITLE_BAR_OFFSET_FROM_BODY, TITLE_BAR_SIZE)
      ).getData()

      this._title = OCR.readSmallCapsBackwards(title_bar, CapturedModal.title_font, [[255, 203, 5]], 0, 13, title_bar.width, 1).text;
    }

    return this._title.toString()
  }

  static assumeBody(image: CapturedImage): CapturedModal {
    return new CapturedModal(image, false)
  }

  static async findIn(img: CapturedImage): Promise<CapturedModal> {
    // TODO: Support legacy interface mode

    const anchors = await CapturedModal.anchors.get()

    const eoc_x = img.find(anchors.eoc.close_x)[0]

    if (!eoc_x) return null

    const TL_OFFSET_FROM_X: Vector2 = {x: -479, y: -5}

    let top_left = img.getSubSection(
      ScreenRectangle.move(eoc_x.relativeRectangle(), TL_OFFSET_FROM_X, imageSize(anchors.eoc.top_left))
    ).find(anchors.eoc.top_left)[0]

    if (!top_left) return null;

    const BL_OFFSET_FROM_X: Vector2 = {x: -479, y: 328}

    let bot_left = img.getSubSection(
      ScreenRectangle.move(eoc_x.relativeRectangle(), BL_OFFSET_FROM_X, imageSize(anchors.eoc.bot_left))
    ).find(anchors.eoc.bot_left)[0]

    if (!bot_left) return null;

    const BODY_TL_OFFSET_FROM_TL: Vector2 = {x: 4, y: 29}
    const BODY_BL_OFFSET_FROM_BL: Vector2 = {x: 4, y: 7}

    const BODY_OFFSET_FROM_X: Vector2 = {x: -475, y: 24}
    const body_height = (bot_left.relativeRectangle().origin.y + BODY_BL_OFFSET_FROM_BL.y) - (top_left.relativeRectangle().origin.y + BODY_TL_OFFSET_FROM_TL.y) + 1
    const BODY_SIZE: Vector2 = {x: 496, y: body_height}

    const body = img.getSubSection(ScreenRectangle.move(top_left.relativeRectangle(), BODY_TL_OFFSET_FROM_TL, BODY_SIZE))

    return new CapturedModal(body, false)
  }
}

export namespace CapturedModal {
  export const title_font = require("@alt1/ocr/fonts/aa_9px_mono_allcaps.js");

  export const anchors = new LazyAsync(async () => {
    return {
      eoc: {
        close_x: await ImageDetect.imageDataFromUrl("alt1anchors/eocx.png"),
        top_left: await ImageDetect.imageDataFromUrl("alt1anchors/eoctopleft.png"),
        bot_left: await ImageDetect.imageDataFromUrl("alt1anchors/eocbotleft.png")
      },
      legacy: {
        close_x: await ImageDetect.imageDataFromUrl("alt1anchors/legacyx.png"),
        top_left: await ImageDetect.imageDataFromUrl("alt1anchors/legacytopleft.png"),
        bot_left: await ImageDetect.imageDataFromUrl("alt1anchors/legacybotleft.png")
      },
    }
  })
}