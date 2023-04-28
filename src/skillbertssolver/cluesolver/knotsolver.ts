

import CelticKnotReader, { tilesize, cnvoffset } from "./knotreader";

export type KnotOffsets = [number, number, number, number];

export function calcNumberCoord(reader: CelticKnotReader, color: number, offset: number) {
	let btns = reader.buttons[color];
	if (!btns) { return null; }
	let ringlength = reader.paths[color].length;
	let flip = offset > ringlength / 2;
	let n = flip ? ringlength - offset : offset;
	let button = flip ? btns.incr : btns.decr;

	return {
		n,
		x: reader.pathor.x + tilesize * button.x - tilesize * button.y,
		y: reader.pathor.y - tilesize * button.x - tilesize * button.y
	}
}

export function renderKnot(ctx: CanvasRenderingContext2D, reader: CelticKnotReader, buf: ImageData, solution: number[]) {
	ctx.putImageData(buf.toDrawableData(), cnvoffset.x, cnvoffset.y);
	for (let color in solution) {
		let coord = calcNumberCoord(reader, +color, solution[color]);
		if (!coord) { continue; }
		ctx.textBaseline = "top";
		ctx.font = "30px sans-serif";
		ctx.fillStyle = "black";
		ctx.fillText(coord.n + "", cnvoffset.x + coord.x + 10 + 6 + 2, cnvoffset.y + coord.y + 2 + 6 + 2);
		ctx.fillStyle = "white";
		ctx.fillText(coord.n + "", cnvoffset.x + coord.x + 10 + 6, cnvoffset.y + coord.y + 6 + 2);
	}
}

export function solvebrute(reader: CelticKnotReader, offsets?: KnotOffsets, layer?: number, solutions?: { offsets: KnotOffsets, sure: boolean }[]) {
	if (!offsets || layer == undefined || !solutions) {
		offsets = [0, 0, 0, 0];
		layer = 0;
		solutions = [];
	}

	var paths = reader.paths;
	var iscts = reader.intersections;

	//path can be empty, give it a single iter at 0 offset
	var layersize = Math.max(1, paths[layer].length);
	for (var a = 0; a < layersize; a++) {
		offsets[layer] = a;
		if (layer + 1 < offsets.length) {
			//next layer
			solvebrute(reader, offsets, layer + 1, solutions);
		}
		else {
			//check for solution
			var sure = true;
			var pass = true;
			for (var b in iscts) {
				var c1 = iscts[b].col1 as number;
				var c2 = iscts[b].col2 as number;
				var r1 = paths[c1][(iscts[b].i1 as number + offsets[c1]) % paths[c1].length].rune;
				var r2 = paths[c2][(iscts[b].i2 as number + offsets[c2]) % paths[c2].length].rune;

				if (r1 < 0 && r2 >= 0 && -r1 - 1 == r2) { pass = false; break; }//r1 is any but r2
				if (r2 < 0 && r1 >= 0 && -r2 - 1 == r1) { pass = false; break; }//r2 is any but r1
				if (r1 >= 0 && r2 >= 0 && r1 != r2) { pass = false; break; }//r1 is not r2

				if (r1 < 0 || r2 < 0) { sure = false; }
			}
			if (pass) { solutions.push({ offsets: offsets.slice() as KnotOffsets, sure: sure }); }
		}
	}

	return solutions;
}