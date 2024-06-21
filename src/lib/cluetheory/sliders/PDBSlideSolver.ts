import {Sliders} from "../Sliders";
import {SliderPDB} from "./PDB";
import SliderState = Sliders.SliderState;

export class PatternDAG {
  constructor(databases: SliderPDB.PatternDB[]) {

  }
}

export class PDBSlideSolver extends Sliders.SlideSolver {

  constructor(start_state: SliderState, databases: SliderPDB.PatternDB[]) {
    super(start_state);
  }

  protected async solve_implementation(): Promise<void> {
    let slackness = 0

    while (!this.should_stop) {
      const stuff = (current_region: SliderPDB.PatternDB, remaining_slackness: number, state: SliderState) => {
        
      }

      slackness++
    }
  }
}