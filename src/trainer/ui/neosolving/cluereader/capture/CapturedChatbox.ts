import {CapturedImage, NeedleImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy, lazy} from "../../../../../lib/properties/Lazy";
import {Rectangle, Vector2} from "../../../../../lib/math";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import {FontDefinition} from "@alt1/ocr";
import {OCR} from "../../../../../lib/alt1/OCR";
import * as lodash from "lodash";


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