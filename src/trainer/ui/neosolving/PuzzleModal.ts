import {NisModal} from "../../../lib/ui/NisModal";
import {ClueReader} from "./cluereader/ClueReader";
import {Sliders} from "./puzzles/Sliders";
import {CapturedModal} from "../../../lib/alt1/ImageCapture";
import {KnotReader} from "./cluereader/KnotReader";

export abstract class PuzzleModal extends NisModal {
  protected is_aborted = false

  constructor(public readonly puzzle: PuzzleModal.Puzzle) {
    super({size: "fullscreen"});

    this.hidden.on(() => {
      this.abort()
    })
  }

  protected abstract end(): void

  protected abstract begin(): void

  start(): this {
    this.show() // Don't await

    this.begin()

    return this
  }

  abort(): void {
    if (!this.is_aborted) {
      this.end()
      this.is_aborted = true
    }

    this.remove()
  }
}

export namespace PuzzleModal {
  import MatchedUI = ClueReader.MatchedUI;
  import SliderPuzzle = Sliders.SliderPuzzle;

  export type Type = "slider" | "knot" | "tower" | "lockbox"

  type puzzle_base = {
    type: Type
  }

  export type Slider = puzzle_base & {
    type: "slider",
    ui: MatchedUI.Slider
    puzzle: SliderPuzzle
  }

  export type Knot = puzzle_base & {
    type: "knot",
    modal: CapturedModal,
    knot: KnotReader.Result
  }

  export type Puzzle = Slider | Knot
}