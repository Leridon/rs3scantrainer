/**
 * File: oldlib.ts
 * Original Author: Skillbert
 * Forked by Zyklop Marco with permission.
 */


import {Transform} from "../../lib/math";
import col = Transform.col;

export {addzeros, spacednr} from "../oldlib";

//calculates the average color of an area in a imagedata object
//used in a1lib.tiledata
export function coloravg(buf: ImageData, x: number, y: number, w: number, h: number) {
  var a, c, r, g, b, i;

  r = 0;
  g = 0;
  b = 0;
  for (a = x; a < x + w; a++) {
    for (c = y; c < y + h; c++) {
      i = 4 * buf.width * c + 4 * a;
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

//calculates the total amount of difference between adjecent pixels
//used in a1lib.tiledata
export function sumAdjacentColorDifference(buf: ImageData, origin_x: number, origin_y: number, w: number, h: number) {
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

export type ImageFingerprint = number[]

//calculates a pattern from a buffer to compare to solver buffers
//currently experimental, did wonders on slide puzzle tiles
export function computeImageFingerprint(buf: ImageData, tile_width: number, tile_height: number, origin_x: number, origin_y: number, area_width: number, area_height: number): ImageFingerprint {

  const [base_hue, base_saturation, base_luminance] = rgbtohsl(coloravg(buf, origin_x, origin_y, area_width, area_height));

  const tiles_x = Math.floor(area_width / tile_width)
  const tiles_y = Math.floor(area_width / tile_height)

  const r = new Array(3 + tiles_x * tiles_y).fill(0)

  r[0] = base_hue
  r[1] = base_saturation
  r[2] = base_luminance

  for (let xi = 0; xi < tiles_x; xi++) {
    const x = origin_x + xi * tile_width;

    for (let yi = 0; yi < tiles_y; yi++) {
      const y = origin_y + yi * tile_height;

      const i = xi * 5 + yi * Math.floor(area_width / tile_width) * 5 + 3;

      let [b_hue, b_sat, b_lum] = rgbtohsl(coloravg(buf, x, y, tile_width, tile_height))

      r[i + 0] = b_hue;//hue
      r[i + 1] = b_sat;//sat
      r[i + 2] = base_luminance - b_lum;//lum
      r[i + 3] = Math.floor(sumAdjacentColorDifference(buf, x + 1, y + 1, tile_width - 2, tile_height - 2) / (tile_width * tile_height)); //min roughness (border -1 px)
      r[i + 4] = Math.floor(sumAdjacentColorDifference(buf, x, y, tile_width, tile_height) / (tile_width * tile_height)); //max roughness (full square)
    }
  }
  return r;
}

/**
 * Compares two tile data objects and calculates a score.
 * The lower that score is, the more similar both data objects are
 *
 * @author Skillbert
 * @param data1
 * @param data2
 */
export function imageFingerPrintDelta(data1: ImageFingerprint, data2: ImageFingerprint): number {

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

export function rgbtohsl(r: number | number[], g?: number, b?: number): [number, number, number] {
  var mx, mn, cr, h, s, l;

  if (typeof r == "object") {
    b = r[2];
    g = r[1];
    r = r[0];
  }

  r = r! / 256;
  g = g! / 256;
  b = b! / 256;

  mx = Math.max(r, g, b);
  mn = Math.min(r, g, b);
  cr = mx - mn;

  s = cr;

  l = 0.5 * (mx + mn);
  h = 0;
  if (cr != 0) {
    if (mx == r) { h = (6 + (g - b) / cr) % 6; }
    if (mx == g) { h = (b - r) / cr + 2; }
    if (mx == b) { h = (r - g) / cr + 4; }
  }

  return [Math.round(h / 6 * 255), Math.round(s * 255), Math.round(l * 255)];
}


function strcompare(first: string, second: string) {
  // Calculates the similarity between two strings
  // discuss at: http://phpjs.org/functions/similar_text
  first += '';
  second += '';

  var pos1 = 0,
    pos2 = 0,
    max = 0,
    firstLength = first.length,
    secondLength = second.length,
    p, q, l, sum;

  max = 0;

  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0;
           (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++) ;
      if (l > max) {
        max = l;
        pos1 = p;
        pos2 = q;
      }
    }
  }

  sum = max;

  if (sum) {
    if (pos1 && pos2) {
      sum += strcompare(first.substr(0, pos2), second.substr(0, pos2));
    }

    if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
      sum += strcompare(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max, secondLength - pos2 - max));
    }
  }

  return sum;
}

export function strcomparescore(foundstring: string, templatestr: string) {
  return (strcompare(foundstring.toLowerCase(), templatestr.toLowerCase()) - Math.abs(foundstring.length - templatestr.length) / 2) / foundstring.length;
}