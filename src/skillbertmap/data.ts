import * as a1lib from "@alt1/base";
import * as PB from "@runeapps/common/promptbox";
import { checkaccess, dlpagejson, jsonTryDecode, newDragHandler, OldDom } from "../../../other/oldlib";
import * as leaflet from "leaflet";
import { MapMode, Marker3d } from "./map";
import { boundMethod } from "autobind-decorator";

export type Coordset = { id: number, n: string, type: "compass" | "scan", map: number, x: number, y: number, coords: unknown[], scandist?: number };

export type MapSettings = {
	jewelry: Record<string, string>,
	fairyrings: string[],
	toggles: Record<string, string>,
	enablePota: boolean,
	enableFairy: boolean,
	hideTeleports: boolean,
	mapmode: MapMode
};

export function loadSettings() {
	let settings: MapSettings = jsonTryDecode(localStorage.map_settings) || {};
	settings.jewelry = settings.jewelry || {};
	settings.fairyrings = settings.fairyrings || [];
	settings.toggles = settings.toggles || {};
	settings.hideTeleports = settings.hideTeleports || false;
	settings.mapmode = settings.mapmode || "3d";
	for (var a in teleporttoggles) {
		var value = settings.toggles[a];
		settings.toggles[a] = (Object.keys(teleporttoggles[a].opts).indexOf(value) != -1 ? value : teleporttoggles[a].default);
	}
	return settings;
}

export function saveSettings(settings: MapSettings) {
	localStorage.map_settings = JSON.stringify(settings);
}

export function showSettings(settings: MapSettings, elementWindow: HTMLElement, onchange: () => void) {
	var jewelry = {
		glory: "Amulet of Glory",
		cbbrace: "Combat bracelet",
		digpendant: "Dig Site pendant",
		enlightened: "Enlightened amulet",
		feroring: "Ferocious ring",
		games: "Games necklace",
		duel: "Ring of duelling",
		respawn: "Ring of respawn",
		slayer: "Ring of slaying",//TODO change slayer helm/ring shortcuts
		wealth: "Ring of wealth",//TODO deal with lotd having different teleports
		skneck: "Skills necklace",
		travellers: "Traveller's necklace"
	};

	var cols = {
		red: "Red",
		purple: "Purple",
		green: "Green",
		yellow: "Yellow"
	};
	var nslots = 6;

	var opts = {
		none: "No override",
	}

	for (var a in cols) {
		for (var b = 0; b < nslots; b++) {
			opts["pota-" + a + "-" + b] = cols[a] + " PotA slot " + (b + 1);
		}
	}

	var btns: PB.PBButton[] = [];
	for (a in jewelry) {
		btns.push({ t: "h", sizes: "11" }, { t: "text", text: jewelry[a] }, { t: "dropdown", id: "jewelry-" + a, options: opts, v: settings.jewelry[a] || "none" });
	}

	var fairybtns: PB.PBButton[] = [];
	for (var b = 0; b < 10; b += 2) {
		fairybtns.push(
			{ t: "h", sizes: "1313" },
			{ t: "text", text: (b + 1) + "" },
			{ t: "string", id: "fairy-" + b, v: settings.fairyrings[b] },
			{ t: "text", text: (b == 8 ? "0" : (b + 2) + "") },
			{ t: "string", id: "fairy-" + (b + 1), v: settings.fairyrings[b + 1] },
		)
	}

	var togglebtns: PB.PBButton[] = [];
	for (var c in teleporttoggles) {
		togglebtns.push(
			{ t: "h", sizes: "11" },
			{ t: "text", text: teleporttoggles[c].name },
			{ t: "dropdown", id: "toggle-" + c, options: teleporttoggles[c].opts, v: settings.toggles[c] }
		)
	}

	var box = PB.show({ title: "Map Settings", style: "popup", parent: elementWindow.ownerDocument.body }, [
		...togglebtns,
		{ t: "bool", id: "enablepota", v: settings.enablePota, text: "Passage of the Abyss" },
		{ t: "lockable", id: "potasub", locked: !settings.enablePota, children: btns },
		{ t: "bool", id: "enablefairy", v: settings.enableFairy, text: "Fairy ring favourites" },
		{ t: "lockable", id: "fairysub", locked: !settings.enableFairy, children: fairybtns },
		{ t: "h", sizes: "11" },
		{ t: "button", id: "confirm", text: "Confirm" },
		{ t: "button", id: "cancel", text: "Cancel" }
	]);

	box.enablepota.dom.onchange = function () {
		box.potasub.setLocked(!box.enablepota.getValue());
	}
	box.enablefairy.dom.onchange = function () {
		box.fairysub.setLocked(!box.enablefairy.getValue());
	}
	box.confirm.dom.onclick = function () {
		settings.enablePota = box.enablepota.getValue();
		settings.jewelry = {};
		for (var a in jewelry) {
			var val = box["jewelry-" + a].getValue();
			if (val != "none") { settings.jewelry[a] = val; }
		}
		settings.enableFairy = box.enablefairy.getValue();
		settings.fairyrings = [];
		for (let a = 0; a < 10; a++) {
			settings.fairyrings[a] = box["fairy-" + a].getValue().toUpperCase();
		}
		for (var a in teleporttoggles) {
			settings.toggles[a] = box["toggle-" + a].getValue();
		}
		saveSettings(settings);
		box.frame.close();
		onchange();
	}
	box.cancel.dom.onclick = function () {
		box.frame.close();
	}
}


class TeleportIcon extends leaflet.Icon {
	declare options: leaflet.IconOptions & { text?: string, title?: string };
	constructor(p: leaflet.IconOptions & { text?: string, title?: string }) {
		super(p);
	}
	createIcon() {
		let el = document.createElement("div");
		el.style.backgroundImage = `url("${this.options.iconUrl}")`;
		el.classList.add("marktele");
		if (this.options.text) { el.innerText = this.options.text; }
		if (this.options.title) { el.title = this.options.title; }
		return el;
	}
}

export function drawTeleports(settings: MapSettings) {
	let markers: leaflet.Marker[] = [];
	for (let tele of teleports) {
		if (tele.cond && !checkCondition(settings, tele.cond)) { continue; }
		if (typeof tele.x != "undefined" && typeof tele.z != "undefined" && typeof tele.img != "undefined") {
			var code = tele.code;
			var img = tele.img;
			if (settings.enablePota) {
				var potamatch = tele.sub && settings.jewelry[tele.sub]?.match(/^pota-(\w+)-(\d+)$/);
				if (potamatch) {
					code = (+potamatch[2] + 1) + "," + code;
					img = "pota-" + potamatch[1] + ".png";
				}
			}
			if (settings.enableFairy) {
				if (tele.sub == "fairy") {
					var index = settings.fairyrings.indexOf(code + "");
					if (index != -1) {
						code = (index == 9 ? "0" : (index + 1) + "");
					}
				}
			}
			let icon = new TeleportIcon({ iconUrl: "../map/teleports/" + img, text: code, title: tele.hover });
			markers.push(new Marker3d({ x: tele.x, z: tele.z, mapid: 0, level: tele.level ?? 0 }, { icon, interactive: false, zIndexOffset: 60 }));
			// var el = eldiv("marktele", {
			// 	style: "background-image:url('teleports/" + img + "');",
			// 	"data-minzoom": "0.5",
			// 	"data-pos": (tele.mapid || 0) + ";" + tele.x + ";" + tele.y,
			// 	title: tele.hover || ""
			// }, [code]);
		}
	}
	return new leaflet.LayerGroup(markers);
}

export function checkCondition(settings: MapSettings, cond: string) {
	var chunks = cond.split("=");
	var opts = chunks[1].split(/\|/g);
	return opts.indexOf(settings.toggles[chunks[0]]) != -1;
}

export const maps = {
	0: { id: 0, t: "World map", src: "map_50_jul_2020.png", centerx: 1165, centery: 2859, w: 4868, h: 4124, tilehor: 2, tilever: 2, backcolor: "#87909D" },
	//0: { id: 0, t: "World map", src: "map.png", centerx: 784, centery: 1999, w: 3712, h: 3327, tilehor: 2, tilever: 2, backcolor: "#87909D" },
	1: { id: 1, t: "Brimhaven dungeon", src: "brim.png", centerx: 387, centery: 148, w: 552, h: 771, tilehor: 4, tilever: 4, backcolor: "#000" },
	2: { id: 2, t: "Chaos tunnels", src: "chaos.png", centerx: 489, centery: 319, w: 784, h: 556, tilehor: 4, tilever: 4, backcolor: "#000" },
	3: { id: 3, t: "Dorgesh-Kaan", src: "dkaan.png", centerx: 270, centery: 90, w: 622, h: 634, tilehor: 4, tilever: 4, backcolor: "#000" },
	4: { id: 4, t: "Fremennik Slayer Dungeon", src: "fremdg.png", centerx: 476, centery: 168, w: 493, h: 371, tilehor: 4, tilever: 4, backcolor: "#000" },
	5: { id: 5, t: "Keldagrim", src: "keldagrim.png", centerx: 99, centery: 607, w: 537, h: 653, tilehor: 4, tilever: 4, backcolor: "#000" },
	6: { id: 6, t: "Lumbridge Swamp Caves", src: "lumdg.png", centerx: 360, centery: 9, w: 520, h: 316, tilehor: 4, tilever: 4, backcolor: "#000" },
	7: { id: 7, t: "Taverley Dungeon", src: "tavdg.png", centerx: 358, centery: 256, w: 730, h: 776, tilehor: 4, tilever: 4, backcolor: "#000" },//3.9, 3.95 //445,6635?
	//8: { id: 8, t: "White Wolf Mountain", src: "wolf.png", centerx: 244, centery: 294, w: 723, h: 559, tilehor: 4, tilever: 4, backcolor: "#000" },
	8: { id: 8, t: "White Wolf Mountain", src: "wolf.png", centerx: 244, centery: 320, w: 723, h: 559, tilehor: 4, tilever: 4, backcolor: "#000" },
	9: { id: 9, t: "Zanaris", src: "zanaris.png", centerx: 250, centery: 240, w: 529, h: 478, tilehor: 4, tilever: 4, backcolor: "#000" },
	10: { id: 10, t: "The Heart", src: "heart.png", centerx: 518, centery: 625, w: 1097, h: 965, tilehor: 4, tilever: 4, backcolor: "#87909D", mapoffsetx: 757, mapoffsety: -3783 },
	11: { id: 11, t: "the Arc", src: "arc.png", centerx: 112, centery: 904, w: 1899, h: 1986, tilehor: 2, tilever: 2, backcolor: "#87909D", mapoffsetx: -682, mapoffsety: -8439 },
};
export const coordsets: Record<number, Coordset> = {
	0: { id: 0, n: "Compass clue", type: "compass", map: 0, x: 930, y: -357, coords: [] },
	//1:{id:1,n:"(Hard) Coordinate clue",type:"coord",map:"main",x:930,y:-357,coords:[]},
	2: { id: 2, n: "Falador", type: "scan", map: 0, x: 552, y: -195, coords: [], scandist: 22 },
	3: { id: 3, n: "Varrock", type: "scan", map: 0, x: 768, y: -282, coords: [], scandist: 16 },
	4: { id: 4, n: "Ardougne", type: "scan", map: 0, x: 135, y: -141, coords: [], scandist: 22 },
	5: { id: 5, n: "Neitiznot & Jatizso", type: "scan", map: 0, x: -76, y: -688, coords: [], scandist: 16 },
	6: { id: 6, n: "Haunted Woods", type: "scan", map: 0, x: 1138, y: -326, coords: [], scandist: 11 },
	7: { id: 7, n: "Kharazi Jungle", type: "scan", map: 0, x: 429, y: 245, coords: [], scandist: 14 },
	8: { id: 8, n: "North of Nardah", type: "scan", map: 0, x: 989, y: 94, coords: [], scandist: 27 },
	9: { id: 9, n: "Mos Le'Harmless", type: "scan", map: 0, x: 1308, y: 160, coords: [], scandist: 27 },
	10: { id: 10, n: "Piscatoris Hunter Area", type: "scan", map: 0, x: -105, y: -422, coords: [], scandist: 14 },
	11: { id: 11, n: "Isafdar and Lletya", type: "scan", map: 0, x: -201, y: -28, coords: [], scandist: 22 },

	12: { id: 12, n: "Brimhaven dungeon", type: "scan", map: 1, x: -30, y: 49, coords: [], scandist: 14 },
	13: { id: 13, n: "Chaos tunnels", type: "scan", map: 2, x: -26, y: -11, coords: [], scandist: 22 },
	14: { id: 14, n: "Dorgesh-Kaan", type: "scan", map: 3, x: 10, y: 60, coords: [], scandist: 16 },
	15: { id: 15, n: "Fremennik Slayer Dungeon", type: "scan", map: 4, x: -58, y: -4, coords: [], scandist: 16 },
	16: { id: 16, n: "Keldagrim", type: "scan", map: 5, x: 41, y: -73, coords: [], scandist: 11 },
	17: { id: 17, n: "Lumbridge Swamp Caves", type: "scan", map: 6, x: -22, y: 35, coords: [], scandist: 11 },
	18: { id: 18, n: "Taverley Dungeon", type: "scan", map: 7, x: 7, y: 12, coords: [], scandist: 22 },
	//19: { id: 19, n: "White Wolf Mountain", type: "scan", map: 8, x: 27, y: -16, coords: [], scandist: 38 },
	20: { id: 20, n: "Zanaris", type: "scan", map: 9, x: 1, y: -9, coords: [], scandist: 16 },

	21: { id: 21, n: "Wilderness Volcano", type: "scan", map: 0, x: 695, y: -550, coords: [], scandist: 11 },
	22: { id: 22, n: "Deep Wilderness", type: "scan", map: 0, x: 701, y: -771, coords: [], scandist: 25 },

	23: { id: 23, n: "Menaphos", type: "scan", map: 0, x: 784, y: 429, coords: [], scandist: 30 },
	24: { id: 24, n: "Prifddinas", type: "scan", map: 0, x: -230, y: -200, coords: [], scandist: 30 },
	25: { id: 25, n: "Darkmeyer", type: "scan", map: 0, x: 1196, y: -209, coords: [], scandist: 16 },
	26: { id: 26, n: "Turtle Islands", type: "scan", map: 11, x: 481, y: 126, coords: [], scandist: 27 },
	27: { id: 27, n: "Heart of Gielinor", type: "scan", map: 10, x: 2, y: -29, coords: [], scandist: 49 },

	50: { id: 50, n: "Compass clue (The Arc)", type: "compass", map: 11, x: 950, y: 1000, coords: [] },
};

export var teleporttoggles = {
	varrock: { opts: { "default": "Varrock center", "ge": "Grand Exchange", "church": "Varrock Church" }, default: "default", name: "Varrock teleport" },
	yanille: { opts: { "default": "Watchtower", "yanille": "Yanille center" }, default: "yanille", name: "Watchtower teleport" },
	camelot: { opts: { "default": "Camelot", "seers": "Seers' Village" }, default: "default", name: "Camelot teleport" },

	sent: { opts: { "none": "Hide", "meta": "Useful only", "all": "All" }, default: "none", name: "Natures Sentinel outfit" },
	arch: { opts: { "none": "Hide", "meta": "Useful only", "all": "All" }, default: "none", name: "Master Archaeologists outfit" },
};

export type Teleport = {
	r?: RegExp
	group?: string,
	x?: number,
	z?: number,
	sub?: string,
	n?: string,
	img?: string,
	hover?: string,
	code?: string,
	cond?: string,
	mapid?: number,
	level?: number
}



export const teleports: Teleport[] = [
	//lodestones
	{ group: "home", r: /^(Lodestone network|Cast Home Teleport)$/i },
	{ sub: "home", r: /^(Quick Teleport Al Kharid|(Cast )?Al Kharid lodestone)$/i, n: "Al Kharid Lode", x: 3297, z: 3184, img: "homeport.png", hover: "A" },
	{ sub: "home", r: /(Quick Teleport Ardougne|(Cast )?Ardougne lodestone)/i, n: "Ardougne Lode", x: 2634, z: 3348, img: "homeport.png", hover: "Alt+A" },
	{ sub: "home", r: /(Quick Teleport Ashdale|(Cast )?Ashdale lodestone)/i, n: "Ashdale Lode", x: 2474, z: 2708, level: 2, img: "homeport.png", hover: "Shift+A" },
	{ sub: "home", r: /(Quick Teleport Bandit Camp|(Cast )?Bandit Camp lodestone)/i, n: "Bandit Camp Lode", x: 3214, z: 2954, img: "homeport.png", hover: "Alt+B" },
	{ sub: "home", r: /(Quick Teleport Burthorpe|(Cast )?Burthorpe lodestone)/i, n: "Burthorpe Lode", x: 2899, z: 3544, img: "homeport.png", hover: "B" },
	{ sub: "home", r: /(Quick Teleport Canifis|(Cast )?Canifis lodestone)/i, n: "Canifis Lode", x: 3517, z: 3515, img: "homeport.png", hover: "Alt+C" },
	{ sub: "home", r: /(Quick Teleport Catherby|(Cast )?Catherby lodestone)/i, n: "Catherby Lode", x: 2811, z: 3449, img: "homeport.png", hover: "C" },
	{ sub: "home", r: /(Quick Teleport Draynor|(Cast )?Draynor lodestone)/i, n: "Draynor Lode", x: 3105, z: 3298, img: "homeport.png", hover: "D" },
	{ sub: "home", r: /(Quick Teleport Eagles'? Peak|(Cast )?Eagles'? Peak lodestone)/i, n: "Eagles' Peak Lode", x: 2366, z: 3479, img: "homeport.png", hover: "Alt+E" },
	{ sub: "home", r: /(Quick Teleport Edgeville|(Cast )?Edgeville lodestone)/i, n: "Edgeville Lode", x: 3067, z: 3505, img: "homeport.png", hover: "E" },
	{ sub: "home", r: /(Quick Teleport Falador|(Cast )?Falador lodestone)/i, n: "Falador Lode", x: 2967, z: 3403, img: "homeport.png", hover: "F" },
	{ sub: "home", r: /(Quick Teleport Fremennik Province|(Cast )?Fremennik Province lodestone)/i, n: "Fremennik Province Lode", x: 2712, z: 3677, img: "homeport.png", hover: "Alt+F" },
	{ sub: "home", r: /(Quick Teleport Karamja|(Cast )?Karamja lodestone)/i, n: "Karamja Lode", x: 2761, z: 3147, img: "homeport.png", hover: "K" },
	{ sub: "home", r: /(Quick Teleport Lumbridge|(Cast )?Lumbridge lodestone)/i, n: "Lumbridge Lode", x: 3233, z: 3221, img: "homeport.png", hover: "L" },
	{ sub: "home", r: /(Quick Teleport Lunar Isle|(Cast )?Lunar Isle lodestone)/i, n: "Lunar Isle Lode", x: 2085, z: 3914, img: "homeport.png", hover: "Alt+L" },
	{ sub: "home", r: /(Quick Teleport Oo'? ?glog|(Cast )?Oo'? ?glog lodestone)/i, n: "Oo'glog Lode", x: 2532, z: 2871, img: "homeport.png", hover: "O" },
	{ sub: "home", r: /(Quick Teleport Port Sarim|(Cast )?Port Sarim lodestone)/i, n: "Port Sarim Lode", x: 3011, z: 3215, img: "homeport.png", hover: "P" },
	{ sub: "home", r: /(Quick Teleport Prifddinas|(Cast )?Prifddinas lodestone)/i, n: "Prifddinas Lode", x: 2208, z: 3360, level: 1, img: "homeport.png", hover: "Alt+P" },
	{ sub: "home", r: /(Quick Teleport Seers'? Village|(Cast )?Seers'? Village lodestone)/i, n: "Seers' Village Lode", x: 2689, z: 3482, img: "homeport.png", hover: "S" },
	{ sub: "home", r: /(Quick Teleport Taverley|(Cast )?Taverley lodestone)/i, n: "Taverley Lode", x: 2878, z: 3442, img: "homeport.png", hover: "T" },
	{ sub: "home", r: /(Quick Teleport Tirannwn|(Cast )?Tirannwn lodestone)/i, n: "Tirannwn Lode", x: 2254, z: 3149, img: "homeport.png", hover: "Alt+T" },
	{ sub: "home", r: /(Quick Teleport Varrock|(Cast )?Varrock lodestone)/i, n: "Varrock Lode", x: 3214, z: 3376, img: "homeport.png", hover: "V" },
	{ sub: "home", r: /(Quick Teleport Wilderness Volcano|(Cast )?Wilderness Volcano lodestone)/i, n: "Wilderness Volcano Lode", x: 3144, z: 3636, img: "homeport.png", hover: "W" },
	{ sub: "home", r: /(Quick Teleport Yanille|(Cast )?Yanille lodestone)/i, n: "Yanille Lode", x: 2529, z: 3094, img: "homeport.png", hover: "Y" },
	{ sub: "home", r: /(Quick Teleport Menaphos|(Cast )?Menaphos lodestone)/i, n: "Menaphos Lode", x: 3216, z: 2716, img: "homeport.png", hover: "M" },
	{ sub: "home", r: /(Quick Teleport Fort Forinthry|(Cast )?Fort Forinthry lodestone)/i, n: "Fort Forinthry Lode", x: 3298, z: 3526, img: "homeport.png", hover: "M" },

	//teletabs/normal teleports
	{ r: /^(Break|Cast) Lumbridge Teleport$/i, n: "Lumbridge", x: 3220, z: 3245, img: "tele-lum.png" },
	{ r: /^(Break|Cast) Falador Teleport$/i, n: "Falador", x: 2966, z: 3381, img: "tele-fal.png" },
	{ r: /^(Break|Cast) Camelot Teleport$/i, n: "Camelot", x: 2758, z: 3477, img: "tele-cam.png", cond: "camelot=default" },
	{ r: /^(Break|Cast) Camelot Teleport$/i, n: "Camelot - Seers'", x: 2707, z: 3483, img: "tele-cam.png", cond: "camelot=seers" },
	{ r: /^(Break|Cast) Ardougne Teleport$/i, n: "Ardougne", x: 2661, z: 3302, img: "tele-ard.png" },
	{ r: /^(Break|Cast) Varrock Teleport$/i, n: "Varrock", x: 3212, z: 3433, img: "tele-var.png", cond: "varrock=default" },
	{ r: /^(Break|Cast) Varrock Teleport$/i, n: "Varrock - GE", x: 3165, z: 3464, img: "tele-var.png", cond: "varrock=ge" },
	{ r: /^(Break|Cast) Varrock Teleport$/i, n: "Varrock - Church", x: 3246, z: 3479, img: "tele-var.png", cond: "varrock=church" },
	{ r: /^(Break|Cast) South Feldip Hills Teleport$/i, n: "South Feldip Hills", x: 2414, z: 2847, img: "tele-mob.png" },
	{ r: /^(Break|Cast) Taverley Teleport$/i, n: "Taverley", x: 2910, z: 3421, img: "tele-taverley.png" },
	{ r: /^(Break|Cast) Watchtower Teleport$/i, n: "Watchtower", x: 2548, z: 3115, img: "tele-watch.png", cond: "yanille=default" },
	{ r: /^(Break|Cast) Watchtower Teleport$/i, n: "Yanille", x: 2574, z: 3090, img: "tele-watch.png", cond: "yanille=yanille" },
	{ r: /^(Break|Cast) God Wars Teleport$/i, n: "God Wars", x: 2908, z: 3724, img: "tele-god.png" },
	{ r: /^(Break|Cast) Trollheim Teleport$/i, n: "Trollheim", x: 2881, z: 3669, img: "tele-troll.png" },
	{ r: /^(Break|Cast) Ape Atoll Teleport$/i, n: "Ape Atoll", x: 2798, z: 2791, img: "tele-ape.png" },

	//ancient teleports
	{ r: /^(Break|Cast) Senntisten Teleport$/i, n: "Senntisten (Dig site)", x: 3379, z: 3402, img: "tele-senntisten.png" },
	{ r: /^(Break|Cast) Kharyrll Teleport$/i, n: "Kharyrll (Canifis)", x: 3499, z: 3488, img: "tele-kharyrll.png" },
	{ r: /^(Break|Cast) Lassar Teleport$/i, n: "Lassar (Ice mountain)", x: 3008, z: 3475, img: "tele-lassar.png" },
	{ r: /^(Break|Cast) Dareeyak Teleport$/i, n: "Dareeyak (Wildy - West)", x: 2969, z: 3699, img: "tele-dareeyak.png" },
	{ r: /^(Break|Cast) Carrallanger Teleport$/i, n: "Carrallanger (Wildy - Cementry)", x: 3223, z: 3665, img: "tele-carrallaner.png" },
	{ r: /^(Break|Cast) Annakarl Teleport$/i, n: "Annakarl (Wildy - North East)", x: 3288, z: 3888, img: "tele-annakarl.png" },
	{ r: /^(Break|Cast) Ghorrock Teleport$/i, n: "Ghorrock (Wildy - North West)", x: 2979, z: 3877, img: "tele-ghorrock.png" },

	//lunar teleports //TODO add group teles
	{ r: /^Cast Moonclan Teleport$/i, n: "Moonclan", x: 2111, z: 3917, img: "tele-moonclan.png" }, //
	{ r: /^Cast Ourania Teleport$/i, n: "ZMI Altar", x: 2468, z: 3248, img: "tele-ourania.png" },
	{ r: /^Cast South Falador Teleport$/i, n: "South Falador", x: 3057, z: 3311, img: "tele-southfalador.png" },
	{ r: /^Cast Waterbirth Teleport$/i, n: "Waterbirth", x: 2548, z: 3758, img: "tele-waterbird.png" }, //
	{ r: /^Cast Barbarian Teleport$/i, n: "Barbarian Outpost", x: 2542, z: 3570, img: "tele-barbarian.png" }, //
	{ r: /^Cast North Ardougne Teleport$/i, n: "North Ardougne", x: 2670, z: 3375, img: "tele-northardougne.png" },
	{ r: /^Cast Khazard Teleport$/i, n: "Port Khazard", x: 2634, z: 3167, img: "tele-khazard.png" }, //
	{ r: /^Cast Fishing Guild Teleport$/i, n: "Fishing Guild", x: 2614, z: 3383, img: "tele-fishing.png" }, //
	{ r: /^Cast Catherby Teleport$/i, n: "Catherby", x: 2803, z: 3450, img: "tele-catherby.png" }, //
	{ r: /^Cast Ice Plateau Teleport$/i, n: "Wildy - Ice Plateau", x: 2975, z: 3941, img: "tele-iceplateau.png" }, //
	{ r: /^Cast Trollheim Teleport$/i, n: "Trollheim", x: 2818, z: 3676, img: "tele-trollheim.png" }, //

	//modified house tabs
	{ r: /^Break Rimmington tablet$/i, n: "Rimmington house", x: 2953, z: 3223, img: "modhouse.gif", code: "1" },
	{ r: /^Break Taverley tablet$/i, n: "Taverley house", x: 2883, z: 3452, img: "modhouse.gif", code: "2" },
	{ r: /^Break Pollnivneach tablet$/i, n: "Pollnivneach house", x: 3339, z: 3001, img: "modhouse.gif", code: "3" },
	{ r: /^Break Rellekka tablet$/i, n: "Rellekka house", x: 2670, z: 3632, img: "modhouse.gif", code: "4" },
	{ r: /^Break Brimhaven tablet$/i, n: "Brimhaven house", x: 2757, z: 3178, img: "modhouse.gif", code: "5" },
	{ r: /^Break Yanille tablet$/i, n: "Yanille house", x: 2544, z: 3095, img: "modhouse.gif", code: "6" },
	{ r: /^Break Trollheim tablet$/i, n: "Trollheim house tablet", x: 2890, z: 3675, img: "modhouse.gif", code: "7" },
	{ r: /^Break Prifddinas tablet$/i, n: "Prifddinas house tablet", x: 2166, z: 3335, level: 1, img: "modhouse.gif", code: "8" },
	//otot 9
	{ r: /^Break Menaphos tablet$/i, n: "Menaphos house tablet", x: 3123, z: 2632, img: "modhouse.gif", code: "0,1" },

	//tt teleport scrolls
	{ group: "scroll", r: /^Teleport Globetrotter arm guards$/ },
	{ sub: "scroll", r: /^Read Grand Exchange Teleport$/i, n: "Grand Exchange scroll", x: 3160, z: 3458, code: "1", img: "id41801.gif" },//TODO img, ge api glitched right now
	{ sub: "scroll", r: /^Read Bandit Camp Teleport$/i, n: "Bandit Camp scroll", x: 3169, z: 2981, code: "2", img: "id19476.gif" },
	{ sub: "scroll", r: /^Read Clocktower Teleport$/i, n: "Clocktower scroll", x: 2593, z: 3253, code: "3", img: "id41803.gif" },//TODO img, ge api glitched right now
	{ sub: "scroll", r: /^Read Gu'? ?Tanoth Teleport$/i, n: "Gu'Tanoth scroll", x: 2523, z: 3062, code: "4", img: "id41802.gif" },//TODO img, ge api glitched right now
	{ sub: "scroll", r: /^Read Lighthouse Teleport$/i, n: "Lighthouse scroll", x: 2512, z: 3632, code: "5", img: "id41804.gif" },//TODO img, ge api glitched right now
	{ sub: "scroll", r: /^Read Fort Forintry Teleport$/i, n: "Forintry Teleport scroll", x: 3302, z: 3550, code: "6", img: "id19480.gif" },
	{ sub: "scroll", r: /^Read Miscellania Teleport$/i, n: "Miscellania scroll", x: 2514, z: 3862, code: "7", img: "id19477.gif" },
	{ sub: "scroll", r: /^Read Phoenix Lair Teleport$/i, n: "Phoenix Lair scroll", x: 2293, z: 3620, code: "8", img: "id19478.gif" },
	{ sub: "scroll", r: /^Read Pollnivneach Teleport$/i, n: "Pollnivneach scroll", x: 3360, z: 2966, code: "9", img: "id19475.gif" },
	{ sub: "scroll", r: /^Read Tai Bwo Wannai Teleport$/i, n: "Tai Bwo Wannai scroll", x: 2801, z: 3085, code: "0", img: "id19479.gif" },
	//menaphos tabs
	{ r: /^Break Imperial district teleport$/i, n: "Imperial district", x: 3177, z: 2730, code: "1", img: "id40260.gif" },
	{ r: /^Break Merchant district teleport$/i, n: "Merchant district", x: 3208, z: 2784, code: "2", img: "id40261.gif" },
	{ r: /^Break Port district teleport$/i, n: "Port district", x: 3187, z: 2654, code: "3", img: "id40262.gif" },
	{ r: /^Break Worker district teleport$/i, n: "Worker district", x: 3154, z: 2800, code: "4", img: "id40259.gif" },
	{ r: /^Break Sophanem Slayer Dungeon teleport$/i, n: "Sophanem Dungeon", x: 3291, z: 2710, code: "5", img: "id40263.gif" },
	//sixt-age
	{ group: "sixtage", r: /^Teleport Sixth-? ?Age circuit/i },
	//last swapped 03nov2018 10:00 Teleport Sixt-Age circuit world gate option 2
	{ sub: "sixtage", r: /^Guthix'? ?s shrine Sixth-? ?Age circuit/, n: "Guthix's Shrine", x: 2709, z: 3373, img: "id27477.gif", code: "1" },
	{ sub: "sixtage", r: /^World Gate Sixth-? ?Age circuit/, n: "World Gate", x: 2367, z: 3355, img: "id27477.gif", code: "2" },
	{ sub: "sixtage", r: /^(Guthix memorial Sixth-? ?Age circuit|Teleport Memory strand)/, n: "Guthix Memorial", x: 2265, z: 3554, img: "id39486.gif", code: "3" },

	{ group: "desertamy", r: /^Teleport Desert amulet/ },
	{ sub: "desertamy", r: /^Nardah teleport Desert amulet/i, n: "Nardah", x: 3434, z: 2914, img: "id27096.gif", code: "1" },
	{ sub: "desertamy", r: /^Uzer teleport Desert amulet/i, n: "Uzer", x: 3478, z: 3103, img: "id27096.gif", code: "2" },

	//crystal teleport seed
	{ group: "crystal", r: /^Activate (Attuned crystal|Crystal) teleport/i },
	{ sub: "crystal", r: /^Lletya (Attuned crystal|Crystal) teleport/i, n: "Lletya", x: 2335, z: 3171, img: "crystal.gif", code: "1" },
	{ sub: "crystal", n: "Amlodd", x: 2156, z: 3382, level: 1, img: "crystal.gif", code: "3" },
	{ sub: "crystal", n: "Cadarn", x: 2262, z: 3338, level: 1, img: "crystal.gif", code: "4" },
	{ sub: "crystal", n: "Cwrys", x: 2261, z: 3382, level: 1, img: "crystal.gif", code: "5" },
	{ sub: "crystal", n: "Hefin", x: 2187, z: 3410, level: 1, img: "crystal.gif", code: "6" },
	{ sub: "crystal", n: "Iowerth", x: 2186, z: 3310, level: 1, img: "crystal.gif", code: "7" },
	{ sub: "crystal", n: "Ithell", x: 2156, z: 3338, level: 1, img: "crystal.gif", code: "8" },
	{ sub: "crystal", n: "Meilyr", x: 2231, z: 3410, level: 1, img: "crystal.gif", code: "9" },
	{ sub: "crystal", n: "Trahaearn", x: 2232, z: 3310, level: 1, img: "crystal.gif", code: "0" },

	//other items
	{ r: /^Teleport to Daemonheim Ring of/i, n: "Daemonheim", x: 3449, z: 3701, img: "id15707.gif" },
	{ r: /^(Teleport (Witchdoctor mask|Juju teleport)|Herblore Habitat Master farmer hat)/i, n: "Herblore Habitat", x: 2950, z: 2933, img: "id20046.gif" },
	{ r: /^(Cast Kandarin monastery teleport|Kandarin Monastery Ardougne cloak)/i, n: "Kandarin Monastery", x: 2606, z: 3217, img: "monastery.png" },
	{ r: /^(Cast Manor farm teleport|Manor Farm (Master farmer hat|Ardougne cloak))/i, n: "Ardougne Farm", x: 2670, z: 3372, img: "pof.png" },
	{ r: /^Cast Max guild teleport/i, n: "Max guild", x: 2276, z: 3313, level: 1, img: "max.png" },
	{ r: /^Cast Skeletal horror Teleport/i, n: "Skeletal Horror", x: 3364, z: 3502, img: "skhorror.png" },
	{ r: /^Empty Ectophial/i, n: "Ectophial", x: 3660, z: 3521, img: "id4251.gif" },
	{ r: /^Cabbage(-? ?port Explorer'? ?s ring)?/i, n: "Cabbage field", x: 3053, z: 3290, img: "id19760.gif" },//"-" currently can't be detected by alt1
	{ r: /^Teleport Captain'? ?s Log/i, n: "Ports", x: 3036, z: 3253, img: "id26358.gif" },
	{ r: /^Teleport Clan vexillum$/i, n: "Clan portal", x: 2967, z: 3286, img: "id20709.gif" },
	{ r: /^Teleport Karamja gloves/i, n: "Karamja gloves", x: 2825, z: 2997, img: "id19754.gif" },
	{ r: /^Break The Heart teleport$/i, n: "The Heart", x: 3199, z: 6942, level: 1, img: "id36919.gif" },
	{ r: /^Rellekka teleport Fremennik sea boots/i, n: "Rellekka market", x: 2642, z: 3678, img: "id14573.gif", hover: "Fremennik sea boots" },
	{ r: /^Teleport Cape of Legends$/i, n: "Legends Guids", x: 2729, z: 3349, img: "legendcape.gif", hover: "Cape of Legends" },
	{ r: /^Teleport Archaeology journal$/i, n: "Archaeology journal", x: 3334, z: 3379, img: "archjournal.png" },
	{ r: /^Teleport Skull sceptre/, n: "Skull Sceptre", x: 3081, z: 3422, img: "skullsceptre.png" },
	{ r: /^Break Dragonkin Laboratory teleport/, n: "Dragonking Laboratory", x: 3368, z: 3887, img: "dragonkin.png" },

	//big book 'o piracy
	{ group: "piratebook", r: /Teleport Big Book o[' ] ?Piracy/ },
	{ sub: "piratebook", n: "Mos Le'Harmless", x: 3684, z: 2958, img: "id42379.gif", code: "1" },
	{ sub: "piratebook", n: "Braindeath Island", x: 2162, z: 5114, level: 1, img: "id42379.gif", code: "2" },
	{ sub: "piratebook", n: "Dragontooth Isle", x: 3793, z: 3559, img: "id42379.gif", code: "3" },
	{ sub: "piratebook", n: "Harmony Island", x: 3797, z: 2836, img: "id42379.gif", code: "3" },

	//digsite pendant
	{ group: "digpendant", r: /^Rub Digsite pendant/i },
	{ sub: "digpendant", r: /^Digsite Digsite pendant/i, n: "Digsite", x: 3358, z: 3396, img: "id11194.gif", code: "1" },
	{ sub: "digpendant", r: /^Senntisten Digsite pendant/i, n: "Senntisten (pendant)", x: 3375, z: 3445, img: "id11194.gif", code: "2" },
	{ sub: "digpendant", r: /^Exam Centre Digsite pendant/i, n: "Exame Centre", x: 3362, z: 3345, img: "id11194.gif", code: "3" },
	//ring of dueling
	{ group: "duel", r: /^Rub Ring of duelling/i },
	{ sub: "duel", r: /^Duel Arena Ring of duelling/i, n: "Duel arena", x: 3321, z: 3231, img: "duelling.gif", code: "1" },
	{ sub: "duel", r: /^Castle Wars Ring of duelling/i, n: "Castle wars", x: 2444, z: 3089, img: "duelling.gif", code: "2" },
	{ sub: "duel", r: /^South Feldip Hills Ring of duelling/i, n: "South Feldip Hills", x: 2414, z: 2843, img: "duelling.gif", code: "3" },
	//{ sub: "duel", r: /^Fist of Guthix Ring of duelling/i, n: "Fist of Guthix", x: 2997, z: 3411, img: "duelling.gif", code: "4" },
	//games neck
	{ group: "games", r: /^Rub Games necklace/i },
	{ sub: "games", n: "Troll invasion", x: 2878, z: 3564, img: "games.gif", code: "1" },
	{ sub: "games", n: "Barbarian Outpost", x: 2519, z: 3572, img: "games.gif", code: "2" },
	//{ sub: "games", n: "Gamer's grotto", x: 2992, z: 3412, img: "games.gif", code: "3" },
	{ sub: "games", n: "Agoroth", x: 2453, z: 2729, img: "games.gif", code: "4" },
	{ sub: "games", n: "Corpereal Beast", x: 3216, z: 3784, img: "games.gif", code: "5" },
	{ sub: "games", n: "Burgh De Rott", x: 3485, z: 3239, img: "games.gif", code: "6" },
	//wealth/lotd/hsr/fortune
	{ group: "wealth", r: /^Rub (Ring of fortune|Ring of wealth|Luck of the dwarves|Hazelmere'?s signet ring)/i },
	{ sub: "wealth", r: /^Miscellania (Ring of fortune|Ring of wealth|Luck of the dwarves|Hazelmere'?s signet ring)/i, n: "Miscellania", x: 2508, z: 3862, img: "id20659.gif", code: "1" },
	{ sub: "wealth", r: /^Grand Exchange (Ring of fortune|Ring of wealth|Luck of the dwarves|Hazelmere'?s signet ring)/i, n: "Grand Exchange", x: 3165, z: 3462, img: "id20659.gif", code: "2" },
	{ sub: "wealth", n: "Keldagrim", x: 2858, z: 10200, img: "lotd.png", code: "3" },
	//glory
	{ group: "glory", r: /^Rub Amulet of glory/i },
	{ sub: "glory", r: /^(Teleport )?Edgeville Amulet of glory/i, n: "Edgeville", x: 3088, z: 3497, img: "glory.gif", code: "1" },
	{ sub: "glory", r: /^(Teleport )?Karamja Amulet of glory/i, n: "Karamja", x: 2919, z: 3175, img: "glory.gif", code: "2" },
	{ sub: "glory", r: /^(Teleport )?Draynor (Village )?Amulet of glory/i, n: "Draynor", x: 3081, z: 3250, img: "glory.gif", code: "3" },
	{ sub: "glory", r: /^(Teleport )?Al Kharid Amulet of glory/i, n: "Al kharid", x: 3305, z: 3123, img: "glory.gif", code: "4" },
	//spirit trees
	{ group: "sptree", r: /^Teleport Spirit Tree$/i },
	{ sub: "sptree", n: "Tree Gnome Village", x: 2542, z: 3168, img: "sptree.png", code: "1" },
	{ sub: "sptree", n: "Tree Gnome Stronghold", x: 2462, z: 3444, img: "sptree.png", code: "2" },
	{ sub: "sptree", n: "Battlefield of Khazard", x: 2557, z: 3257, img: "sptree.png", code: "3" },
	{ sub: "sptree", n: "Grand Exchange", x: 3188, z: 3508, img: "sptree.png", code: "4" },
	{ sub: "sptree", n: "South Feldip Hills", x: 2416, z: 2849, img: "sptree.png", code: "5" },
	{ sub: "sptree", n: "Port Sarim", x: 3058, z: 3255, img: "sptree.png", code: "6" },
	{ sub: "sptree", n: "Etceteria", x: 2614, z: 3855, img: "sptree.png", code: "7" },
	{ sub: "sptree", n: "Brimhaven", x: 2800, z: 3203, img: "sptree.png", code: "8" },
	{ sub: "sptree", n: "Poison Waste", x: 2337, z: 3109, img: "sptree.png", code: "9" },
	{ sub: "sptree", n: "Prifddinas", x: 2272, z: 3371, level: 1, img: "sptree.png", code: "0" },
	//slayer ring
	{ group: "slayer", r: /^Rub Ring of slaying/i },
	{ group: "slayer", r: /^Teleport options.*[sS]layer/i },
	{ sub: "slayer", n: "Sumona", x: 3362, z: 2992, img: "slayring.gif", code: "1" },
	{ sub: "slayer", n: "Slayer Tower", x: 3423, z: 3524, img: "slayring.gif", code: "2" },
	{ sub: "slayer", n: "Fremennik Slayer Dungeon", x: 2789, z: 3627, img: "slayring.gif", code: "3" },
	//skills necklace
	{ group: "skneck", r: /^Rub Skills necklace/i },
	{ sub: "skneck", r: /^Fishing Guild Skills necklace/, n: "Fishing Guild", x: 2614, z: 3386, img: "skneck.gif", code: "1", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Mining Guild Skills necklace/, n: "Mining Guild", x: 3023, z: 3339, img: "skneck.gif", code: "2", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Crafting Guild Skills necklace/, n: "Crafting Guild", x: 2934, z: 3291, img: "skneck.gif", code: "3", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Cooking Guild Skills necklace/, n: "Cooking Guild", x: 3144, z: 3443, img: "skneck.gif", code: "4", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Invention Guild Skills necklace/, n: "Invention guild", x: 2998, z: 3440, img: "skneck.gif", code: "5", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Farming Guild Skills necklace/, n: "Farming Guild", x: 2645, z: 3354, img: "skneck.gif", code: "6", hover: "Skills necklace" },
	{ sub: "skneck", r: /^Runecrafting Guild Skills necklace/, n: "Runecrafting Guild", x: 3097, z: 3156, level: 3, img: "skneck.gif", code: "7", hover: "Skills necklace" },
	//combat bracelet
	{ group: "cbbrace", r: /^Rub Combat bracelet/i },
	{ sub: "cbbrace", r: /^Warriors'? Guild Combat bracelet/, n: "Warriors' Guild", x: 2879, z: 3543, img: "cbbrace.gif", code: "1", hover: "Combat bracelet" },
	{ sub: "cbbrace", r: /^Champions'? Guild Combat bracelet/, n: "Champions' Guild", x: 3192, z: 3366, img: "cbbrace.gif", code: "2", hover: "Combat bracelete" },
	{ sub: "cbbrace", r: /^Monastery Combat bracelet/, n: "Edgeville Monastery", x: 3052, z: 3490, img: "cbbrace.gif", code: "3", hover: "Combat bracelet" },
	{ sub: "cbbrace", r: /^Ranging Guild Combat bracelet/, n: "Ranging Guild", x: 2657, z: 3440, img: "cbbrace.gif", code: "4", hover: "Combat bracelet" },
	//traveller's necklace
	{ group: "travellers", r: /^Rub Traveller'? ?s necklace/i },
	{ sub: "travellers", r: /^Wizard'? ?s Tower Traveller'? ?s necklace/, n: "Wizard's Tower", x: 3103, z: 3182, img: "travellers.png", code: "1", hover: "Traveller's necklace" },
	{ sub: "travellers", r: /^The Outpost Traveller'? ?s necklace/, n: "The Outpost", x: 2444, z: 3346, img: "travellers.png", code: "2", hover: "Traveller's necklace" },
	{ sub: "travellers", r: /^S of Desert Eagle'? ?s Eyrie Traveller'/, n: "Desert Eagle's Eyrie", x: 3426, z: 3143, img: "travellers.png", code: "3", hover: "Traveller's necklace" },
	//traveller's necklace
	{ group: "enlightened", r: /^Rub Enlightened amulet/i },
	{ sub: "enlightened", r: /^Nexus Enlightened amulet/, n: "Nexus", x: 3216, z: 3182, img: "enlightened.png", code: "1", hover: "Enlightened amulet" },
	{ sub: "enlightened", r: /^S of Graveyard of Shadows Enlightened/, n: "Graveyard of Shadows", x: 3229, z: 3657, img: "enlightened.png", code: "2", hover: "Enlightened amulet" },
	{ sub: "enlightened", r: /^Desert bandit camp entrance Enlightened/, n: "Bandit camp", x: 3170, z: 2992, img: "enlightened.png", code: "3", hover: "Enlightened amulet" },
	//ring of respawn
	{ group: "respawn", r: /^Rub Ring of respawn/i },
	{ sub: "respawn", r: /^Lumbridge Ring of respawn/, n: "Lumbridge spawn", x: 3221, z: 3219, img: "respawn.png", code: "1", hover: "Ring of respawn" },
	{ sub: "respawn", r: /^Falador Ring of respawn/, n: "Falador spawn", x: 2970, z: 3339, img: "respawn.png", code: "2", hover: "Ring of respawn" },
	{ sub: "respawn", r: /^Camelot Ring of respawn/, n: "Camelot spawn", x: 2758, z: 3481, img: "respawn.png", code: "3", hover: "Ring of respawn" },
	{ sub: "respawn", r: /^Soul Wars Ring of respawn/, n: "Soul Wars spawn", x: 3082, z: 3475, img: "respawn.png", code: "4", hover: "Ring of respawn" },
	{ sub: "respawn", r: /^Burthorpe Ring of respawn/, n: "Burthorpe spawn", x: 2888, z: 3538, img: "respawn.png", code: "5", hover: "Ring of respawn" },
	//drakans medallion
	{ group: "drakmed", r: /^Teleport Drakan'? ?s medallion/i },
	{ sub: "drakmed", n: "Barrows", x: 3565, z: 3316, img: "drakmed.gif", code: "1" },
	{ sub: "drakmed", n: "Burgh de Rott", x: 3491, z: 3202, img: "drakmed.gif", code: "2" },
	{ sub: "drakmed", n: "Meiyerditch", x: 3639, z: 3250, img: "drakmed.gif", code: "3" },
	{ sub: "drakmed", n: "Darkmeyer", x: 3624, z: 3365, img: "drakmed.gif", code: "4" },
	{ sub: "drakmed", n: "Meiyerditch Laboratories", x: 3642, z: 3307, img: "drakmed.gif", code: "5" },
	//Pharaoh's sceptre
	{ group: "sceptre", r: /^Teleport (Pharaoh'? ?s sceptre|Sceptre of the gods)/i },
	{ sub: "sceptre", n: "Pyramid Plunder", x: 3289, z: 2802, img: "sceptre.gif", code: "1" },
	{ sub: "sceptre", n: "Agility Pyramid", x: 3344, z: 2832, img: "sceptre.gif", code: "2" },
	{ sub: "sceptre", n: "Ancient Pyramid", x: 3233, z: 2898, img: "sceptre.gif", code: "3" },
	{ sub: "sceptre", n: "Golden Palace", x: 3169, z: 2730, img: "sceptre.gif", code: "4" },
	//Wicked hood
	{ r: /^Teleport Wicked hood$/, x: 3106, z: 3157, level: 3, n: "Wizard's tower", img: "wicked.gif" },
	{ group: "wicked", r: /^Activate Wicked hood$/i },
	{ sub: "wicked", n: "Soul", x: 3087, z: 2697, img: "wicked.gif", hover: "Soul" },
	{ sub: "wicked", n: "Cosmic", x: 2408, z: 4379, img: "wicked.gif", hover: "Cosmic" },
	//blood
	{ sub: "wicked", n: "Air", x: 3127, z: 3403, img: "wicked.gif", hover: "Air" },
	{ sub: "wicked", n: "Body", x: 3053, z: 3443, img: "wicked.gif", hover: "Body" },
	{ sub: "wicked", n: "Mind", x: 2982, z: 3514, img: "wicked.gif", hover: "Mind" },
	{ sub: "wicked", n: "Fire", x: 3314, z: 3256, img: "wicked.gif", hover: "Fire" },
	{ sub: "wicked", n: "Earth", x: 3305, z: 3475, img: "wicked.gif", hover: "Earth" },
	{ sub: "wicked", n: "Water", x: 3165, z: 3185, img: "wicked.gif", hover: "Water" },
	//death
	{ sub: "wicked", n: "Nature", x: 2870, z: 3023, img: "wicked.gif", hover: "Nature" },
	{ sub: "wicked", n: "Astral", x: 2158, z: 3866, img: "wicked.gif", hover: "Astral" },
	{ sub: "wicked", n: "Chaos", x: 3059, z: 3593, img: "wicked.gif", hover: "Chaos" },
	{ sub: "wicked", n: "Law", x: 2857, z: 3382, img: "wicked.gif", hover: "Law" },
	//Quiver
	{ group: "quiver", r: /^Teleport Tirannwn quiver/i },
	{ sub: "quiver", n: "Lletya", x: 2348, z: 3172, img: "quiver.gif", code: "1" },
	//2 islwyn location is random
	{ sub: "quiver", n: "Tyras Camp", x: 2186, z: 3148, img: "quiver.gif", code: "3" },
	{ sub: "quiver", n: "Poison Waste", x: 2321, z: 3102, img: "quiver.gif", code: "4" },
	//5 death altar
	{ sub: "quiver", n: "Elf Camp", x: 2202, z: 3255, img: "quiver.gif", code: "6" },
	{ sub: "quiver", n: "Mushroom Patch", x: 2227, z: 3136, img: "quiver.gif", code: "7" },
	{ sub: "quiver", n: "Harmony Pillars", x: 2219, z: 3397, level: 1, img: "quiver.gif", code: "8" },
	//grace of the elves/max guild skilling portals
	//only showing these two as they are meta and way more useful than others
	{ n: "Overgrown idols", x: 2950, z: 2976, img: "gote.png", hover: "GotE Overgrow Idols" },
	{ n: "Deep sea fishing hub", x: 2594, z: 3412, img: "gote.png", hover: "GotE Deep Sea Fishing" },
	{ n: "Lava Flow Mine", x: 2940, z: 10198, img: "gote.png", hover: "GotE Lava Flow Mine" },

	//fairy rings
	{ sub: "fairy", x: 2996, z: 3114, img: "fairyring.gif", code: "AIQ" },
	{ sub: "fairy", x: 2700, z: 3247, img: "fairyring.gif", code: "AIR" },
	//ais guthix dream
	//ajq dorghes kaan agi dungeon
	{ sub: "fairy", x: 2780, z: 3613, img: "fairyring.gif", code: "AJR" },
	{ sub: "fairy", x: 2500, z: 3896, img: "fairyring.gif", code: "AJS" },
	{ sub: "fairy", x: 2319, z: 3619, img: "fairyring.gif", code: "AKQ" },
	{ sub: "fairy", x: 2571, z: 2956, img: "fairyring.gif", code: "AKS" },
	{ sub: "fairy", x: 2473, z: 3028, img: "fairyring.gif", code: "ALP" },
	{ sub: "fairy", x: 3597, z: 3495, img: "fairyring.gif", code: "ALQ" },
	//alr the abbyss
	{ sub: "fairy", x: 2644, z: 3495, img: "fairyring.gif", code: "ALS" },
	{ sub: "fairy", x: 3410, z: 3324, img: "fairyring.gif", code: "BIP" },
	{ sub: "fairy", x: 3251, z: 3095, img: "fairyring.gif", code: "BIQ" },
	//bir stuck in forrest zanaris
	{ sub: "fairy", x: 2635, z: 3266, img: "fairyring.gif", code: "BIS" },
	//bjq waterfiends kura dung
	//bjr fisher realm
	{ sub: "fairy", x: 1936, z: 3137, img: "fairyring.gif", code: "BJS" },
	{ sub: "fairy", x: 2385, z: 3035, img: "fairyring.gif", code: "BKP" },
	//bkq spirit realm
	{ sub: "fairy", x: 3469, z: 3431, img: "fairyring.gif", code: "BKR" },
	{ sub: "fairy", x: 4622, z: 5147, img: "fairyring.gif", code: "BLP" },
	//blq yubuisk
	{ sub: "fairy", x: 2740, z: 3351, img: "fairyring.gif", code: "BLR" },
	{ sub: "fairy", x: 2513, z: 3884, img: "fairyring.gif", code: "CIP" },
	{ sub: "fairy", x: 2528, z: 3127, img: "fairyring.gif", code: "CIQ" },
	{ sub: "fairy", x: 2705, z: 3576, img: "fairyring.gif", code: "CJR" },
	//cis evil bobs island
	{ sub: "fairy", x: 2901, z: 2930, img: "fairyring.gif", code: "CJS", hover: "You have to plant this fairy ring first (using 5 bittercap mushrooms)." },
	//ckp floating space lsd thingy
	{ sub: "fairy", x: 3086, z: 2704, img: "fairyring.gif", code: "CKQ" },
	{ sub: "fairy", x: 2801, z: 3003, img: "fairyring.gif", code: "CKR" },
	{ sub: "fairy", x: 3447, z: 3470, img: "fairyring.gif", code: "CKS" },
	{ sub: "fairy", x: 3082, z: 3206, img: "fairyring.gif", code: "CLP" },
	{ sub: "fairy", x: 2682, z: 3081, img: "fairyring.gif", code: "CLS" },
	{ sub: "fairy", x: 2735, z: 2742, img: "fairyring.gif", code: "CLR" },
	{ sub: "fairy", x: 3763, z: 2930, img: "fairyring.gif", code: "DIP" },
	//dir gorak plane
	{ sub: "fairy", x: 3092, z: 3137, img: "fairyring.gif", code: "DIS" },
	{ sub: "fairy", x: 2658, z: 3230, img: "fairyring.gif", code: "DJP" },
	{ sub: "fairy", x: 2676, z: 3587, img: "fairyring.gif", code: "DJR" },
	{ sub: "fairy", x: 2130, z: 3369, level: 1, img: "fairyring.gif", code: "DJS" },
	{ sub: "fairy", x: 2900, z: 3111, img: "fairyring.gif", code: "DKP" },
	//dkq glacors
	{ sub: "fairy", x: 3129, z: 3496, img: "fairyring.gif", code: "DKR" },
	{ sub: "fairy", x: 2744, z: 3719, img: "fairyring.gif", code: "DKS" },
	{ sub: "fairy", x: 3423, z: 3016, img: "fairyring.gif", code: "DLQ" },
	{ sub: "fairy", x: 2213, z: 3099, img: "fairyring.gif", code: "DLR" },
	{ sub: "fairy", x: 2412, z: 4434, img: "fairyring.gif" },
	//dls canifis cave

	//slayer cape
	{ x: 3050, z: 3953, img: "slayer.gif", hover: "Mandrith", code: "1" },
	//2 laniakea
	{ x: 2197, z: 3327, level: 1, img: "slayer.gif", hover: "Morvran", code: "3" },
	//4 kuradal
	{ x: 2870, z: 2982, level: 1, img: "slayer.gif", hover: "Lapalok", code: "5" },
	{ x: 3359, z: 2993, img: "slayer.gif", hover: "Sumona", code: "6" },
	{ x: 2447, z: 4431, img: "slayer.gif", hover: "Chealdar", code: "7" },
	{ x: 3510, z: 3507, img: "slayer.gif", hover: "Mazchna", code: "8" },
	{ x: 3094, z: 3481, img: "slayer.gif", hover: "Vannaka", code: "9" },
	{ x: 3221, z: 3223, img: "slayer.gif", hover: "Jacquelyn", code: "0,1" },
	{ x: 2887, z: 3544, img: "slayer.gif", hover: "Spria", code: "0,2" },

	//dg cape
	{ x: 3132, z: 9914, img: "dung.gif", hover: "Karamja volcano", code: "1" },
	{ x: 3035, z: 9772, img: "dung.gif", hover: "Dwarven mine", code: "2" },
	{ x: 3104, z: 9827, img: "dung.gif", hover: "Hill giants", code: "3" },
	{ x: 2844, z: 9558, img: "dung.gif", hover: "Karamja volcano", code: "4" },
	{ x: 3511, z: 3666, img: "dung.gif", hover: "Daemonheim wc", code: "5" },
	{ x: 2511, z: 3464, img: "dung.gif", hover: "Waterfall fire giants", code: "6" },
	{ x: 3019, z: 3339, img: "dung.gif", hover: "Mining guild", code: "7" },
	{ x: 2127, z: 5146, img: "dung.gif", hover: "Braindeath Island", code: "8" },
	{ x: 2854, z: 9841, img: "dung.gif", hover: "Taverley dungeon hellhounds", code: "9" },
	{ x: 2911, z: 9810, img: "dung.gif", hover: "Taverley dungeon blue dragons", code: "0,1" },
	{ x: 3165, z: 9880, img: "dung.gif", hover: "Varrock sewers", code: "0,2" },
	{ x: 3817, z: 3529, img: "dung.gif", hover: "Dragontooth island", code: "0,3" },
	//0,4 chaos tunnels
	{ x: 3297, z: 3310, img: "dung.gif", hover: "Al Kharid mine", code: "0,5" },
	{ x: 2695, z: 9440, img: "dung.gif", hover: "Brimhaven metal dragons", code: "0,6" },
	{ x: 4661, z: 5490, level: 3, img: "dung.gif", hover: "Polypore dungeon", code: "0,7" },
	{ x: 3033, z: 9599, img: "dung.gif", hover: "Frost dragons", code: "0,8" },
	{ x: 3399, z: 3665, img: "dung.gif", hover: "Daemonheim demons", code: "0,9" },
	{ x: 2237, z: 3424, level: 1, img: "dung.gif", hover: "Gorajo hoardstalker", code: "0,0,1" },
	{ x: 3434, z: 3535, img: "dung.gif", hover: "Slayer tower dungeon", code: "0,0,2" },
	{ x: 2237, z: 3397, level: 1, img: "dung.gif", hover: "Edimmu dungeon", code: "0,0,3" },

	//master quest cape
	{ group: "mqc", r: /^Activate Master quest cape/i },
	//1 tds cave
	//2 gower quest bts
	{ sub: "mqc", x: 3192, z: 3357, img: "masterquest.gif", n: "Champion's Guild", hover: "Champion's Guild", code: "3" },
	{ sub: "mqc", x: 3375, z: 3402, img: "masterquest.gif", n: "The empty throne room", hover: "The empty throne room", code: "4" },
	{ sub: "mqc", x: 2912, z: 3840, img: "masterquest.gif", n: "Glacor cavern", hover: "Glacor cavern", code: "5" },
	//6 heroes guild underground
	{ sub: "mqc", x: 2730, z: 3353, img: "masterquest.gif", n: "Legends' Guild", hover: "Legends' Guild", code: "7" },
	{ sub: "mqc", x: 3250, z: 9517, img: "masterquest.gif", n: "Tears of Guthix", hover: "Tears of Guthix", code: "8" },
	{ sub: "mqc", x: 3255, z: 3449, img: "masterquest.gif", n: "Varrock Museum", hover: "Varrock Museum", code: "9" },
	{ sub: "mqc", x: 2371, z: 3355, img: "masterquest.gif", n: "The World Gate", hover: "The World Gate", code: "0" },

	//arc sailing
	{ group: "arc", r: /^Travel Quartermaster Gully$/ },
	{ sub: "arc", r: /^Sail to Tuai Leit$/, x: 1762, z: 12009, n: "Tua Leit Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Whale'? ?s Maw$/, x: 2012, z: 11783, n: "Whale's Maw Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Waiko$/, x: 1810, z: 11652, n: "Waiko Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Turtles$/, x: 2242, z: 11423, n: "Turtle Islands Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Aminishi$/, x: 2063, z: 11271, n: "Aminishi Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Cyclosis$/, x: 2257, z: 11180, n: "Cyclosis Docks", img: "sail.png" },
	{ sub: "arc", r: /^Sail to Goshima$/, x: 2454, z: 11591, n: "Goshima Docks", img: "sail.png" },

	//arc teletabs
	{ group: "arctab", r: /^Teleport Arc journal$/ },
	{ sub: "arctab", r: /^Break Waiko teleport$/i, x: 1824, z: 11612, n: "Waiko", img: "id37903.gif", code: "2" },
	{ sub: "arctab", r: /^Break Whale'? ?s Maw teleport$/i, x: 2062, z: 11798, n: "Whale's Maw", img: "id38576.gif", code: "3" },
	{ sub: "arctab", r: /^Break Aminishi teleport$/i, x: 2088, z: 11274, n: "Aminishi", img: "id38575.gif", code: "4" },
	{ sub: "arctab", r: /^Break Cyclosis teleport$/i, x: 2318, z: 11225, n: "Cyclosis", img: "id38577.gif", code: "5" },
	{ sub: "arctab", r: /^Break Tuai Leit teleport$/i, x: 1800, z: 11960, n: "Tuai Leit", img: "id38578.gif", code: "6" },
	{ sub: "arctab", r: /^Break Islands That Once Were/i, x: 2278, z: 11504, n: "Turtle Islands", img: "id38579.gif", code: "7" },
	{ sub: "arctab", r: /^Break Goshima teleport$/i, x: 2459, z: 11547, n: "Goshima", img: "id38580.gif", code: "8" },

	//evil dave's spellbook
	{ group: "dave", r: /Teleport Dave'? ?s spellbook/ },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Watchtower teleport/i, x: 2444, z: 3182, n: "Observatory", img: "davebook.gif", code: "1", hover: "Chipped Watchtower tab (Dave's spellbook)" },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Camelot teleport/i, x: 2794, z: 3419, n: "Catherby", img: "davebook.gif", code: "2", hover: "Chipped Camelot tab (Dave's spellbook)" },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Falador teleport/i, x: 3006, z: 3321, n: "South Falador", img: "davebook.gif", code: "3", hover: "Chipped Falador tab (Dave's spellbook)" },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Ardougne teleport/i, x: 2538, z: 3308, n: "West Ardougne", img: "davebook.gif", code: "4", hover: "Chipped Ardougne tab (Dave's spellbook)" },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Lumbridge teleport/i, x: 3170, z: 3199, n: "Lumbridge Swamp", img: "davebook.gif", code: "5", hover: "Chipped Lumbridge tab (Dave's spellbook)" },
	{ sub: "dave", r: /^Break '? ?Chipped'? ? Varrock teleport/i, x: 3252, z: 3450, n: "Varrock Musuem", img: "davebook.gif", code: "6", hover: "Chipped Varrock tab (Dave's spellbook)" },

	//spheres
	{ x: 2719, z: 5350, n: "Dorgesh-kaan (north)", img: "id10972.gif", code: "1" },
	{ x: 2722, z: 5264, n: "Dorgesh-kaan (south)", img: "id10972.gif", code: "2" },
	{ x: 2735, z: 5307, level: 1, n: "Dorgesh-kaan (east)", img: "id10972.gif", code: "3" },
	{ x: 2701, z: 5303, level: 1, n: "Dorgesh-kaan (west)", img: "id10972.gif", code: "4" },


	//gliders
	{ group: "glider", r: /^Glider (Captain|Azalea|Gnormadium)/i },
	{ sub: "glider", x: 2466, z: 3496, n: "The Grand Tree", img: "glider.png", code: "1" },
	{ sub: "glider", x: 2851, z: 3497, n: "White Wolf Mountain", img: "glider.png", code: "2" },
	{ sub: "glider", x: 3321, z: 3432, n: "Digsite glider", img: "glider.png", code: "3" },
	{ sub: "glider", x: 3280, z: 3213, n: "Al Kharid glider", img: "glider.png", code: "4" },
	{ sub: "glider", x: 2971, z: 2970, n: "Karamja glider", img: "glider.png", code: "5" },
	{ sub: "glider", x: 2556, z: 2972, n: "Feldip Hills glider", img: "glider.png", code: "6" },
	{ sub: "glider", x: 2495, z: 3192, n: "Tree Gnome glider", img: "glider.png", code: "7" },
	{ sub: "glider", x: 2208, z: 3446, n: "Prifddinas", level: 1, img: "glider.png", code: "8" },
	{ sub: "glider", x: 1774, z: 11919, n: "Tua Leit", img: "glider.png", code: "9" },

	//balloons
	{ group: "balloon", r: /^Fly Basket/i },
	{ sub: "balloon", x: 2463, z: 3109, n: "Castle Wars", img: "balloon.png" },
	{ sub: "balloon", x: 2477, z: 3462, n: "Grand Tree", img: "balloon.png" },
	{ sub: "balloon", x: 2923, z: 3300, n: "Crafting Guild", img: "balloon.png" },
	{ sub: "balloon", x: 2931, z: 3414, n: "Taverley", img: "balloon.png" },
	{ sub: "balloon", x: 3298, z: 3483, n: "Varrock", img: "balloon.png" },
	{ sub: "balloon", x: 2809, z: 3356, n: "Entrana", img: "balloon.png" },

	//natures sentinel
	{ sub: "sent", x: 3138, z: 3431, img: "sentinel.png", code: "1,1", cond: "sent=all" },
	{ sub: "sent", x: 3290, z: 3476, img: "sentinel.png", code: "1,2", cond: "sent=all" },
	{ sub: "sent", x: 3165, z: 3414, img: "sentinel.png", code: "2,1", cond: "sent=all" },
	{ sub: "sent", x: 3278, z: 3474, img: "sentinel.png", code: "2,2", cond: "sent=all" },
	{ sub: "sent", x: 3090, z: 3232, img: "sentinel.png", code: "3,1", cond: "sent=all" },
	{ sub: "sent", x: 2783, z: 3430, img: "sentinel.png", code: "3,2", cond: "sent=all" },
	{ sub: "sent", x: 2520, z: 3579, img: "sentinel.png", code: "3,3", cond: "sent=all" },
	{ sub: "sent", x: 2728, z: 3501, img: "sentinel.png", code: "4,1", cond: "sent=all" },
	{ sub: "sent", x: 3500, z: 3625, img: "sentinel.png", code: "4,2", cond: "sent=all" },
	{ sub: "sent", x: 2708, z: 3462, img: "sentinel.png", code: "5,1", cond: "sent=all" },
	{ sub: "sent", x: 2755, z: 3431, img: "sentinel.png", code: "5,2", cond: "sent=all" },
	{ sub: "sent", x: 3087, z: 3476, img: "sentinel.png", code: "5,3", cond: "sent=all" },
	{ sub: "sent", x: 3208, z: 3502, img: "sentinel.png", code: "5,4", cond: "sent=all" },
	{ sub: "sent", x: 2261, z: 3388, img: "sentinel.png", code: "5,5", cond: "sent=all" },
	{ sub: "sent", x: 2693, z: 3428, img: "sentinel.png", code: "6,1", cond: "sent=all" },
	{ sub: "sent", x: 2702, z: 3397, img: "sentinel.png", code: "6,2", cond: "sent=all" },
	{ sub: "sent", x: 3357, z: 3310, img: "sentinel.png", code: "6,3", cond: "sent=all" },
	{ sub: "sent", x: 2288, z: 3140, img: "sentinel.png", code: "6,4", cond: "sent=all|meta" },
	{ sub: "sent", x: 2250, z: 3366, img: "sentinel.png", code: "6,5", cond: "sent=all" },
	{ sub: "sent", x: 2733, z: 3410, img: "sentinel.png", code: "7,1", cond: "sent=all|meta" },
	{ sub: "sent", x: 2574, z: 3065, img: "sentinel.png", code: "7,2", cond: "sent=all|meta" },
	{ sub: "sent", x: 2423, z: 3455, img: "sentinel.png", code: "7,3", cond: "sent=all" },
	{ sub: "sent", x: 3095, z: 3217, img: "sentinel.png", code: "7,4", cond: "sent=all" },
	{ sub: "sent", x: 3049, z: 3321, img: "sentinel.png", code: "7,5", cond: "sent=all|meta" },
	{ sub: "sent", x: 3257, z: 3371, img: "sentinel.png", code: "7,6", cond: "sent=all" },
	{ sub: "sent", x: 2292, z: 3146, img: "sentinel.png", code: "7,7", cond: "sent=all" },
	{ sub: "sent", x: 2319, z: 3596, img: "sentinel.png", code: "7,8", cond: "sent=all" },
	{ sub: "sent", x: 3094, z: 3451, img: "sentinel.png", code: "7,9,1", cond: "sent=all" },
	{ sub: "sent", x: 2934, z: 3228, img: "sentinel.png", code: "7,9,2", cond: "sent=all" },
	{ sub: "sent", x: 2814, z: 3084, img: "sentinel.png", code: "0,1,1", cond: "sent=all" },
	{ sub: "sent", x: 2772, z: 2698, img: "sentinel.png", code: "0,1,2", cond: "sent=all" },
	{ sub: "sent", x: 2333, z: 3048, img: "sentinel.png", code: "0,1,3", cond: "sent=all" },
	//{ sub: "sent",x:374,y:77, img: "sentinel.png", code: "0,2,1", cond: "sent=all"},
	{ sub: "sent", x: 2715, z: 2708, img: "sentinel.png", code: "0,2,2", cond: "sent=all" },
	{ sub: "sent", x: 2934, z: 2928, img: "sentinel.png", code: "0,2,3", cond: "sent=all|meta" },
	{ sub: "sent", x: 2355, z: 3849, img: "sentinel.png", code: "0,3", cond: "sent=all|meta" },
	{ sub: "sent", x: 3187, z: 2720, img: "sentinel.png", code: "0,4", cond: "sent=all" },
	{ sub: "sent", x: 3218, z: 3499, img: "sentinel.png", code: "0,5,1", cond: "sent=all|meta" },
	{ sub: "sent", x: 3232, z: 3460, img: "sentinel.png", code: "0,5,2", cond: "sent=all" },
	{ sub: "sent", x: 3015, z: 3393, img: "sentinel.png", code: "0,5,3", cond: "sent=all" },
	{ sub: "sent", x: 3044, z: 3327, img: "sentinel.png", code: "0,5,4", cond: "sent=all" },
	{ sub: "sent", x: 2938, z: 3429, img: "sentinel.png", code: "0,5,5", cond: "sent=all" },
	{ sub: "sent", x: 2623, z: 3308, img: "sentinel.png", code: "0,5,6", cond: "sent=all" },
	{ sub: "sent", x: 2593, z: 3114, img: "sentinel.png", code: "0,5,7", cond: "sent=all|meta" },
	{ sub: "sent", x: 2426, z: 3062, img: "sentinel.png", code: "0,5,8", cond: "sent=all" },
	{ sub: "sent", x: 2241, z: 3377, img: "sentinel.png", code: "0,5,9", cond: "sent=all" },
	{ sub: "sent", x: 2932, z: 3026, img: "sentinel.png", code: "0,6,1", cond: "sent=all" },
	{ sub: "sent", x: 2947, z: 2976, img: "sentinel.png", code: "0,6,2", cond: "sent=all" },

	//arch outfit	
	{ sub: "arch", x: 3329, z: 3379, n: "Master Archaeologists", img: "arch.png", code: "1", cond: "arch=all|meta" },
	{ sub: "arch", x: 3349, z: 3195, n: "Master Archaeologists", img: "arch.png", code: "2", cond: "arch=all" },
	{ sub: "arch", x: 3271, z: 3504, n: "Master Archaeologists", img: "arch.png", code: "3", cond: "arch=all|meta" },
	{ sub: "arch", x: 3695, z: 3209, n: "Master Archaeologists", img: "arch.png", code: "4", cond: "arch=all" },
	{ sub: "arch", x: 2682, z: 3403, n: "Master Archaeologists", img: "arch.png", code: "6", cond: "arch=all|meta" },
	{ sub: "arch", x: 2408, z: 2829, n: "Master Archaeologists", img: "arch.png", code: "7", cond: "arch=all" },
	{ sub: "arch", x: 3985, z: 4323, n: "Master Archaeologists", img: "arch.png", code: "8", cond: "arch=all" },
	{ sub: "arch", x: 3254, z: 3455, n: "Master Archaeologists", img: "arch.png", code: "9,1", cond: "arch=all" },
	{ sub: "arch", x: 2550, z: 2854, n: "Master Archaeologists", img: "arch.png", code: "9,2", cond: "arch=all" },
	{ sub: "arch", x: 2957, z: 3510, n: "Master Archaeologists", img: "arch.png", code: "9,3", cond: "arch=all|meta" },
	{ sub: "arch", x: 2921, z: 9702, n: "Master Archaeologists", img: "arch.png", code: "9,4", cond: "arch=all|meta" },
	{ sub: "arch", x: 2988, z: 3269, n: "Master Archaeologists", img: "arch.png", code: "9,5", cond: "arch=all|meta" },
	{ sub: "arch", x: 3985, z: 4329, n: "Master Archaeologists", img: "arch.png", code: "9,6", cond: "arch=all" },
	{ sub: "arch", x: 2962, z: 3347, n: "Master Archaeologists", img: "arch.png", code: "9,7", cond: "arch=all" },
	{ sub: "arch", x: 3182, z: 3418, n: "Master Archaeologists", img: "arch.png", code: "9,8", cond: "arch=all|meta" },
	{ sub: "arch", x: 3342, z: 3384, n: "Master Archaeologists", img: "arch.png", code: "9,9", cond: "arch=all" },
	{ sub: "arch", x: 3088, z: 3254, n: "Master Archaeologists", img: "arch.png", code: "9,0,1", cond: "arch=all" }
];
