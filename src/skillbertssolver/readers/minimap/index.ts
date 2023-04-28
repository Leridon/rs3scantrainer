import * as a1lib from "@alt1/base";
import { ImageDetect, ImgRef } from "@alt1/base";

let imgs = ImageDetect.webpackImages({
	homeportbutton: require("./imgs/homeport.data.png"),
	botrun: require("./imgs/botrun.data.png"),
	toprun: require("./imgs/toprun.data.png"),
	botwalk: require("./imgs/botwalk.data.png"),
	topwalk: require("./imgs/topwalk.data.png"),
});

let energies = {
	botrun: { x: 35, y: -29 },
	toprun: { x: 35, y: -9 },
	topwalk: { x: 35, y: -9 },
	botwalk: { x: 35, y: -29 },
};

export default class MinimapReader {
	pos: null | a1lib.RectLike & { centerx: number, centery: number } = null;

	find(img?: ImgRef) {
		if (!img) { img = a1lib.captureHoldFullRs(); }
		if (!img) { return null; }
		var homeport = img.findSubimage(imgs.homeportbutton);
		if (homeport.length == 0) { return null; }
		var botleft = { x: homeport[0].x - 17, y: homeport[0].y + 33 };

		var area = { x: homeport[0].x - 17, y: homeport[0].y - 700 + 33, w: 700, h: 700 };
		if (area.y < 0) { area.h += area.y; area.y = 0; }
		if (area.x + area.w >= img.width) { area.w = img.width - area.x - 1; }

		var topright: a1lib.PointLike | null = null;
		for (var a in energies) {
			var pos = img.findSubimage(imgs[a], area.x, area.y, area.w, area.h);
			if (pos.length != 0) {
				console.log("found energy", a);
				topright = { x: pos[0].x + energies[a].x, y: pos[0].y + energies[a].y };
				break;
			}
		}
		if (!topright) { return null; }

		var w = topright.x - botleft.x;
		var h = botleft.y - topright.y
		this.pos = {
			x: botleft.x,
			y: topright.y,
			width: w,
			height: h,
			centerx: w / 2,
			centery: h / 2,
		};
		return this.pos;
	}

	readCompass(img?: ImgRef) {
		if (!this.pos) { return null; }
		var buf: ImageData;
		if (img) { buf = img.toData(this.pos.x, this.pos.y, 40, 40); }
		else { buf = a1lib.capture(this.pos.x, this.pos.y, 40, 40); }

		var r = 11;
		var buf2 = buf.clone(new a1lib.Rect(0, 0, buf.width, buf.height));
		var centerx = 22;
		var centery = 22;

		var sx1 = 0, sy1 = 0, m1 = 0;
		var sx2 = 0, sy2 = 0, m2 = 0;
		for (var x = Math.round(centerx) - r; x <= Math.round(centerx) + r; x++) {
			for (var y = Math.round(centery) - r; y <= Math.round(centery) + r; y++) {
				var i = 4 * x + 4 * buf.width * y;
				var dx = x - centerx;
				var dy = y - centery;
				if (dx * dx + dy * dy > r * r) { buf.data[i] = buf.data[i + 1] = buf.data[i + 2] = 0; continue; }

				var rating1 = buf.data[i] - buf.data[i + 1];
				sx1 += dx * rating1;
				sy1 += dy * rating1;
				m1 += rating1;
				var rating2 = Math.max(0, buf.data[i] + buf.data[i + 1] + buf.data[i + 2] - 300);
				sx2 += dx * rating2;
				sy2 += dy * rating2;
				m2 += rating2;
				if (isNaN(m2)) { debugger; }
				if (isNaN(m1)) { debugger; }

				buf.data[i] = buf.data[i + 1] = buf.data[i + 2] = rating1;
				buf2.data[i] = buf2.data[i + 1] = buf2.data[i + 2] = rating2;
			}
		}
		if (m1 == 0 || m2 == 0) { return null; }

		var mx1 = sx1 / m1;
		var my1 = sy1 / m1;
		var mx2 = sx2 / m2;
		var my2 = sy2 / m2;

		var dir = Math.atan2((my2 - my1), (mx2 - mx1));
		dir += -1 / 180 * Math.PI;
		dir = (Math.PI + dir) % (Math.PI * 2);
		return dir;
	}

	//was this even used anywhere?
	// readEnergy(img: ImgRef) {
	// 	if (!this.pos) { return null; }
	// 	if (!img) { img = a1lib.captureHold(this.pos.x + this.pos.width - 50, this.pos.y + 5, 50, 40); }
	// 	var str = alt1.bindReadColorString(img.handle, "chat", a1lib.mixcolor(255, 255, 255), this.pos.x + this.pos.w - 27 - img.x, this.pos.y + 23 - img.y);
	// 	var m = str.match(/(\d{1,3})%/);
	// 	if (!m) { return null; }
	// 	return +m[1];
	// }
}