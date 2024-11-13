import * as a1lib from "alt1";
import {ImageDetect} from "alt1";

export class NeedleImage {
  private _encoded: string

  constructor(public underlying: ImageData) {
    this._encoded = a1lib.encodeImageString(underlying)
  }

  public encoded(): string {
    return this._encoded
  }

  static async fromURL(url: string): Promise<NeedleImage> {
    return new NeedleImage(await ImageDetect.imageDataFromUrl(url))
  }
}