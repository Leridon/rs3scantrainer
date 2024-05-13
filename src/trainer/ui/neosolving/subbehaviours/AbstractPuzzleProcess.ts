import {Process} from "../../../../lib/Process";
import {ewent} from "../../../../lib/reactive";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";

export abstract class AbstractPuzzleProcess extends Process {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  debug_overlay = new OverlayGeometry()

  protected constructor() {
    super();

    this.asInterval(1000 / 50)
  }

  abstract tick(): Promise<void>

  protected puzzleClosed() {
    this.stop()
    this.puzzle_closed.trigger(this)
  }

  async implementation(): Promise<void> {
    while (!this.should_stop) {
      try {
        await this.tick()
      } catch (e) {
        console.error(e.toString())
      }

      await (this.checkTime())
    }

    this.solution_overlay?.clear()?.render()
    this.debug_overlay?.clear()?.render()
  }
}