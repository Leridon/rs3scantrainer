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

  public cost_function: (_: Lockboxes.MoveMap) => number = Lockboxes.MoveMap.scoring([0, 1, this.settings.two_click_factor])

  puzzle: Lockboxes.State
  isSolved: boolean = false

  constructor(private parent: LockboxSolving) {
    super();
  }

  private overlay(solution: Lockboxes.MoveMap, reader: LockBoxReader.LockBoxReader, is_desynced: boolean) {
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

    if (is_desynced) {
      this.solution_overlay.text("Detected Client Desync - Overlay paused", reader.tileOrigin({x: 2, y: -1}, true))
    }

    this.solution_overlay.render()
  }

  private last_solution: {
    moves: Lockboxes.MoveMap,
    timestamp: number,
    visually_desynced?: boolean
  } = null

  async tick() {
    const capt = CapturedImage.capture(this.parent.lockbox.reader.modal.body.screenRectangle())

    if (!capt) return

    const capture = CapturedModal.assumeBody(capt)
    const reader = new LockBoxReader.LockBoxReader(capture)

    const puzzle = await reader.getPuzzle()

    if (await reader.getState() == "likelyclosed") this.puzzleClosed()

    if (puzzle) {

      if (this.last_solution) {
        // If there is already a previous solution, find the most similar solution
        const solution = Lockboxes.solve(puzzle, true, true, s => Lockboxes.MoveMap.difference(s, this.last_solution.moves))

        const is_visually_desynced = (() => {
            // Assumes a maximum click rate of 20/s
            const max_plausible_moves = (capt.capture.timestamp - this.last_solution.timestamp) / 50

            return Lockboxes.MoveMap.difference(solution, this.last_solution?.moves) > max_plausible_moves
          }
        )()

        if (!is_visually_desynced) {
          this.last_solution = {
            moves: solution,
            timestamp: capt.capture.timestamp
          }
        } else {
          this.last_solution.visually_desynced = true

          const DESYNC_TIMEOUT = 3000

          if ((capt.capture.timestamp - this.last_solution.timestamp) > DESYNC_TIMEOUT) {
            this.last_solution = null
          }
        }
      }

      // This is intentionally not an else because the previous conditional can set the last_solution back to null
      if (!this.last_solution) {
        // If there is no solution, do an initial solve with the cost function
        const solution = Lockboxes.solve(puzzle, true, true, this.cost_function, null)

        this.last_solution = {
          moves: solution,
          timestamp: capt.capture.timestamp
        }
      }

      this.overlay(this.last_solution.moves, reader, this.last_solution.visually_desynced)
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
    super(parent, lockbox, deps().app.settings.settings.solving.puzzles.lockboxes.autostart, "Lockbox Puzzle", "lockboxes");
  }

  protected constructProcess(): LockboxSolvingProcess {
    return new LockboxSolvingProcess(this)
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