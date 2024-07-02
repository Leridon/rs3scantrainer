import {Sliders} from "../Sliders";
import {RegionDistanceTable} from "./RegionDistanceTable";
import {OptimizedSliderState} from "./OptimizedSliderState";
import {util} from "../../util/util";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import profileAsync = util.profileAsync;
import RegionGraph = RegionDistanceTable.RegionGraph;
import todo = util.todo;

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

  constructor(start_state: SliderState, private chain: RegionGraph) {
    super(start_state);
  }

  //FIXME: Apparently this does not produce any solution if the state is already solved
  protected async solve_implementation(): Promise<void> {
    let state: OptimizedSliderState
    let move_list: MoveList

    const doregion = async (coming_from_reflected_region: boolean, current_region: RegionGraph.Node, remaining_slackness: number): Promise<void> => {
      await this.checkTime() // TODO: Maybe this doesn't need to be done this often
      if (this.should_stop) return

      const move_translation = current_region.reflected ? move_translation_reflect : move_translation_identity

      const dostate = async (known_distance: number, remaining_slackness: number) => {
        const previous_move = state[OptimizedSliderState.LASTMOVE_INDEX]

        if (this.best_solution && move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        let found_optimal_move: boolean = false

        const moves = current_region.table.move_table.get(state)

        // TODO: This iterates the moves in the order they are in the table, and does not prioritize slackness to be used as early as possible.
        for (const move of moves) {

          OptimizedSliderState.doMove(state, move)

          const child_index = current_region.table.indexing.stateIndex(state) // TODO: It's likely that this function uses a majority of the algorithm's time
          const child_distance = current_region.table.getDistanceByIndex(child_index)

          if ((child_distance + 1) % 4 == known_distance) {
            // this is an optimal move
            found_optimal_move = true

            move_list.push(move_translation[move + 20])
            await dostate(child_distance, remaining_slackness)
            move_list.pop()
          } else if (child_distance == known_distance) {
            // This state doesn't bring us any closer to the target state, but doesn't move away from it either
            // To use this move, we need to invest 1 unit of slackness

            if (remaining_slackness >= 1) {

              move_list.push(move_translation[move + 20])
              await dostate(child_distance, remaining_slackness - 1)
              move_list.pop()
            }
          } else if ((known_distance + 1) % 4 == child_distance) {
            // This state is further away from the target state than the current state.
            // To use this move, we need to invest 2 units of slackness

            if (remaining_slackness >= 2) {
              move_list.push(move_translation[move + 20])
              await dostate(child_distance, remaining_slackness - 2)
              move_list.pop()
            }
          }

          OptimizedSliderState.doMove(state, -move)
          state[OptimizedSliderState.LASTMOVE_INDEX] = previous_move
        }

        if (!found_optimal_move) {
          if (known_distance != 0 || current_region.table.indexing.satisfied(state)) return // Ran into a dead end

          // When no optimal move exists, this must be a solved state. Continue with child regions instead
          if (current_region.children.length == 0) {
            if (move_list.length > 0 || current_region.table.indexing.solves_puzzle) this.registerSolution([...move_list])
            else debugger
          } else {
            for (const child of current_region.children) {
              await doregion(current_region.reflected, child, remaining_slackness)
            }
          }
        }
      }

      if (current_region.reflected != coming_from_reflected_region) {
        OptimizedSliderState.reflect(state)
      }

      // If we are in a target region and have not used our entire slackness yet and the state also doesn't solve this region, we have already seen this state in a previous slackness pass and prune this branch
      const seen_in_previous_slackness = current_region.table.indexing.solves_puzzle && remaining_slackness > 0 && !current_region.table.indexing.satisfied(state)

      if (!seen_in_previous_slackness) {
        const idx = current_region.table.indexing.stateIndex(state)

        await dostate(current_region.table.getDistanceByIndex(idx), remaining_slackness)
      }

      if (current_region.reflected != coming_from_reflected_region) {
        OptimizedSliderState.reflect(state)
      }
    }

    let slackness = 0

    while (!this.should_stop) {
      await profileAsync(async () => {
        for (const start of this.chain.getEntryPoints()) {
          state = OptimizedSliderState.fromState(this.start_state)
          move_list = []

          await doregion(false, start, slackness)
        }
      }, `Slackness ${slackness}`)
    }
  }
}

export class PDBSolver extends Sliders.Solver {
  constructor(private chain: RegionGraph) {
    super();
  }

  instantiate(state: Sliders.SliderState): Sliders.SolvingProcess {
    return new PDBSolvingProcess(state, this.chain);
  }

}