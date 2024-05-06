import Behaviour from "../../../lib/ui/Behaviour";
import NeoSolvingBehaviour, {NeoSolving} from "./NeoSolvingBehaviour";

export abstract class NeoSolvingSubBehaviour extends Behaviour {

  protected constructor(public readonly parent: NeoSolvingBehaviour,
                        public readonly disables_clue_reader: boolean = false) {
    super()
  }
}