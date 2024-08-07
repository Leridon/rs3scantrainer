import {Process} from "../../../../lib/Process";
import {CapturedChatbox} from "./capture/CapturedChatbox";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {ewent} from "../../../../lib/reactive";
import * as OCR from "@alt1/ocr";
import {lazy} from "../../../../lib/properties/Lazy";
import {NisModal} from "../../../../lib/ui/NisModal";
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
                width: 2
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
                const msg = this._messages[i]

                if (Message.equals(message, msg)) return false

                if (msg.timestamp < message.timestamp) break
            }

            this._messages.splice(i, 0, message)

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

            if (i == 0) {
                const modal = mod.get();

                modal.body.empty()

                modal.body.append(line.getData().toImage())
            }

            const read = OCR.readLine(line.getData(), font_def, [[255, 255, 255]], 0, this.chatbox.font.lineheight, true).text

            console.log(`Read ${i}: '${read}'`)

            return read
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
            return a.timestamp == b.timestamp && a.text == b.text
        }
    }
}