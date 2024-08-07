import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {async_lazy} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {Rectangle, Vector2} from "../../../../../lib/math";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";


export class CapturedChatbox {
    constructor(public body: CapturedImage, public font: CapturedChatbox.Font) {}

    static async findAll(img: CapturedImage): Promise<CapturedChatbox[]> {
        const anchors = await CapturedChatbox.anchors.get()

        const trs = [
            ...img.find(anchors.tr_minus),
            ...img.find(anchors.tr_plus),
        ].map(cpt => cpt.screenRectangle())

        if (trs.length == 0) return []

        const brackets = img.find(anchors.lbracket).map(b => b.screenRectangle())

        if (brackets.length == 0) return []

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

        const font = CapturedChatbox.fonts[0]

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

        // 4. TODO Match groups with the corresponding tr anchor

        return trs.flatMap<CapturedChatbox>(tr => {
            const best_bracket_group = split_groups.find(g => g.y[0] > tr.origin.y && g.x < tr.origin.x && !g.used)

            if (!best_bracket_group) return []

            if (best_bracket_group) {
                best_bracket_group.used = true

                const [min, max] = best_bracket_group.y

                return new CapturedChatbox(img.getSubSection(ScreenRectangle.fromRectangle(Rectangle.from(
                    {x: best_bracket_group.x, y: max + font.lineheight - 1},
                    Vector2.add(tr.origin, {x: 0, y: 20})
                ))), CapturedChatbox.fonts[0])
            }
        })
    }

    public visibleRows(): number {
        return ~~(this.body.size.y / this.font.lineheight)
    }

    public line(i: number): CapturedImage {
        const sub = this.body.getSubSection({
            origin: {x: 0, y: this.body.size.y - (i + 1) * this.font.lineheight},
            size: {x: this.body.size.x, y: this.font.lineheight}
        })

        //debugger

        return sub
    }
}

export namespace CapturedChatbox {
    export type Font = {
        fontsize: number,
        lineheight: number
    }

    export const fonts: Font[] = [
        {fontsize: 12, lineheight: 16}
    ]


    export const anchors = async_lazy(async () => {
        return {
            lbracket: await ImageDetect.imageDataFromUrl("alt1anchors/chat/lbracket_12pt.png"),
            tr_minus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_minus.png"),
            tr_plus: await ImageDetect.imageDataFromUrl("alt1anchors/chat/tr_plus.png"),
        }
    })
}