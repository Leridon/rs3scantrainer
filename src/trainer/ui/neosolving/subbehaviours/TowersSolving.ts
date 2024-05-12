import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {Process} from "../../../../lib/Process";
import {ClueReader} from "../cluereader/ClueReader";
import {PuzzleModal} from "../PuzzleModal";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import Widget from "../../../../lib/ui/Widget";
import {BigNisButton} from "../../widgets/BigNisButton";
import {ewent} from "../../../../lib/reactive";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {CapturedModal} from "../cluereader/capture/CapturedModal";
import {TowersReader} from "../cluereader/TowersReader";
import {Towers} from "../../../../lib/cluetheory/Towers";

class TowersSolvingProcess extends Process {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  last_successful_read: number

  puzzle: Towers.PuzzleState
  isSolved: boolean = false

  constructor(private parent: TowersSolving) {
    super();

    this.last_successful_read = Date.now()

    this.asInterval(1000 / 50)
  }

  private debugOverlay(reader: TowersReader.TowersReader) {

    this.solution_overlay.clear()

    const hints = reader.readHints()

   hints.top.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: i, y: -1}, true),
      )
    })
    hints.bottom.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: i, y: 5}, true),
      )
    })
    hints.left.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: -1, y: i}, true),
      )
    })

    hints.right.forEach((h, i) => {
      this.solution_overlay.text(
        h?.toString() ?? "N",
        reader.tileOrigin({x: 5, y: i}, true),
      )
    })

    this.solution_overlay.render()
  }

  async tick() {
    try {
      const capt = CapturedImage.capture(this.parent.lockbox.reader.modal.body.screenRectangle())

      if (!capt) return

      const capture = CapturedModal.assumeBody(capt)
      const reader = new TowersReader.TowersReader(capture)

      this.debugOverlay(reader)

      const puzzle = await reader.getPuzzle()

      if (await reader.getState() == "likelyclosed") this.puzzleClosed()


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

class TowersModal extends PuzzleModal {
  constructor(public parent: TowersSolving) {
    super(parent);

    this.title.set("Lockbox")
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
            this.parent.lockbox.reader.tile_area.getData().toImage()
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

export class TowersSolving extends NeoSolvingSubBehaviour {
  public process: TowersSolvingProcess
  public modal: TowersModal

  constructor(parent: NeoSolvingBehaviour,
              public settings: TowersSolving.Settings,
              public lockbox: ClueReader.Result.Puzzle.Towers) {
    super(parent);
  }

  async resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = new TowersSolvingProcess(this)
      this.process.puzzle_closed.on(() => this.stop())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    this.modal = new TowersModal(this)

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

export namespace TowersSolving {
  export type Settings = {
    autostart: boolean,
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      autostart: true,
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart

      return settings
    }
  }
}