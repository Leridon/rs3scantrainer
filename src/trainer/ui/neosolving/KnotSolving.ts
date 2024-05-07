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

  constructor(private parent: KnotSolving) {
    super();

    this.asInterval(1000 / 10)
  }

  async implementation(): Promise<void> {
    while (!this.should_stop) {
      try {
        //const reader = await time("Tick", async () => {
        const capture = CapturedModal.assumeBody(CapturedImage.capture(this.parent.knot.modal.body.screenRectangle()))
        const reader = new KnotReader.KnotReader(capture)

        const puzzle = await reader.getPuzzle()

        if (puzzle) {
          const buttons = KnotReader.getButtons(puzzle.shape)

          const solution = CelticKnots.solve(puzzle)

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
                    width: 10
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

          //await (reader.showDebugOverlay())
        }

        if (reader.isBroken) console.log("Broken")


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