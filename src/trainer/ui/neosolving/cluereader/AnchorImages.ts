import {ImageDetect} from "@alt1/base";

export namespace AnchorImages {
  let anchor_images: {
    slide: ImageData,
    slidelegacy: ImageData,
    legacyx: ImageData,
    eocx: ImageData,
    scanleveltext: ImageData,
    scanfartext: ImageData,
    scanfartext_pt: ImageData,
    compassnorth: ImageData,
    slider_inverted_checkmark: ImageData
  } = null

  export async function getAnchorImages() {
    if (!anchor_images) anchor_images = {
      slide: await ImageDetect.imageDataFromUrl("alt1anchors/slide.png"),
      slidelegacy: await ImageDetect.imageDataFromUrl("alt1anchors/slidelegacy.png"),
      legacyx: await ImageDetect.imageDataFromUrl("alt1anchors/legacyx.png"),
      eocx: await ImageDetect.imageDataFromUrl("alt1anchors/eocx.png"),
      scanleveltext: await ImageDetect.imageDataFromUrl("alt1anchors/differentlevel.png"),
      scanfartext: await ImageDetect.imageDataFromUrl("alt1anchors/youaretofaraway.png"),
      scanfartext_pt: await ImageDetect.imageDataFromUrl("alt1anchors/youaretofaraway_pt.png"),
      compassnorth: await ImageDetect.imageDataFromUrl("alt1anchors/compassnorth.png"),
      slider_inverted_checkmark: await ImageDetect.imageDataFromUrl("alt1anchors/slider_inverted_checkmark.png")
    }

    return anchor_images
  }
}