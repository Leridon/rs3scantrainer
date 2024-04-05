import {Sliders} from "./puzzles/Sliders";
import {ClueReader} from "./cluereader/ClueReader";
import {Rectangle, Vector2} from "../../../lib/math";
import * as a1lib from "@alt1/base";
import {mixColor} from "@alt1/base";
import {delay} from "../../../oldlib";
import {OverlayGeometry} from "../../../lib/util/OverlayGeometry";
import {SlideReader} from "./cluereader/SliderReader";
import {C} from "../../../lib/ui/constructors";
import {PuzzleModal} from "./PuzzleModal";
import over = OverlayGeometry.over;
import SliderState = Sliders.SliderState;
import SliderPuzzle = Sliders.SliderPuzzle;

export class SliderModal extends PuzzleModal {
  constructor(public readonly puzzle: PuzzleModal.Slider) {
    super(puzzle);

    this.title.set("Slider")
  }

  protected begin(): void {
    (async () => {
      let moves = await Sliders.solve(Sliders.SliderPuzzle.getState(this.puzzle.puzzle))
      moves = Sliders.compressMoves(moves)
      this.guide(moves)
    })()
  }

  protected end(): void {

  }

  private posToScreen(pos: number): Vector2 {
    return Vector2.add(
      Rectangle.screenOrigin(this.puzzle.ui.rect),
      {x: 25, y: 25},
      {x: (pos % 5) * 56, y: Math.floor(pos / 5) * 56}
    )
  }

  private async guide(moves: Sliders.MoveList) {
    const annotated_moves = Sliders.MoveList.annotate(Sliders.SliderPuzzle.getState(this.puzzle.puzzle), moves)

    let active_overlay: OverlayGeometry = null

    let last_move_index = null

    while (true) {
      await delay(20)

      const ui_state = SliderPuzzle.getState(
        await SlideReader.read(a1lib.captureHoldFullRs(), Rectangle.screenOrigin(this.puzzle.ui.rect), this.puzzle.puzzle.theme)
      )

      const current_move_index = annotated_moves.findIndex(a => a.pre_states.some(s => SliderState.equals(s, ui_state)))

      if (current_move_index >= 0) {
        if (current_move_index == last_move_index) continue

        last_move_index = current_move_index

        if (active_overlay) {
          active_overlay.hide()
          active_overlay = null
        }

        active_overlay = over()

        for (let i = 0; i < 4 && i + current_move_index < annotated_moves.length; ++i) {
          const move = annotated_moves[current_move_index + i]

          active_overlay.rect(
            Rectangle.centeredOn(this.posToScreen(move.clicked_tile),
              20 - 3 * i
            ),
            {width: 3, color: mixColor(255, 0, 0)}
          )
        }

        active_overlay.show(20000)
      } else {
        if (active_overlay) {
          active_overlay.hide()
          active_overlay = null
        }
        break
      }
    }
  }

  render() {
    super.render();

    C.img(SlideReader.getThemeImageUrl(this.puzzle.puzzle.theme))
      .appendTo(C.div().css("text-align", "center").appendTo(this.body))
  }
}