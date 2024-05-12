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
        this.screenRectangle().size.x,
        this.screenRectangle().size.y,
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
