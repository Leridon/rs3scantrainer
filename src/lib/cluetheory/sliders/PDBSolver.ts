import {Sliders} from "../Sliders";
import {RegionDistanceTable} from "./RegionDistanceTable";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import Move = Sliders.Move;
import {OptimizedSliderState} from "./OptimizedSliderState";



// TODO: Move table is dependent on region, move into Region.Active


export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: RegionDistanceTable.RegionGraph) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {

    const state = OptimizedSliderState.fromState(this.start_state)
    const move_list: MoveList = []

    const doregion = async (current_region: RegionDistanceTable, next_direction: 0 | 1): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often

      const dostate = async (next_direction: 0 | 1, known_distance: number, state_index: number) => {
        if (this.should_stop) return

        if (move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        let found_optimal_move: boolean = false

        for (const move of current_region.move_table[next_direction][state[OptimizedSliderState.BLANK_INDEX]]) {

          const child_index = current_region.region.stateIndex(state)
          const child_distance = current_region.getDistanceByIndex(child_index)

          if ((child_distance + 1) % 4 == known_distance) {
            // this is an optimal move

            found_optimal_move = false

            OptimizedSliderState.doMove(state, move)

            move_list.push(move)
            await dostate(1 - next_direction as 0 | 1, child_distance, child_index)
            move_list.pop()

            OptimizedSliderState.doMove(state, -move)
          }
        }

        if (!found_optimal_move) {
          // When no optimal move exists, this must be a solved state. Continue with child regions instead
          const children = this.data.getChildren(current_region)

          if (children.length == 0) {
            this.registerSolution(move_list)
          } else {
            for (const child of children) {
              await doregion(child, next_direction)
            }
          }
        }
      }

      const idx = current_region.region.stateIndex(state)

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
  constructor(private data: RegionDistanceTable.RegionGraph) {
    super();
  }

  instantiate(state: Sliders.SliderState): Sliders.SolvingProcess {
    return new PDBSolvingProcess(state, this.data);
  }

}