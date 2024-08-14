import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {Rectangle, Vector2} from "../../../../../lib/math";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import {FontDefinition} from "@alt1/ocr";


export class CapturedChatbox {
  constructor(public body: CapturedImage, public font: CapturedChatbox.Font) {}

  static async findAll(img: CapturedImage): Promise<CapturedChatbox[]> {
    const anchors = await CapturedChatbox.anchors.get()

    const trs = [
      ...img.find(anchors.tr_minus),
      ...img.find(anchors.tr_plus),
    ].map(cpt => cpt.screenRectangle())

    if (trs.length == 0) return []

    const bubbles = img.find(anchors.chatbubble).map(b => b.screen_rectangle)

    if (bubbles.length == 0) return []

    for (const bracket_anchor of await CapturedChatbox.bracket_anchors.get()) {
      const brackets = img.find(bracket_anchor.img).map(b => b.screenRectangle())

      if (brackets.length == 0) continue

      // 1. Sort brackets by x coordinate.
      const groups: {
        x: number,
        ys: number[]
      }[] = []

      for (const brack of brackets) {
        let group = groups.find(g => g.x == brack.origin.x)

        if (!group) groups.push(group = {x: brack.origin.x, ys: []})

        group.ys.push(brack.origin.y)
      }

      const font = bracket_anchor.font

      // 2. Discard groups that are exactly 61 (for 12pt) pixels right of another group (and share at least one y coord)
      const filtered_groups = groups.filter(g => !groups.some(g2 => g2.x == g.x - 61 && g.ys.some(y => g2.ys.some(y2 => y == y2))))

      // 3. Group brackets into consecutive lines
      const split_groups = filtered_groups.flatMap<{
        x: number,
        y: [number, number],
        used?: boolean
      }>(g => {
        let from = null
        let to = null

        const sections: [number, number][] = []

        for (let y of g.ys) {
          if (from == null) to = from = y
          else {
            if (y - to > 3 * font.lineheight) {
              sections.push([from, to])
              from = to = y
            } else {
              to = y
            }
          }
        }

        sections.push([from, to])

        return sections.map((range) => ({
          x: g.x, y: range
        }))
      })

      /*const viable: ScreenRectangle[] = []

      for (const tr of trs) {
        for (const bubble of bubbles) {
          if (bubble.origin.x > tr.origin.x) continue
          if (bubble.origin.y < tr.origin.x) continue

          const rect = ScreenRectangle.union(tr, bubble)

          if (trs.some(tr => ScreenRectangle.contains(rect, tr.origin))) continue

          viable.push(rect)
        }
      }*/

      // 4. TODO Match groups with the corresponding tr anchor

      return trs.flatMap<CapturedChatbox>(tr => {
        const best_bracket_group = split_groups.find(g => g.y[0] > tr.origin.y && g.x < tr.origin.x && !g.used)

        if (!best_bracket_group) return []

        if (best_bracket_group) {
          const [min, max] = best_bracket_group.y

          const rect = ScreenRectangle.fromRectangle(Rectangle.from(
            {x: best_bracket_group.x - 1, y: max + font.lineheight - 1},
            Vector2.add(tr.origin, {x: 0, y: 20})
          ))

          if (trs.some(other_tr => other_tr != tr && ScreenRectangle.contains(rect, other_tr.origin))) return []

          best_bracket_group.used = true

          return new CapturedChatbox(img.getSubSection(rect), font)
        }
      })
    }
  }

  public visibleRows(): number {
    return ~~(this.body.size.y / this.font.lineheight)
  }

  public line(i: number): CapturedImage {
    return this.body.getSubSection({
      origin: {x: 0, y: this.body.size.y - (i + 1) * this.font.lineheight},
      size: {x: this.body.size.x, y: this.font.lineheight}
    })
  }
}

export namespace CapturedChatbox {
  export type Font = {
    fontsize: number,
    baseline_y: number,
    lineheight: number,
    icon_y: number,
    dy: number,
    def: FontDefinition
  }

  export const fonts: Font[] = [
    {fontsize: 10, lineheight: 14, icon_y: -9, baseline_y: 7, dy: 2, def: require("@alt1/ocr/fonts/chatbox/10pt.js")},
    {fontsize: 12, lineheight: 16, icon_y: -9, baseline_y: 10, dy: -1, def: require("@alt1/ocr/fonts/chatbox/12pt.js")},
    {fontsize: 14, lineheight: 18, icon_y: -10, baseline_y: 12, dy: -3, def: require("@alt1/ocr/fonts/chatbox/14pt.js")},
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
      lbracket10pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_10pt.png"),
      lbracket12pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_12pt.png"),
      lbracket14pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_14pt.png"),
      lbracket16pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_16pt.png"),
      lbracket18pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_18pt.png"),
      lbracket20pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_20pt.png"),
      lbracket22pt: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_22pt.png"),
      tr_minus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_minus.png"),
      tr_plus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_plus.png"),
      chatbubble: await ImageDetect.imageDataFromUrl("alt1anchors/chat/chatbubble.png"),
    }
  })

  export const bracket_anchors = async_lazy<{ img: ImageData, font: Font }[]>(async () => {
    const anch = await anchors.get()

    return [
      {font: getFont(10), img: anch.lbracket10pt},
      {font: getFont(12), img: anch.lbracket12pt},
      {font: getFont(14), img: anch.lbracket14pt},
      {font: getFont(16), img: anch.lbracket16pt},
      {font: getFont(18), img: anch.lbracket18pt},
      {font: getFont(20), img: anch.lbracket20pt},
      {font: getFont(22), img: anch.lbracket22pt},
    ]
  })
}