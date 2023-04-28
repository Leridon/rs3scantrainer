import { ImgRef, RectLike, Rect, ImageDetect } from "@alt1/base";
import * as a1lib from "@alt1/base";
import * as OCR from "@alt1/ocr";
import { ModalUI } from "./modeluireader";

var font = require("@alt1/ocr/fonts/aa_9px_mono_allcaps.js");


export default class ClueRewardReader {
	pos: ModalUI | null = null;

	read(img: ImgRef) {
		if (!this.pos) { throw new Error("ui not found yet");; }
		var buf = img.toData(this.pos.rect.x, this.pos.rect.y, this.pos.rect.width, this.pos.rect.height);

		var hash = 0;

		const xcomp = 20 - 28;
		const ycomp = -19 - 13;

		for (var y = 50 + ycomp; y < 85 + ycomp; y++) {
			for (var x = 25 + xcomp; x < 375 + xcomp; x++) {
				if (this.pos.legacy && buf.getColorDifference(x, y, 62, 53, 40) < 10) { continue; }
				if (!this.pos.legacy && buf.getColorDifference(x, y, 10, 31, 41) < 10) { continue; }
				hash = (((hash << 5) - hash) + buf.getPixelInt(x, y)) | 0;
			}
		}

		var str = OCR.findReadLine(buf, font, [[255, 255, 255]], 134 + xcomp, 113 + ycomp);
		if (!str.text) { return null; }
		var text = str.text.toLowerCase();
		var m = text.match(/(value|atual)[: ]+([\d,\.]+)\b/);
		if (!m) { return null; }
		var value = +m[2].replace(/[,\.]/g, "");

		return { hash, value, text };
	}
}