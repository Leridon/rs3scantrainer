import {CapturedImage} from "../../../../../lib/alt1/ImageCapture";
import {Vector2} from "../../../../../lib/math";
import {ImageDetect} from "@alt1/base";
import {Lazy, lazy, LazyAsync} from "../../../../../lib/properties/Lazy";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import * as OCR from "@alt1/ocr";

export class CapturedScan {

  constructor(public readonly body: CapturedImage) {
    body.setName("scan")
  }

  private _lines: Lazy<string[]> = lazy(() => {
    /**
     * This function is originally by skillbert as part of the ScanTextReader class
     */

    const font = require("@alt1/ocr/fonts/aa_8px_new.js")

    //const font = require("@alt1/ocr/fonts/aa_8px_new.js");
    const LINEHEIGHT = 12;

    let data = this.body.getData();

    let lines: string[] = [];

    for (let lineindex = 0; lineindex < 13; lineindex++) {
      const y = lineindex * LINEHEIGHT;
      const line = OCR.findReadLine(data, font, [[255, 255, 255]], 70, y, 40, 1);
      lines.push(line.text);
    }

    const cleaned_lines: string[] = []

    let text = "";

    for (let line of lines) {
      if (line == "" && text != "") {
        cleaned_lines.push(text)

        text = ""
      } else {
        if (text != "") text += " "

        text += line
      }
    }

    if (text != "") cleaned_lines.push(text)

    return cleaned_lines
  })

  text(): string {
    return this._lines.get().join("\n")
  }

  scanArea(): string {
    return this._lines.get()[0]
  }

  static async find(screen: CapturedImage): Promise<CapturedScan> {
    const anchor_images = await CapturedScan.anchors.get()

    const anchors: {
      img: ImageData,
      origin_offset: Vector2
    }[] = [{
      img: anchor_images.scanfartext,
      origin_offset: {x: -20, y: 5 - 12 * 4}
    }, {
      img: anchor_images.orbglows,
      origin_offset: {x: -20, y: 5 - 12 * 4}
    }, {
      img: anchor_images.scanleveltext,
      origin_offset: {x: -20, y: 7 - 12 * 6}
    }]

    const found_body = await (async (): Promise<CapturedImage> => {
      for (let anchor of anchors) {
        let locs = screen.find(anchor.img)

        if (locs.length > 0) {
          return screen.getSubSection(
            ScreenRectangle.move(locs[0].screenRectangle(),
              anchor.origin_offset,
              {x: 180, y: 190}
            )
          )
        }
      }
    })()

    if (!found_body) return

    return new CapturedScan(found_body)
  }
}

export namespace CapturedScan {
  export const anchors = new LazyAsync(async () => {
    return {
      scanleveltext: await ImageDetect.imageDataFromUrl("alt1anchors/differentlevel.png"),
      scanfartext: await ImageDetect.imageDataFromUrl("alt1anchors/youaretofaraway.png"),
      orbglows: await ImageDetect.imageDataFromUrl("alt1anchors/orbglows.png"),
    }
  })
}