import TextArea from "../../../../lib/ui/controls/TextArea";
import {BigNisButton} from "../BigNisButton";
import {deps} from "../../../dependencies";
import {NisModal} from "../../../../lib/ui/NisModal";
import {Notification} from "../../NotificationBar";
import notification = Notification.notification;
import {util} from "../../../../lib/util/util";
import download = util.download;

export default class ExportStringModal extends NisModal {
  textarea: TextArea

  constructor(private string: string,
              private explanation: string = "",
              private file_name: string = undefined
  ) {
    super({force_footer: true});
  }

  render() {
    super.render();

    this.title.set("Export")

    c("<p></p>").text(this.explanation).appendTo(this.body)

    this.textarea = new TextArea({readonly: true}).setValue(this.string)
      .css2({
        "resize": "none",
        "width": "100%",
        "height": "20em"
      })
      .on("click", () => this.textarea.raw().select())
      .appendTo(this.body)
  }

  getButtons(): BigNisButton[] {
    const buttons: BigNisButton[] = [
      new BigNisButton("Cancel", "cancel")
        .onClick(() => this.remove()),
      new BigNisButton("Copy", "confirm")
        .onClick(async () => {
          try {
            await navigator.clipboard.writeText(this.string)

            notification("String copied to clipboard!").show()
          } catch {
            notification("Copying failed!", "error").show()
          }

        })
    ]

    if (this.file_name && this.file_name.length > 0) {
      buttons.push(new BigNisButton("Download", "confirm")
        .onClick(async () => {
          try {
            download(this.file_name, this.string)
          } catch {
            notification("Download failed!", "error").show()
          }
        })
      )
    }

    return buttons
  }

  static do(
    value: string,
    explanation: string = "",
    file_name: string = undefined
  ): Promise<ExportStringModal> {
    return new ExportStringModal(value, explanation, file_name).show()
  }
}