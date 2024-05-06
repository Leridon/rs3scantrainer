import {NisModal} from "../../../lib/ui/NisModal";
import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";

export abstract class PuzzleModal extends NisModal {
  protected constructor(public readonly parent: NeoSolvingSubBehaviour) {
    super({size: "fullscreen"});

    this.hidden.on(() => {
      this.parent.stop()
    })
  }
}