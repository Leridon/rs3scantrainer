import {CapturedModal} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {Lockboxes} from "../../../../lib/cluetheory/Lockboxes";

export namespace LockBoxReader {
  export class LockBoxReader {

    private debug_overlay: OverlayGeometry

    constructor(public modal: CapturedModal) {

    }

    getPuzzle(): Lockboxes.State {
      return null
    }

    showDebugOverlay() {
      if (!this.debug_overlay) {
        this.debug_overlay = new OverlayGeometry()
      }

      this.debug_overlay.clear()

      this.debug_overlay.render()
    }
  }
}