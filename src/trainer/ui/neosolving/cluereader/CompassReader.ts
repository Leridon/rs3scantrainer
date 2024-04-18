import {coldiff} from "../../../../skillbertssolver/oldlib";
import {posmod} from "../../../../skillbertssolver/util";
import {Compasses} from "../../../../lib/cluetheory/Compasses";
import {ImgRef} from "@alt1/base";
import {Vector2} from "../../../../lib/math";

export namespace CompassReader {

  import angleDifference = Compasses.angleDifference;
  const newAngleTrans: { dx: number, dz: number, raw: number }[] = [
    {dx: -5, dz: 0, raw: 0.0454},
    {dx: -5, dz: 1, raw: 0.2037},
    {dx: -5, dz: 2, raw: 0.359},
    {dx: -5, dz: 3, raw: 0.5237},
    {dx: -5, dz: 4, raw: 0.6809},
    {dx: -5, dz: 5, raw: 0.8382},
    {dx: -4, dz: 5, raw: 0.9919},
    {dx: -3, dz: 5, raw: 1.1473},
    {dx: -2, dz: 5, raw: 1.3094},
    {dx: -1, dz: 5, raw: 1.4671},
    {dx: 0, dz: 5, raw: 1.6218},
    {dx: 1, dz: 5, raw: 1.7809},
    {dx: 2, dz: 5, raw: 1.9308},
    {dx: 3, dz: 5, raw: 2.0947},
    {dx: 4, dz: 5, raw: 2.2519},
    {dx: 5, dz: 5, raw: 2.4098},
    {dx: 5, dz: 4, raw: 2.5633},
    {dx: 5, dz: 3, raw: 2.7193},
    {dx: 5, dz: 2, raw: 2.8785},
    {dx: 5, dz: 1, raw: -3.243},
    {dx: 5, dz: 0, raw: -3.0895},
    {dx: 5, dz: -1, raw: -2.9294},
    {dx: 5, dz: -2, raw: -2.7802},
    {dx: 5, dz: -3, raw: -2.6201},
    {dx: 5, dz: -4, raw: -2.4627},
    {dx: 5, dz: -5, raw: -2.3011},
    {dx: 4, dz: -5, raw: -2.147},
    {dx: 3, dz: -5, raw: -1.992},
    {dx: 2, dz: -6, raw: -1.7791},//different dz!!
    {dx: 1, dz: -5, raw: -1.6773},
    {dx: 0, dz: -5, raw: -1.5167},
    {dx: -1, dz: -5, raw: -1.3567},
    {dx: -2, dz: -5, raw: -1.207},
    {dx: -3, dz: -5, raw: -1.0464},
    {dx: -4, dz: -5, raw: -0.8892},
    {dx: -5, dz: -5, raw: -0.7311},
    {dx: -5, dz: -4, raw: -0.577},
    {dx: -5, dz: -3, raw: -0.4213},
    {dx: -5, dz: -2, raw: -0.2666},
    {dx: -5, dz: -1, raw: -0.1103}
  ]

  export type CompassState = {
    angle: number,
    isArc: boolean
  }

  export function readCompassState(img: ImgRef, pos: Vector2): CompassState {
    let data = img.toData(pos.x, pos.y, 130, 170);
    let dir = CompassReader.getCompassAngle(data);

    if (dir == null) { return null; }

    let isArc = CompassReader.isArcClue(data);
    return {angle: dir, isArc: isArc};
  }

  export function getCompassAngle(buf: ImageData): number {
    //var size = 170;
    const maxr = 60;
    const minr2 = 20;
    const maxr2 = 50;
    const mx = 65;//x + 15;
    const my = 65;//y + 118;

    //var buf = img.toData(round(mx) - size / 2, round(my) - size / 2, size, size);
    //mx = mx - round(mx) + size / 2;
    //my = my - round(my) + size / 2;


    let sx = 0
    let sy = 0
    let m1 = 0;
    for (let cx = 0; cx < buf.width; cx++) {
      for (let cy = 0; cy < buf.height; cy++) {
        const i = 4 * cx + 4 * buf.width * cy;
        const dx = cx - mx;
        const dy = cy - my;
        const rr = dx * dx + dy * dy;
        if (rr >= maxr * maxr) { continue; }
        if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 19, 19, 18) < 20//java
          || buf.data[i] < 5 && buf.data[i + 1] < 5 && buf.data[i + 2] < 5) {//nxt
          sx += dx;
          sy += dy;
          //buf.data[i] = 0; buf.data[i + 1] = 255; buf.data[i + 2] = 0;
          m1++;
        } else {
          //buf.data[i] = 255; buf.data[i + 1] = 0; buf.data[i + 2] = 0;
        }
      }
    }
    if (m1 == 0) { return 0; }
    const massx = sx / m1;
    const massy = sy / m1;
    let angle = Math.atan2(massy, massx);

    const PI = Math.PI;
    const PI2 = Math.PI * 2;

    let dirsum = 0

    let m2 = 0;
    for (let cx = 0; cx < buf.width; cx++) {
      for (let cy = 0; cy < buf.height; cy++) {
        var i = 4 * cx + 4 * buf.width * cy;
        var dx = cx - mx - massx;
        var dy = cy - my - massy;
        var rr = dx * dx + dy * dy;
        if (rr >= maxr2 * maxr2 || rr <= minr2 * minr2) { continue; }
        if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 19, 19, 18) < 20//java
          || buf.data[i] < 5 && buf.data[i + 1] < 5 && buf.data[i + 2] < 5) {//nxt
          let dir = posmod(Math.atan2(dy, dx) - angle, PI2);

          if (dir > PI * 3 / 2) { dir -= PI2; } else if (dir > PI / 2) { dir -= PI; }

          dirsum += dir;
          m2++;
          //buf.data[i] = 0; buf.data[i + 1] = 255; buf.data[i + 2] = 0;
        } else {
          //buf.data[i] = 255; buf.data[i + 1] = 0; buf.data[i + 2] = 0;
        }
      }
    }

    if (m2 == 0) { return 0; }
    let ddir = dirsum / m2;
    angle += ddir;
    //console.log(ddir.toFixed(4));
    // console.log((angle / Math.PI * 180).toFixed(2).padStart(7, " ") + massx.toFixed(2).padStart(7, " ") + "," + massy.toFixed(2).padStart(4, " "));

    //top.ImageData.prototype.show.call(buf)

    var under: typeof newAngleTrans[number] = null!;
    var above: typeof newAngleTrans[number] = null!;
    var dunder = -10;
    var dabove = 10;
    for (let opt of newAngleTrans) {
      let d = angleDifference(angle, opt.raw);
      if (d <= 0 && d > dunder) {
        under = opt;
        dunder = d;
      }
      if (d >= 0 && d < dabove) {
        above = opt;
        dabove = d;
      }
    }
    //interpolate between the 2 closest points
    let alpha = (under == above ? 1 : dabove / (dabove - dunder));
    let dirz = alpha * under.dz + (1 - alpha) * above.dz;
    let dirx = alpha * under.dx + (1 - alpha) * above.dx;
    return Math.atan2(-dirz, -dirx);
  }

  export function isArcClue(buf: ImageData) {
    let n = 0;
    for (let a = 20; a < 120; a++) {
      const i = a * 4 + 163 * buf.width * 4;
      if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 52, 31, 5) < 50) {
        n++;
      }
    }
    return n > 5;
  }
}