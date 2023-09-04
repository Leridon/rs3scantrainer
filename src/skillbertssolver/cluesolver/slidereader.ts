import { ImgRef } from "@alt1/base";
import * as defs from "./slidetiles";
import * as oldlib from "./oldlib";

var mapw = 5;
var maph = 5;

export class SlideReader {
	pos: { x: number, y: number } | null = null;
	osrs = false;
	debugimport = false;

	find() {
		throw new Error("Not implemented, get the position using cluereader");
	}

	read(imgref: ImgRef) {
		if (!this.pos) { return null; }
		var x = this.pos.x;
		var y = this.pos.y;

		var buf = imgref.toData(x, y, 280, 280);
		var tileoffset = this.osrs ? 39 : 56;
		var puzzleoffset = { x: 0, y: 0 };
		var scores: any[][] = [];//read all tiles possibilities into scores
		for (var a = 0; a < maph; a++) {
			for (var b = 0; b < mapw; b++) {
				scores.push(this.readtile(buf, puzzleoffset.x + b * tileoffset, puzzleoffset.y + a * tileoffset));
			}
		}

		var themescores: { [theme in defs.SliderThemes]: number } = {} as any;//get the match rate for every theme
		var cthemes = this.osrs ? defs.osrsthemes : defs.themes;
		for (var a = 0; a < cthemes.length; a++) {
			var d = cthemes[a];
			themescores[d] = 0;
			for (var b = 0; b < scores.length; b++) {
				for (var c = 0; c < scores[b].length; c++) {
					if (scores[b][c].theme == d || scores[b][c].theme == "black") { themescores[d] += scores[b][c].score; break; }
				}
			}
		}

		var b = Infinity;
		var theme: defs.SliderThemes = null!;
		for (var d in themescores) {//get the best theme match
			if (themescores[d] < b) { b = themescores[d]; theme = d as defs.SliderThemes; }
		}

		var map: number[] = [];
		for (var a = 0; a < scores.length; a++) {
			for (var b = 0; b < scores[a].length; b++) {
				if (scores[a][b].theme == theme || scores[a][b].theme == "black") { map[a] = scores[a][b].part; break; }
			}
		}

		//console.log("== theme = " + theme + " == ");
		//console.log(map);

		//multiply color at coord with color vector, highest sum is p1
		var hardcodes: { theme: string, p1: number, p2: number, x: number, y: number, r: number, g: number, b: number }[];
		if (this.osrs) {
			hardcodes = [
				{ theme: "c", p1: 11, p2: 6, x: 3, y: 3, r: 1, g: 0, b: 0 },
			];
		}
		else {
			hardcodes = [
				{ theme: "r", p1: 20, p2: 17, x: 10, y: 10, r: 0, g: 0, b: 1 },
				{ theme: "m", p1: 4, p2: 0, x: 47, y: 47, r: 1, g: 0, b: 0 },
				{ theme: "b", p1: 4, p2: 1, x: 25, y: 45, r: 0, g: 0, b: 1 },
				//rare fixes, obscure graphics settings
				{ theme: "o", p1: 4, p2: 14, x: 40, y: 10, r: 1, g: 1, b: 1 },
				{ theme: "c", p1: 6, p2: 11, x: 5, y: 45, r: 1, g: 0, b: 1 },
				{ theme: "d", p1: 2, p2: 4, x: 42, y: 47, r: 0, g: 0, b: 1 },
				{ theme: "m", p1: 10, p2: 6, x: 9, y: 6, r: 1, g: 0, b: 0 },
				{ theme: "m", p1: 22, p2: 23, x: 9, y: 6, r: 1, g: 0, b: 0 },
				{ theme: "d", p1: 21, p2: 23, x: 2, y: 39, r: 0, g: 1, b: 0 },
				{ theme: "m", p1: 10, p2: 6, x: 20, y: 40, r: 1, g: 1, b: 0 },
				{ theme: "m", p1: 4, p2: 6, x: 43, y: 44, r: 1, g: 0, b: 0 },
				{ theme: "m", p1: 10, p2: 14, x: 2, y: 2, r: 1, g: 0, b: 0 },
				{ theme: "t", p1: 22, p2: 21, x: 2, y: 2, r: 1, g: 1, b: 1 },
				{ theme: "o", p1: 19, p2: 24, x: 40, y: 40, r: 0, g: 0, b: 1 },
			];
		}
		for (var d in hardcodes) {
			if (theme != hardcodes[d].theme) { continue; }
			let b: number[][] = [];
			for (var a = 0; a < map.length; a++) { if (map[a] == hardcodes[d].p1 || map[a] == hardcodes[d].p2) { b.push([a % mapw, Math.floor(a / mapw), a, 0]); } }
			if (b.length <= 1) { continue; }

			var max = 0;
			for (let e in b) {
				var p = buf.getPixel(puzzleoffset.x + b[e][0] * tileoffset + hardcodes[d].x, puzzleoffset.y + b[e][1] * tileoffset + hardcodes[d].y);
				b[e][3] += p[0] * hardcodes[d].r;
				b[e][3] += p[1] * hardcodes[d].g;
				b[e][3] += p[2] * hardcodes[d].b;
				if (b[e][3] > max) { max = b[e][3]; }
			}

			var used = false;
			for (let e in b) {
				if (b[e][3] == max) { if (map[b[e][2]] != hardcodes[d].p1) { used = true; } map[b[e][2]] = hardcodes[d].p1 }
				else { if (map[b[e][2]] != hardcodes[d].p2) { used = true; } map[b[e][2]] = hardcodes[d].p2; }
			}

			console.log("hardcode fix #" + d + " applied: " + hardcodes[d].p1 + "-" + hardcodes[d].p2, used);
		}

		if (!this.debugimport) {
			//check if we have a full set of unique tiles
			for (var a = 0; a < 25; a++) { if (map.indexOf(a) == -1) { return false; } }
		}

		return { map, theme };
	}
	readtile(data: ImageData, x: number, y: number) {
		var a, vals;
		var tilelist = this.osrs ? defs.ostiles : defs.tiles;
		if (this.osrs) { vals = oldlib.tiledata(data, 9, 9, x, y, 36, 36); }
		else { vals = oldlib.tiledata(data, 12, 12, x, y, 48, 48); }
		//if (tiledataname) { tiledata.push({ part: tiledataname + tiledata.length, scores: vals }); }
		var r: { score: number, part: number, theme: string }[] = [];
		for (a in tilelist) {
			var b: number;
			var c: string;
			tilelist[a].part.replace(/([A-Za-z_]+)(\d+)/, function () { b = +arguments[2]; c = arguments[1]; return ""; });
			r[a] = { score: oldlib.comparetiledata(vals as any, tilelist[a].scores as any), part: b!, theme: c! };
		}
		r.sort(function (a, b) { return a.score - b.score });
		return r;
	}
}


