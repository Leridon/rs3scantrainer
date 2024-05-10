import Behaviour from "../../../lib/ui/Behaviour";
import NeoSolvingBehaviour, {NeoSolving} from "./NeoSolvingBehaviour";

export abstract class NeoSolvingSubBehaviour extends Behaviour {

  protected constructor(public readonly parent: NeoSolvingBehaviour) {
    super()
  }

  pausesClueReader(): boolean {
    return false
  }
}