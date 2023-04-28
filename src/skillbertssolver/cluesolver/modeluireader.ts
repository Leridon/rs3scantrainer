import { webpackImages } from "@alt1/base/dist/imagedetect";
import { PointLike, RectLike, ImgRef, captureHoldFullRs, Rect } from "@alt1/base";
import * as OCR from "@alt1/ocr";

var capsfont = require("@alt1/ocr/fonts/aa_9px_mono_allcaps.js");

let imgs = webpackImages({
	exitbutton: require("./imgs/eocx.data.png"),
	exitbutton_leg: require("./imgs/legacyx.data.png"),
	topleft: require("./imgs/eoctopleft.data.png"),
	topleft_leg: require("./imgs/legacytopleft.data.png"),
	botleft: require("./imgs/eocbotleft.data.png"),
	botleft_leg: require("./imgs/legacybotleft.data.png"),
})

export type ModalUI = {
	rect: RectLike,
	legacy: boolean,
	title: string,
	img: ImgRef
}

export namespace ModalUIReader {
	export function find(img?: ImgRef) {
		if (!img) { img = captureHoldFullRs(); }
		let treoc = img.findSubimage(imgs.exitbutton);
		let trleg = img.findSubimage(imgs.exitbutton_leg);
		let eocboxes = treoc.map(p => detectEoc(img!, p));
		let legacyboxes = trleg.map(p => detectLegacy(img!, p));
		return [...eocboxes, ...legacyboxes].filter(m => m) as ModalUI[];
	}

	export function detectEoc(img: ImgRef, pos: PointLike): ModalUI | null {
		let left = img.findSubimage(imgs.topleft, img.x, pos.y - 5, pos.x, imgs.topleft.height).sort((a, b) => a.x - b.x)[0];
		if (!left) { return null; }
		let bot = img.findSubimage(imgs.botleft, left.x, pos.y, imgs.botleft.width, img.y + img.height - pos.y).sort((a, b) => a.y - b.y)[0];
		if (!bot) { return null; }
		let buf = img.toData(left.x, pos.y, 250, 20);
		let title = OCR.readSmallCapsBackwards(buf, capsfont, [[255, 203, 5]], 0, 13, buf.width, 1);
		return {
			rect: new Rect(left.x + 4, pos.y + 24, (pos.x + 21) - (left.x + 4), (bot.y + 8) - (pos.y + 24)),
			legacy: false,
			title: title ? title.text.toLowerCase() : "",
			img: img
		}
	}

	export function detectLegacy(img: ImgRef, pos: PointLike): ModalUI | null {
		let left = img.findSubimage(imgs.topleft_leg, img.x, pos.y - 9, pos.x, imgs.topleft_leg.height).sort((a, b) => a.x - b.x)[0];
		if (!left) { return null; }
		let bot = img.findSubimage(imgs.botleft_leg, left.x - 2, pos.y, imgs.botleft_leg.width, img.y + img.height - pos.y).sort((a, b) => a.y - b.y)[0];
		if (!bot) { return null; }
		let buf = img.toData(Math.round(left.x + pos.x - 250) / 2, pos.y - 4, 250, 20);
		let title = OCR.readSmallCapsBackwards(buf, capsfont, [[255, 152, 31]], 0, 13, buf.width, 1);
		return {
			rect: new Rect(left.x + 4, pos.y + 20, (pos.x + 20) - (left.x + 4), (bot.y) - (pos.y + 20)),
			legacy: true,
			title: title ? title.text.toLowerCase() : "",
			img: img
		}
	}
}