import {CelticKnots} from "../../../../lib/cluetheory/CelticKnots";
import {Vector2} from "../../../../lib/math";
import {ClueReader} from "./ClueReader";
import {util} from "../../../../lib/util/util";

export namespace KnotReader {

  import MatchedUI = ClueReader.MatchedUI;
  import todo = util.todo;
  export type Result = {
    state: CelticKnots.PuzzleState,
    buttons: {
      clockwise: Vector2,
      counterclockwise: Vector2
    }[]
  }

  class KnotReader {
    constructor(private ui: MatchedUI.Modal) {

    }

    private readTile(x: number, y: number): {
      pos: Vector2
      strip_color: number,
      rune: {
        id: number,
        intersection: {
          matches: boolean
        } | null
      },

    } {
      todo()
    }
  }


  export function read(modal: MatchedUI.Modal) {
    // Idea: Read grid into
  }


}