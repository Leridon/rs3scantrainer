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


class KnotSolvingProcess extends Process {
  solution_overlay = new OverlayGeometry()
  last_successfull_read: number

  private puzzle: CelticKnots.PuzzleState

  constructor(private parent: KnotSolving) {
    super();

    this.puzzle = this.parent.knot.knot.state

    this.last_successfull_read = Date.now()

    this.asInterval(1000 / 10)
  }

  async implementation(): Promise<void> {
    while (!this.should_stop) {
      try {
        //const reader = await time("Tick", async () => {
        const capture = CapturedModal.assumeBody(CapturedImage.capture(this.parent.knot.modal.body.screenRectangle()))
        const reader = new KnotReader.KnotReader(capture)

        const puzzle = await reader.getPuzzle()
        const now = Date.now()

        if (puzzle) {
          this.last_successfull_read = now

          this.puzzle = CelticKnots.unify(puzzle, this.puzzle) ?? puzzle

          const buttons = KnotReader.getButtons(puzzle.shape)

          const solution = CelticKnots.solve(this.puzzle)

          this.solution_overlay.clear()

          if (solution) {
            if (buttons) {
              solution.moves.forEach(move => {
                const button = buttons[move.snake_index]

                const pos = move.offset < 0 ? button.counterclockwise : button.clockwise

                this.solution_overlay.text(Math.abs(move.offset).toString(),
                  Vector2.add(reader.tileOrigin(pos, true), {x: 12, y: 12}), {
                    color: mixColor(255, 255, 255),
                    centered: true,
                    shadow: true,
                    width: 13
                  }
                )
              })
            } else {
              this.solution_overlay.text(solution.moves.map((m) => `${m.snake_index}:${m.offset}`).join("  "),
                Vector2.add(reader.ui.body.screenRectangle().origin, Vector2.scale(0.5, reader.ui.body.screenRectangle().size))
              )
            }


          } else {
            this.solution_overlay.text("No solution found",
              Vector2.add(reader.ui.body.screenRectangle().origin, Vector2.scale(0.5, reader.ui.body.screenRectangle().size))
            )
          }

          this.solution_overlay.render()

          await (reader.showDebugOverlay())
        } else {
          if (CelticKnots.PuzzleState.isSolved(this.puzzle)) {
            this.stop()
          }
        }

        if (reader.isBroken) console.log("Broken")

        if (this.last_successfull_read + 3000 < now) {
          // Or immediately if state is solved
          this.stop()
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


      await (this.checkTime())
    }

    this.solution_overlay?.clear()?.render()
  }
}

class KnotModal extends PuzzleModal {
  constructor(public parent: KnotSolving) {super(parent);}

  render() {
    super.render()
  }
}

export class KnotSolving extends NeoSolvingSubBehaviour {
  private process: KnotSolvingProcess
  public modal: KnotModal

  constructor(parent: NeoSolvingBehaviour,
              public knot: ClueReader.Result.Puzzle.Knot) {
    super(parent, true);
  }

  protected begin() {
    this.process = new KnotSolvingProcess(this)
    this.modal = new KnotModal(this)

    this.modal.show()

    this.process.run()
  }

  protected end() {
    this.process.stop()
  }
}