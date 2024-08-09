import {Process} from "../../../../lib/Process";
import {CapturedChatbox} from "./capture/CapturedChatbox";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {ewent} from "../../../../lib/reactive";
import * as OCR from "@alt1/ocr";
import {ColortTriplet} from "@alt1/ocr";
import {lazy} from "../../../../lib/properties/Lazy";
import {NisModal} from "../../../../lib/ui/NisModal";
import {defaultcolors} from "@alt1/chatbox";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;

const font_def = require("@alt1/ocr/fonts/chatbox/12pt.js")

const mod = lazy(() => {
  const mod = new NisModal()

  mod.show()

  return mod
})

export class ChatReader extends Process.Interval {
  buffer = new ChatReader.MessageBuffer()

  new_message = this.buffer.new_message

  private last_search = Number.NEGATIVE_INFINITY
  private chatboxes: ChatReader.SingleChatboxReader[] = []

  constructor(private read_interval: number = 100, private search_interval: number = 1000) {
    super(read_interval);

    this.new_message.on(m => {
      console.log(m.text)
    })
  }

  private overlay: OverlayGeometry = over()

  async tick() {
    const capture = CapturedImage.capture()

    if (Date.now() - this.search_interval > this.last_search) {
      const current_boxes = await CapturedChatbox.findAll(capture)

      // Remove readers that weren't found anymore
      this.chatboxes = this.chatboxes.filter(box => current_boxes.some(box2 => ScreenRectangle.equals(box.chatbox.body.screenRectangle(), box2.body.screenRectangle())))

      const new_readers = current_boxes.filter(box => !this.chatboxes.some(box2 => ScreenRectangle.equals(box.body.screenRectangle(), box2.chatbox.body.screenRectangle())))
        .map(c => new ChatReader.SingleChatboxReader(c))

      new_readers.forEach(reader => reader.new_message.on(m => this.buffer.add(m)))

      this.chatboxes.push(...new_readers)
    }

    for (const box of this.chatboxes) box.read()

    this.overlay.clear()

    this.chatboxes.forEach(box => {
      this.overlay.rect2(box.chatbox.body.screenRectangle(), {
        color: A1Color.fromHex("#FF0000"),
        width: 1
      })
    })

    this.overlay.render()
  }
}

export namespace ChatReader {
  import index = util.index;

  export class MessageBuffer {
    new_message = ewent<Message>()

    private _messages: Message[] = []

    add(message: Message): boolean {
      let i = this._messages.length

      while (i > 0) {
        const msg = this._messages[i - 1]

        if (Message.equals(message, msg)) return false

        if (msg.timestamp < message.timestamp) break

        i--
      }

      this._messages.splice(i, 0, message)

      this.new_message.trigger(message)

      return true
    }

    get(): Message[] {
      return this._messages
    }
  }

  export class SingleChatboxReader {
    buffer = new MessageBuffer()

    new_message = this.buffer.new_message

    constructor(public chatbox: CapturedChatbox) {

    }

    private readLine(i: number): string {
      const line = this.chatbox.line(i)
      const line_img = line.getData()

      const f = font_def

      if (i == 0) {
        const modal = mod.get();

        modal.body.empty()

        modal.body.append(line_img.toImage())
      }

      const fragments: string[] = []

      let scan_x = 0
      const baseline = this.chatbox.font.baseline_y

      const read_string = (colors: ColortTriplet[] = defaultcolors as ColortTriplet[]): boolean => {
        const data = OCR.readLine(line_img, f, colors, scan_x, baseline, true, false);

        if (data.text) {
          fragments.push(data.text)

          scan_x = index(data.fragments, -1).xend

          return true
        }

        return false
      };

      const timestamp_open = OCR.readChar(line_img, f, [255, 255, 255], scan_x, baseline, false, false);

      const has_timestamp = timestamp_open?.chr == "["

      if (has_timestamp) {
        fragments.push("[")

        scan_x += timestamp_open.basechar.width
      }

      // Read start text or text after opening bracket
      read_string(ChatReader.all_colors)

      // TODO: Optionally Read chat icon

      // Read text again
      read_string(ChatReader.all_colors)

      // TODO: Optionally read quick chat icon

      // Read text again
      read_string(ChatReader.all_colors)

      //if (timestampopen?.chr == "[") {
      //ctx.addfrag({color: [255, 255, 255], index: -1, text: "[", xstart: ctx.rightx, xend: ctx.rightx + timestampopen.basechar.width});
      //return true;
      //}

      return fragments.join("")
    }

    private commit(message: string): void {
      this.buffer.add({
        timestamp: 0,
        text: message
      })
    }

    read() {
      let row = 0

      const max_rows = this.chatbox.visibleRows()

      while (row < max_rows) {
        const components: string[] = []

        while (row < max_rows && !index(components, -1)?.startsWith("[")) {
          components.push(this.readLine(row))

          row++
        }

        const line = components.reverse().join(" ")

        if (!line.startsWith("[")) return

        this.commit(line)
      }
    }
  }

  export type Message = {
    timestamp: number,
    text: string
  }

  export namespace Message {
    export function equals(a: Message, b: Message): boolean {
      if (!a || !b) debugger

      return a.timestamp == b.timestamp && a.text == b.text
    }
  }

  export const all_colors: ColortTriplet[] = [
    [255, 176, 0], // orange, ex brooch of the gods
    [235, 47, 47], // weird red, ex divine blessing disappearing
    ...defaultcolors as ColortTriplet[]
  ]
}