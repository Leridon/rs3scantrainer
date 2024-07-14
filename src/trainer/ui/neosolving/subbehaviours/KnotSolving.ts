import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {ClueReader} from "../cluereader/ClueReader";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {KnotReader} from "../cluereader/KnotReader";
import {CelticKnots} from "../../../../lib/cluetheory/CelticKnots";
import {Vector2} from "../../../../lib/math";
import {mixColor} from "@alt1/base";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {CapturedModal} from "../cluereader/capture/CapturedModal";
import {AbstractPuzzleProcess} from "./AbstractPuzzleProcess";
import {AbstractPuzzleSolving} from "./AbstractPuzzleSolving";
import {deps} from "../../../dependencies";
import {Log} from "../../../../lib/util/Log";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import PuzzleState = CelticKnots.PuzzleState;
import log = Log.log;
import over = OverlayGeometry.over;


const CENTER_TEXT_SIZE = 20
const MOVE_FONT_SIZE = 24
const CENTRAL_TEXT_OFFSET = {x: 0, y: -150}


class KnotSolvingProcess extends AbstractPuzzleProcess {
  last_successful_read: number
  last_read_puzzle: PuzzleState = null

  puzzle: CelticKnots.PuzzleState
  isSolved: boolean = false

  found_solution: boolean = false
  bug_detected: boolean = false

  constructor(private parent: KnotSolving) {
    super();

    this.last_successful_read = Date.now()

    this.asInterval(1000 / 50)
  }

  async tick() {
    const capt = CapturedImage.capture(this.parent.knot.reader.ui.body.screenRectangle())

    if (!capt) return

    const capture = CapturedModal.assumeBody(capt)
    const reader = new KnotReader.KnotReader(capture)

    const puzzle = await reader.getPuzzle()
    const now = Date.now()

    if (!!puzzle) {
      this.last_successful_read = now
    }

    const matches_last_read = CelticKnots.PuzzleState.equal(puzzle, this.last_read_puzzle)

    this.last_read_puzzle = puzzle

    if (matches_last_read && puzzle) {
      const old_state = this.puzzle

      const unified = CelticKnots.unify(puzzle, this.puzzle)

      if (!unified) {
        log().log("Could not unify knot states!", "Knot Solving", {
          existing: old_state?.snakes?.map(s => CelticKnots.Snake.toString(s)),
          new: puzzle?.snakes?.map(s => CelticKnots.Snake.toString(s)),
          unified: unified?.snakes?.map(s => CelticKnots.Snake.toString(s)),
        })

        // log().log("Capture", "Knot Solving", reader.ui.body.getData())
      }

      this.puzzle = unified ?? this.puzzle
      this.isSolved = CelticKnots.PuzzleState.isSolved(this.puzzle)

      const buttons = await this.parent.knot.reader.getButtons()

      const solution = CelticKnots.solve(this.puzzle)

      this.solution_overlay.clear()

      if (solution) {
        this.found_solution = true

        if (buttons) {
          solution.moves.forEach(move => {
            if (move.offset == 0) return // Don't render 0 moves

            const button = buttons[move.snake_index]

            const pos = move.offset < 0 ? button.counterclockwise : button.clockwise

            this.solution_overlay.text(Math.abs(move.offset).toString(),
              Vector2.add(reader.tileOrigin(pos, true), {x: 12, y: 12}), {
                color: mixColor(255, 255, 255),
                centered: true,
                shadow: true,
                width: MOVE_FONT_SIZE
              }
            )
          })
        } else {
          this.solution_overlay.text(CelticKnots.PuzzleShape.hash(this.puzzle.shape).toString(),
            Vector2.add(reader.ui.body.screenRectangle().origin, CENTRAL_TEXT_OFFSET, Vector2.scale(0.5, reader.ui.body.screenRectangle().size)),
            {
              color: mixColor(255, 255, 255),
              width: CENTER_TEXT_SIZE,
            }
          )
        }


      } else {
        if (this.found_solution && !this.bug_detected) {
          // We found a solution previously, but can't find one now. Something must have gone wrong with unification or capturing.
          this.bug_detected = true

          log().log("Bug detected! Knot solution disappeared.", "Knot Solving", {
            raw: {
              existing: old_state,
              new: puzzle,
              unified: unified
            },
            asstring: {
              existing: old_state?.snakes?.map(s => CelticKnots.Snake.toString(s)),
              new: puzzle?.snakes?.map(s => CelticKnots.Snake.toString(s)),
              unified: unified?.snakes?.map(s => CelticKnots.Snake.toString(s)),
            },
          })

          log().log("Capture", "Knot Solving", reader.ui.body.getData())

          over().text("BUG DETECTED! Please export the log file with F6 and report it.",
            Vector2.add(reader.ui.body.screenRectangle().origin, {x: 0, y: -200}, Vector2.scale(0.5, reader.ui.body.screenRectangle().size)),
            {
              color: mixColor(255, 255, 255),
              width: CENTER_TEXT_SIZE,
            }
          ).withTime(10000)
            .render()
        }

        this.solution_overlay.text("Not enough information",
          Vector2.add(reader.ui.body.screenRectangle().origin, CENTRAL_TEXT_OFFSET, Vector2.scale(0.5, reader.ui.body.screenRectangle().size)),
          {
            color: mixColor(255, 255, 255),
            width: CENTER_TEXT_SIZE,
          }
        )

        this.solution_overlay.rect2(
          ScreenRectangle.move(reader.ui.body.screenRectangle(), {x: 4, y: 282}, {x: 121, y: 26}),
          {
            color: mixColor(255, 255, 255),
            width: 2,
          }
        )
      }

      if (this.isSolved) {
        this.solution_overlay.text("Solved",
          Vector2.add(reader.ui.body.screenRectangle().origin, CENTRAL_TEXT_OFFSET, Vector2.scale(0.5, reader.ui.body.screenRectangle().size)),
          {
            color: mixColor(0, 255, 0),
            width: CENTER_TEXT_SIZE,
          }
        )

        this.solution_overlay.rect2(
          ScreenRectangle.move(reader.ui.body.screenRectangle(), {x: 372, y: 282}, {x: 121, y: 26}),
          {
            color: mixColor(0, 255, 0),
            width: 2,
          }
        )
      }

      this.solution_overlay.render()

      //await (reader.showDebugOverlay(true))
    } else {
      if (this.isSolved && this.last_successful_read + 500 < now) {
        this.puzzleClosed()
      }
    }

    if (this.last_successful_read + 3000 < now) {
      // Or immediately if state is solved
      this.puzzleClosed()
    }

    /*this.parent.modal.body.empty().append(
      vbox(
        ...reader.elements.map(row => hboxl(...row.map(e => e.css2({
          "width": "12px",
          "height": "12px",
        }))))
      )
    )*/
  }

  async implementation(): Promise<void> {
    this.last_read_puzzle = this.puzzle = await this.parent.knot.reader.getPuzzle() // This should already be cached

    await super.implementation()
  }
}

export class KnotSolving extends AbstractPuzzleSolving<
  ClueReader.Result.Puzzle.Knot,
  KnotSolvingProcess
> {
  constructor(parent: NeoSolvingBehaviour,
              public knot: ClueReader.Result.Puzzle.Knot) {
    super(parent, knot, deps().app.settings.settings.solving.puzzles.knots.autostart, "Celtic Knot Puzzle", "knots");
  }

  protected constructProcess(): KnotSolvingProcess {
    return new KnotSolvingProcess(this)
  }

  async resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = new KnotSolvingProcess(this)
      this.process.puzzle_closed.on(() => this.endClue())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    super.begin()
    this.modal.setImage(this.knot.reader.relevant_body.getData())
  }

  pausesClueReader(): boolean {
    return this.process && !this.process.isSolved && (Date.now() - this.process.last_successful_read) < 500
  }
}

export namespace KnotSolving {
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