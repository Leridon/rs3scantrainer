import {Process} from "../../../../lib/Process";
import {CapturedChatbox} from "./capture/CapturedChatbox";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";

export class ChatReader extends Process.Interval {
  SEARCH_INTERVAL = 1000

  private buffer: ChatReader.Message[]

  private last_search = Number.NEGATIVE_INFINITY
  private chatboxes: CapturedChatbox[] = []


  constructor(private read_interval: number = 100, private search_interval: number = 1000) {
    super(this.read_interval);
  }

  private overlay: OverlayGeometry = over()

  async tick() {

    const capture = CapturedImage.capture()

    if (Date.now() - this.search_interval > this.last_search) {
      const current_boxes = await CapturedChatbox.find(capture)

      this.chatboxes = this.chatboxes.filter(box => current_boxes.some(box2 => ScreenRectangle.equals(box.body.screenRectangle(), box2.body.screenRectangle())))

      this.chatboxes.push(...current_boxes.filter(box => !this.chatboxes.some(box2 => ScreenRectangle.equals(box.body.screenRectangle(), box2.body.screenRectangle()))))
    }

    for (const box of this.chatboxes) {

    }

    this.overlay.clear()

    this.chatboxes.forEach(box => {
      this.overlay.rect2(box.body.screenRectangle(), {
        color: A1Color.fromHex("#FF0000"),
        width: 2
      })
    })

    this.overlay.render()
  }
}

export namespace ChatReader {
  export type Message = string
}