import {ewent} from "./reactive";
import {delay} from "../skillbertssolver/oldlib";

export abstract class Process<Result> {
  private finished_event = ewent<this>()

  private is_running: boolean = false
  protected should_stop: boolean = false
  private finished: boolean = false

  protected start_time: number
  private last_interrupt_time: number
  protected end_time: number
  private progress: number

  private timeout: number = Number.MAX_SAFE_INTEGER

  withTimeout(timeout: number): this {
    this.timeout = timeout
    return this
  }

  private interrupt_ewent = ewent<null>()

  abstract implementation(): Promise<Result> | Result

  async run(): Promise<Result> {
    if (this.is_running || this.finished) return null

    this.is_running = true
    this.should_stop = false

    this.start_time = Date.now();
    this.end_time = this.start_time + this.timeout;
    this.last_interrupt_time = this.start_time

    const result = await this.implementation()

    this.is_running = false
    this.should_stop = false
    this.finished = true

    return result
  }

  onInterrupt(f: () => void): this {
    this.interrupt_ewent.on(f)
    return this
  }

  protected async interrupt() {
    this.interrupt_ewent.trigger(null)
    await delay(1)
  }

  stop() {
    if (!this.is_running) return

    this.should_stop = true
  }

  await(): Promise<this> {
    return new Promise(resolve => {
      if (this.finished) resolve(this)
      else this.finished_event.on(resolve)
    })
  }

  protected async checkTime() {
    const t = Date.now()

    const INTERRUPT_FREQUENCY = 50

    if (t >= this.end_time) this.stop()
    else if (t >= this.last_interrupt_time + INTERRUPT_FREQUENCY) {
      this.last_interrupt_time = t
      await this.interrupt()
    }
  }
}