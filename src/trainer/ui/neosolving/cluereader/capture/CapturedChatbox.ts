import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";


export class CapturedChatbox {
  constructor(public body: CapturedImage) {}

  static async find(img: CapturedImage): Promise<CapturedChatbox[]> {
    const anchors = await CapturedChatbox.anchors.get()

    const trs = [
      ...img.find(anchors.tr_minus),
      ...img.find(anchors.tr_plus),
    ].map(cpt => cpt.screenRectangle())

    if (trs.length == 0) return []

    const brackets = img.find(anchors.lbracket).map(b => b.screenRectangle())

    if (brackets.length == 0) return []

    // 1. Sort brackets by x coordinate.
    // 2. Group brackets into consecutive lines
    // 3. Match groups with the corresponding tr anchor
    // 4. Discard groups that are exactly 61 (for 12pt) pixels right of another group (and share at least one y coord)


    const groups: {
      x: number,
      ys: number[]
    }[] = []

    for (const brack of brackets) {
      let group = groups.find(g => g.x == brack.origin.x)

      if (!group) groups.push(group = {x: brack.origin.x, ys: []})

      group.ys.push(brack.origin.y)
    }

    return [new CapturedChatbox(img.getSubSection(ScreenRectangle.union(...brackets)))]
  }
}

export namespace CapturedChatbox {

  export const anchors = async_lazy(async () => {
    return {
      lbracket: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_12pt.png"),
      tr_minus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_minus.png"),
      tr_plus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_plus.png"),
    }
  })
}