import {Sliders} from "../Sliders";
import {RegionDistanceTable} from "./RegionDistanceTable";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {RegionChainDistanceTable} from "./RegionChainDistanceTable";
import {util} from "../../util/util";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import numberWithCommas = util.numberWithCommas;

export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: RegionChainDistanceTable) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {
    let state: OptimizedSliderState
    let move_list: MoveList

    const doregion = async (current_region: RegionDistanceTable): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often

      const child_regions = this.data.graph.getChildren(current_region)

      console.log(`Entering ${current_region.description.region.join(",")}`)

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

          console.log(`${child_distance} from ${known_distance} for move ${move} to ${numberWithCommas(child_index)}, ${is_optimal}, ${state.join(",")}`)

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
          // When no optimal move exists, this must be a solved state. Continue with child regions instead
          if (child_regions.length == 0) {
            //debugger

            console.log(`Found ${move_list.length}`)

            if (move_list.length > 0) this.registerSolution([...move_list])
            else debugger

            //this.registerSolution([...move_list])
          } else {
            //debugger
            for (const child of child_regions) {
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
        state = OptimizedSliderState.fromState(this.start_state)
        move_list = []

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