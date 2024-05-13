import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {ClueReader} from "../cluereader/ClueReader";
import {PuzzleModal} from "../PuzzleModal";
import {AbstractPuzzleProcess} from "./AbstractPuzzleProcess";
import {SettingsEdit} from "../../settings/SettingsEdit";
import section_id = SettingsEdit.section_id;

export abstract class AbstractPuzzleSolving<
  PuzzleT extends ClueReader.Result.Puzzle.Puzzle,
  ProcessT extends AbstractPuzzleProcess
> extends NeoSolvingSubBehaviour {
  public process: ProcessT
  public modal: PuzzleModal

  protected constructor(parent: NeoSolvingBehaviour,
                        public puzzle: PuzzleT,
                        private autostart: boolean,
                        private modal_title: string,
                        public settings_id: section_id
  ) {
    super(parent);
  }

  protected abstract constructProcess(): ProcessT

  async resetProcess(start: boolean) {
    if (this.process) {
      this.process.stop()
      this.process = null
    }

    if (start) {
      this.process = this.constructProcess()
      this.process.puzzle_closed.on(() => this.stop())
      this.process.run()
    }

    this.modal.update()
  }

  protected begin() {
    this.modal = new PuzzleModal(this)

    this.modal.title.set(this.modal_title)

    this.modal.hidden.on(() => this.stop())

    this.modal.show()

    if (this.autostart) this.resetProcess(true)
  }

  protected end() {
    this.resetProcess(false)
    this.modal.remove()
  }
}