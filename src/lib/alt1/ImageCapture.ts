import * as a1lib from "@alt1/base";
import {ImageDetect, ImgRef, mixColor} from "@alt1/base";
import {Vector2} from "../math";
import {LazyAsync} from "../properties/Lazy";
import * as OCR from "@alt1/ocr";
import {ScreenRectangle} from "./ScreenRectangle";
import {OverlayGeometry} from "./OverlayGeometry";
import {util} from "../util/util";
import A1Color = util.A1Color;

export class CapturedImage {
  private _name: string = undefined
  private _data: ImageData = undefined
  private readonly _fullCapturedRectangle: ScreenRectangle
  private readonly _relativeRectangle: ScreenRectangle

  public readonly size: Vector2

  constructor(private readonly capture: { timestamp: number, img_ref: ImgRef },
              private readonly screen_rectangle: ScreenRectangle = null,
              public readonly parent: CapturedImage = null
  ) {
    this._fullCapturedRectangle = {
      origin: {x: capture.img_ref.x, y: capture.img_ref.y},
      size: {x: capture.img_ref.width, y: capture.img_ref.height}
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

  setName(name: string): this {
    this._name = name
    return this
  }

  name(): string {
    return this._name
  }

  raw(): ImgRef {
    return this.capture.img_ref
  }

  screenRectangle(): ScreenRectangle {
    return this.screen_rectangle
  }

  relativeRectangle(): ScreenRectangle {
    return this._relativeRectangle
  }

  find(needle: ImageData): CapturedImage[] {
    return this.capture.img_ref.findSubimage(needle).map(position =>
      this.getSubSection({origin: position, size: {x: needle.width, y: needle.height}})
    )
  }

  root(): CapturedImage {
    if (this.parent) return this.parent
    else return this
  }

  getSubSection(relative_rectangle: ScreenRectangle): CapturedImage {
    return new CapturedImage(
      this.capture,
      {
        origin: Vector2.add(this.screen_rectangle.origin, relative_rectangle.origin),
        size: relative_rectangle.size
      },
      this
    )
  }

  getData(): ImageData {
    if (!this._data) {
      this._data = this.capture.img_ref.toData(
        this.screen_rectangle.origin.x,
        this.screen_rectangle.origin.y,
        this.screen_rectangle.size.x,
        this.screen_rectangle.size.y,
      )
    }

    return this._data
  }

  recapture(): CapturedImage {
    return CapturedImage.capture(this.screenRectangle())
  }

  static capture(section: ScreenRectangle = null): CapturedImage | null {
    try {
      // TODO: This should respect a1.captureInterval in some way
      const timestamp = Date.now()

      const img = section
        ? a1lib.captureHold(section.origin.x, section.origin.y, section.size.x, section.size.y)
        : a1lib.captureHoldFullRs()

      return new CapturedImage({img_ref: img, timestamp: timestamp})
    } catch (e: any) {
      console.error(`Capture failed: ${e.message}`)
      console.error(e.stack)

      return null
    }
  }

  debugOverlay(overlay: OverlayGeometry = new OverlayGeometry()): OverlayGeometry {
    overlay.rect2(this.screenRectangle())

    if (this._name) {
      overlay.text(this._name, this.screen_rectangle.origin,
        {width: 10, centered: false, color: A1Color.fromHex("#FFFFFF")}
      )
    }

    return overlay
  }
}