import {Sliders} from "../Sliders";

export type OptimizedSliderState = Uint8Array

export namespace OptimizedSliderState {
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

    return new Uint8Array([...state, blank, 0])
  }
}