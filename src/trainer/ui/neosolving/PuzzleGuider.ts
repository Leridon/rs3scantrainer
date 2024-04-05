import {NisModal} from "../../../lib/ui/NisModal";
import {Sliders} from "./puzzles/Sliders";
import LightButton from "../widgets/LightButton";
import {ClueReader} from "./cluereader/ClueReader";
import {Rectangle, Vector2} from "../../../lib/math";
import {mixColor} from "@alt1/base";
import {delay} from "../../../oldlib";
import {OverlayGeometry} from "../../../lib/util/OverlayGeometry";
import SliderPuzzle = Sliders.SliderPuzzle;
import over = OverlayGeometry.over;
import {SlideReader} from "./cluereader/SliderReader";
import SliderState = Sliders.SliderState;

export class PuzzleGuiderModal extends NisModal {
  constructor(private ui: ClueReader.MatchedUI, private slider: SliderPuzzle) {
    super({size: "fullscreen"});

    this.title.set("Slider")
  }

  private posToScreen(pos: number): Vector2 {
    return Vector2.add(
      Rectangle.screenOrigin(this.ui.rect),
      {x: 25, y: 25},
      {x: (pos % 5) * 56, y: Math.floor(pos / 5) * 56}
    )
  }

  private async guide(moves: Sliders.MoveList) {
    let pos = this.slider.tiles.findIndex(t => t.position == 24)

    const annotated_moves = Sliders.MoveList.annotate(Sliders.SliderPuzzle.getState(this.slider), moves)


    /*
    let active_overlay = null

    while (true) {
      const ui_state = SliderPuzzle.getState(
        await SlideReader.read(this.ui.image, Rectangle.screenOrigin(this.ui.rect), this.slider.theme)
      )

      const current_move_index = annotated_moves.findIndex(a => a.states.some(s => SliderState.equals(s, ui_state)))

      if (current_move_index >= 0) {
        const current_move = annotated_moves[current_move_index]

        // Update overlay
      } else {

      }

      await delay(20)
    }*/

    for (let move of annotated_moves) {
      const next_pos = pos + move.move

      const p1 = this.posToScreen(pos)
      const p2 = this.posToScreen(next_pos)

      over()
        .line(p1, p2, {color: mixColor(255, 0, 0), width: 3})
        .rect(Rectangle.centeredOn(p2, 15), {color: mixColor(255, 0, 0), width: 3})
        .show(1500)

      pos = next_pos

      await delay(200)
    }
  }

  render() {
    super.render();

    this.body.append(new LightButton("Start")
      .onClick(async () => {
        this.guide(Sliders.compressMoves(await Sliders.solve(Sliders.SliderPuzzle.getState(this.slider))))
      })
    )
  }
}