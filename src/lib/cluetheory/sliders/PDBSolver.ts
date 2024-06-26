import {Sliders} from "../Sliders";
import {SliderPatternDatabase} from "./SliderPatternDatabase";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import Move = Sliders.Move;


// Prepared move table that contains all possible moves for every blank position and both move directions
// move_table[0][i] = possible horizontal moves when the blank tile is at position i
// move_table[1][i] = possible vertical moves when the blank tile is at position i
const move_table: Move[][][] = (() => {
  const res: Move[][][] = []

  const lut: Move[][] = [
    [1, 2, 3, 4],
    [-1, 1, 2, 3],
    [-2, -1, 1, 2],
    [-3, -2, -1, 1],
    [-4, -3, -2, -1],
  ]

  // Horizontal moves
  {
    res[0] = new Array<Move[]>(25)

    for (let i = 0; i < 25; i++) {

      res[0][i] = lut[i % 5]
    }
  }

  // Vertical moves
  {
    res[1] = new Array<Move[]>(25)

    for (let i = 0; i < 25; i++) {

      res[1][i] = lut[~~(i / 5)].map(m => 5 * m)
    }
  }

  return res
})()

export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: SliderPatternDatabase.RegionGraph) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {

    const state = SlideStateWithBlank.fromState(this.start_state)
    const move_list: MoveList = []

    const doregion = async (current_region: SliderPatternDatabase, next_direction: 0 | 1): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often

      const dostate = async (next_direction: 0 | 1, known_distance: number, state_index: number) => {
        if (this.should_stop) return

        if (move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        if (state_index == 0) {
          // Region is solved, go to next region
          const children = this.data.getChildren(current_region)

          if (children.length == 0) {
            this.registerSolution(move_list)
          } else {
            for (const child of children) {
              await doregion(child, next_direction)
            }
          }
        } else {

          for (const move of move_table[next_direction][state.blank]) {

            const child_index = current_region.region.stateIndex(state.tiles)
            const child_distance = current_region.getDistanceByIndex(child_index)

            if ((child_distance + 1) % 4 == known_distance) {
              // this is an optimal move

              SlideStateWithBlank.doMove(state, move) // TODO: This only works for single tile moves!

              move_list.push(move)
              await dostate(1 - next_direction as 0 | 1, child_distance, child_index)
              move_list.pop()

              SlideStateWithBlank.doMove(state, -move)
            }
          }
        }
      }

      const idx = current_region.region.stateIndex(state.tiles)

      await dostate(next_direction, current_region.getDistanceByIndex(idx), idx)
    }

    while (!this.should_stop) {
      for (const start of this.data.getEntryPoints()) {

        // Start the search 2 times. Once with a vertical first move and once with a horizontal first move
        await doregion(start, 0)
        await doregion(start, 1)
      }
    }
  }
}

export class PDBSolver extends Sliders.Solver {
  constructor(private data: SliderPatternDatabase.RegionGraph) {
    super();
  }

  instantiate(state: Sliders.SliderState): Sliders.SolvingProcess {
    return new PDBSolvingProcess(state, this.data);
  }

}