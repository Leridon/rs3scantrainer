
import * as a1lib from "@alt1/base"
import * as OCR from "@alt1/ocr";
import { webpackImages } from "@alt1/base/dist/imagedetect";
import { ImgRef } from "@alt1/base";
import { Grid } from "./towerssolver";
import { ModalUI } from "./modeluireader";

let font: OCR.FontDefinition = require("@alt1/ocr/fonts/aa_10px_mono.js");
let fontclone = { ...font, chars: font.chars.filter(c => !isNaN(+c.chr)) };


export type TowersReadState = { left: number[], right: number[], top: number[], bot: number[], filled: number[] }

export class TowersReader {
	pos: ModalUI | null = null;

	innerRect() {
		return this.pos ? new a1lib.Rect(this.pos.rect.x + 15, this.pos.rect.y + 12, 270, 270) : null;
	}

	read(img?: ImgRef) {
		if (!this.pos) { throw new Error("pos not found"); }
		if (!img) { img = this.pos.img; }
		let innerpos = this.innerRect()!;
		var buf = img.toData(innerpos.x, innerpos.y, innerpos.width, innerpos.height);

		var state: TowersReadState = { left: [], right: [], top: [], bot: [], filled: [] };
		var readn = function (x: number, y: number, col: OCR.ColortTriplet, req: boolean) {
			let str: OCR.ReadCharInfo | null = null;
			for (let wiggle = -2; wiggle < 2; wiggle++) {
				str = str || OCR.readChar(buf, fontclone, col, x + wiggle, y, false, true);
			}
			if (!str) {
				if (req) { throw new Error("charfail"); }
				else { return 0; }
			}
			return +str.chr;
		}

		let col: OCR.ColortTriplet = [255, 205, 10];

		//top
		for (var i = 0; i < 5; i++) { state.top.push(readn(43 + 44 * i, 13, col, true)); }
		//bot
		for (var i = 0; i < 5; i++) { state.bot.push(readn(43 + 44 * i, 263, col, true)); }
		//left
		for (var i = 0; i < 5; i++) { state.left.push(readn(6, 50 + 44 * i, col, true)); }
		//right
		for (var i = 0; i < 5; i++) { state.right.push(readn(256, 50 + 44 * i, col, true)); }

		for (var y = 0; y < 5; y++) {
			for (var x = 0; x < 5; x++) {
				// OCR.readChar(buf, font, [255, 255, 255], 43 + 44 * x, 50 + 44 * y, false, true);
				var str = readn(43 + 44 * x, 50 + 44 * y, [255, 255, 255], false);
				state.filled[x + y * 5] = (str ? +str : -1);
			}
		}
		console.log(state);
		return state;
	}
}

