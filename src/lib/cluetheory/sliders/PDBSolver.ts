import {Sliders} from "../Sliders";
import {RegionDistanceTable} from "./RegionDistanceTable";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {RegionChainDistanceTable} from "./RegionChainDistanceTable";
import {util} from "../../util/util";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import numberWithCommas = util.numberWithCommas;
import profileAsync = util.profileAsync;

const move_translation_identity: number[] = [
  -20, undefined, undefined, undefined, undefined, // -20
  -15, undefined, undefined, undefined, undefined, // -15
  -10, undefined, undefined, undefined, undefined, // -10
  -5, // -5
  -4, // -4
  -3, // -3
  -2, // -2
  -1,  // -1
  0,    //  0
  1,  // 1
  2, // 2
  3, // 3
  4, // 4
  5, undefined, undefined, undefined, undefined, // 5
  10, undefined, undefined, undefined, undefined, // 10
  15, undefined, undefined, undefined, undefined, // 15
  20, // 20
]
const move_translation_reflect: number[] = [
  -4, undefined, undefined, undefined, undefined, // -20
  -3, undefined, undefined, undefined, undefined, // -15
  -2, undefined, undefined, undefined, undefined, // -10
  -1, // -5
  -20, // -4
  -15, // -3
  -10, // -2
  -5,  // -1
  0,    //  0
  5,  // 1
  10, // 2
  15, // 3
  20, // 4
  1, undefined, undefined, undefined, undefined, // 5
  2, undefined, undefined, undefined, undefined, // 10
  3, undefined, undefined, undefined, undefined, // 15
  4, // 20
]

export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: RegionChainDistanceTable) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {
    let state: OptimizedSliderState
    let move_list: MoveList

    const doregion = async (current_region: RegionDistanceTable): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often

      const move_translation = move_translation_identity

      if (this.should_stop) return

      const child_regions = this.data.graph.getChildren(current_region)

      const dostate = async (known_distance: number) => {
        const previous_move = state[OptimizedSliderState.LASTMOVE_INDEX]

        if (this.best_solution && move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        let found_optimal_move: boolean = false

        const moves = current_region.move_table.get(state)

        for (const move of moves) {

          OptimizedSliderState.doMove(state, move)

          const child_index = current_region.region.stateIndex(state)
          const child_distance = current_region.getDistanceByIndex(child_index)

          if ((child_distance + 1) % 4 == known_distance) {
            // this is an optimal move
            found_optimal_move = true

            move_list.push(move_translation[move + 20])

            await dostate(child_distance)

            move_list.pop()
          }

          OptimizedSliderState.doMove(state, -move)
          state[OptimizedSliderState.LASTMOVE_INDEX] = previous_move
        }

        if (!found_optimal_move) {
          if (!current_region.region.satisfied(state)) return // Ran into a dead end

          // When no optimal move exists, this must be a solved state. Continue with child regions instead
          if (child_regions.length == 0) {
            if (move_list.length > 0) this.registerSolution([...move_list])
          } else {
            for (const child of child_regions) {
              await doregion(child)
            }
          }
        }
      }

      const idx = current_region.region.stateIndex(state)

      await dostate(current_region.getDistanceByIndex(idx))
    }

    //while (!this.should_stop) {
    await profileAsync(async () => {
      for (const start of this.data.graph.getEntryPoints()) {
        state = OptimizedSliderState.fromState(this.start_state)
        move_list = []

        await doregion(start)
      }
    }, "Slackness 0")
    //}
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