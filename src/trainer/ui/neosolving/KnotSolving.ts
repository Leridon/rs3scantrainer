import {NeoSolvingSubBehaviour} from "./NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "./NeoSolvingBehaviour";
import {Process} from "../../../lib/Process";
import {ClueReader} from "./cluereader/ClueReader";
import {CapturedImage, CapturedModal} from "../../../lib/alt1/ImageCapture";
import {KnotReader} from "./cluereader/KnotReader";
import {PuzzleModal} from "./PuzzleModal";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import hboxl = C.hboxl;
import {CelticKnots} from "../../../lib/cluetheory/CelticKnots";


class KnotSolvingProcess extends Process {
  constructor(private parent: KnotSolving) {
    super();

    this.asInterval(1000 / 20)
  }

  async implementation(): Promise<void>{
    while (!this.should_stop) {
      const capture = CapturedImage.capture(this.parent.knot.modal.body.screenRectangle())

      const reader = new KnotReader.KnotReader(CapturedModal.assumeBody(capture))

      const state = await reader.getPuzzle()

      //console.log(await reader.getPuzzle())

      await (reader.showDebugOverlay())

      this.parent.modal.body.empty().append(
        vbox(
          ...reader.elements.map(row => hboxl(...row.map(e => e.css2({
            "width": "12px",
            "height": "12px",
          }))))
        )
      )

      await (this.checkTime())
    }
  }
}

class KnotModal extends PuzzleModal {
  constructor(public parent: KnotSolving) {super(parent);}

  render() {
    super.render()
  }
}

export class KnotSolving extends NeoSolvingSubBehaviour {
  private process: KnotSolvingProcess
  public modal: KnotModal

  constructor(parent: NeoSolvingBehaviour,
              public knot: ClueReader.Result.Puzzle.Knot) {
    super(parent, true);
  }

  protected begin() {
    console.log("Begin")
    this.process = new KnotSolvingProcess(this)
    this.modal = new KnotModal(this)

    this.modal.show()

    this.process.run()
  }

  protected end() {
    this.process.stop()
  }
}