import {Sliders} from "../Sliders";
import SliderState = Sliders.SliderState;
import MoveList = Sliders.MoveList;
import SlideStateWithBlank = Sliders.SlideStateWithBlank;
import {SliderPatternDatabase} from "./SliderPatternDatabase";

export class PDBSlideSolver extends Sliders.SlideSolver {

  constructor(start_state: SliderState, private data: SliderPatternDatabase.RegionGraph) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {

    const state = SlideStateWithBlank.fromState(this.start_state)

    const pass = (current_region: SliderPatternDatabase, remaining_slackness: number, initial_state: SlideStateWithBlank, moves_so_far: MoveList): void => {

      for (let used_slackness = remaining_slackness; used_slackness >= 0; used_slackness--) {
        const state = SlideStateWithBlank.copy(initial_state)

        const moves: MoveList = [...moves_so_far]

        const isSolved = SliderPatternDatabase.Region.toSatisfiedPredicate(current_region.meta.region)

        while (!isSolved(state.tiles)) {
          if (moves.length > this.best_solution.length) return // Abort if this can't be better than the best solution we already found

          const move = current_region.get(state.tiles)

          SlideStateWithBlank.doMove(state, move)

          moves.push(move)
        }

        if (SliderPatternDatabase.Region.solvesPuzzle(current_region.meta.region)) {
          this.registerSolution(moves)
        } else {
          const children = this.data.getChildren(current_region)

          for (const child of children) {
            pass(child, remaining_slackness - used_slackness, state, moves)
          }
        }
      }
    }

    let slackness = 0
    while (!this.should_stop) {
      for (const start of this.data.getEntryPoints()) {
        pass(start, slackness, state, [])
      }

      slackness++
    }
  }
}