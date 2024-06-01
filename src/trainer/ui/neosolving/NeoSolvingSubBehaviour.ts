import Behaviour from "../../../lib/ui/Behaviour";
import NeoSolvingBehaviour, {NeoSolving} from "./NeoSolvingBehaviour";
import {TileArea} from "../../../lib/runescape/coordinates/TileArea";

/**
 * {@link NeoSolvingSubBehaviour}s implement active components for the {@link NeoSolvingBehaviour}.
 * They are instantiated when a clue of the respective type is solved.
 * Subbehaviours typically instantiate internal reading processes, for example for active puzzles, and self-terminate if the step is completed.
 */
export abstract class NeoSolvingSubBehaviour<State extends NeoSolving.ActiveState = NeoSolving.ActiveState> extends Behaviour {
  protected _state: State = undefined

  protected constructor(public readonly parent: NeoSolvingBehaviour) {
    super()
  }

  public setRelatedState(state: State) {
    this._state = state
  }

  protected registerSolution(area: TileArea) {
    if (!this._state) {
      console.error("Setting solution area with undefined state")
      debugger
    }
    this._state.solution_area = area
  }

  /**
   * Determines whether auto-solving is paused while this subbehaviour is active.
   * Checked on every tick of the AutoSolving process, so it can be dynamically checked based on internal state.
   */
  pausesClueReader(): boolean {
    return false
  }
}