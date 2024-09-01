import * as a1lib from "@alt1/base";
import {ImageDetect, ImgRef, ImgRefData} from "@alt1/base";
import {Vector2} from "../math";
import {ScreenRectangle} from "./ScreenRectangle";
import {OverlayGeometry} from "./OverlayGeometry";
import {util} from "../util/util";
import {findSubbuffer} from "@alt1/base/src/imagedetect";
import {Process} from "../Process";
import {ewent, Ewent} from "../reactive";
import {timeSync} from "../gamemap/GameLayer";
import A1Color = util.A1Color;

export class CapturedImage {
  private _name: string = undefined
  private _data: ImageData = undefined
  private readonly _fullCapturedRectangle: ScreenRectangle
  private readonly _relativeRectangle: ScreenRectangle

  public readonly size: Vector2

  constructor(public readonly capture: { timestamp: number, img_ref: ImgRef },
              public readonly screen_rectangle: ScreenRectangle,
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

  private ensure_current() {
    if (this.root() != CapturedImage.latest_capture) {
      //debugger
      throw new Error("Tried to perform an operation on an expired ImgRefBind")
    }
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
    const ref = alt1.bindFindSubImg
      ? this.capture.img_ref
      : new ImgRefData(this.getData())

    this.ensure_current()

    return ref.findSubimage(needle,
      this.screen_rectangle.origin.x, this.screen_rectangle.origin.y,
      this.screen_rectangle.size.x, this.screen_rectangle.size.y
    ).map(position =>
      this.getSubSection({origin: position, size: {x: needle.width, y: needle.height}})
    )
  }

  findNeedle(needle: NeedleImage): CapturedImage[] {

    const find = ((): Vector2[] => {
      if (this.capture.img_ref instanceof a1lib.ImgRefBind && alt1.bindFindSubImg) {

        this.ensure_current()

        // Happy path: Accelerated image lookup via Alt1 is available

        const r = alt1.bindFindSubImg(this.capture.img_ref.handle, needle.encoded(), needle.underlying.width,
          this.screen_rectangle.origin.x, this.screen_rectangle.origin.y,
          this.screen_rectangle.size.x, this.screen_rectangle.size.y
        )

        if (!r) { throw new a1lib.Alt1Error(); }

        return JSON.parse(r) as Vector2[]
      } else {
        // Fallback:

        return findSubbuffer(this.getData(), needle.underlying,
          this.screen_rectangle.origin.x, this.screen_rectangle.origin.y,
          this.screen_rectangle.size.x, this.screen_rectangle.size.y)
      }
    })

    return find().map(pos => {

      return this.getSubSection(ScreenRectangle.relativeTo(this.screen_rectangle, {origin: pos, size: {x: needle.underlying.width, y: needle.underlying.height}}))
    });
  }

  root(): CapturedImage {
    if (this.parent) return this.parent.root()
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
      this.ensure_current()

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

  private static latest_capture: CapturedImage = null

  static capture(section: ScreenRectangle = null): CapturedImage | null {
    try {
      // TODO: This should respect a1.captureInterval in some way
      const timestamp = Date.now()

      // Default to the full rs game window if no specific section was specified
      const area = section ?? {origin: {x: 0, y: 0}, size: {x: alt1.rsWidth, y: alt1.rsHeight}}

      const img = a1lib.captureHold(area.origin.x, area.origin.y, area.size.x, area.size.y)

      return this.latest_capture = new CapturedImage({img_ref: img, timestamp: timestamp}, area)
        .setName(section ? "Partial Capture" : "Full Capture")
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

export class NeedleImage {
  private _encoded: string

  constructor(public underlying: ImageData) {
    this._encoded = a1lib.encodeImageString(underlying)
  }

  public encoded(): string {
    return this._encoded
  }

  static async fromURL(url: string): Promise<NeedleImage> {
    return new NeedleImage(await ImageDetect.imageDataFromUrl(url))
  }
}

export class CaptureService extends Process.Interval {
  private last_capture: CapturedImage = null

  constructor() {
    super(1000 / CaptureService.MAX_FPS);
  }

  tick(): Promise<void> {
    if (!alt1.rsLinked) return

    const active_interests = this.interests.filter(t => !t.token.isPaused())

    if (active_interests.length == 0) return

    const min_interval = Math.min(...active_interests.map(i => i.token.getInterval()))

    const now = Date.now()

    if (this.last_capture && this.last_capture.capture.timestamp + min_interval > now) return

    const capture = timeSync("Capture", () => CapturedImage.capture())

    if (!capture) return

    this.last_capture = capture

    for (const interest of this.interests) {

      const next_scheduled = interest.last_capture == null
        ? now
        : interest.last_capture + interest.token.getInterval()

      if (Math.abs(now - next_scheduled) < Math.abs((now + min_interval) - next_scheduled)) {
        interest.last_capture = capture.capture.timestamp

        const area = interest.token.getArea()

        if (area) interest.ewent.trigger(capture.getSubSection(area))
        else interest.ewent.trigger(capture)
      }
    }

    return undefined;
  }

  registerInterest(desired_interval: number,
                   rectangle: ScreenRectangle): CaptureService.InterestToken {
    const event = ewent<CapturedImage>()

    const token = new CaptureService.InterestToken(self => {
      const i = this.interests.findIndex(i => i.token == self);

      if (i >= 0) this.interests.splice(i, 1)
    }, event)
      .setInterval(desired_interval)
      .setArea(rectangle)


    this.interests.push({
      last_capture: null,
      token: token,
      ewent: event
    })

    return token
  }

  private interests: {
    last_capture: number,
    token: CaptureService.InterestToken,
    ewent: Ewent.Real<CapturedImage>
  }[] = []
}

export namespace CaptureService {

  export const MAX_FPS = 60
  export const MIN_CAPTURE_INTERVAL = 1000 / MAX_FPS

  export class InterestToken {

    private captureInterval: number = MIN_CAPTURE_INTERVAL
    private area: ScreenRectangle = null

    private active: boolean = true
    private paused: boolean = false


    constructor(private readonly kill: (self: InterestToken) => void,
                private readonly ewent: Ewent<CapturedImage>
    ) { }

    unregister() {
      if (!this.active) return

      this.active = false
      this.kill(this)
    }

    setInterval(interval: number): this {
      this.captureInterval = interval
      return this
    }

    getInterval(): number {
      return this.captureInterval
    }

    setArea(area: ScreenRectangle): this {
      this.area = area
      return this
    }

    getArea(): ScreenRectangle {
      return this.area
    }

    pause(): this {
      this.paused = true
      return this
    }

    unpause(): this {
      this.paused = false
      return this
    }

    isPaused(): boolean {
      return this.paused
    }

    onCapture(handler: (_: CapturedImage) => void): this {
      this.ewent.on(handler)

      return this
    }
  }
}