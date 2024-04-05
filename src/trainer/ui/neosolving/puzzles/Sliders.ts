import {SlideMove, SlideSolverRandom} from "../../../../skillbertssolver/cluesolver/slidesolver";

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

      const single_tile_move = Math.sign(move) * (Math.abs(move) >= 5 ? 5 : 1)

      const n = move / single_tile_move

      let blank = state.indexOf(24)

      for (let i = 0; i < n; i++) {
        copy[blank] = copy[blank + single_tile_move]
        blank += single_tile_move
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

  export type MoveList = Move[]

  export type AnnotatedMoveList = {
    pre_state: SliderState,
    move: Move
    post_state: SliderState,
  }[]

  export namespace MoveList {
    export function annotate(state: SliderState, moves: MoveList): AnnotatedMoveList {
      const buffer: AnnotatedMoveList = []

      for (let move of moves) {
        const post_state = SliderState.applyMove(state, move)

        buffer.push({
          pre_state: state,
          move: move,
          post_state: post_state
        })
        state = post_state
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