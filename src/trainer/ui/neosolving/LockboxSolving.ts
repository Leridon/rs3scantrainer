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
import {CapturedImage, CapturedModal} from "../../../lib/alt1/ImageCapture";
import {LockBoxReader} from "./cluereader/LockBoxReader";
import {Vector2} from "../../../lib/math";
import {mixColor} from "@alt1/base";

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

  private overlay(solution: Lockboxes.MoveMap, reader: LockBoxReader.LockBoxReader) {
    for (let y = 0; y < solution.length; y++) {
      const row = solution[y]

      for (let x = 0; x < row.length; x++) {
        const tile = row[x]

        if (tile == 0) continue

        this.solution_overlay.text(tile.toString(),
          Vector2.add(Vector2.scale(0.5, LockBoxReader.TILE_SIZE), reader.tileOrigin({x, y}, true), {x: 3, y: 0}),
          {
            width: 24,
            color: this.parent.settings.overlay_color
          }
        )
      }
    }
  }

  async tick() {
    try {
      const capt = CapturedImage.capture(this.parent.lockbox.reader.modal.body.screenRectangle())

      if (!capt) return

      const capture = CapturedModal.assumeBody(capt)
      const reader = new LockBoxReader.LockBoxReader(capture)

      const puzzle = await reader.getPuzzle()

      if (await reader.getState() == "likelyclosed") this.puzzleClosed()

      if (puzzle) {
        let solution = Lockboxes.solve(puzzle, true, true, this.parent.cost_function)

        this.solution_overlay.clear()

        this.overlay(solution, reader)

        this.solution_overlay.render()
      }
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

export class LockboxSolving extends NeoSolvingSubBehaviour {
  public process: LockboxSolvingProcess
  public modal: LockboxModal

  public cost_function: (_: Lockboxes.MoveMap) => number = null

  constructor(parent: NeoSolvingBehaviour,
              public settings: LockboxSolving.Settings,
              public lockbox: ClueReader.Result.Puzzle.Lockbox) {
    super(parent);

    this.cost_function = (() => {
      switch (this.settings.optimize_by) {
        case "clicks":
          return Lockboxes.MoveMap.clickScore
        case "tiles":
          return Lockboxes.MoveMap.tileScore
        case "hybrid":
          return Lockboxes.MoveMap.hybridScore
      }
    })()
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
    optimize_by: "clicks" | "tiles" | "hybrid",
    overlay_color: number
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      autostart: true,
      optimize_by: "hybrid",
      overlay_color: mixColor(255, 255, 255)
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart
      if (!["clicks", "tiles", "hybrid"].includes(settings.optimize_by)) settings.optimize_by = DEFAULT.optimize_by
      if (typeof settings.overlay_color != "number") settings.overlay_color = DEFAULT.overlay_color

      return settings
    }
  }
}