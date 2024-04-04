import {util} from "../../../../lib/util/util";
import {SlideMove, SlideSolverRandom} from "../../../../skillbertssolver/cluesolver/slidesolver";

export namespace Sliders {

  export type SliderState = number[]

  export const SolvedState =
    [
      0, 1, 2, 3, 4,
      5, 6, 7, 8, 9,
      10, 11, 12, 13, 14,
      15, 16, 17, 18, 19,
      20, 21, 22, 23, 24
    ]

  /**
   * A move is the index offset from the current position of tile 24 to the tile you need to click next.
   * Examples:
   *  -  1 = click tile right
   *  - -1 = click tile left
   *  -  5 = click tile below
   *  - -5 = click tile above
   *  -  3 = click 3 tiles right of blank tile
   */
  type Move = number

  type MoveList = Move[]

  function skillbertMoveToMyMove(move: SlideMove): Move {
    return (move.y2 - move.y1) * 5 + (move.x2 - move.x1)
  }

  export async function solve(state: SliderState): Promise<MoveList> {
    const solver = new SlideSolverRandom(state)

    await solver.startSolve(3000)

    return solver.bestsolution.map(skillbertMoveToMyMove)
  }

  /**
   * Compressed a list of single tile moves into a list of multitile moves.
   * @param moves
   */
  export function compressMoves(moves: MoveList): MoveList {
    let i = 0

    const combined_moves: Move[] = []

    while (i < moves.length) {
      const move = moves[i]
      i++

      let n = 1

      while (i < moves.length) {
        if (moves[i] != move) break
        n++
        i++
      }

      combined_moves.push(n * move)
    }

    return combined_moves
  }
}