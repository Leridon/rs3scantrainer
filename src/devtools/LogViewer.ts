import {Log} from "../lib/util/Log";
import {NisModal} from "../lib/ui/NisModal";
import {C} from "../lib/ui/constructors";
import cls = C.cls;
import {util} from "../lib/util/util";
import formatTime = util.formatTime;
import cleanedJSON = util.cleanedJSON;

export class LogViewer extends NisModal {
  constructor(private buffer: Log.Buffer) {
    super({size: "fullscreen"})

    this.setTitle("Log Viewer")
  }

  private renderLog() {
    this.body.empty()

    if (this.buffer) {

      const container = cls("nisl-textinput").appendTo(this.body)
        .css("height", "unset")
        .css("max-height", "500px")

      for (const entry of this.buffer) {
        cls("ctr-log-viewer-message")
          .append(
            cls("ctr-log-viewer-attachment-indicator").text(entry.message.attachment ? "J" : ""),
            c().css("width", "100px").text(formatTime(entry.timestamps[0])),
            c().css("min-width", "70px").css("width", "70px").text(entry.message.category),
            c().text(entry.message.body.toString()),
          )
          .appendTo(container)

        if (entry.message.attachment) {
          const atttachment = cls("ctr-log-viewer-attachment")
            .appendTo(container)

          switch (entry.message.attachment.type) {
            case "object":
              atttachment.text(cleanedJSON(entry.message.attachment.value, 4))
              break;
            case "image":
              atttachment.append(entry.message.attachment.value.toImage())

              break;

          }
        }
      }
    }
  }

  render() {
    super.render();

    this.renderLog()
  }

  static do(log: Log.Buffer): Promise<LogViewer> {
    return new LogViewer(log).show()
  }
}