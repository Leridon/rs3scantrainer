import {NisModal} from "../../../lib/ui/NisModal";
import {Sliders} from "./puzzles/Sliders";
import LightButton from "../widgets/LightButton";
import {ClueReader} from "./cluereader/ClueReader";
import {Rectangle, Vector2} from "../../../lib/math";
import {mixColor} from "@alt1/base";
import {delay} from "../../../oldlib";
import SliderPuzzle = Sliders.SliderPuzzle;

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

    for (let move of annotated_moves) {
      const next_pos = pos + move.move

      const p1 = this.posToScreen(pos)
      const p2 = this.posToScreen(next_pos)

      alt1.overLayLine(mixColor(255, 0, 0),
        3,
        p1.x, p1.y,
        p2.x, p2.y,
        1500
      )

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