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
    return null
  }
}

