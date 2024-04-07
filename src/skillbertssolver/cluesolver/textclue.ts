import {ImgRef} from "@alt1/base";
import * as OCR from "@alt1/ocr";
import * as oldlib from "./oldlib";
import {coldiff} from "../oldlib";
import {ModalUI} from "./modeluireader";
import {byType} from "data/clues";
import {Clues} from "../../lib/runescape/clues";
import ScanStep = Clues.ScanStep;

var cluefont = require("./fonts/cluefont.fontmeta.json.js");

export const sextant = {
	offsetx: 2440,
	offsetz: 3161,
	minutespertile: 1.875
}

export type ClueCache = {
	textclues: Clue[],
	coordsets: CoordsetPoint[]
}

export type SextandCoord = { latdeg: number, latmin: number, northsouth: "north" | "south", longdeg: number, longmin: number, eastwest: "east" | "west" };
export type CoordsetPoint = { x: number, z: number, level: number, clueid: number };
//expressed as tiles offset northeast from sextant origin (the observatory)
export type MapPoint = { x: number, z: number, mapid: number, level: number };
export type CoordMeta = { name: string, manualplace?: boolean };
type ClueBase = { subid?: string, subidtext?: string, clueid: number, type: string, clue: any, answer: string, x: number, z: number, level?: number, mapid?: number };
type ClueScan = ClueBase & { type: "scan", scantext: string, scan: number };
type CoordClue = ClueBase & { type: "coordinate", coord: SextandCoord };
type ClueCompass = ClueBase & { type: "compass" };
type ClueOther = ClueBase & { type: "action" | "annagram" | "emote" | "simple" | "img" | "anagram" | "cryptic" | "emptyimg" };
type Clue = ClueScan | CoordClue | ClueOther | ClueCompass;


export type ClueSolution = {
	cluetext: string,
	answer: string,
	mapid: number,
	points: MapPoint[],
	inner: Clue,
	alternatives?: {
		clueid: number,
		opts: ClueSolution[]
	}
};

export function sextantToCoord(comp: SextandCoord): MapPoint {
	return {
		x: sextant.offsetx + Math.round((60 * comp.longdeg + comp.longmin) * (comp.eastwest == "west" ? -1 : 1) / sextant.minutespertile),
		z: sextant.offsetz + Math.round((60 * comp.latdeg + comp.latmin) * (comp.northsouth == "south" ? -1 : 1) / sextant.minutespertile),
		mapid: 0,
		level: 0
	}
}

export class TextclueReader {
	pos: ModalUI | null = null;
	cache: ClueCache = { coordsets: [], textclues: [] };
	read(img?: ImgRef) {
		if (!this.pos) { throw new Error("clue not found"); }
		if (!img) { img = this.pos.img; }
		return solvetextclue(this.cache, img, this.pos.rect);
	}
}

export function solveScanClue(text: string): ScanStep {
	let str = text.split("\n")[0];

	let bestscore = 0;
	let best: ScanStep | null = null;

	for(let clue of byType("scan") as ScanStep[]){
		let score = oldlib.strcomparescore(str, clue.scantext);
		if (score > bestscore) {
			best = clue;
			bestscore = score;
		}
	}

	if (bestscore < 0.5 || !best) { return null; }

	return best;
}

export function solvetextclue(cache: ClueCache, imgref: ImgRef, pos: { x: number, y: number }) {
	var buf = imgref.toData(pos.x, pos.y, 496, 293);
	var str: string[] = [];
	var linestart = 0;
	for (var y = 60; y < 290; y++) {
		var linescore = 0;
		for (var x = 220; x < 320; x++) {
			var i = 4 * x + 4 * buf.width * y;
			var a = coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 84, 72, 56);
			if (a < 80) { linescore++; }
		}
		if (linescore >= 3) { if (linestart == 0) { linestart = y; } }
		else if (linestart != 0) {
			a = Math.abs(linestart - y);
			linestart = 0;
			if (a >= 6 && a <= 18) {
				var b = OCR.findReadLine(buf, cluefont, [[84, 72, 56]], 255, y - 4)
					|| OCR.findReadLine(buf, cluefont, [[84, 72, 56]], 265, y - 4);
				if (b) { str.push(b.text); }
			}
		}
	}
	var cluetext = str.join(" ");
	console.log(cluetext);

	var res: ClueSolution | null = null;
	if (str.length != 0) {
		res = checkcluetext(cache, cluetext);
		if (res) { return res; }
	}
	res = matchimgclue(cache, buf);
	if (res) { return res; }
	throw new Error("no clue matched");
}

function matchimgclue(cache: ClueCache, buf: ImageData): ClueSolution | null {
	var tiledata = oldlib.computeImageFingerprint(buf, 20, 20, 90, 25, 300, 240);

	var best: Clue | null = null;
	var bestscore = Infinity;
	for (var a in cache.textclues) {
		let clue = cache.textclues[a];
		if (clue.type != "img" && clue.type != "emptyimg") { continue; }
		var score = oldlib.comparetiledata(tiledata, cache.textclues[a].clue);
		console.log("score: " + oldlib.spacednr(score));
		if (score < bestscore) { bestscore = score; best = cache.textclues[a]; }
	}
	if (best) {
		//TODO remove indexof
		console.log("img matched " + best.clueid + ", score: " + oldlib.spacednr(bestscore));
		return { inner: best, cluetext: "Image clue", answer: best.answer, points: [{ x: best.x, z: best.z, level: best.level ?? 0, mapid: best.mapid ?? 0 }], mapid: best.mapid || 0 };
	}
	return null;
	//if (tiledata) { dlpage("/node/clue/logclue?cluetext=" + encodeURIComponent(jsonEncode(tiledata)) + "&score=" + bestscore); }
}

function checkcluetext(cache: ClueCache, str: string): ClueSolution | null {
	var coordmatch = str.match(/^(\d{1,2}) degrees (\d{1,2}) minutes (north|south)\s+(\d{1,2}) degrees (\d{1,2}) minutes (east|west)$/mi);
	if (!coordmatch) {
		coordmatch = str.match(/^(\d{1,2}) ?graus? (\d{1,2}) minutos? (norte|sul)\s+(\d{1,2}) graus? (\d{1,2}) minutos? (leste|oeste)$/mi);
	}
	if (!coordmatch) {
		coordmatch = str.match(/^(\d{1,2}) Grad (\d{1,2}) Minuten (Nord|Sud)\s+(\d{1,2}) Grad (\d{1,2}) Minuten (Ost|Westen)$/mi);
	}
	if (coordmatch) {
		var comp: SextandCoord = {
			northsouth: (["north", "norte", "Nord"].indexOf(coordmatch[3]) != -1 ? "north" : "south"),
			latdeg: +coordmatch[1],
			latmin: +coordmatch[2],
			eastwest: (["west", "oeste", "Westen"].indexOf(coordmatch[6]) != -1 ? "west" : "east"),
			longdeg: +coordmatch[4],
			longmin: +coordmatch[5]
		};
		let pos = sextantToCoord(comp);
		let text = `${comp.latmin}.${comp.latdeg} ${comp.northsouth == "north" ? "North" : "South"} ${comp.longmin}.${comp.longdeg} ${comp.eastwest == "west" ? "West" : "East"}`;
		return {
			cluetext: text,
			answer: "",
			mapid: 0,
			points: [pos],
			inner: { clueid: -1, type: "coordinate", answer: text, clue: str, coord: comp, x: 0, z: 0 }
		};
	}
	else {
		var bestscore = 0;
		var best: Clue | null = null;
		for (var a in cache.textclues) {
			if (cache.textclues[a].type == "img" || cache.textclues[a].type == "emptyimg") { continue; }
			var score = oldlib.strcomparescore(str, cache.textclues[a].clue);
			if (score > bestscore) {
				best = cache.textclues[a];
				bestscore = score;
			}
		}

		//need to know which ones we're missing
		//if (str) { dlpage("/node/clue/logclue?cluetext=" + encodeURIComponent(str) + "&score=" + bestscore); }

		if (bestscore < 0.5 || !best) { return null; }
		console.log("Text clue match score: " + bestscore);
		console.log("Text clue match: " + best.clue);
		if (best.type == "scan") {
			var b = best;
			return {
				cluetext: best.clue,
				answer: "Scan clue",
				mapid: best.mapid ?? 0,
				points: cache.coordsets.filter(c => c.clueid == b.scan).map(c => ({ x: c.x, z: c.z, mapid: best!.mapid ?? 0, level: c.level })),
				inner: best
			};
		}
		else {
			let alternatives: ClueSolution["alternatives"] = {
				clueid: best.clueid,
				opts: []
			}
			let allanswers = cache.textclues.filter(q => q.clueid == best!.clueid);
			let allsolutions = allanswers.map(ans => {
				var answer = "";
				if (ans.type == "emote") {
					if (ans.answer) { answer = ans.answer; }
				}
				else {
					answer = (ans.answer ? "<b>Answer:</b> " + ans.answer : "");
				}
				let r: ClueSolution = {
					cluetext: ans.clue,
					answer: answer,
					mapid: ans.mapid ?? 0,
					points: [{ x: ans.x, z: ans.z, level: ans.level ?? 0, mapid: ans.mapid ?? 0 }],
					inner: ans,
					alternatives
				};
				let subid = (ans as ClueOther).subid
				if (subid) { alternatives!.opts.push(r); }
				return r;
			});
			return allsolutions[0];
		}
	}
}
