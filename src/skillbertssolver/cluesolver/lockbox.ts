import * as a1lib from "@alt1/base"
import { webpackImages } from "@alt1/base/dist/imagedetect";
import { ImgRef } from "@alt1/base";
import { ModalUI } from "./modeluireader";

var imgs = webpackImages({
	melee: require("./imgs/lockboxmelee.data.png"),
	mage: require("./imgs/lockboxmage.data.png"),
	range: require("./imgs/lockboxrange.data.png"),
});

const w = 5;
const h = 5;
const colors = 3;
const tilesize = 38;


export class LockBoxReader {
	pos: ModalUI | null = null;

	innerRect() {
		return this.pos ? new a1lib.Rect(this.pos.rect.x + 38, this.pos.rect.y + 13, w * tilesize, h * tilesize) : null;
	}

	read(img?: ImgRef) {
		if (!this.pos) { throw new Error("ui not found yet");; }
		if (!img) { img = this.pos.img; }
		let rect = this.innerRect()!;
		var buf = img.toData(rect.x, rect.y, rect.width, rect.height);

		var state: number[][] = [];
		for (var y = 0; y < h; y++) {
			state[y] = [];
			for (var x = 0; x < w; x++) {
				var t = -1;
				if (a1lib.ImageDetect.simpleCompare(buf, imgs.melee, x * tilesize, y * tilesize) < Infinity) { t = 0; }
				if (a1lib.ImageDetect.simpleCompare(buf, imgs.range, x * tilesize, y * tilesize) < Infinity) { t = 1; }
				if (a1lib.ImageDetect.simpleCompare(buf, imgs.mage, x * tilesize, y * tilesize) < Infinity) { t = 2; }
				if (t == -1) { throw new Error("lockbox tile not matched"); }
				state[y][x] = t;
			}
		}
		console.log(state)
		return state;
	}
}


export function renderLockbox(ctx: CanvasRenderingContext2D, buf: ImageData, solution: number[][]) {
	ctx.putImageData(buf.toDrawableData(), 0, 0);
	ctx.font = "28px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (var x = 0; x < solution.length; x++) {
		for (var y = 0; y < solution[x].length; y++) {
			if (solution[y][x] == 0) { continue; }
			ctx.fillStyle = "#000";
			ctx.fillText(solution[y][x] + "", x * 38 + 19 + 1, y * 38 + 19 + 1);
			ctx.fillText(solution[y][x] + "", x * 38 + 19 - 1, y * 38 + 19 - 1);
			ctx.fillStyle = "#fff";
			ctx.fillText(solution[y][x] + "", x * 38 + 19, y * 38 + 19);
		}
	}
}

export function solveLockbox(grid: number[][], target: number) {
	var doMovo = function (x: number, y: number) {
		toggleTile(x, y);
		toggleTile(x + 1, y);
		toggleTile(x - 1, y);
		toggleTile(x, y + 1);
		toggleTile(x, y - 1);
		moves[y][x] = (moves[y][x] + 1) % colors;
	}

	var toggleTile = function (x: number, y: number) {
		if (x < 0 || x >= w) { return; }
		if (y < 0 || y >= h) { return; }
		clone[y][x] = (clone[y][x] + 1) % colors;
	}

	var chase = function () {
		for (var y = 1; y < h; y++) {
			for (var x = 0; x < w; x++) {
				while (clone[y - 1][x] != target) {
					doMovo(x, y);
				}
			}
		}
	}

	var clone: number[][] = [];
	var moves: number[][] = [];
	for (var y = 0; y < h; y++) {
		clone[y] = [];
		moves[y] = [];
		for (var x = 0; x < w; x++) {
			clone[y][x] = grid[y][x];
			moves[y][x] = 0;
		}
	}

	chase();

	//save bottom row vector
	var aim: number[] = [];
	for (var x = 0; x <= w; x++) {
		aim[x] = clone[h - 1][x];
	}

	//Get matrix of bottom rows for each possible top light
	var bot = [
		[0, 1, 0, 0, 0],
		[1, 1, 0, 0, 0]
	];
	var inv = [
		[1, 0, 2, 0, 1],
		[0, 1, 0, 1, 0]
	];

	//Now try to make aim from inv rows, by pressing the bot pattern on top row
	for (var m = 0; m < 2; m++) {
		while (aim[m]) {
			//add inv[m] to aim, and apply bot[m] to top row
			for (var x = 0; x <= w; x++) {
				aim[x] = (aim[x] + inv[m][x]) % colors;
				for (var j = 1; j <= bot[m][x]; j++) {
					doMovo(x, 0);
				}
			}
		}
	}
	//Error if aim has not been attained
	if (aim[2] + aim[3] + aim[4]) {
		//restore board
		return null;
	}
	//Expand solution to full board
	chase();
	return moves;
	//TODO implement this part
	/*
			//Should now check whether can minimise solution by adding a quiet pattern
			aim = counthnt();
			//save current position
			var backhnt = new Array;
			for (var i = 0; i <= 4; i++) {
				backhnt[i] = new Array();
				for (var j = 0; j <= 4; j++) backhnt[i][j] = hnt[i][j];
			}
	
			//get complete quiet pattern generators
			var invar = new Array();
			invar[0] = new Array();
			invar[0][0] = new Array(1, 0, 0, 0, 2);
			invar[0][1] = new Array(2, 2, 0, 1, 1);
			invar[0][2] = new Array(1, 2, 0, 1, 2);
			invar[0][3] = new Array(1, 1, 0, 2, 2);
			invar[0][4] = new Array(0, 2, 0, 1, 0);
			invar[1] = new Array();
			invar[1][0] = new Array(0, 1, 0, 2, 0);
			invar[1][1] = new Array(2, 2, 0, 1, 1);
			invar[1][2] = new Array(2, 1, 0, 2, 1);
			invar[1][3] = new Array(1, 1, 0, 2, 2);
			invar[1][4] = new Array(2, 0, 0, 0, 1);
			invar[2] = new Array();
			invar[2][0] = new Array(0, 0, 1, 0, 1);
			invar[2][1] = new Array(0, 2, 2, 1, 2);
			invar[2][2] = new Array(1, 2, 0, 1, 2);
			invar[2][3] = new Array(0, 1, 1, 2, 1);
			invar[2][4] = new Array(1, 2, 2, 1, 1);
	
			//run through all non-zero combinations of the quiet patterns.
			for (var c0 = 0; c0 <= 2; c0++) {
				for (var c1 = 0; c1 <= 2; c1++) {
					for (var c2 = 0; c2 <= 2; c2++) {
						//check combination c012; each c is multiplier for generator
						for (var i = 0; i <= 4; i++) for (var j = 0; j <= 4; j++) {
							var c = backhnt[i][j] + c0 * invar[0][i][j] + c1 * invar[1][i][j] + c2 * invar[2][i][j];
							hnt[i][j] = c - 3 * Math.floor(c / 3)
	
						}
						//check if found better solution
						j = counthnt();
						if (j < aim) {
							aim = j;
							for (var i = 0; i <= 4; i++) for (var j = 0; j <= 4; j++) backhnt[i][j] = hnt[i][j];
						}
					}
				}
			}
			//restore hnt
			for (var i = 0; i <= 4; i++) for (var j = 0; j <= 4; j++) {
				if (backhnt[i][j]) hnt[i][j] = 3 - backhnt[i][j]; else hnt[i][j] = 0;
			}
			//restore board
			for (var i = 0; i <= 4; i++) for (var j = 0; j <= 4; j++) posit[i][j] = backup[i][j];
			return (true);*/
}
