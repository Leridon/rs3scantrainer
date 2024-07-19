import {Process} from "../../../../lib/Process";
import {CapturedChatbox} from "./capture/CapturedChatbox";
import {CapturedImage} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {util} from "../../../../lib/util/util";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;

export class ChatReader extends Process.Interval {

  constructor() {super(100);}

  private overlay: OverlayGeometry = over()

  async tick() {
    const capture = CapturedImage.capture()

    const boxes = await CapturedChatbox.find(capture)

    this.overlay.clear()

    boxes.forEach(box => {
      this.overlay.rect2(box.body.screenRectangle(), {
        color: A1Color.fromHex("#FF0000"),
        width: 2
      })
    })

    this.overlay.render()
  }
}