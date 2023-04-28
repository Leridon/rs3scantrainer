import { ImageDetect, ImageData, ImgRef, Rect } from "@alt1/base";
import * as a1lib from "@alt1/base";
import CelticKnotReader from "./knotreader";
import { constrainedMap, arrayEnum } from "../util";
import { SlideReader } from "./slidereader";
import { ModalUIReader } from "./modeluireader";
import { TowersReader } from "./towersreader";
import { LockBoxReader } from "./lockbox";
import { TextclueReader } from "./textclue";
import { ScantextReader } from "./scantextreader";
import ClueRewardReader from "./rewardreader";
import { CompassReader } from "./compassclue";

var anchorimgs = ImageDetect.webpackImages({
	slide: require("./imgs/slide.data.png"),
	slidelegacy: require("./imgs/slidelegacy.data.png"),
	legacyx: require("./imgs/legacyx.data.png"),
	eocx: require("./imgs/eocx.data.png"),
	scanleveltext: require("./imgs/differentlevel.data.png"),
	scanfartext: require("./imgs/youaretoofaraway.data.png"),
	scanfartext_pt: require("./imgs/youaretoofaraway_pt.data.png"),
	compassnorth: require("./imgs/compassnorth.data.png")
});

type AnchorImgIds = keyof typeof anchorimgs;
export type Matchpos = { x: number, y: number, img: AnchorImgIds };

type AnchorLocations = typeof anchorlocs[number];
var anchorlocs = arrayEnum(["central", "central_large", "central_overlay", "minigame"]);

export type IntfBase = {
	type: "slide" | "knot" | "text" | "lockbox" | "towers" | "scan" | "compass" | "reward",
	anchor: AnchorLocations,
	img: keyof typeof anchorimgs.raw,
	buf: ImageData,
	imgpos: a1lib.PointLike,
	searchsize?: { w: number, h: number }
};

var intfbases = constrainedMap<IntfBase>()({
	slide: { type: "slide", img: "slide", anchor: "central", buf: null!, imgpos: { x: 484, y: 19 } },
	slide_leg: { type: "slide", img: "slidelegacy", anchor: "central", buf: null!, imgpos: { x: 484, y: 19 } },
	lockbox: { type: "lockbox", img: "eocx", anchor: "central", buf: null!, imgpos: { x: 368, y: 17 } },
	lockbox_leg: { type: "lockbox", img: "legacyx", anchor: "central", buf: null!, imgpos: { x: 369, y: 21 } },
	text: { type: "text", img: "eocx", anchor: "central", buf: null!, imgpos: { x: 483, y: 17 } },
	text_leg: { type: "text", img: "legacyx", anchor: "central", buf: null!, imgpos: { x: 484, y: 21 } },
	towers_leg: { type: "towers", img: "legacyx", anchor: "central_large", buf: null!, imgpos: { x: 507, y: 48 } },
	towers: { type: "towers", img: "eocx", anchor: "central_large", buf: null!, imgpos: { x: 627, y: 141 } },
	knot_leg: { type: "knot", img: "legacyx", anchor: "central_overlay", buf: null!, imgpos: { x: 484, y: 12 } },
	reward: { type: "reward", img: "eocx", anchor: "central", buf: null!, imgpos: { x: 368 + 60, y: 17 + 55 } },
	reward_leg: { type: "reward", img: "eocx", anchor: "central", buf: null!, imgpos: { x: 369 + 60, y: 21 + 55 } },
	knot: { type: "knot", img: "eocx", anchor: "central_overlay", buf: null!, imgpos: { x: 483, y: 8 } },
	scan: { type: "scan", img: "scanfartext", anchor: "minigame", buf: null!, imgpos: { x: 0, y: -5 + 12 * 4 }, searchsize: { w: 4, h: 100 } },
	scan_level: { type: "scan", img: "scanleveltext", anchor: "minigame", buf: null!, imgpos: { x: 0, y: -7 + 12 * 6 }, searchsize: { w: 4, h: 100 } },
	scan_pt: { type: "scan", img: "scanfartext_pt", anchor: "minigame", buf: null!, imgpos: { x: 0, y: -5 + 12 * 4 }, searchsize: { w: 4, h: 100 } },
	compass: { type: "compass", img: "compassnorth", anchor: "minigame", buf: null!, imgpos: { x: 56, y: 19 }, searchsize: { w: 4, h: 100 } }
});

var unionarea: { [key in AnchorLocations]: Rect | null } = {} as any;
anchorimgs.promise.then(r => {
	//run only once when all required images are loaded
	for (var a in intfbases) {
		if (!anchorimgs.raw[intfbases[a].img]) { throw new Error("not all infbases have a matching img"); }
	}

	for (let anchor of anchorlocs) {
		//get the union off all capture areas
		var area: Rect | null = null;
		for (var a in intfbases) {
			var intf = intfbases[a as keyof typeof intfbases];
			if (intf.anchor != anchor) { continue; }
			intf.buf = anchorimgs.raw[intf.img];
			var rect = new Rect(intf.imgpos.x, intf.imgpos.y, intf.buf.width + (intf.searchsize ? intf.searchsize.w : 0), intf.buf.height + (intf.searchsize ? intf.searchsize.h : 0));
			if (!area) {
				area = rect;
			} else {
				area.union(rect);
			}
		}
		if (area && area.width * area.height > 150 * 150) { console.log("Warning large combined search area in clue reader"); }
		unionarea[anchor] = area;
	}
});

const modalTextClue = [
	"mysterious clue scroll", "treasure map",
	"pergaminho de dicas mister", "mapa do tesouro",
	"..:se hinweis-schriftp", ""
];
const modalTowers = [
	"towers",
	"torres",
	", ( rme"//t"urme
];
const modalLockbox = [
	"lockbox",
	"gica",//Caixa M`agica,
	"schlie. .;fach"//schliessfach
];
const modalKnot = [
	"celtic knot",
	"..: celta",//N~o celta
	"keltischer knoten"
];
const modalComplete = [
	"trail complete!",
	"trilha terminada!"
];
export default class ClueScrollReader {
	anchorpositions: Partial<{ [key in AnchorLocations]: a1lib.PointLike }>;
	knotreader = new CelticKnotReader();
	rewardreader = new ClueRewardReader();
	slidereader = new SlideReader();
	towersreader = new TowersReader();
	lockboxreader = new LockBoxReader();
	textcluereader = new TextclueReader();
	scantextreader = new ScantextReader();
	compassreader = new CompassReader();

	constructor() {
		this.anchorpositions = {};
	}

	async find(img?: ImgRef, checkonly?: boolean) {
		var imgtype: Matchpos | null = null;
		if (a1lib.hasAlt1) { imgtype = await this.refind(); }
		if (!imgtype && checkonly) { return null; }
		if (!img && a1lib.hasAlt1) { img = a1lib.captureHoldFullRs(); }
		if (!img) { return null; }

		if (!imgtype) {
			for (var imgname in anchorimgs) {
				var matchimg = (anchorimgs as any)[imgname];
				var locs = img.findSubimage(matchimg);
				if (locs.length != 0) {
					imgtype = { img: imgname as AnchorImgIds, x: locs[0].x, y: locs[0].y };
				}
			}
		}
		if (!imgtype) { return null; }

		var intf: IntfBase | null = null;
		if (imgtype.img == "legacyx" || imgtype.img == "eocx") {
			let modal = (imgtype.img == "legacyx" ? ModalUIReader.detectLegacy(img, imgtype) : ModalUIReader.detectEoc(img, imgtype));
			if (modal) {
				if (modalTowers.indexOf(modal.title) != -1) {
					intf = (modal.legacy ? intfbases.towers_leg : intfbases.towers);
					this.towersreader.pos = modal;
				}
				if (modalLockbox.indexOf(modal.title) != -1) {
					intf = (modal.legacy ? intfbases.lockbox_leg : intfbases.lockbox);
					this.lockboxreader.pos = modal;
				}
				if (modalTextClue.indexOf(modal.title) != -1) {
					intf = (modal.legacy ? intfbases.text_leg : intfbases.text);
					this.textcluereader.pos = modal;
				}
				if (modalKnot.indexOf(modal.title) != -1) {
					intf = (modal.legacy ? intfbases.knot_leg : intfbases.knot);
					this.knotreader.pos = modal;
				}
				if (modalComplete.indexOf(modal.title) != -1) {
					intf = (modal.legacy ? intfbases.reward_leg : intfbases.reward);
					this.rewardreader.pos = modal;
				}
			}
		}
		if (imgtype.img == "slide" || imgtype.img == "slidelegacy") {
			intf = (imgtype.img == "slide" ? intfbases.slide : intfbases.slide_leg);
			this.slidereader.pos = { x: imgtype.x - intf.imgpos.x + 187, y: imgtype.y - intf.imgpos.y + 34 };
		}
		if (imgtype.img == "scanfartext" || imgtype.img == "scanleveltext" || imgtype.img == "scanfartext_pt") {
			intf = (imgtype.img == "scanleveltext" ? intfbases.scan_level : intfbases.scan);
			this.scantextreader.pos = { x: imgtype.x - intf.imgpos.x, y: imgtype.y - intf.imgpos.y };
		}
		if (imgtype.img == "compassnorth") {
			intf = intfbases.compass;
			this.compassreader.pos = { x: imgtype.x - 53, y: imgtype.y + 54 };
		}
		if (intf) {
			return this.found(imgtype, intf, img);
		}
	}

	private found(pos: Matchpos, intf: IntfBase, img: ImgRef) {
		let anchorpos = {
			x: pos.x - intf.imgpos.x - Math.round(intf.searchsize ? intf.searchsize.w / 2 : 0),
			y: pos.y - intf.imgpos.y - Math.round(intf.searchsize ? intf.searchsize.h / 2 : 0)
		};
		this.anchorpositions[intf.anchor] = anchorpos;
		let r = { intf: intf, matchedpos: pos, img: img };
		return r;
	}

	async refind() {
		let captareas: { [k in AnchorLocations]: a1lib.RectLike | null } = {} as any;
		for (let a in this.anchorpositions) {
			let anchor = a as AnchorLocations;
			let pos = this.anchorpositions[anchor]
			let area = unionarea[anchor];
			if (pos && area) {
				captareas[anchor] = { x: pos.x + area.x, y: pos.y + area.y, width: area.width, height: area.height };
			} else {
				captareas[anchor] = null;
			}
		}

		let capts = await a1lib.captureMultiAsync(captareas);
		for (let a in capts) {
			let anchor = a as AnchorLocations;
			let capt = capts[anchor];
			if (!capt) { continue; }
			let captarea = captareas[anchor]!;
			for (let intfid in intfbases) {
				let intf = intfbases[intfid] as IntfBase;
				let area = unionarea[anchor];
				if (intf.anchor != anchor || !area) { continue; }
				let x = intf.imgpos.x - area.x;
				let y = intf.imgpos.y - area.y;

				if (!intf.searchsize && ImageDetect.simpleCompare(capt, intf.buf, x, y) != Infinity) {
					let r: Matchpos = { img: intf.img, x: captarea.x + x, y: captarea.y + y };
					return r;
				}
				if (intf.searchsize) {
					let pos = ImageDetect.findSubbuffer(capt, intf.buf, x, y, intf.buf.width + intf.searchsize.w, intf.buf.height + intf.searchsize.h);
					if (pos.length != 0) {
						let r: Matchpos = { img: intf.img, x: captarea.x + pos[0].x, y: captarea.y + pos[0].y };
						return r;
					}
				}
			}
		}
		return null;
	}
}






