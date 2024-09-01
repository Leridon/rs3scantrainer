import {Process} from "../../../../lib/Process";
import {CapturedImage} from "../../../../lib/alt1/capture";
import {PulseReaderModal} from "../../../pulse_reader/pulsereader";
import {ScreenRectangle} from "../../../../lib/alt1/ScreenRectangle";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {CapturedScan} from "./capture/CapturedScan";
import {util} from "../../../../lib/util/util";
import over = OverlayGeometry.over;
import A1Color = util.A1Color;

export class ScanReader extends Process {
  constructor() {
    super();

    this.asInterval(50)
  }

  async implementation(): Promise<void> {
    const modal = new PulseReaderModal()

    modal.show()

    const overlay = over()

    while (!this.should_stop) {
      await this.checkTime()

      overlay.clear()

      const capture = CapturedImage.capture()
      const scan = await CapturedScan.find(capture)

      if (scan) {
        const rect = scan.screenRectangle()

        overlay.rect2(rect, {
          width: 1,
          color: A1Color.fromHex("#FF0000"),
        })

        const data = capture.getSubSection(
          ScreenRectangle.centeredOn({x: 1108, y: 561}, 50)
        ).getData()

        modal.update(data)

        if (scan.isDifferentLevel()) {
          overlay.rect2(ScreenRectangle.move(rect,
            {x: 50, y: 220}, {x: 20, y: 20}
          ), {
            color: A1Color.fromHex("#8adc13"),
            width: 2
          })
        }

        overlay.rect2(ScreenRectangle.move(rect,
          {x: 80, y: 220}, {x: 20, y: 20}
        ), {
          color: scan.isTriple() ? A1Color.fromHex("#FF0000") : A1Color.fromHex("#0000FF"),
          width: 2
        })

        if (scan.hasMeerkats()) {
          overlay.rect2(ScreenRectangle.move(rect,
            {x: 110, y: 220}, {x: 20, y: 20}
          ), {
            color: A1Color.fromHex("#00ffff"),
            width: 2
          })
        }


      }

      overlay.render()
    }
  }
}