import {NeedleImage} from "../lib/alt1/capture";
import {util} from "../lib/util/util";
import * as a1lib from "@alt1/base";
import {base64ToBytes, bytesToBase64} from "byte-base64";
import profile = util.profile;

export function encodeImageString(buf: ImageData, sx = 0, sy = 0, sw = buf.width, sh = buf.height) {
  const new_buffer = new Uint8Array(sw * sh * 4)

  for (let yi = 0; yi < sh; yi++) {
    for (let xi = 0; xi < sw; xi++) {
      const x = sx + xi
      const y = sy + yi

      const i = 4 * (x + buf.width * y);
      const j = 4 * (xi + sw * yi)

      new_buffer[j] = buf.data[i + 2]
      new_buffer[j + 1] = buf.data[i + 1]
      new_buffer[j + 2] = buf.data[i]
      new_buffer[j + 3] = buf.data[i + 3]
    }
  }
  return bytesToBase64(new_buffer)
}

export function encodeImageString2(buf: ImageData) {
  const new_buffer = new Uint8Array(buf.width * buf.height * 4)

  for (let y = 0; y < buf.height; y++) {
    for (let x = 0; x < buf.width; x++) {

      const i = 4 * (x + buf.width * y);

      new_buffer[i] = buf.data[i + 2]
      new_buffer[i + 1] = buf.data[i + 1]
      new_buffer[i + 2] = buf.data[i]
      new_buffer[i + 3] = buf.data[i + 3]
    }
  }
  return bytesToBase64(new_buffer)
}

export function encodeImageStringDestructive(buf: ImageData) {
  const n = buf.width * buf.height * 4

  for (let i = 0; i < n; i += 4) {
    const tmp = buf.data[i]
    buf.data[i] = buf.data[i + 2]
    buf.data[i + 2] = tmp
  }

  return bytesToBase64(buf.data as any)
}

export function decodeImageString(imagestring: string, target: ImageData, x: number, y: number, w: number, h: number) {
  var bin = base64ToBytes(imagestring);

  var bytes = target.data;
  w |= 0;
  h |= 0;
  var offset = 4 * x + 4 * y * target.width;
  var target_width = target.width | 0;
  for (var a = 0; a < w; a++) {
    for (var b = 0; b < h; b++) {
      var i1 = (offset + (a * 4 | 0) + (b * target_width * 4 | 0)) | 0;
      var i2 = ((a * 4 | 0) + (b * 4 * w | 0)) | 0;
      bytes[i1 + 0 | 0] = bin[i2 + 2 | 0];//fix weird red/blue swap in c#
      bytes[i1 + 1 | 0] = bin[i2 + 1 | 0];
      bytes[i1 + 2 | 0] = bin[i2 + 0 | 0];
      bytes[i1 + 3 | 0] = bin[i2 + 3 | 0];
    }
  }
  return target;
}

export async function makeshift_main(): Promise<void> {

  const img = await NeedleImage.fromURL("alt1anchors/sliders/adventurer.png")

  const N = 500

  const tested = encodeImageStringDestructive

  const ref = a1lib.encodeImageString(img.underlying)
  const mine = tested(img.underlying)

  console.log(`Are equal: ${ref == mine}`)

  console.log(ref)
  console.log(mine)

  profile(() => {
    for (let i = 0; i < N; i++) a1lib.encodeImageString(img.underlying)
  }, "A1Lib Encode")


  profile(() => {
    for (let i = 0; i < N; i++) tested(img.underlying)
  }, "Custom Encode")

  profile(() => {
    for (let i = 0; i < N; i++) a1lib.decodeImageString(ref, new ImageData(img.underlying.width, img.underlying.height), 0, 0, img.underlying.width, img.underlying.height)
  }, "Lib Decode")

  profile(() => {
    for (let i = 0; i < N; i++) decodeImageString(ref, new ImageData(img.underlying.width, img.underlying.height), 0, 0, img.underlying.width, img.underlying.height)
  }, "Custom Decode")
}