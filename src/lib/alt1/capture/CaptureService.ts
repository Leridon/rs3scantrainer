import {Process} from "../../Process";
import {CapturedImage} from "./CapturedImage";
import {timeSync} from "../../gamemap/GameLayer";
import {ScreenRectangle} from "../ScreenRectangle";
import {Ewent, ewent, EwentHandler} from "../../reactive";
import {util} from "../../util/util";
import {EwentHandlerPool} from "../../reactive/EwentHandlerPool";
import {Log} from "../../util/Log";
import todo = util.todo;
import TimedValue = AbstractCaptureService.TimedValue;

export type InterestedToken<InterestOptionsT extends AbstractCaptureService.Options = AbstractCaptureService.Options, ValueT = any> = {
  token: AbstractCaptureService.InterestToken<InterestOptionsT, ValueT>,
  options: InterestOptionsT
}

export abstract class AbstractCaptureService<
  InterestOptionsT extends AbstractCaptureService.Options,
  ValueT
> {
  protected last_checked_tick: AbstractCaptureService.CaptureTime = undefined
  protected interests: AbstractCaptureService.InterestToken<InterestOptionsT, ValueT>[] = []
  protected raw_last_capture: TimedValue<ValueT, InterestOptionsT> = undefined

  subscribe<ActualInterestOptionsT extends InterestOptionsT>(token: AbstractCaptureService.InterestToken<ActualInterestOptionsT, ValueT>,
                                                             f: (_: this) => EwentHandler<any>[] = () => []
  ): AbstractCaptureService.InterestToken<InterestOptionsT, ValueT> {

    this.interests.push(token)

    token.onKilled(() => {
      const i = this.interests.indexOf(token)
      if (i >= 0) this.interests.splice(i, 1)
    })

    token.handler_pool.bind(...f(this))

    return token
  }

  protected transformValueForNotification(options: InterestOptionsT,
                                          raw_value: TimedValue<ValueT, InterestOptionsT>
  ): ValueT {
    return raw_value.value
  }

  protected doIfAnyInterest(time: AbstractCaptureService.CaptureTime, f: (interest_options: InterestOptionsT[]) => ValueT | undefined) {
    if (time.tick == this.last_checked_tick?.tick) return // Skip if the tick was already done

    this.last_checked_tick = time

    const interested_in_this_tick = this.getInterests(time)

    if (interested_in_this_tick.length > 0) {
      const raw_value = f(interested_in_this_tick.map(t => t.options))

      if (raw_value === undefined) return

      const value = this.raw_last_capture = {
        time: time,
        value: raw_value,
        options: null
      }

      interested_in_this_tick.forEach(interest => {
        interest.token.notify({
          time: time,
          value: this.transformValueForNotification(interest.options, value),
          options: interest.options
        })
      })
    }
  }

  private _currentInterest: {
    time: AbstractCaptureService.CaptureTime,
    interests: InterestedToken<InterestOptionsT, ValueT>[]
  } = null

  protected getInterests(time: AbstractCaptureService.CaptureTime): InterestedToken<InterestOptionsT, ValueT>[] {
    if (!this._currentInterest || this._currentInterest.time.tick != time.tick) {
      this._currentInterest = {
        time: time,
        interests: this.interests
          .filter(t => !t.isPaused())
          .map(t => ({options: t.options(time), token: t}))
          .filter(t => t.options && (time.tick % Math.pow(2, t.options.tick_modulo) == 0))
      }
    }

    return this._currentInterest.interests
  }

  captureOnce(options: {
    newer_than?: number | CapturedImage,
    options: InterestOptionsT
  }): Promise<ValueT> {

    todo()
  }
}

export namespace AbstractCaptureService {
  import log = Log.log;

  export abstract class InterestToken<OptionsT extends Options = Options, ValueT = any> {
    public handler_pool: EwentHandlerPool = new EwentHandlerPool()

    private killed_event = ewent<this>()
    private alive: boolean = true
    private _last_notification: TimedValue<ValueT, OptionsT>

    constructor() {}

    abstract isPaused(): boolean

    revoke() {
      if (!this.alive) return

      this.alive = false
      this.killed_event.trigger(this)

      this.handler_pool.kill()
    }

    onKilled(f: (_: this) => void): this {
      this.killed_event.on(f)

      return this
    }

    isOneTime(): boolean {
      return false
    }

    protected abstract handle(value: AbstractCaptureService.TimedValue<ValueT, OptionsT>): void

    abstract options(time: CaptureTime): OptionsT | null

    notify(value: TimedValue<ValueT, OptionsT>): void {
      this._last_notification = value

      try {
        this.handle(value)
      } catch (e) {
        if (e instanceof Error) {
          log().log(e.toString(), "Capturing")
        }
      }

      if (this.isOneTime()) this.revoke()
    }

    lastNotification(): TimedValue<ValueT, OptionsT> {
      return this._last_notification
    }
  }

  export type Options = {
    tick_modulo: number
  }

  export type CaptureTime = {
    tick: number,
    time: number
  }

  export type TimedValue<T, OptionsT extends Options = Options> = {
    time: CaptureTime,
    options: OptionsT,
    value: T
  }
}

export abstract class DerivedCaptureService<
  InterestOptionsT extends AbstractCaptureService.Options = AbstractCaptureService.Options,
  ValueT = null
> extends AbstractCaptureService<InterestOptionsT, ValueT> {
  private sources: {
    token: AbstractCaptureService.InterestToken,
    service: AbstractCaptureService<any, any>
  }[] = []

  protected constructor() {
    super()
  }

  protected addDataSource<SourceOptionsT extends AbstractCaptureService.Options, SourceValueT>(
    s: AbstractCaptureService<SourceOptionsT, SourceValueT>,
    options: (child_options: InterestOptionsT[]) => SourceOptionsT
  ): AbstractCaptureService.InterestToken<SourceOptionsT, SourceValueT> {
    const self = this

    const token = s.subscribe(new class extends AbstractCaptureService.InterestToken<DerivedCaptureService.Options<SourceOptionsT, InterestOptionsT, ValueT>, SourceValueT> {
      protected handle(source_value: AbstractCaptureService.TimedValue<SourceValueT, DerivedCaptureService.Options<SourceOptionsT, InterestOptionsT, ValueT>>): void {

        if (self.sources.every(s => s.token.lastNotification()?.time?.tick == source_value.time.tick)) {
          const interests = self.getInterests(source_value.time) // This looks like a recalculation, but getInterests caches the results for each tick

          const value = self.raw_last_capture = {
            time: source_value.time,
            options: null,
            value: self.processNotifications(interests)
          }

          interests.forEach(token => {
            token.token.notify(
              {
                time: value.time,
                options: token.options,
                value: self.transformValueForNotification(token.options, value)
              }
            )
          })
        }
      }

      options(time: AbstractCaptureService.CaptureTime): DerivedCaptureService.Options<SourceOptionsT, InterestOptionsT, ValueT> {
        const interested_in_this_tick: InterestedToken<any, ValueT>[] = self.getInterests(time)

        const compound_options = options(interested_in_this_tick.map(t => t.options))

        return {
          ...compound_options,
          tick_modulo: Math.min(200, ...interested_in_this_tick.map(t => t.options.tick_modulo)),
          original_interests: interested_in_this_tick
        }
      }


      /*options(time: AbstractCaptureService.CaptureTime): SourceOptionsT {
        const interested_in_this_tick = self.interests
          .filter(t => !t.isPaused() && (time.tick % t.tickModulo() == 0))
          .map(t => t.options(time))

        return options(interested_in_this_tick)
      }*/

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

  abstract processNotifications(interested_tokens: InterestedToken<InterestOptionsT, ValueT>[]): ValueT
}

export namespace DerivedCaptureService {
  export type Options<SourceOptionsT extends AbstractCaptureService.Options, InterestOptionsT extends AbstractCaptureService.Options, ValueT> = SourceOptionsT & {
    original_interests: InterestedToken<InterestOptionsT, ValueT>[]
  }
}

export class ScreenCaptureService extends AbstractCaptureService<
  { area: ScreenRectangle, tick_modulo: number },
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

        const time: AbstractCaptureService.CaptureTime = {
          tick: ~~((now - this.start_time) / CaptureService.MIN_CAPTURE_INTERVAL),
          time: now
        }

        self.doIfAnyInterest(time, interested_in_this_tick => {
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


  protected transformValueForNotification(options: { area: ScreenRectangle; tick_modulo: number }, raw_value: AbstractCaptureService.TimedValue<CapturedImage, {
    area: ScreenRectangle;
    tick_modulo: number
  }>): CapturedImage {
    return options?.area ? raw_value.value.getScreenSection(options.area) : raw_value.value
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