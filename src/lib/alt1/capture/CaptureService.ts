import {Process} from "../../Process";
import {CapturedImage} from "./CapturedImage";
import {timeSync} from "../../gamemap/GameLayer";
import {ScreenRectangle} from "../ScreenRectangle";
import {Ewent, ewent} from "../../reactive";
import {util} from "../../util/util";
import todo = util.todo;

class AbstractCaptureService<
  InterestOptionsT,
  ValueT
> {
  private last_capture: ValueT = null

  constructor(private data_sources: AbstractCaptureService<any, any>[]) {
    
  }

  registerInterest(desired_interval: number,
                   rectangle: ScreenRectangle
  ): CaptureService.InterestToken {
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

  captureOnce(options: {
    newer_than?: number | CapturedImage,
    options: InterestOptionsT
  }): Promise<ValueT> {

    todo()
  }
}

namespace AbstractCaptureService {
  export abstract class InterestToken<OptionsT, ValueT> {
    private killed_event = ewent<this>()
    private alive: boolean = true
    private paused: boolean = false

    constructor() {}

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

    unregister() {
      if (!this.alive) return

      this.alive = false
      this.killed_event.trigger(this)
    }

    onKilled(f: (_: this) => void): this {
      this.killed_event.on(f)

      return this
    }

    abstract isOneTime(): boolean

    abstract handle(value: ValueT): void

    abstract options(): OptionsT
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

  /**
   * Will
   * @param options
   */
  captureOnce(options: {
    newer_than?: number | CapturedImage,
    area: ScreenRectangle
  }): Promise<CapturedImage> {

    todo()
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