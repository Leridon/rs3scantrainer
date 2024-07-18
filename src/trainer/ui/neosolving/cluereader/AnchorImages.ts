import {ImageDetect} from "@alt1/base";

export namespace AnchorImages {
  let anchor_images: {
    scanleveltext: ImageData,
    scanfartext: ImageData,
    orbglows: ImageData,
  } = null

  export async function getAnchorImages() {
    if (!anchor_images) anchor_images = {
      scanleveltext: await ImageDetect.imageDataFromUrl("alt1anchors/differentlevel.png"),
      scanfartext: await ImageDetect.imageDataFromUrl("alt1anchors/youaretofaraway.png"),
      orbglows: await ImageDetect.imageDataFromUrl("alt1anchors/orbglows.png"),
    }

    return anchor_images
  }
}