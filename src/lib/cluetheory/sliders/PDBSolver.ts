import {Sliders} from "../Sliders";
import {SliderPatternDatabase} from "./SliderPatternDatabase";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import SlideStateWithBlank = Sliders.SlideStateWithBlank;

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

        const potential_moves = current_region.get(state)

        if (potential_moves.length == 0) {
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

          for (const move of potential_moves) {
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