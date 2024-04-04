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
export function colordifsum(buf: ImageData, x: number, y: number, w: number, h: number) {
  var a, b, c, s, i, row, column;

  row = 4 * buf.width;
  column = 4;
  s = 0;
  for (a = x; a < x + w; a++) {
    for (c = y; c < y + h; c++) {
      i = row * c + column * a;
      s += Math.abs(buf.data[i] - buf.data[i + column]);
      s += Math.abs(buf.data[i] - buf.data[i + row]);
      s += Math.abs(buf.data[i + 1] - buf.data[i + 1 + column]);
      s += Math.abs(buf.data[i + 1] - buf.data[i + 1 + row]);
      s += Math.abs(buf.data[i + 2] - buf.data[i + 2 + column]);
      s += Math.abs(buf.data[i + 2] - buf.data[i + 2 + row]);
    }
  }
  return s;
}

//calculates a pattern from a buffer to compare to solver buffers
//currently experimental, did wonders on slide puzzle tiles
export function tiledata(buf: ImageData, rw: number, rh: number, x: number, y: number, w: number, h: number): number[] {

  let basecol = rgbtohsl(coloravg(buf, x, y, w, h));
  let r = [basecol[0], basecol[1], basecol[2]];
  for (let cx = 0; (cx + 1) * rw <= w; cx++) {
    let xx = x + cx * rw;
    for (let cy = 0; (cy + 1) * rh <= h; cy++) {
      let yy = y + cy * rh;
      let i = cx * 5 + cy * Math.floor(w / rw) * 5 + 3;
      let b = rgbtohsl(coloravg(buf, xx, yy, rw, rh));
      r[i + 0] = b[0];//hue
      if (r[i + 0] > 128) { r[i + 1] -= 256; }
      if (r[i + 0] < -128) { r[i + 1] += 256; }
      r[i + 1] = b[1];//sat
      r[i + 2] = basecol[2] - b[2];//lum
      r[i + 3] = Math.floor(colordifsum(buf, xx + 1, yy + 1, rw - 2, rh - 2) / rw / rh);//min roughtness (border -1 px)
      r[i + 4] = Math.floor(colordifsum(buf, xx, yy, rw, rh) / rw / rh);//max roughness (full square)
    }
  }
  return r;
}

//compares 2 tiledata objects and returns a match score
export function comparetiledata(data1: Uint8ClampedArray | number[], data2: Uint8ClampedArray | number[]) {//compares two tiledata sets
  let r = 0;
  let c = Math.abs(data1[0] - data2[0]);
  r += Math.max(0, (c > 128 ? 255 - c : c) * 5 - 100);//basecol hue
  r += Math.max(0, Math.abs(data1[1] - data2[1]) * 5 - 100);//basecol sat

  for (let a = 3; a < data1.length; a += 5) {
    let b = 0;
    c = Math.abs(data1[a] - data2[a]);//hue
    b += (c > 128 ? 255 - c : c) * Math.max(data1[a], data2[a]) / 255;
    b += Math.abs(data1[a + 1] - data2[a + 1]);//sat

    b += Math.max(0, data1[a + 3] - data2[a + 4]) * 100;//more roughness
    b += Math.max(0, data2[a + 3] - data1[a + 4]) * 100;//less roughness

    r += b;
  }
  return r;
}

export function rgbtohsl(r: number | number[], g?: number, b?: number) {
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