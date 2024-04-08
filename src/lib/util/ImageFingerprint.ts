import {Vector2} from "../math";

export type ImageFingerprint = number[]

export namespace ImageFingerprint {


  export function averageColor(buf: ImageData, x: number, y: number, w: number, h: number): [number, number, number] {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let a = x; a < x + w; a++) {
      for (let c = y; c < y + h; c++) {
        const i = 4 * buf.width * c + 4 * a;
        r += buf.data[i];
        g += buf.data[i + 1]
        b += buf.data[i + 2];
      }
    }
    r /= w * h;
    g /= w * h;
    b /= w * h;
    return [r, g, b];
  }

  /**
   * Converts an rgb color (0-255) to hsl (0, 255))
   * @param r
   * @param g
   * @param b
   * @private
   */
  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r = r / 256;
    g = g / 256;
    b = b / 256;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const color_range = max - min;

    const s = color_range;

    const l = 0.5 * (max + min);
    let h = 0;

    if (color_range != 0) {
      if (max == r) { h = (6 + (g - b) / color_range) % 6; }
      if (max == g) { h = (b - r) / color_range + 2; }
      if (max == b) { h = (r - g) / color_range + 4; }
    }

    return [Math.round(h / 6 * 255), Math.round(s * 255), Math.round(l * 255)];
  }

  function averageColorDifference(buf: ImageData, origin_x: number, origin_y: number, w: number, h: number) {
    const row = 4 * buf.width;
    const column = 4;

    function col_dif(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
    }

    let s = 0;

    for (let xi = 0; xi < w - 1; xi++) {
      for (let yi = 0; yi < h - 1; yi++) {
        const i = row * (yi + origin_y) + column * (origin_x + xi);

        const self = buf.data.slice(i, i + 3)
        const below = buf.data.slice(i + row, i + row + 3)
        const right = buf.data.slice(i + column, i + column + 3)

        s += col_dif(self, below) + col_dif(self, right)
      }
    }

    return Math.round(s / (3 * 2 * (w - 1) * (h - 1)))
  }

  const OFFSETS = {
    hue: 0,
    sat: 1,
    roughness: 2,
  }

  /**
   * Computes a fingerprint/perceptual hash of a section from the given image data.
   * The fingerprint can then be used to compare the image to another image to find a similarity score.
   *
   * @param buf
   * @param origin
   * @param size
   * @param kernel_size
   */
  export function get(buf: ImageData, origin: Vector2, size: Vector2, kernel_size: Vector2): ImageFingerprint {
    const tiles_x = Math.floor(size.x / kernel_size.x)
    const tiles_y = Math.floor(size.y / kernel_size.y)

    const r = new Array(tiles_x * tiles_y)

    for (let xi = 0; xi < tiles_x; xi++) {
      const x = origin.x + xi * kernel_size.x;

      for (let yi = 0; yi < tiles_y; yi++) {
        const y = origin.y + yi * kernel_size.y;

        const i = 3 * (xi + yi * tiles_x)

        let [hue, sat, _] = rgbToHsl(...averageColor(buf, x, y, kernel_size.x, kernel_size.y))

        r[i + OFFSETS.hue] = hue
        r[i + OFFSETS.sat] = sat
        r[i + OFFSETS.roughness] = averageColorDifference(buf, x, y, kernel_size.x, kernel_size.y)
      }
    }
    return r;
  }

  export function delta(data1: ImageFingerprint, data2: ImageFingerprint): number {
    function hue_delta(a: number, b: number) {
      let c = Math.abs(a - b);

      if (c > 128) c = 255 - c

      return c / 128
    }

    let delta = 0;

    for (let i = 0; i < data1.length; i += 3) {

      // All components are normalized to the interval [0, 1]
      delta += hue_delta(data1[i + OFFSETS.hue], data2[i + OFFSETS.hue]);

      delta += Math.abs(data1[i + OFFSETS.sat] - data2[i + OFFSETS.sat]) / 255;

      delta += Math.abs(data1[i + OFFSETS.roughness] - data2[i + OFFSETS.roughness]) / 255;

      if (Number.isNaN(delta)) debugger
    }

    return 1 - delta / data1.length;
  }
}