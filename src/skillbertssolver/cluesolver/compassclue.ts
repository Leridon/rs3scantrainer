import * as a1lib from "@alt1/base";
import {ImageDetect, ImgRef} from "@alt1/base";
import {TypedEmitter} from "../eventemitter";
import {coldiff} from "../oldlib";
import {posmod} from "../util";
import type {CoordMeta, MapPoint} from "./textclue";

let imgs = ImageDetect.webpackImages({
  northimg: require("./imgs/compassnorth.data.png")
});

//before 07jun2022
let newAngleTransold: { dx: number, dz: number, raw: number }[] = [
  {dx: -6, dz: 0, raw: 0.0454},
  {dx: -6, dz: 1, raw: 0.2232},
  {dx: -6, dz: 2, raw: 0.3520},
  {dx: -6, dz: 3, raw: 0.4875},
  {dx: -6, dz: 4, raw: 0.6123},
  {dx: -6, dz: 5, raw: 0.7531},
  {dx: -6, dz: 6, raw: 0.8382},
  {dx: -5, dz: 6, raw: 0.9688},
  {dx: -4, dz: 6, raw: 1.0947},
  {dx: -3, dz: 6, raw: 1.2337},
  {dx: -2, dz: 6, raw: 1.3632},
  {dx: -1, dz: 6, raw: 1.4884},
  {dx: 0, dz: 6, raw: 1.6218},
  {dx: 1, dz: 6, raw: 1.7545},
  {dx: 2, dz: 6, raw: 1.8831},
  {dx: 3, dz: 6, raw: 2.0182},
  {dx: 4, dz: 6, raw: 2.1465},
  {dx: 5, dz: 6, raw: 2.2789},
  {dx: 6, dz: 6, raw: 2.4098},
  {dx: 6, dz: 5, raw: 2.5404},
  {dx: 6, dz: 4, raw: 2.6688},
  {dx: 6, dz: 3, raw: 2.8045},
  {dx: 6, dz: 2, raw: 2.9357},
  {dx: 6, dz: 1, raw: -3.2229},
  {dx: 6, dz: 0, raw: -3.0895},
  {dx: 6, dz: -1, raw: -2.9611},
  {dx: 6, dz: -2, raw: -2.8280},
  {dx: 6, dz: -3, raw: -2.6930},
  {dx: 6, dz: -4, raw: -2.5674},
  {dx: 6, dz: -5, raw: -2.4321},
  {dx: 6, dz: -6, raw: -2.3011},
  {dx: 5, dz: -6, raw: -2.1725},
  {dx: 4, dz: -6, raw: -2.0424},
  {dx: 3, dz: -6, raw: -1.9069},
  {dx: 2, dz: -6, raw: -1.7791},
  {dx: 1, dz: -6, raw: -1.6524},
  {dx: 0, dz: -6, raw: -1.5167},
  {dx: -1, dz: -6, raw: -1.3859},
  {dx: -2, dz: -6, raw: -1.2552},
  {dx: -3, dz: -6, raw: -1.1228},
  {dx: -4, dz: -6, raw: -0.9937},
  {dx: -5, dz: -6, raw: -0.8578},
  {dx: -6, dz: -6, raw: -0.6898},
  {dx: -6, dz: -5, raw: -0.5594},
  {dx: -6, dz: -4, raw: -0.4314},
  {dx: -6, dz: -3, raw: -0.3023},
  {dx: -6, dz: -2, raw: -0.1692},
  {dx: -6, dz: -1, raw: -0.0426}
];

let newAngleTrans: { dx: number, dz: number, raw: number }[] = [
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

type CompassState = {
  dir: number,
  isArc: boolean
}

export class CompassReader {
  pos: a1lib.PointLike | null = null;

  find(img: ImgRef) {
    let locs = img.findSubimage(imgs.northimg);
    if (locs.length != 1) { return null; }
    this.pos = {
      x: locs[0].x - 53,
      y: locs[0].y + 54
    }
  }

  read(img: ImgRef): CompassState | null {
    if (!this.pos) { return null; }
    let data = img.toData(this.pos.x, this.pos.y, 130, 170);
    let dir = getdirection(data);
    if (dir == null) { return null; }
    let isArc = isArcClue(data);
    return {dir, isArc};
  }
}

interface CompassSolverEvents {
  pointChanged: { coord: MapPoint | null, meta: CoordMeta },
  message: string,
  toggletrack: boolean,
  beamschanged: void
}


export class CompassSolver extends TypedEmitter<CompassSolverEvents> {
  trackinterval = 0;
  trackendtime = 0;
  tracklastdir = NaN;//i feel discusting for doing this, should prolby remove this
  tracklastdif = 0;
  tracksecondlastdif = 0;
  trackend = 0;
  beams: { x: number, z: number, dir: number }[] = [];
  pointsOfInterest: { x: number, z: number }[] = [];
  selectedCoord: MapPoint | null = null;
  selectedCoordMeta: CoordMeta = {name: ""};

  reader = new CompassReader();

  setCoord(coord: MapPoint, meta: CoordMeta) {
    this.selectedCoord = coord;
    this.selectedCoordMeta = meta;
    this.fixPointsOfInterest();
    this.emit("pointChanged", {coord, meta});
    if (!meta.manualplace) {
      this.toggleTrackCompass(10 * 1000);
    }
  }


  trigger() {
    this.toggleTrackCompass(0);
    if (!this.selectedCoord) {
      if (!window.alt1) {
        this.emit("message", "Double-click your location on the map and then paste the screenshot again.");
      } else {
        //TODO the version of this error is handled somewhere else is think
      }
      return;
    }
    //TODO might not have alt1 at this point
    let img = a1lib.captureHoldFullRs();
    this.reader.find(img);
    let state = this.reader.read(img);
    if (state) { this.doCompass(state); }
    return !!state;
  }


  undo() {
    this.beams.pop();
    this.emit("beamschanged", undefined);
  }


  clear() {
    this.beams.length = 0;
    this.emit("beamschanged", undefined);
  }

  fixPointsOfInterest() {
    this.pointsOfInterest = [];
    const PI = Math.PI;
    const PI2 = Math.PI * 2;
    for (var a = 0; a < this.beams.length; a++) {
      let beama = this.beams[a];
      for (var b = a + 1; b < this.beams.length; b++) {
        let beamb = this.beams[b];
        var da = beama.dir - beamb.dir;
        console.log(Math.min(posmod(da, PI2), PI2 - posmod(da, PI2)));
        if (Math.min(posmod(da, PI2), PI2 - posmod(da, PI2)) < PI / 20) { continue; }//ignore small diff angles
        var isct = findintersect(beama.x, beama.z, beama.dir, beamb.x, beamb.z, beamb.dir);
        if (!isct) { continue; }
        this.pointsOfInterest.push(isct);
      }
    }
    if (this.pointsOfInterest.length == 0 && this.beams.length == 1) {
      this.pointsOfInterest.push({x: this.beams[0].x, z: this.beams[0].z});
      this.pointsOfInterest.push({
        x: this.beams[0].x + 400 * Math.cos(this.beams[0].dir),
        z: this.beams[0].z + 400 * Math.sin(this.beams[0].dir)
      });
    }
  }

  doCompass(state: CompassState) {
    this.toggleTrackCompass(0);
    if (!this.selectedCoord) {
      if (!window.alt1) {
        this.emit("message", "Double-click your location on the map and then paste the screenshot again.");
      } else {
        //handled elsewhere i think
      }
      return;
    }
    this.beams.push({x: this.selectedCoord.x, z: this.selectedCoord.z, dir: state.dir});
    this.fixPointsOfInterest();
    this.emit("beamschanged", undefined);
  }

  toggleTrackCompass(time: number) {
    if (!window.alt1) { return; }
    if (!this.reader.pos) {
      if (time > 0) {
        this.reader.find(a1lib.captureHoldFullRs())
      }
      if (!this.reader.pos) { return; }
    }
    this.tracklastdir = NaN;
    this.trackendtime = Date.now() + time;
    if (time > 0 && !this.trackinterval) {
      this.trackinterval = +setInterval(this.tracktick, 100);
      this.emit("toggletrack", true);
    }
    if (time <= 0 && this.trackinterval) {
      clearInterval(this.trackinterval);
      this.trackinterval = 0;
      this.emit("toggletrack", false);
    }
  }


  tracktick() {
    let img = a1lib.captureHoldFullRs();
    let state = this.reader.read(img);
    const rad2deg = (rad: number) => rad / 180 * Math.PI;
    if (state) {
      var dif = state.dir - this.tracklastdir;
      if (this.tracklastdir != -1) {
        //if it was previously stationary and now jumped more than ~30deg
        //OR if there was previous movement, followed by a large jump, and now stationary
        if (
          // Math.abs(this.tracklastdif) < 0.05 && Math.abs(dif) > 0.5
          // || Math.abs(this.tracksecondlastdif) > 0.1 && Math.abs(dif) > 0.5 && Math.abs(dif) < 0.02
          Math.abs(this.tracklastdif) > rad2deg(15) && Math.abs(dif) < rad2deg(2)
        ) {
          this.doCompass(state);
        }
      }

      this.tracksecondlastdif = this.tracklastdif;
      this.tracklastdif = dif;
      this.tracklastdir = state.dir;
    }

    if (Date.now() >= this.trackendtime) {
      this.toggleTrackCompass(0);
    }
  }
}

function findintersect(x1: number, y1: number, a1: number, x2: number, y2: number, a2: number) {
  var dx = x1 - x2, dy = y1 - y2;
  var dx1 = Math.cos(a1), dy1 = Math.sin(a1);
  var dx2 = Math.cos(a2), dy2 = Math.sin(a2);

  var denominator = dy2 * dx1 - dx2 * dy1;
  if (denominator == 0) { return null; }

  var num1 = dx2 * dy - dy2 * dx;
  var num2 = dx1 * dy - dy1 * dx;

  var a = num1 / denominator;
  var b = num2 / denominator;

  var x = x1 + a * dx1;
  var y = y1 + a * dy1;
  return {x: x, z: y};
}

export function isArcClue(buf: ImageData) {
  var n = 0;
  for (var a = 20; a < 120; a++) {
    var i = a * 4 + 163 * buf.width * 4;
    if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 52, 31, 5) < 50) {
      n++;
    }
  }
  return n > 5;
}

export function getdirection(buf: ImageData) {
  //var size = 170;
  var maxr = 60;
  var minr2 = 20;
  var maxr2 = 50;
  var mx = 65;//x + 15;
  var my = 65;//y + 118;

  //var buf = img.toData(round(mx) - size / 2, round(my) - size / 2, size, size);
  //mx = mx - round(mx) + size / 2;
  //my = my - round(my) + size / 2;


  var sx = 0, sy = 0, m = 0;
  for (var cx = 0; cx < buf.width; cx++) {
    for (var cy = 0; cy < buf.height; cy++) {
      var i = 4 * cx + 4 * buf.width * cy;
      var dx = cx - mx;
      var dy = cy - my;
      var rr = dx * dx + dy * dy;
      if (rr >= maxr * maxr) { continue; }
      if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 19, 19, 18) < 20//java
        || buf.data[i] < 5 && buf.data[i + 1] < 5 && buf.data[i + 2] < 5) {//nxt
        sx += dx;
        sy += dy;
        //buf.data[i] = 0; buf.data[i + 1] = 255; buf.data[i + 2] = 0;
        m++;
      } else {
        //buf.data[i] = 255; buf.data[i + 1] = 0; buf.data[i + 2] = 0;
      }
    }
  }
  if (m == 0) { return 0; }
  var massx = sx / m;
  var massy = sy / m;
  var angle = Math.atan2(massy, massx);

  const PI = Math.PI;
  const PI2 = Math.PI * 2;

  var dirsum = 0, m = 0;
  for (var cx = 0; cx < buf.width; cx++) {
    for (var cy = 0; cy < buf.height; cy++) {
      var i = 4 * cx + 4 * buf.width * cy;
      var dx = cx - mx - massx;
      var dy = cy - my - massy;
      var rr = dx * dx + dy * dy;
      if (rr >= maxr2 * maxr2 || rr <= minr2 * minr2) { continue; }
      if (coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 19, 19, 18) < 20//java
        || buf.data[i] < 5 && buf.data[i + 1] < 5 && buf.data[i + 2] < 5) {//nxt
        var dir = posmod(Math.atan2(dy, dx) - angle, PI2);

        if (dir > PI * 3 / 2) { dir -= PI2; } else if (dir > PI / 2) { dir -= PI; }

        dirsum += dir;
        m++;
        //buf.data[i] = 0; buf.data[i + 1] = 255; buf.data[i + 2] = 0;
      } else {
        //buf.data[i] = 255; buf.data[i + 1] = 0; buf.data[i + 2] = 0;
      }
    }
  }

  if (m == 0) { return 0; }
  let ddir = dirsum / m;
  angle += ddir;
  //console.log(ddir.toFixed(4));
  // console.log((angle / Math.PI * 180).toFixed(2).padStart(7, " ") + massx.toFixed(2).padStart(7, " ") + "," + massy.toFixed(2).padStart(4, " "));

  //top.ImageData.prototype.show.call(buf)

  var under: typeof newAngleTrans[number] = null!;
  var above: typeof newAngleTrans[number] = null!;
  var dunder = -10;
  var dabove = 10;
  for (let opt of newAngleTrans) {
    let d = angledif(angle, opt.raw);
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

function angledif(a: number, b: number) {
  return posmod(b - a + Math.PI, 2 * Math.PI) - Math.PI;
}
