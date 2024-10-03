import {ewent} from "../../../../lib/reactive";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {AbstractCaptureService, CapturedImage, CaptureInterval, ScreenCaptureService} from "../../../../lib/alt1/capture";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import Behaviour from "../../../../lib/ui/Behaviour";

export abstract class AbstractPuzzleProcess extends Behaviour {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  debug_overlay = new OverlayGeometry()

  protected start_time: number

  private token: AbstractCaptureService.InterestToken<ScreenCaptureService.Options, CapturedImage>

  protected constructor(protected readonly capture_service: ScreenCaptureService) {
    super()
  }

  protected begin() {
    this.start_time = Date.now();

    this.token = this.capture_service.subscribe({
      options: (time: AbstractCaptureService.CaptureTime) => ({interval: CaptureInterval.fromApproximateInterval(20), area: this.area()}),
      handle: async (value: AbstractCaptureService.TimedValue<CapturedImage, ScreenCaptureService.Options>) => {
        try {
          await this.tick(value.value)
        } catch (e) {
          console.error(e.toString())
        }
      }
    })
  }

  protected end() {
    this.token.revoke()

    this.solution_overlay?.clear()?.render()
    this.debug_overlay?.clear()?.render()
  }

  abstract area(): ScreenRectangle

  abstract tick(capture: CapturedImage): void

  protected puzzleClosed() {
    this.stop()
    this.puzzle_closed.trigger(this)
  }
}