import {Sliders} from "../Sliders";

export type OptimizedSliderState = Uint8Array

const tile_reflection_table: number[] = [
  0, 5, 10, 15, 20,
  1, 6, 11, 16, 21,
  2, 7, 12, 17, 22,
  3, 8, 13, 18, 23,
  4, 9, 14, 19, 24
]

const reflection_pairs: [number, number][] = [
  [1, 5], [2, 10], [3, 15], [4, 20], [7, 11], [8, 16], [9, 21], [13, 17], [14, 22], [19, 23]
]

export namespace OptimizedSliderState {
  export const SIZE = 27

  import Move = Sliders.Move;
  import SliderState = Sliders.SliderState;

  export function copy(state: OptimizedSliderState): OptimizedSliderState {
    return new Uint8Array(state)
  }

  export const BLANK_INDEX = 25
  export const LASTMOVE_INDEX = 26

  export const SOLVED: OptimizedSliderState = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 24, 20])

  const partial_moves: number[][] = [
    /* -20 */[0, -5, -10, -15, -20],
    /* -19 */[],
    /* -18 */[],
    /* -17 */[],
    /* -16 */[],
    /* -15 */[0, -5, -10, -15],
    /* -14 */[],
    /* -13 */[],
    /* -12 */[],
    /* -11 */[],
    /* -10 */[0, -5, -10],
    /* - 9 */[],
    /* - 8 */[],
    /* - 7 */[],
    /* - 6 */[],
    /* - 5 */[0, -5],
    /* - 4 */[0, -1, -2, -3, -4],
    /* - 3 */[0, -1, -2, -3],
    /* - 2 */[0, -1, -2],
    /* - 1 */[0, -1],
    /*   0 */[],
    /*   1 */[0, 1],
    /*   2 */[0, 1, 2],
    /*   3 */[0, 1, 2, 3],
    /*   4 */[0, 1, 2, 3, 4],
    /*   5 */[0, 5],
    /*   6 */[],
    /*   7 */[],
    /*   8 */[],
    /*   9 */[],
    /*  10 */[0, 5, 10],
    /*  11 */[],
    /*  12 */[],
    /*  13 */[],
    /*  14 */[],
    /*  15 */[0, 5, 10, 15],
    /*  16 */[],
    /*  17 */[],
    /*  18 */[],
    /*  19 */[],
    /*  20 */[0, 5, 10, 15, 20],
  ]

  export function doMove(state: OptimizedSliderState, move: Move): void {
    const partials = partial_moves[move + 20]

    let blank = state[BLANK_INDEX]

    for (let i = 0; i < partials.length - 1; ++i) {
      state[blank + partials[i]] = state[blank + partials[i + 1]]
    }

    state[LASTMOVE_INDEX] = move + 20

    state[state[BLANK_INDEX] = blank + move] = 24
  }

  export function fromState(state: SliderState): OptimizedSliderState {
    const blank = SliderState.blank(state)

    return new Uint8Array([...state, blank, 20])
  }

  export function reflect(state: OptimizedSliderState): void {
    // Swap tiles on opposing side of the main diagonal
    for (const [a, b] of reflection_pairs) {
      const tmp = state[a]
      state[a] = state[b]
      state[b] = tmp
    }

    // Update tile values to the reflected tile id
    for (let i = 0; i < 25; i++) {
      state[i] = tile_reflection_table[state[i]]
    }
  }
}