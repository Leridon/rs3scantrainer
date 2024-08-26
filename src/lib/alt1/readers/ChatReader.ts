import {Process} from "../../Process";
import {CapturedChatbox} from "../../../trainer/ui/neosolving/cluereader/capture/CapturedChatbox";
import {CapturedImage} from "../ImageCapture";
import {OverlayGeometry} from "../OverlayGeometry";
import {util} from "../../util/util";
import {ScreenRectangle} from "../ScreenRectangle";
import {ewent, EwentHandler} from "../../reactive";
import {OCR} from "../OCR";
import {ColortTriplet} from "@alt1/ocr";
import {async_lazy} from "../../properties/Lazy";
import {defaultcolors} from "@alt1/chatbox";
import {webpackImages} from "@alt1/base/dist/imagedetect";
import {time} from "../../gamemap/GameLayer";
import * as a1lib from "@alt1/base";
import {Log} from "../../util/Log";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;
import log = Log.log;

/**
 * A service class to read chat messages. It will search for chat boxes periodically, so it will find the chat
 * again even if it is moved or font sizes change. To read messages, timestamps need to be turned on in game.
 * This is a hard requirement because the reader uses timestamps to differentiate repeated identical messages
 * and also to buffer messages so that scrolling the chat up and down does not cause messages to be read again.
 */
export class ChatReader extends Process.Interval {
  private debug_mode: boolean = false

  private active_interest_tokens = 0

  private buffer = new ChatReader.MessageBuffer()

  new_message = this.buffer.new_message

  private last_search = Number.NEGATIVE_INFINITY
  private chatboxes: ChatReader.SingleChatboxReader[] = []

  constructor(private read_interval: number = 600, private search_interval: number = 6000) {
    super(read_interval);

    this.new_message.on(msg => {
      if (!this.debug_mode) return

      console.log(msg.text)
    })
  }

  private debug_overlay: OverlayGeometry = over()

  async tick() {
    if (!this.debug_mode && this.active_interest_tokens <= 0) return // If no interest token is active, just go back to sleep

    try {
      const capture = CapturedImage.capture()

      if (Date.now() - this.search_interval > this.last_search) {
        await time("Find", async () => {
          const current_boxes = await CapturedChatbox.findAll(capture)

          // Remove readers that weren't found anymore
          this.chatboxes = this.chatboxes.filter(box => current_boxes.some(box2 => ScreenRectangle.equals(box.chatbox.body.screenRectangle(), box2.body.screenRectangle())))

          this.chatboxes.forEach(box => {
            box.chatbox.update(capture)
          })

          const new_readers = current_boxes.filter(box => !this.chatboxes.some(box2 => ScreenRectangle.equals(box.body.screenRectangle(), box2.chatbox.body.screenRectangle())))
            .map(c => new ChatReader.SingleChatboxReader(c))

          new_readers.forEach(reader => reader.new_message.on(m => this.buffer.add(m)))

          this.chatboxes.push(...new_readers)

          await Promise.all(this.chatboxes.map(async box => await box.chatbox.identifyFontAndOffset()))
        })
      } else {
        this.chatboxes.forEach(box => {
          box.chatbox.update(capture)
        })
      }

      if (this.debug_mode) {
        this.debug_overlay.clear()

        this.chatboxes.forEach(box => {
          this.debug_overlay.rect2(box.chatbox.body.screenRectangle(), {
            color: A1Color.fromHex("#FF0000"),
            width: 1
          })
        })

        this.debug_overlay.render()
      }

      await time("Read", async () => {
        for (const box of this.chatboxes) await box.read()
      })

    } catch (e) {
      log().log(e)
    }
  }

  setDebugEnabled(debug: boolean = true): this {
    this.debug_mode = debug

    return this
  }

  registerInterest(f: (_: ChatReader.Message) => void = () => {}): ChatReader.InterestToken {
    this.active_interest_tokens++
    return new ChatReader.InterestToken(() => this.active_interest_tokens--,
      this.new_message.on(f)
    )
  }
}

export namespace ChatReader {

  export class InterestToken {

    private active: boolean = true

    constructor(private readonly kill: () => void,
                private readonly handler: EwentHandler<Message>
    ) { }

    unregister() {
      if (!this.active) return

      this.active = false
      this.handler.remove()
      this.kill()
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

      const fodef = this.chatbox.font.def

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

        const matched_icon = (await all_chat_icons.get()).find(icon => {
            return a1lib.ImageDetect.simpleCompare(line_img, icon.icon, badgeleft, baseline + this.chatbox.font.icon_y) < Number.POSITIVE_INFINITY
          }
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

      while (scan_x < this.chatbox.body.screen_rectangle.origin.x + this.chatbox.body.screen_rectangle.size.x - this.chatbox.font.def.width) {
        if (!await read_icon()) break
        if (!read_string()) break
      }

      return fragments.join("")
    }

    private commit(message: string): boolean {
      let m = message.match(/^\[(\d{2}):(\d{2}):(\d{2})]/);

      if (!m) return false // Reject messages without a timestamp

      const timestamp = (+m[1]) * 60 * 60 + (+m[2]) * 60 + (+m[3]);

      return this.buffer.add({
        timestamp: timestamp,
        text: message
      })
    }

    async read() {
      if (!this.chatbox.font) return

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

        const actually_new_message = this.commit(line)

        if (!actually_new_message) break
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
    [0, 255, 0],
    [0, 255, 255],
    [0, 175, 255],
    [0, 0, 255],
    [255, 82, 86],
    [159, 255, 159],
    [0, 111, 0],
    [255, 143, 143],
    [255, 152, 31],
    [255, 111, 0],
    [255, 255, 0],
    //[239, 0, 0],//messes up broadcast detection [255,0,0]
    [239, 0, 175],
    [255, 79, 255],
    [175, 127, 255],
    //[48, 48, 48],//fuck this color, its unlegible for computers and people alike
    [127, 255, 255],
    [128, 0, 0],
    [255, 255, 255],
    [127, 169, 255],
    [255, 140, 56], //orange drop received text
    [255, 0, 0], //red achievement world message
    [69, 178, 71], //blueish green friend broadcast
    [164, 153, 125], //brownish gray friends/fc/cc list name
    [215, 195, 119], //interface preset color
    [45, 185, 20], // Green in "Completion time" for bosses
    [254, 128, 0]
  ]
}