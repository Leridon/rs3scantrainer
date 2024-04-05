import {SlideMove, SlideSolverRandom} from "../../../../skillbertssolver/cluesolver/slidesolver";
import {stat} from "copy-webpack-plugin/types/utils";
import {util} from "../../../../lib/util/util";

export namespace Sliders {
  export type SliderPuzzle = { tiles: Tile[], theme?: string }

  export namespace SliderPuzzle {
    export function getState(puzzle: SliderPuzzle): SliderState {
      return puzzle.tiles.map(t => t.position)
    }
  }

  export type Tile = { position: number, signature: number[], theme?: string }

  export type SliderState = number[]

  export namespace SliderState {
    export function equals(a: SliderState, b: SliderState): boolean {
      for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) return false
      }
      return true
    }

    export function applyMove(state: SliderState, move: Move): SliderState {
      const copy = [...state]

      const split_moves = Move.split(move)

      let blank = state.indexOf(24)

      for (let move of split_moves) {
        copy[blank] = copy[blank + move]
        blank += move
      }

      copy[blank] = 24

      return copy
    }
  }

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
  export type Move = number

  export namespace Move {
    export function split(move: Move): Move[] {
      const single_tile_move = Math.sign(move) * (Math.abs(move) >= 5 ? 5 : 1)

      const n = move / single_tile_move

      return new Array(n).fill(single_tile_move)
    }
  }

  export type MoveList = Move[]

  export type AnnotatedMoveList = {
    states: SliderState[],
    move: Move
  }[]

  export namespace MoveList {
    import index = util.index;

    export function annotate(state: SliderState, moves: MoveList): AnnotatedMoveList {
      const buffer: AnnotatedMoveList = []

      for (let move of moves) {
        const states: SliderState[] = [state]

        for (let single_move of Move.split(move)) {
          state = SliderState.applyMove(state, single_move)
          states.push(state)
        }

        buffer.push({
          states: states,
          move: move,
        })


        state = index(states, -1)
      }

      return buffer
    }
  }

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