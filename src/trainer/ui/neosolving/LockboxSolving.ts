import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {Process} from "../../../lib/Process";
import {ClueReader} from "./cluereader/ClueReader";
import {PuzzleModal} from "./PuzzleModal";
import {OverlayGeometry} from "../../../lib/alt1/OverlayGeometry";
import Widget from "../../../lib/ui/Widget";
import {BigNisButton} from "../widgets/BigNisButton";
import {ewent} from "../../../lib/reactive";
import {Lockboxes} from "../../../lib/cluetheory/Lockboxes";

class LockboxSolvingProcess extends Process {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  last_successful_read: number

  puzzle: Lockboxes.State
  isSolved: boolean = false

  constructor(private parent: LockboxSolving) {
    super();

    this.last_successful_read = Date.now()

    this.asInterval(1000 / 50)
  }

  async tick() {
    try {

    } catch (e) {
      console.error(e.toString())
    }
  }

  private puzzleClosed() {
    this.stop()
    this.puzzle_closed.trigger(this)
  }

  async implementation(): Promise<void> {
    this.puzzle = await this.parent.lockbox.reader.getPuzzle() // This should already be cached

    while (!this.should_stop) {
      await this.tick()

      await (this.checkTime())
    }

    this.solution_overlay?.clear()?.render()
  }
}

class LockboxModal extends PuzzleModal {
  constructor(public parent: LockboxSolving) {
    super(parent);

    this.title.set("Celtic Knot")
  }

  update() {
    this.body.empty().append(
      c()
        .css2({
          "max-width": "100%",
          "text-align": "center"
        })
        .append(
          Widget.wrap(
            this.parent.lockbox.reader.modal.body.getData().toImage()
          ).css("max-width", "100%")
        ),
      this.parent.process
        ? new BigNisButton("Reset", "neutral")
          .onClick(() => {
            this.parent.resetProcess(true)
          })
        : new BigNisButton("Show Solution", "confirm")
          .onClick(() => {
            this.parent.resetProcess(true)
          })
    )
  }

  render() {
    super.render()

    this.update()
  }
}

export class LockboxSolving extends NeoSolvingSubBehaviour {
  public process: LockboxSolvingProcess
  public modal: LockboxModal

  constructor(parent: NeoSolvingBehaviour,
              private settings: LockboxSolving.Settings,
              public lockbox: ClueReader.Result.Puzzle.Lockbox) {
    super(parent);
  }

  async resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = new LockboxSolvingProcess(this)
      this.process.puzzle_closed.on(() => this.stop())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    this.modal = new LockboxModal(this)

    this.modal.hidden.on(() => this.stop())

    this.modal.show()

    if (this.settings.autostart) this.resetProcess(true)
  }

  protected end() {
    this.resetProcess(false)
    this.modal.remove()
  }

  pausesClueReader(): boolean {
    return !this.process?.isSolved
  }
}

export namespace LockboxSolving {
  export type Settings = {
    autostart: boolean,
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      autostart: true
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart

      return settings
    }
  }
}