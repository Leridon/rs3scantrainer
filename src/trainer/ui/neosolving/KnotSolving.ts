import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {Process} from "../../../lib/Process";
import {ClueReader} from "./cluereader/ClueReader";
import {CapturedImage, CapturedModal} from "../../../lib/alt1/ImageCapture";
import {KnotReader} from "./cluereader/KnotReader";
import {PuzzleModal} from "./PuzzleModal";
import {OverlayGeometry} from "../../../lib/alt1/OverlayGeometry";
import {CelticKnots} from "../../../lib/cluetheory/CelticKnots";
import {Vector2} from "../../../lib/math";
import {mixColor} from "@alt1/base";
import {ScreenRectangle} from "../../../lib/alt1/ScreenRectangle";
import Widget from "../../../lib/ui/Widget";
import {BigNisButton} from "../widgets/BigNisButton";
import {ewent} from "../../../lib/reactive";

const CENTER_TEXT_SIZE = 20
const MOVE_FONT_SIZE = 24
const CENTRAL_TEXT_OFFSET = {x: 0, y: -150}


class KnotSolvingProcess extends Process {
  puzzle_closed = ewent<this>()

  solution_overlay = new OverlayGeometry()
  last_successful_read: number

  puzzle: CelticKnots.PuzzleState
  isSolved: boolean = false

  constructor(private parent: KnotSolving) {
    super();

    this.last_successful_read = Date.now()

    this.asInterval(1000 / 50)
  }

  async tick() {
    try {
      const capt = CapturedImage.capture(this.parent.knot.reader.ui.body.screenRectangle())

      if (!capt) return

      const capture = CapturedModal.assumeBody(capt)
      const reader = new KnotReader.KnotReader(capture)

      const puzzle = await reader.getPuzzle()
      const now = Date.now()

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

    } catch (e) {
      console.error(e.toString())
    }
  }

  private puzzleClosed() {
    this.stop()
    this.puzzle_closed.trigger(this)
  }

  async implementation(): Promise<void> {
    this.puzzle = await this.parent.knot.reader.getPuzzle() // This should already be cached

    while (!this.should_stop) {
      await this.tick()

      await (this.checkTime())
    }

    this.solution_overlay?.clear()?.render()
  }
}

class KnotModal extends PuzzleModal {
  constructor(public parent: KnotSolving) {
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
            this.parent.knot.reader.relevant_body.getData().toImage()
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

export class KnotSolving extends NeoSolvingSubBehaviour {
  public process: KnotSolvingProcess
  public modal: KnotModal

  constructor(parent: NeoSolvingBehaviour,
              public settings: KnotSolving.Settings,
              public knot: ClueReader.Result.Puzzle.Knot) {
    super(parent);
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
    this.modal = new KnotModal(this)

    this.modal.hidden.on(() => this.stop())

    this.modal.show()

    if (this.settings.autostart) this.resetProcess(true)
  }

  protected end() {
    this.resetProcess(false)
    this.modal.remove()
  }

  pausesClueReader(): boolean {
    return this.process && !this.process.isSolved
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