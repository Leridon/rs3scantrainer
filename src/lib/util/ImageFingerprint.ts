import {Vector2} from "../math";
import {coloravg, rgbtohsl} from "../../skillbertssolver/cluesolver/oldlib";

export type ImageFingerprint = number[]

export namespace ImageFingerprint {
  function sumAdjacentColorDifference(buf: ImageData, origin_x: number, origin_y: number, w: number, h: number) {
    const row = 4 * buf.width;
    const column = 4;

    function col_dif(a: Uint8ClampedArray, b:Uint8ClampedArray): number {
      return Math.abs(a[0] - b[0])
        + Math.abs(a[1] - b[1])
        + Math.abs(a[2] - b[2])
    }

    let s = 0;

    for (let x = origin_x; x < origin_x + w - 1; x++) {
      for (let y = origin_y; y < origin_y + h - 1; y++) {
        const i = row * y + column * x;

        const self = buf.data.slice(i, i + 3)
        const below = buf.data.slice(i + row, i + row + 3)
        const right = buf.data.slice(i + column, i + column + 3)

        s += col_dif(self, below) + col_dif(self, right)
      }
    }

    return s;
  }

  export function get(buf: ImageData, origin: Vector2, size: Vector2, tile_size: Vector2): ImageFingerprint {
    const [base_hue, base_saturation, base_luminance] = rgbtohsl(coloravg(buf, origin.x, origin.y, size.x, size.y));

    const tiles_x = Math.floor(size.x / tile_size.x)
    const tiles_y = Math.floor(size.y / tile_size.y)

    const r = new Array(3 + tiles_x * tiles_y).fill(0)

    r[0] = base_hue
    r[1] = base_saturation
    r[2] = base_luminance

    for (let xi = 0; xi < tiles_x; xi++) {
      const x = origin.x + xi * tile_size.x;

      for (let yi = 0; yi < tiles_y; yi++) {
        const y = origin.y + yi * tile_size.y;

        const i = xi * 5 + yi * Math.floor(size.x / tile_size.x) * 5 + 3;

        let [b_hue, b_sat, b_lum] = rgbtohsl(coloravg(buf, x, y, tile_size.x, tile_size.y))

        r[i + 0] = b_hue;//hue
        r[i + 1] = b_sat;//sat
        r[i + 2] = base_luminance - b_lum;//lum
        r[i + 3] = Math.floor(sumAdjacentColorDifference(buf, x + 1, y + 1, tile_size.x - 2, tile_size.y - 2) / (tile_size.x * tile_size.y)); //min roughness (border -1 px)
        r[i + 4] = Math.floor(sumAdjacentColorDifference(buf, x, y, tile_size.x, tile_size.y) / (tile_size.x * tile_size.y)); //max roughness (full square)
      }
    }
    return r;
  }

  export function delta(data1: ImageFingerprint, data2: ImageFingerprint): number {
    function hue_delta(a: number, b: number) {
      let c = Math.abs(a - b);

      if (c > 128) c = 255 - c

      return c
    }

    let delta = 0;

    delta += Math.max(0, hue_delta(data1[0], data2[0]) * 5 - 100);//basecol hue
    delta += Math.max(0, Math.abs(data1[1] - data2[1]) * 5 - 100);//basecol sat

    for (let i = 3; i < data1.length; i += 5) {
      delta += hue_delta(data1[i], data2[i]);
      delta += Math.abs(data1[i + 1] - data2[i + 1]);//sat

      delta += Math.max(0, data1[i + 3] - data2[i + 4]) * 100; //more roughness
      delta += Math.max(0, data2[i + 3] - data1[i + 4]) * 100; //less roughness
    }

    if (Number.isNaN(delta)) debugger

    return delta;
  }
}