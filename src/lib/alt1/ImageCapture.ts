import * as a1lib from "@alt1/base";
import {ImageDetect, ImgRef} from "@alt1/base";
import {Vector2} from "../math";
import {LazyAsync} from "../properties/Lazy";
import * as OCR from "@alt1/ocr";
import {ScreenRectangle} from "./ScreenRectangle";

export function imageSize(image: ImageData): Vector2 {
  return {x: image.width, y: image.height}
}

export class CapturedImage {
  private _data: ImageData = undefined
  private readonly _fullCapturedRectangle: ScreenRectangle
  private readonly _relativeRectangle: ScreenRectangle

  public readonly size: Vector2

  constructor(public readonly underlying: ImgRef,
              private readonly screen_rectangle: ScreenRectangle = null,
              public readonly parent: CapturedImage = null
  ) {
    this._fullCapturedRectangle = {
      origin: {x: underlying.x, y: underlying.y},
      size: {x: underlying.width, y: underlying.height}
    }

    if (!this.screen_rectangle) {
      this.screen_rectangle = this._fullCapturedRectangle
    }

    if (parent) {
      this._relativeRectangle = {
        origin: Vector2.sub(this.screen_rectangle.origin, this.parent.screen_rectangle.origin),
        size: screen_rectangle.size
      }
    }

    this.size = this.screen_rectangle.size
  }

  screenRectangle(): ScreenRectangle {
    return this.screen_rectangle
  }

  relativeRectangle(): ScreenRectangle {
    return this._relativeRectangle
  }

  find(needle: ImageData): CapturedImage[] {
    return this.underlying.findSubimage(needle).map(position =>
      this.getSubSection({origin: position, size: {x: needle.width, y: needle.height}})
    )
  }

  root(): CapturedImage {
    if (this.parent) return this.parent
    else return this
  }

  getSubSection(rectangle: ScreenRectangle): CapturedImage {
    return new CapturedImage(
      this.underlying,
      {
        origin: Vector2.add(this.screen_rectangle.origin, rectangle.origin),
        size: rectangle.size
      },
      this
    )
  }

  getData(): ImageData {
    if (!this._data) {
      this._data = this.underlying.toData(
        this.screen_rectangle.origin.x,
        this.screen_rectangle.origin.y,
        this.screen_rectangle.size.x,
        this.screen_rectangle.size.y,
      )
    }

    return this._data
  }

  static capture(section: ScreenRectangle = null): CapturedImage | null {
    try {
      // TODO: This should respect a1.captureInterval in some way
      const img = section
        ? a1lib.captureHold(section.origin.x, section.origin.y, section.size.x, section.size.y)
        : a1lib.captureHoldFullRs()

      return new CapturedImage(img)
    } catch (e: any) {
      console.error(`Capture failed: ${e.message}`)
      console.error(e.stack)

      return null
    }

  }
}

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
    const BODY_TR_OFFSET_FROM_X: Vector2 = {x: 20, y: 24}

    const body_tl = Vector2.add(top_left.relativeRectangle().origin, BODY_TL_OFFSET_FROM_TL)
    const body_bl = Vector2.add(bot_left.relativeRectangle().origin, BODY_BL_OFFSET_FROM_BL)
    const body_tr = Vector2.add(eoc_x.relativeRectangle().origin, BODY_TR_OFFSET_FROM_X)

    const body_height = body_bl.y - body_tl.y + 1
    const body_width = body_tr.x - body_tl.x + 1
    const BODY_SIZE: Vector2 = {x: body_width, y: body_height}

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