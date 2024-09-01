import {LazyAsync} from "../../../../../lib/properties/Lazy";
import {ImageDetect} from "@alt1/base";
import {CapturedImage} from "../../../../../lib/alt1/capture";
import {Vector2} from "../../../../../lib/math";
import {ScreenRectangle} from "../../../../../lib/alt1/ScreenRectangle";
import {util} from "../../../../../lib/util/util";
import rgbSimilarity = util.rgbSimilarity;
import * as lodash from "lodash";

export class CapturedSliderInterface {
  public readonly body: CapturedImage

  constructor(
    public readonly image: CapturedImage,
    private readonly image_includes_checkbox: boolean,
    public readonly isLegacy: boolean) {

    if (image_includes_checkbox) {
      this.body = image.getSubSection({
        origin: {x: -CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.x, y: 0},
        size: {...CapturedSliderInterface.PUZZLE_SIZE}
      })
    } else {
      this.body = image
    }
  }

  isInvertedArrowKeyCheckboxEnabled(): boolean {
    if (!this.image_includes_checkbox) return false

    const pixel = this.image.getSubSection({
      origin: {x: 0, y: CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.y},
      size: {x: 1, y: 1}
    }).getData()

    return rgbSimilarity(CapturedSliderInterface.CHECKMARK_COLOR,
      pixel.getPixel(0, 0) as any
    ) > 0.8
  }

  recapture(include_checkbox: boolean): CapturedSliderInterface {
    if (include_checkbox == this.image_includes_checkbox) {
      return new CapturedSliderInterface(
        CapturedImage.capture(this.image.screenRectangle()),
        this.image_includes_checkbox,
        this.isLegacy
      )
    } else if (include_checkbox) {
      const body_rect: ScreenRectangle = lodash.cloneDeep(this.body.screenRectangle())

      body_rect.origin.x += CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.x
      body_rect.size.x += -CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.x

      return new CapturedSliderInterface(
        CapturedImage.capture(body_rect),
        true,
        this.isLegacy
      )
    } else {
      return new CapturedSliderInterface(
        CapturedImage.capture(this.body.screenRectangle()),
        false,
        this.isLegacy
      )
    }
  }

  static async findIn(img: CapturedImage, include_inverted_arrow_checkmark: boolean): Promise<CapturedSliderInterface> {
    const anchors: {
      isLegacy: boolean,
      anchor: ImageData
    }[] = [
      {isLegacy: false, anchor: (await CapturedSliderInterface.anchors.get()).eoc_x},
      {isLegacy: true, anchor: (await CapturedSliderInterface.anchors.get()).legacy_x},
    ]

    for (const anchor of anchors) {
      const positions = img.find(anchor.anchor)

      if (positions.length > 0) {
        const body_rect: ScreenRectangle = {
          origin: Vector2.add(positions[0].relativeRectangle().origin, CapturedSliderInterface.TL_TILE_FROM_X_OFFSET),
          size: {...CapturedSliderInterface.PUZZLE_SIZE}
        }

        if (include_inverted_arrow_checkmark) {
          body_rect.origin.x += CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.x
          body_rect.size.x += -CapturedSliderInterface.INVERTED_CHECKBOX_OFFSET_FROM_TL.x
        }

        return new CapturedSliderInterface(
          positions[0].parent.getSubSection(body_rect),
          include_inverted_arrow_checkmark,
          anchor.isLegacy
        )
      }
    }

    return null
  }
}

export namespace CapturedSliderInterface {
  export const TL_TILE_FROM_X_OFFSET = {x: -297, y: 15}
  export const INVERTED_CHECKBOX_OFFSET_FROM_TL = {x: -169, y: 222}
  export const PUZZLE_SIZE = {x: 273, y: 273}

  export const CHECKMARK_COLOR: [number, number, number] = [239, 175, 63]

  export const anchors = new LazyAsync(async () => {
    return {
      eoc_x: await ImageDetect.imageDataFromUrl("alt1anchors/slide.png"),
      legacy_x: await ImageDetect.imageDataFromUrl("alt1anchors/slidelegacy.png"),
    }
  })
}