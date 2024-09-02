import {Process} from "../../Process";
import {CapturedImage} from "./CapturedImage";
import {timeSync} from "../../gamemap/GameLayer";
import {ScreenRectangle} from "../ScreenRectangle";
import {Ewent, ewent} from "../../reactive";
import {util} from "../../util/util";
import todo = util.todo;
import TimedValue = AbstractCaptureService.TimedValue;

export abstract class AbstractCaptureService<
  InterestOptionsT,
  ValueT
> {
  protected last_checked_tick: number = undefined
  protected interests: AbstractCaptureService.InterestToken<InterestOptionsT, ValueT>[] = []
  protected raw_last_capture: TimedValue<ValueT> = undefined

  subscribe(token: AbstractCaptureService.InterestToken<InterestOptionsT, ValueT>): AbstractCaptureService.InterestToken<InterestOptionsT, ValueT> {

    this.interests.push(token)

    token.onKilled(() => {
      const i = this.interests.indexOf(token)
      if (i >= 0) this.interests.splice(i, 1)
    })

    return token
  }

  protected transformValueForNotification(options: InterestOptionsT,
                                          raw_value: ValueT
  ): ValueT {
    return raw_value
  }

  protected doIfAnyInterest(tick: number, f: (interest_options: InterestOptionsT[]) => ValueT | undefined) {
    if (tick == this.last_checked_tick) return // Skip if the tick was already done

    this.last_checked_tick = tick

    const interested_in_this_tick = this.interests
      .filter(t => !t.isPaused())
      .filter(t => tick % t.tickModulo() == 0)
      .map(t => ({options: t.options(), token: t}))

    if (interested_in_this_tick.length > 0) {
      const raw_value = f(interested_in_this_tick.map(t => t.options))

      if (raw_value === undefined) return

      this.raw_last_capture = {
        tick: tick,
        value: raw_value
      }

      interested_in_this_tick.forEach(interest => {
        interest.token.notify({
          tick: tick,
          value: this.transformValueForNotification(interest.options, raw_value)
        })
      })
    }
  }

  captureOnce(options: {
    newer_than?: number | CapturedImage,
    options: InterestOptionsT
  }): Promise<ValueT> {

    todo()
  }
}

export namespace AbstractCaptureService {
  export abstract class InterestToken<OptionsT = any, ValueT = any> {
    private killed_event = ewent<this>()
    private alive: boolean = true
    private _last_notification: TimedValue<ValueT>

    constructor() {}

    abstract isPaused(): boolean

    revoke() {
      if (!this.alive) return

      this.alive = false
      this.killed_event.trigger(this)
    }

    onKilled(f: (_: this) => void): this {
      this.killed_event.on(f)

      return this
    }

    isOneTime(): boolean {
      return false
    }

    protected abstract handle(value: AbstractCaptureService.TimedValue<ValueT>): void

    abstract options(): OptionsT

    tickModulo(): number {
      return 1
    }

    notify(value: TimedValue<ValueT>): void {
      this._last_notification = value
      this.handle(value)

      if (this.isOneTime()) this.revoke()
    }

    lastNotification(): TimedValue<ValueT> {
      return this._last_notification
    }
  }

  export type TimedValue<T> = {
    tick: number,
    value: T
  }
}

export abstract class DerivedCaptureService<
  InterestOptionsT,
  ValueT
> extends AbstractCaptureService<InterestOptionsT, ValueT> {
  private sources: {
    token: AbstractCaptureService.InterestToken<any, any>,
    service: AbstractCaptureService<any, any>
  }[] = []

  protected constructor() {
    super()
  }

  protected addDataSource<SourceOptionsT, SourceValueT>(s: AbstractCaptureService<SourceOptionsT, SourceValueT>, options: () => SourceOptionsT): AbstractCaptureService.InterestToken<SourceOptionsT, SourceValueT> {
    const self = this

    const token = s.subscribe(new class extends AbstractCaptureService.InterestToken<SourceOptionsT, SourceValueT> {
      protected handle(value: AbstractCaptureService.TimedValue<SourceValueT>): void {

        if (self.sources.every(s => s.token.lastNotification()?.tick == value.tick)) {
          self.doIfAnyInterest(value.tick, interest_options => {
            return self.process(interest_options)
          })
        }
      }

      options(): SourceOptionsT {
        return options()
      }

      tickModulo(): number {
        return Math.min(200, ...self.interests.map(t => t.tickModulo()));
      }

      isPaused(): boolean {
        return self.interests.every(t => t.isPaused());
      }
    })

    this.sources.push({
      service: s,
      token: token
    })

    return token
  }

  abstract process(interested_tokens: InterestOptionsT[]): ValueT
}

export class ScreenCaptureService extends AbstractCaptureService<
  { area: ScreenRectangle },
  CapturedImage
> {
  private ticker: Process

  constructor() {
    super();

    const self = this

    this.ticker = new class extends Process.Interval {
      start_time: number = undefined

      async tick(): Promise<void> {
        if (!alt1.rsLinked) return

        const now = Date.now()

        this.start_time ??= now

        const tick = ~~((now - this.start_time) / CaptureService.MIN_CAPTURE_INTERVAL)

        self.doIfAnyInterest(tick, interested_in_this_tick => {
          const required_area = ScreenRectangle.union(
            ...interested_in_this_tick.map(t => t?.area ?? {origin: {x: 0, y: 0}, size: {x: alt1.rsWidth, y: alt1.rsHeight}})
          )

          const capture = timeSync("Capture", () => CapturedImage.capture(required_area))

          if (!capture) return undefined

          return capture
        })
      }
    }(1000 / CaptureService.MAX_FPS / 2)

    this.ticker.run()
  }


  protected transformValueForNotification(options: { area: ScreenRectangle }, raw_value: CapturedImage): CapturedImage {
    return options?.area ? raw_value.getScreenSection(options.area) : raw_value
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


  export function getTickModulo(interval: number): number {
    const tier = Math.round(Math.log2(interval / CaptureService.MIN_CAPTURE_INTERVAL))

    return Math.pow(2, tier)
  }

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