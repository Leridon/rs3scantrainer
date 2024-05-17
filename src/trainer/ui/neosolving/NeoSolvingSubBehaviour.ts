import Behaviour from "../../../lib/ui/Behaviour";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";

/**
 * {@link NeoSolvingSubBehaviour}s implement active components for the {@link NeoSolvingBehaviour}.
 * They are instantiated when a clue of the respective type is solved.
 * Subbehaviours typically instantiate internal reading processes, for example for active puzzles, and self-terminate if the step is completed.
 */
export abstract class NeoSolvingSubBehaviour extends Behaviour {

  protected constructor(public readonly parent: NeoSolvingBehaviour) {
    super()
  }

  /**
   * Determines whether auto-solving is paused while this subbehaviour is active.
   * Checked on every tick of the AutoSolving process, so it can be dynamically checked based on internal state.
   */
  pausesClueReader(): boolean {
    return false
  }
}