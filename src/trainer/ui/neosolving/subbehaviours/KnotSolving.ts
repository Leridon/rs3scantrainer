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

const CENTER_TEXT_SIZE = 20
const MOVE_FONT_SIZE = 24
const CENTRAL_TEXT_OFFSET = {x: 0, y: -150}


class KnotSolvingProcess extends AbstractPuzzleProcess {
  last_successful_read: number
  last_read_successful: boolean = true

  puzzle: CelticKnots.PuzzleState
  isSolved: boolean = false

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

    this.last_read_successful = !!puzzle

    if (puzzle) {
      this.last_successful_read = now

      this.puzzle = CelticKnots.unify(puzzle, this.puzzle) ?? this.puzzle
      this.isSolved = CelticKnots.PuzzleState.isSolved(this.puzzle)

      const buttons = KnotReader.getButtons(this.puzzle.shape)

      if (!buttons) {
        console.log("Button positions unknown")
        console.log(this.puzzle.shape)
        console.log("Hash")
        console.log(CelticKnots.PuzzleShape.hash(this.puzzle.shape))
        await reader.showDebugOverlay(true)
      }

      const solution = CelticKnots.solve(this.puzzle)

      this.solution_overlay.clear()

      if (solution) {
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
    this.puzzle = await this.parent.knot.reader.getPuzzle() // This should already be cached

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
      this.process.puzzle_closed.on(() => this.stop())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    super.begin()
    this.modal.setImage(this.knot.reader.relevant_body.getData())
  }

  pausesClueReader(): boolean {
    return this.process && !this.process.isSolved && this.process.last_read_successful
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