import {Sliders} from "../Sliders";
import {SliderPatternDatabase} from "./SliderPatternDatabase";
import {util} from "../../util/util";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import Move = Sliders.Move;
import index = util.index;

export class PDBSolvingProcess extends Sliders.SolvingProcess {

  constructor(start_state: SliderState, private data: SliderPatternDatabase.RegionGraph) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {

    const state = SlideStateWithBlank.fromState(this.start_state)
    const move_list: MoveList = []

    const doregion = async (current_region: SliderPatternDatabase): Promise<void> => {

      const dostate = async () => {
        await this.checkTime()
        if (this.should_stop) return

        if (move_list.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

        const state_index = current_region.region.stateIndex(state.tiles)

        if (state_index == 0) {
          // Region is solved, go to next region
          const children = this.data.getChildren(current_region)

          if (children.length == 0) {
            this.registerSolution(move_list)
          } else {
            for (const child of children) {
              await doregion(child)
            }
          }
        } else {

          const last_move = index(move_list, -1)
          const distance = current_region.getByIndex(state_index)

          const was_vertical = last_move && last_move % 5 == 0
          const was_horizontal = last_move && !was_vertical

          const blank_x = state.blank % 5
          const blank_y = ~~(state.blank / 5)

          // TODO: This function is a good candidate for caching with lookup tables, needs to be profiled
          function getPotentialMoves() {
            const potential_moves: Move[] = []

            if (!was_horizontal) {
              for (let xi = 0; xi < 5; xi++) {
                if (xi != blank_x) potential_moves.push(xi - blank_x)
              }
            }

            if (!was_vertical) {
              for (let yi = 0; yi < 5; yi++) {
                if (yi != blank_y) potential_moves.push(yi - blank_y)
              }
            }

            return potential_moves
          }


          for (const move of getPotentialMoves()) {
            SlideStateWithBlank.doMove(state, move)

            move_list.push(move)

            await dostate()

            move_list.pop()

            SlideStateWithBlank.doMove(state, -move)
          }
        }
      }

      await dostate()
    }

    while (!this.should_stop) {
      for (const start of this.data.getEntryPoints()) {
        await doregion(start)
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