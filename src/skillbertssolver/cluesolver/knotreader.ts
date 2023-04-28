import { ImageDetect, ImageData, ImgRef } from "@alt1/base";
import * as a1lib from "@alt1/base";
import { ModalUI } from "./modeluireader";

var imgs = ImageDetect.webpackImages({
	runearea: require("./imgs/runearea.data.png"),
	bordernomatch: require("./imgs/bordernomatch.data.png"),
	bordermatch: require("./imgs/bordermatch.data.png")
});

export const tilesize = 24;
export const cnvoffset = { x: -70, y: 0 };

type Tile = { x: number, y: number, tileinfo: boolean, rune: number, match?: boolean };
type Intersection = { x: number, y: number, col1: number | false, i1: number | false, col2: number | false, i2: number | false }
export default class CelticKnotReader {
	oldpaths: Tile[][] = [[], [], [], []];
	paths: Tile[][] = [[], [], [], []];
	intersections: Intersection[] = [];
	alltiles: Tile[] = [];
	pathor = { x: 0, y: 0 };
	buttons: typeof buttonlocs[number]["locs"] = [];
	runeimages: ImageData[] = [];
	combinedprevious = false;

	static buttonoffset = { x: 7, y: 308 };
	static size = { w: 504, h: 326 };

	pos: ModalUI | null = null;
	read(buffer: ImageData) {
		this.oldpaths = this.paths;
		this.paths = [[], [], [], []];
		this.intersections = [];
		this.alltiles = [];
		this.buttons = [];

		var err = this.mappaths(buffer);
		if (err) { return err; }
		this.determineButtons();

		this.combinedprevious = this.combinepaths();
	}
	determineButtons() {
		var ints = this.intersections.length;
		var cols = 0;
		var longestpath = 0;
		var longestempty = 0;
		for (var a in this.paths) {
			var path = this.paths[a];
			if (path.length != 0) { cols++; }
			longestpath = Math.max(longestpath, this.paths[a].length);

			var empycount = 0;
			var hadstart = false;
			for (var b = 0; b < path.length;) {
				var isisct = path[b].tileinfo[5] !== false;
				if (isisct) { empycount = 0; }
				else {
					empycount++
					longestempty = Math.max(longestempty, empycount);
				}
				b++;
				if (b >= path.length) {
					if (hadstart) { break }
					else { b = 0; hadstart = true; }
				}
				if (isisct && hadstart) { break; }
			}
		}
		for (var a in buttonlocs) {
			var btn = buttonlocs[a];
			if (btn.iscts != ints) { continue; }
			if (btn.cols != cols) { continue; }
			if (btn.longestpath && btn.longestpath != longestpath) { continue; }
			if (btn.longestempty && btn.longestempty != longestempty) { continue; }
			this.buttons = btn.locs;
			return true;
		}
		return false;
	}

	getTrackColor(data: ImageData, x: number, y: number) {
		var rgb = data.getPixel(x, y);
		var lum = (rgb[0] + rgb[1] + rgb[2]) / 255;
		var r = rgb[0] / lum;
		var g = rgb[1] / lum;
		var b = rgb[2] / lum;

		var cols = {
			"-1": [101, 96, 56],//background
			0: [75, 66, 116],//blue
			1: [144, 107, 6],//0yellow
			2: [79, 74, 102],//1darkblue
			3: [92, 89, 75],//gray
		}

		var best = "";
		var bestd = -1;
		for (var colid in cols) {
			var d = Math.abs(r - cols[colid][0]) + Math.abs(g - cols[colid][1]) + Math.abs(b - cols[colid][2]);
			if (best == "" || d < bestd) {
				bestd = d;
				best = colid;
			}
		}

		//hardcode darkblue
		if (best == "0" && lum * 255 < 30) { return 2; }
		return +best;
	}

	mappaths(data: ImageData) {
		var x = 380;
		var y = 23;

		//intercept knot
		for (var a = 0; a < 300; a++) {
			if (data.data[x * 4 + data.width * y * 4] < 60 && data.data[x * 4 + data.width * y * 4 + 1] < 60 && data.data[x * 4 + data.width * y * 4 + 2] < 40) { break };
			x -= 1; y++;
		}

		//adjust for possble odd interception
		if (data.data[(x + 1) * 4 + data.width * y * 4] < 60 && data.data[(x + 1) * 4 + data.width * y * 4 + 1] < 60 && data.data[(x + 1) * 4 + data.width * y * 4 + 2] < 40) { x++; }

		//follow line until top corner is found
		for (var a = 0; a < 200; a++) {
			if (data.data[x * 4 + data.width * y * 4] > 60 && data.data[x * 4 + data.width * y * 4 + 1] > 60 && data.data[x * 4 + data.width * y * 4 + 2] > 40) { break };
			x -= 1; y -= 1;
		}
		x -= 23;
		y -= 1;

		this.pathor = { x: x, y: y };

		var err = this.maprecur(data, 0, 0);
		if (err) { return err; }

		for (var a = 0; a <= 3; a++) {//find start spots for recur
			var c = -Infinity;
			var d = -1;
			for (var b in this.alltiles) {//find highest x then y with right type, will alway result in top corner, which will recur down/clockwise
				if (this.alltiles[b].tileinfo[4] == a && this.alltiles[b].x * 100 + this.alltiles[b].y > c) {
					d = +b;
					c = this.alltiles[b].x * 100 + this.alltiles[b].y;
				}
			}
			if (isFinite(c)) {
				this.connectrecur(a, -1, this.alltiles[d].x, this.alltiles[d].y);
			}
		}
	}

	maprecur(data: ImageData, x: number, y: number): string | undefined {
		if (this.alltiles.length > 58) { console.log("To many tiles found/stack error"); return "Error mapping rings."; }
		for (var a in this.alltiles) {
			if (this.alltiles[a].x == x && this.alltiles[a].y == y) { return; }
		}

		var cx = this.pathor.x + tilesize * x - tilesize * y;
		var cy = this.pathor.y - tilesize * x - tilesize * y;

		var tileinfo;
		var isintersect = false;
		var runematch = false;
		if (data.pixelCompare(imgs.bordermatch, cx + 6, cy + 6, -1) < 10) { isintersect = true; runematch = true; }
		if (data.pixelCompare(imgs.bordernomatch, cx + 6, cy + 6, -1) < 10) { isintersect = true; runematch = false; }

		var cmain = this.getTrackColor(data, cx + 23, cy + 2);
		var ctopleft = this.getTrackColor(data, cx + 23, cy + 1);
		var ctopright = this.getTrackColor(data, cx + 24, cy + 1);
		var cbotleft = this.getTrackColor(data, cx + 23, cy + 46);
		var cbotright = this.getTrackColor(data, cx + 24, cy + 46);
		tileinfo = [ctopleft, ctopright, cbotright, cbotleft, cmain, isintersect];

		//TODO check if this is still a thing
		//hardcode solution to weird position glitch in rs
		var search: any = false;
		//if (x == -5 && y == -3) { search = [[0, 0], [1, 0]]; }
		var rune = this.differentiateRune(data, cx + 5 + 6, cy + 5 + 6, search);

		this.alltiles.push({ x: x, y: y, tileinfo: tileinfo, rune: rune, match: runematch });
		//TODO use throw here instead on failure instead of the return string thing
		if (tileinfo[0] != -1) { var err = this.maprecur(data, x, y + 1); if (err) { return err; } }
		if (tileinfo[1] != -1) { var err = this.maprecur(data, x + 1, y); if (err) { return err; } }
		if (tileinfo[2] != -1) { var err = this.maprecur(data, x, y - 1); if (err) { return err; } }
		if (tileinfo[3] != -1) { var err = this.maprecur(data, x - 1, y); if (err) { return err; } }
	}

	differentiateRune(data: ImageData, x: number, y: number, search: false | [number, number][]) {
		if (!search) { search = [[0, 0]]; }
		for (var c in search) {
			var cx = x + search[c][0];
			var cy = y + search[c][1];
			var subimg = multiplybuffer(data, imgs.runearea, cx, cy);
			for (var a = 0; a < this.runeimages.length; a++) {
				var b = diffSum(subimg, this.runeimages[a]);
				if (b < 3) { return a; }
			}
		}
		this.runeimages.push(multiplybuffer(data, imgs.runearea, x, y));
		return this.runeimages.length - 1;
	}


	connectrecur(col: number, dir: number, x: number, y: number) {
		if (this.paths[col][0] && this.paths[col][0].x == x && this.paths[col][0].y == y) { return; }
		var tileinfo = false;
		for (var a = 0; a < this.alltiles.length; a++) {
			if (this.alltiles[a].x == x && this.alltiles[a].y == y) { tileinfo = this.alltiles[a].tileinfo; break; }
		}
		if (tileinfo === false) { console.log("recured to invalid tile"); return; }
		var rune = (tileinfo[4] == col || this.alltiles[a].match ? this.alltiles[a].rune : -1 - this.alltiles[a].rune);
		this.paths[col].push({ x: x, y: y, tileinfo: tileinfo, rune: rune });

		if (tileinfo[5]) {//intersection tile
			var isct: number | false = false;
			for (var c in this.intersections) {
				if (this.intersections[c].x == x && this.intersections[c].y == y) { isct = +c; break; }
			}
			if (isct === false) {
				this.intersections.push({ x: x, y: y, col1: false, i1: false, col2: false, i2: false });
				isct = this.intersections.length - 1;
			}
			if (tileinfo[4] == col) {
				this.intersections[isct].col1 = col;
				this.intersections[isct].i1 = this.paths[col].length - 1;
			} else {
				this.intersections[isct].col2 = col;
				this.intersections[isct].i2 = this.paths[col].length - 1;
			}
		}

		if (dir != 2 && tileinfo[0] == col) { this.connectrecur(col, 0, x, y + 1); }
		else if (dir != 3 && tileinfo[1] == col) { this.connectrecur(col, 1, x + 1, y); }
		else if (dir != 0 && tileinfo[2] == col) { this.connectrecur(col, 2, x, y - 1); }
		else if (dir != 1 && tileinfo[3] == col) { this.connectrecur(col, 3, x - 1, y); }
	}

	combinepaths() {
		var match = true;
		for (var a = 0; a <= 2; a++) {
			if (this.paths[a].length != this.oldpaths[a].length) { match = false; break; }
			for (var b in this.paths[a]) {
				if (this.paths[a][b].rune == this.oldpaths[a][b].rune) { continue; }
				if (this.paths[a][b].rune < 0 && this.oldpaths[a][b].rune < 0) { continue; }
				if (this.paths[a][b].rune < 0 && -1 - this.paths[a][b].rune != this.oldpaths[a][b].rune) { continue; }
				if (this.oldpaths[a][b].rune < 0 && -1 - this.oldpaths[a][b].rune != this.paths[a][b].rune) { continue; }
				match = false;
			}
		}
		if (!match) { return false; }
		for (var a = 0; a <= 2; a++) {
			for (var b in this.paths[a]) {
				if (this.paths[a][b].rune < 0 && this.oldpaths[a][b].rune >= 0) {
					this.paths[a][b].rune = this.oldpaths[a][b].rune;
				}
			}
		}
		return true;
	}
}

function multiplybuffer(target: ImageData, img: ImageData, sx, sy) {
	var x, y, i1, i2, r;
	r = new ImageData(img.width, img.height);
	if (!sx && sx !== 0) { sx = 0; sy = 0; }
	for (x = 0; x < img.width; x++) {
		for (y = 0; y < img.height; y++) {
			i1 = 4 * (sx + x) + target.width * 4 * (sy + y);
			i2 = 4 * x + img.width * 4 * y;
			r.data[i2 + 0] = target.data[i1 + 0] * img.data[i2 + 0] / 255;
			r.data[i2 + 1] = target.data[i1 + 1] * img.data[i2 + 1] / 255;
			r.data[i2 + 2] = target.data[i1 + 2] * img.data[i2 + 2] / 255;
			r.data[i2 + 3] = img.data[i2 + 3];
		}
	}
	return r;
}

function diffSum(target: ImageData, img: ImageData, sx = 0, sy = 0) {
	var x, y, i1, i2, r, d;
	r = 0;
	for (x = 0; x < img.width; x++) {
		for (y = 0; y < img.height; y++) {
			i1 = 4 * (sx + x) + target.width * 4 * (sy + y);
			i2 = 4 * x + img.width * 4 * y;
			d = 0;
			d += Math.abs(target.data[i1 + 0] - img.data[i2 + 0]);
			d += Math.abs(target.data[i1 + 1] - img.data[i2 + 1]);
			d += Math.abs(target.data[i1 + 2] - img.data[i2 + 2]);
			r += d * target.data[i1 + 3] * img.data[i2 + 3] / 255 / 255;
		}
	}
	return r / img.width / img.height;
}

export var buttonlocs: { iscts?: number, cols?: number, longestpath?: number, longestempty?: number, locs: ({ incr: a1lib.PointLike, decr: a1lib.PointLike } | null)[] }[] = [
	{
		iscts: 6, cols: 3, locs: [
			{ incr: { x: -6, y: -3 }, decr: { x: -5, y: -4 } },
			{ incr: { x: -6, y: 3 }, decr: { x: -7, y: 2 } },
			{ incr: { x: 0, y: -5 }, decr: { x: 1, y: -4 } },
			null
		]
	},
	{
		iscts: 8, cols: 3, longestpath: 16, longestempty: 11, locs: [
			{ incr: { x: 0, y: -5 }, decr: { x: 1, y: -4 } },
			{ incr: { x: -4, y: 3 }, decr: { x: -5, y: 2 } },
			{ incr: { x: -6, y: -3 }, decr: { x: -5, y: -4 } },
			null
		]
	},
	{
		iscts: 8, cols: 3, longestpath: 16, locs: [
			{ incr: { x: -5, y: 3 }, decr: { x: -6, y: 2 } },
			{ incr: { x: 1, y: -2 }, decr: { x: 1, y: 0 } },
			{ incr: { x: -1, y: -5 }, decr: { x: 0, y: -4 } },
			null
		]
	},
	{
		iscts: 8, cols: 3, longestpath: 16, longestempty: 11, locs: [
			{ incr: { x: -5, y: 3 }, decr: { x: -6, y: 2 } },
			{ incr: { x: 1, y: -2 }, decr: { x: 1, y: 0 } },
			{ incr: { x: -1, y: -5 }, decr: { x: 0, y: -4 } },
			null
		]
	},
	{
		iscts: 10, cols: 3, longestpath: 16, locs: [
			{ incr: { x: 0, y: -3 }, decr: { x: 1, y: -2 } },
			{ incr: { x: -7, y: 2 }, decr: { x: -8, y: 1 } },
			{ incr: { x: -6, y: -3 }, decr: { x: -5, y: -4 } },
			null
		]
	},
	{
		iscts: 12, cols: 3, locs: [
			{ incr: { x: -6, y: -3 }, decr: { x: -5, y: -4 } },
			{ incr: { x: -6, y: 1 }, decr: { x: -7, y: 0 } },
			{ incr: { x: -2, y: -5 }, decr: { x: -1, y: -4 } },
			null
		]
	},
	{
		iscts: 8, cols: 4, locs: [
			{ incr: { x: -4, y: -6 }, decr: { x: -2, y: -6 } },
			{ incr: { x: -7, y: -1 }, decr: { x: -7, y: -3 } },
			{ incr: { x: -2, y: 2 }, decr: { x: -4, y: 2 } },
			{ incr: { x: 1, y: -3 }, decr: { x: 1, y: -1 } }
		]
	},
	{
		iscts: 14, cols: 4, locs: [
			{ incr: { x: -2, y: 2 }, decr: { x: -5, y: 2 } },
			{ incr: { x: -7, y: -3 }, decr: { x: -6, y: -4 } },
			{ incr: { x: -7, y: 1 }, decr: { x: -8, y: 0 } },
			{ incr: { x: 0, y: -3 }, decr: { x: 1, y: -2 } }
		]
	},
	{
		iscts: 8, cols: 3, longestpath: 28, locs: [
			{ incr: { x: -6, y: 2 }, decr: { x: -7, y: 1 } },
			{ incr: { x: 1, y: -1 }, decr: { x: -3, y: 3 } },
			{ incr: { x: -1, y: -5 }, decr: { x: 0, y: -4 } },
			null
		]
	},
	{
		iscts: 10, cols: 3, longestpath: 24, locs: [
			{ incr: { x: -7, y: 2 }, decr: { x: -8, y: 1 } },
			{ incr: { x: 0, y: 1 }, decr: { x: -2, y: 3 } },
			{ incr: { x: -1, y: -4 }, decr: { x: 1, y: -2 } },
			null
		]
	}
];
