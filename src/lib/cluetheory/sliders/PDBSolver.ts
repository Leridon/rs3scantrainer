import {Sliders} from "../Sliders";
import {RegionDistanceTable} from "./RegionDistanceTable";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {RegionChainDistanceTable} from "./RegionChainDistanceTable";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import {util} from "../../util/util";
import numberWithCommas = util.numberWithCommas;

export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: RegionChainDistanceTable) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {

    const state = OptimizedSliderState.fromState(this.start_state)
    const move_list: MoveList = []

    const doregion = async (current_region: RegionDistanceTable): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often

      const dostate = async (known_distance: number) => {
        if (this.should_stop) return

        if (this.best_solution && move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        let found_optimal_move: boolean = false

        const moves = current_region.move_table.get(state)
        const previous_move = state[OptimizedSliderState.LASTMOVE_INDEX]

        for (const move of moves) {

          OptimizedSliderState.doMove(state, move)

          const child_index = current_region.region.stateIndex(state)
          const child_distance = current_region.getDistanceByIndex(child_index)

          const is_optimal = (child_distance + 1) % 4 == known_distance

          console.log(`${child_distance} from ${known_distance} for move ${move} to ${numberWithCommas(child_index)}, ${is_optimal}`)

          if ((child_distance + 1) % 4 == known_distance) {
            // this is an optimal move
            found_optimal_move = true

            move_list.push(move)
            await dostate(child_distance)
            move_list.pop()
          }

          state[OptimizedSliderState.LASTMOVE_INDEX] = previous_move
          OptimizedSliderState.doMove(state, -move)
        }

        if (!found_optimal_move) {
          debugger

          // When no optimal move exists, this must be a solved state. Continue with child regions instead
          const children = this.data.graph.getChildren(current_region)

          if (true || children.length == 0) {
            this.registerSolution([...move_list])
          } else {
            for (const child of children) {
              await doregion(child)
            }
          }
        }
      }

      const idx = current_region.region.stateIndex(state)

      await dostate(current_region.getDistanceByIndex(idx))
    }

    while (!this.should_stop) {
      for (const start of this.data.graph.getEntryPoints()) {

        // Start the search 2 times. Once with a vertical first move and once with a horizontal first move
        await doregion(start)
      }
    }
  }
}

export class PDBSolver extends Sliders.Solver {
  constructor(private data: RegionChainDistanceTable) {
    super();
  }

  instantiate(state: Sliders.SliderState): Sliders.SolvingProcess {
    return new PDBSolvingProcess(state, this.data);
  }

}