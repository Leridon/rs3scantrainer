import {NisModal} from "../../../lib/ui/NisModal";
import {ClueReader} from "./cluereader/ClueReader";
import {Sliders} from "./puzzles/Sliders";

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
    ui: MatchedUI
  }

  export type Slider = puzzle_base & {
    type: "slider",
    ui: MatchedUI.Slider
    puzzle: SliderPuzzle
  }

  export type Puzzle = Slider
}