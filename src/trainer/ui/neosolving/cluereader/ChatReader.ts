import {Process} from "../../../../lib/Process";
import {CapturedChatbox} from "./capture/CapturedChatbox";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {ewent} from "../../../../lib/reactive";
import * as OCR from "@alt1/ocr";
import {ColortTriplet, FontDefinition} from "@alt1/ocr";
import {async_lazy, lazy} from "../../../../lib/properties/Lazy";
import {NisModal} from "../../../../lib/ui/NisModal";
import {defaultcolors} from "@alt1/chatbox";
import {webpackImages} from "@alt1/base/dist/imagedetect";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;

const font_def: FontDefinition = require("@alt1/ocr/fonts/chatbox/12pt.js")

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

const chat_icons = webpackImages({
  vip: require("@alt1/chatbox/src/imgs/badgevip.data.png"),
  pmod: require("@alt1/chatbox/src/imgs/badgepmod.data.png"),
  pmodvip: require("@alt1/chatbox/src/imgs/badgepmodvip.data.png"),
  broadcast_gold: require("@alt1/chatbox/src/imgs/badge_broadcast_gold.data.png"),
  broadcast_silver: require("@alt1/chatbox/src/imgs/badge_broadcast_silver.data.png"),
  broadcast_bronze: require("@alt1/chatbox/src/imgs/badge_broadcast_bronze.data.png"),
  ironman: require("@alt1/chatbox/src/imgs/badgeironman.data.png"),
  hcim: require("@alt1/chatbox/src/imgs/badgehcim.data.png"),
  chatlink: require("@alt1/chatbox/src/imgs/chat_link.data.png"),
})

const badgemap: { [key in keyof typeof chat_icons.raw]: string } = {
  vip: "\u2730",//SHADOWED WHITE STAR
  pmod: "\u2655",//WHITE CHESS QUEEN
  pmodvip: "\u2655",//WHITE CHESS QUEEN
  broadcast_gold: "\u2746",//HEAVY CHEVRON SNOWFLAKE
  broadcast_silver: "\u2746",//HEAVY CHEVRON SNOWFLAKE
  broadcast_bronze: "\u2746",//HEAVY CHEVRON SNOWFLAKE
  ironman: "\u26AF",//UNMARRIED PARTNERSHIP SYMBOL
  hcim: "\u{1F480}",//SKULL
  chatlink: "\u{1F517}",//LINK SYMBOL
}

const all_chat_icons = async_lazy(async () => {
  await chat_icons.promise

  const icons: { icon: ImageData, character: string }[] = []

  for (let icon_key in chat_icons.raw) icons.push({icon: chat_icons.raw[icon_key], character: badgemap[icon_key]})

  return icons
})

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

    private async readLine(i: number): Promise<string> {
      const line = this.chatbox.line(i)
      const line_img = line.getData()

      const fodef = font_def

      if (i == 0) {
        const modal = mod.get();

        modal.body.empty()

        modal.body.append(line_img.toImage())
      }

      const fragments: string[] = []

      let scan_x = 0
      const baseline = this.chatbox.font.baseline_y

      const read_string = (colors: ColortTriplet[] = defaultcolors as ColortTriplet[]): boolean => {
        const data = OCR.readLine(line_img, fodef, colors, scan_x, baseline, true, false);

        if (data.text) {
          fragments.push(data.text)

          scan_x = index(data.fragments, -1).xend

          return true
        }

        return false
      };

      const read_icon = async (): Promise<boolean> => {
        const addspace = !index(fragments, -1)?.endsWith(" ")

        const badgeleft = scan_x + (addspace ? fodef.spacewidth : 0)

        const matched_icon = (await all_chat_icons.get()).find(icon =>
          line_img.pixelCompare(icon.icon, badgeleft, baseline + this.chatbox.font.icon_y) < Number.POSITIVE_INFINITY
        )

        if (matched_icon) {
          if (addspace) fragments.push(" ")

          fragments.push(matched_icon.character)

          scan_x = badgeleft + matched_icon.icon.width

          return true;
        }

        return false
      }

      const timestamp_open = OCR.readChar(line_img, fodef, [255, 255, 255], scan_x, baseline, false, false);

      const has_timestamp = timestamp_open?.chr == "["

      if (has_timestamp) {
        fragments.push("[")

        scan_x += timestamp_open.basechar.width
      }

      // Read start text or text after opening bracket
      read_string(ChatReader.all_colors)

      while (true) {
        if (!await read_icon()) break
        if (!read_string()) break
      }

      return fragments.join("")
    }

    private commit(message: string): void {
      this.buffer.add({
        timestamp: 0,
        text: message
      })
    }

    async read() {
      let row = 0

      const max_rows = this.chatbox.visibleRows()

      while (row < max_rows) {
        const components: string[] = []

        while (row < max_rows && !index(components, -1)?.startsWith("[")) {
          components.push(await this.readLine(row))

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