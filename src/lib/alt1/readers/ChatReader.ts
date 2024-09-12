import {AbstractCaptureService, CapturedImage, CaptureInterval, DerivedCaptureService, InterestedToken, NeedleImage, ScreenCaptureService} from "../capture";
import {OverlayGeometry} from "../OverlayGeometry";
import {util} from "../../util/util";
import {ScreenRectangle} from "../ScreenRectangle";
import {ewent} from "../../reactive";
import {OCR} from "../OCR";
import {ColortTriplet, FontDefinition} from "@alt1/ocr";
import {async_lazy, lazy} from "../../properties/Lazy";
import {defaultcolors} from "@alt1/chatbox";
import {webpackImages} from "@alt1/base/dist/imagedetect";
import {time} from "../../gamemap/GameLayer";
import * as a1lib from "@alt1/base";
import {Log} from "../../util/Log";
import {Vector2} from "../../math";
import * as lodash from "lodash";
import over = OverlayGeometry.over;
import log = Log.log;
import A1Color = util.A1Color;

/**
 * A service class to read chat messages. It will search for chat boxes periodically, so it will find the chat
 * again even if it is moved or font sizes change. To read messages, timestamps need to be turned on in game.
 * This is a hard requirement because the reader uses timestamps to differentiate repeated identical messages
 * and also to buffer messages so that scrolling the chat up and down does not cause messages to be read again.
 */
export class ChatReader extends DerivedCaptureService {
  private debug_mode: boolean = false

  private active_interest_tokens = 0

  private buffer = new ChatReader.MessageBuffer()

  new_message = this.buffer.new_message

  private last_search = Number.NEGATIVE_INFINITY
  private chatboxes: ChatReader.SingleChatboxReader[] = []

  private capture_interest: AbstractCaptureService.InterestToken<{ area: ScreenRectangle, interval: CaptureInterval } | null, CapturedImage>

  constructor(private capturing: ScreenCaptureService, private search_interval: number = 6000) {
    super();

    this.capture_interest = this.addDataSource(capturing, () => null)

    this.new_message.on(msg => {
      if (!this.debug_mode) return

      console.log(msg.text)
    })
  }

  async processNotifications(interested_tokens: InterestedToken[]): Promise<void> {
    const capture = this.capture_interest.lastNotification()

    try {
      const capture = CapturedImage.capture()

      if (Date.now() - this.search_interval > this.last_search) {
        await time("Find", async () => {
          const current_boxes = await ChatReader.CapturedChatbox.findAll(capture)

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

  private debug_overlay: OverlayGeometry = over()

  setDebugEnabled(debug: boolean = true): this {
    this.debug_mode = debug

    return this
  }
}

export namespace ChatReader {
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
        text: message.substring(11) // Strip timestamp from message itself
      })
    }

    async read(): Promise<void> {
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

  export class CapturedChatbox {
    public font: CapturedChatbox.Font = null
    private offset: number = null

    constructor(public body: CapturedImage,
                public type: CapturedChatbox.Type) {}

    static async findAll(img: CapturedImage): Promise<CapturedChatbox[]> {
      const anchors = await CapturedChatbox.anchors.get()

      const trs: { capture: ScreenRectangle, expanded: boolean }[] = [
        ...img.findNeedle(anchors.tr_minus).map(img => ({capture: img.screen_rectangle, expanded: true})),
        ...img.findNeedle(anchors.tr_plus).map(img => ({capture: img.screen_rectangle, expanded: false})),
      ]

      if (trs.length == 0) return []

      const entertochat = anchors.entertochat

      const bubbles = img.findNeedle(anchors.chatbubble)
        .map(b => b.screen_rectangle)
        .filter(loc => {

          const data = img.getSubSection(ScreenRectangle.move(
            loc, {x: 102, y: 1}, {x: 33, y: 10}
          )).getData()

          for (let dy = 0; dy <= 1; dy++) {
            if (data.pixelCompare(entertochat.underlying, 0, dy) != Infinity // 102 click here to chat
              || data.pixelCompare(entertochat.underlying, 5, dy) != Infinity //107 press enter to chat
            ) {
              loc.origin.y -= dy;
              return true
            }
          }

          // Chat is active, look for white border
          const pixels = img.getSubSection(ScreenRectangle.move(
            loc, {x: 0, y: -6}, {x: 1, y: 2}
          )).getData()

          if (pixels.data[4] == 255) return true
          if (pixels.data[0] == 255) {
            loc.origin.y -= 1
            return true
          }

          return false
        })


      if (bubbles.length == 0) return []

      type PositionCandidate = { taken: boolean, position: Vector2 }

      const bubble_map: { taken: boolean, position: Vector2 }[] = bubbles.map(b => ({taken: false, position: b.origin}))
      const tr_map: { taken: boolean, position: { capture: ScreenRectangle, expanded: boolean } }[] = trs.map(b => ({taken: false, position: b}))

      const viable_pairs: {
        bubble: PositionCandidate,
        top_right: { taken: boolean, position: { capture: ScreenRectangle, expanded: boolean } }
      }[] = []

      for (const top_right of tr_map) {
        for (const bubble of bubble_map) {
          if (bubble.position.x + 120 > top_right.position.capture.origin.x) continue
          if (bubble.position.y < top_right.position.capture.origin.y + 80) continue

          const area = ScreenRectangle.fromPixels(top_right.position.capture.origin, bubble.position)

          if (tr_map.some(tr => tr != top_right && ScreenRectangle.contains(area, tr.position.capture.origin))) continue

          viable_pairs.push({bubble: bubble, top_right: top_right})
        }
      }

      return (await Promise.all(viable_pairs.map(async pair => {

        if (pair.bubble.taken || pair.top_right.taken) return []

        const nameline = img.getSubSection(ScreenRectangle.fromPixels(
          Vector2.add(pair.bubble.position, {x: 9, y: -5}),
          Vector2.add(pair.bubble.position, {x: -110, y: 15}),
        )).getData()

        const nameread = OCR.readLine(nameline, CapturedChatbox.chatfont, [255, 255, 255], 110, 13, false, true);

        function kind_by_name(name: string): { offset: number; type: CapturedChatbox.Type } {
          switch (name) {
            case "Clan Chat":
              return {type: "cc", offset: 62}
            case "Friends Chat":
              return {type: "fc", offset: 76}
            case "Group Chat":
              return {type: "gc", offset: 69}
            case "Guest Clan Chat":
              return {type: "gcc", offset: 98}
            default:
              return null
          }
        }

        const kind = kind_by_name(nameread?.text)

        if (kind) {
          pair.bubble.taken = true
          pair.top_right.taken = true

          return [new CapturedChatbox(img.getSubSection(ScreenRectangle.fromPixels(
            Vector2.add(pair.top_right.position.capture.origin, {x: 13, y: 20}),
            Vector2.add(pair.bubble.position, {x: -kind.offset, y: -10}),
          )), kind.type)]
        }

        // Check for left boundary by looking for the game chat filter
        if (pair.top_right.position.expanded) {
          const width = Math.max(pair.bubble.position.x, 250)

          const area = img.getSubSection(
            {
              origin: {x: pair.bubble.position.x - width, y: pair.top_right.position.capture.origin.y - 2},
              size: {x: width, y: 16}
            }
          );

          const positions = [anchors.gamefiltered, anchors.gameall, anchors.gameoff].map(anchor => lazy(() => area.findNeedle(anchor)))
            .find(r => r.get().length > 0)?.get()

          if (positions) {
            const left = lodash.maxBy(positions, pos => pos.screen_rectangle.origin.x)

            return [new CapturedChatbox(img.getSubSection(ScreenRectangle.fromPixels(
              Vector2.add(pair.top_right.position.capture.origin, {x: 13, y: 20}),
              Vector2.add(pair.bubble.position, {x: 0, y: -10}),
              Vector2.add(left.screen_rectangle.origin, {x: 0, y: 22}),
            )), "main")]
          }
        }

        // Last resort: Check for left boundary by looking for a timestamp
        {
          const width = Math.max(pair.bubble.position.x, 250)
          const height = pair.bubble.position.y - pair.top_right.position.capture.origin.y - 30

          const area = img.getSubSection(
            {
              origin: {x: pair.bubble.position.x - width, y: pair.top_right.position.capture.origin.y + 20},
              size: {x: width, y: Math.min(60, height)}
            }
          );

          const anchor = await (async () => {
            for (const anchor of await CapturedChatbox.bracket_anchors.get()) {
              const positions = area.findNeedle(anchor.img)

              if (positions.length > 0) return lodash.minBy(positions, p => p.screen_rectangle.origin.x)
            }

            return null
          })()

          if (anchor) {
            return [new CapturedChatbox(img.getSubSection(ScreenRectangle.fromPixels(
              Vector2.add(pair.top_right.position.capture.origin, {x: 13, y: 20}),
              Vector2.add(pair.bubble.position, {x: 0, y: -10}),
              Vector2.add(anchor.screen_rectangle.origin, {x: -1, y: 0}),
            )), "main")]
          }
        }

        return []
      }))).flat()
    }

    public visibleRows(): number {
      return ~~(this.body.size.y / this.font.lineheight)
    }

    public line(i: number): CapturedImage {
      if (this.font == null || this.offset == null) return null

      return this.body.getSubSection({
        origin: {x: 0, y: this.body.size.y - (i + 1) * this.font.lineheight - this.offset},
        size: {x: this.body.size.x, y: this.font.lineheight}
      })
    }

    public update(capture: CapturedImage) {
      this.body = capture.getSubSection(this.body.screen_rectangle)
    }

    public async identifyFontAndOffset(): Promise<boolean> {

      const height = Math.min(this.body.screen_rectangle.size.y, 60)

      const section = this.body.getSubSection({origin: {x: 1, y: this.body.screen_rectangle.size.y - height}, size: {x: 3, y: height}})

      for (const font of await CapturedChatbox.bracket_anchors.get()) {
        const pos = section.findNeedle(font.img)

        if (pos.length == 0) continue

        const position = pos[0]

        this.font = font.font

        const delta = (this.body.screen_rectangle.origin.y + this.body.screen_rectangle.size.y) - position.screen_rectangle.origin.y

        this.offset = delta % font.font.lineheight

        return true
      }

      this.font = null
      this.offset = null

      return false
    }

    public identifyOffset(): void {

    }
  }

  export namespace CapturedChatbox {
    export type Type = "main" | "cc" | "fc" | "gc" | "gcc"

    export type Font = {
      fontsize: number,
      baseline_y: number,
      lineheight: number,
      icon_y: number,
      dy: number,
      def: FontDefinition
    }

    export const fonts: Font[] = [
      {fontsize: 12, lineheight: 16, icon_y: -9, baseline_y: 10, dy: -1, def: require("@alt1/ocr/fonts/chatbox/12pt.js")},
      {fontsize: 14, lineheight: 18, icon_y: -10, baseline_y: 12, dy: -3, def: require("@alt1/ocr/fonts/chatbox/14pt.js")},
      {fontsize: 10, lineheight: 14, icon_y: -8, baseline_y: 8, dy: 2, def: require("@alt1/ocr/fonts/chatbox/10pt.js")},
      {fontsize: 16, lineheight: 21, icon_y: -10, baseline_y: 12, dy: -6, def: require("@alt1/ocr/fonts/chatbox/16pt.js")},
      {fontsize: 18, lineheight: 23, icon_y: -11, baseline_y: 14, dy: -8, def: require("@alt1/ocr/fonts/chatbox/18pt.js")},
      {fontsize: 20, lineheight: 25, icon_y: -11, baseline_y: 16, dy: -11, def: require("@alt1/ocr/fonts/chatbox/20pt.js")},
      {fontsize: 22, lineheight: 27, icon_y: -12, baseline_y: 17, dy: -13, def: require("@alt1/ocr/fonts/chatbox/22pt.js")},
    ]

    export function getFont(size: number): Font {
      return fonts.find(f => f.fontsize == size)
    }

    export const anchors = async_lazy(async () => {
      return {
        lbracket10pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_10pt.png"),
        lbracket12pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_12pt.png"),
        lbracket14pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_14pt.png"),
        lbracket16pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_16pt.png"),
        lbracket18pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_18pt.png"),
        lbracket20pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_20pt.png"),
        lbracket22pt: await NeedleImage.fromURL("alt1anchors/chat/lbracket_22pt.png"),
        tr_minus: await NeedleImage.fromURL("alt1anchors/chat/tr_minus.png"),
        tr_plus: await NeedleImage.fromURL("alt1anchors/chat/tr_plus.png"),
        chatbubble: await NeedleImage.fromURL("alt1anchors/chat/chatbubble.png"),
        entertochat: await NeedleImage.fromURL("alt1anchors/chat/entertochat.png"),
        gameall: await NeedleImage.fromURL("alt1anchors/chat/gameall.png"),
        gamefiltered: await NeedleImage.fromURL("alt1anchors/chat/gamefilter.png"),
        gameoff: await NeedleImage.fromURL("alt1anchors/chat/gameoff.png"),
      }
    })


    export const chatfont = require("@alt1/ocr/fonts/chat_8px.js");

    export const bracket_anchors = async_lazy<{ img: NeedleImage, font: Font }[]>(async () => {
      const anch = await anchors.get()

      return [
        {font: getFont(12), img: anch.lbracket12pt},
        {font: getFont(14), img: anch.lbracket14pt},
        {font: getFont(10), img: anch.lbracket10pt},
        {font: getFont(16), img: anch.lbracket16pt},
        {font: getFont(18), img: anch.lbracket18pt},
        {font: getFont(20), img: anch.lbracket20pt},
        {font: getFont(22), img: anch.lbracket22pt},
      ]
    })
  }
}