import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {ClueReader} from "../cluereader/ClueReader";
import {Lockboxes} from "../../../../lib/cluetheory/Lockboxes";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {LockBoxReader} from "../cluereader/LockBoxReader";
import {Vector2} from "../../../../lib/math";
import {mixColor} from "@alt1/base";
import * as lodash from "lodash";
import {CapturedModal} from "../cluereader/capture/CapturedModal";
import {AbstractPuzzleProcess} from "./AbstractPuzzleProcess";
import {AbstractPuzzleSolving} from "./AbstractPuzzleSolving";
import {deps} from "../../../dependencies";

class LockboxSolvingProcess extends AbstractPuzzleProcess {

  settings = deps().app.settings.settings.solving.puzzles.lockboxes

  public cost_function: (_: Lockboxes.MoveMap) => number = Lockboxes.MoveMap.score([0, 1, this.settings.two_click_factor])

  last_successful_read: number

  puzzle: Lockboxes.State
  isSolved: boolean = false

  constructor(private parent: LockboxSolving) {
    super();

    this.last_successful_read = Date.now()
  }

  private overlay(solution: Lockboxes.MoveMap, reader: LockBoxReader.LockBoxReader) {
    this.solution_overlay.clear()

    for (let y = 0; y < solution.length; y++) {
      const row = solution[y]

      for (let x = 0; x < row.length; x++) {
        const tile = row[x]

        if (tile == 0) continue

        this.solution_overlay.text(tile.toString(),
          Vector2.add(Vector2.scale(0.5, LockBoxReader.TILE_SIZE), reader.tileOrigin({x, y}, true), {x: 3, y: 0}),
          {
            width: 24,
            color: this.settings.overlay_color
          }
        )
      }
    }

    this.solution_overlay.render()
  }

  async tick() {
    const capt = CapturedImage.capture(this.parent.lockbox.reader.modal.body.screenRectangle())

    if (!capt) return

    const capture = CapturedModal.assumeBody(capt)
    const reader = new LockBoxReader.LockBoxReader(capture)

    const puzzle = await reader.getPuzzle()

    if (await reader.getState() == "likelyclosed") this.puzzleClosed()

    if (puzzle) {
      let solution = Lockboxes.solve(puzzle, true, true, this.cost_function)

      this.overlay(solution, reader)
    }
  }

  async implementation(): Promise<void> {
    this.puzzle = await this.parent.lockbox.reader.getPuzzle() // This should already be cached

    await super.implementation()
  }
}

export class LockboxSolving extends AbstractPuzzleSolving<ClueReader.Result.Puzzle.Lockbox, LockboxSolvingProcess> {


  constructor(parent: NeoSolvingBehaviour,
              public lockbox: ClueReader.Result.Puzzle.Lockbox) {
    super(parent, lockbox, deps().app.settings.settings.solving.puzzles.lockboxes.autostart, "Lockbox Puzzle");
  }

  protected constructProcess(): LockboxSolvingProcess {
    return new LockboxSolvingProcess(this)
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
    super.begin();

    this.modal.setImage(this.lockbox.reader.tile_area.getData())
  }

  pausesClueReader(): boolean {
    return this.process && !this.process?.isSolved
  }
}

export namespace LockboxSolving {
  export type Settings = {
    autostart: boolean,
    two_click_factor: number,
    overlay_color: number
  }

  export namespace Settings {
    export const DEFAULT: Settings = {
      autostart: true,
      two_click_factor: 1.3,
      overlay_color: mixColor(255, 255, 255)
    }

    export function normalize(settings: Settings): Settings {
      if (!settings) return DEFAULT

      if (![true, false].includes(settings.autostart)) settings.autostart = DEFAULT.autostart
      if (typeof settings.overlay_color != "number") settings.overlay_color = DEFAULT.overlay_color
      if (typeof settings.two_click_factor != "number") settings.two_click_factor = DEFAULT.two_click_factor

      settings.two_click_factor = lodash.clamp(settings.two_click_factor, 1, 2)

      return settings
    }
  }
}