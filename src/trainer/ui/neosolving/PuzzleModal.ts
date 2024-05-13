import {NisModal} from "../../../lib/ui/NisModal";
import Widget from "../../../lib/ui/Widget";
import {BigNisButton} from "../widgets/BigNisButton";
import {AbstractPuzzleSolving} from "./subbehaviours/AbstractPuzzleSolving";
import {C} from "../../../lib/ui/constructors";
import ButtonRow from "../../../lib/ui/ButtonRow";
import LightButton from "../widgets/LightButton";
import hbox = C.hbox;

export class PuzzleModal extends NisModal {
  private image_container: Widget
  private button_row: ButtonRow

  constructor(public readonly parent: AbstractPuzzleSolving<any, any>) {
    super({size: "fullscreen"});

    this.hidden.on(() => {
      this.parent.stop()
    })
  }

  render() {
    super.render();

    this.body.empty().append(
      this.image_container = c()
        .css2({
          "max-width": "100%",
          "text-align": "center"
        }),

      hbox(
        this.button_row = new ButtonRow(),
        new LightButton("Settings")
      )
    )

    this.update()
  }

  update() {
    if (this.parent.process) {
      this.button_row.buttons(
        new BigNisButton("Reset", "neutral")
          .onClick(() => {
            this.parent.resetProcess(true)
          }),
        new BigNisButton("Stop", "cancel")
          .onClick(() => {
            this.parent.resetProcess(false)
          })
      )
    } else {
      this.button_row.buttons(
        new BigNisButton("Start", "confirm")
          .onClick(() => {
            this.parent.resetProcess(true)
          }),
      )
    }
  }

  setImage(img: ImageData) {
    this.image_container.empty().append(Widget.wrap(img.toImage()).css("max-width", "100%"))
  }
}