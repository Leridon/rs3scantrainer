import * as leaflet from "leaflet";
import { drawTeleports, loadSettings, MapSettings, saveSettings } from "./data";
require("./style.scss");

/* This code is needed to properly load the images in the Leaflet CSS */
import 'leaflet/dist/leaflet.css';
import { MapPoint } from "../../../other/cluesolver/textclue";
import { boundMethod } from "autobind-decorator";
import { TypedEmitter } from "@runeapps/common/eventemitter";
//@ts-ignore
delete leaflet.Icon.Default.prototype._getIconUrl;
leaflet.Icon.Default.mergeOptions({
	iconRetinaUrl: require('./imgs/marker-2x.png'),
	iconUrl: require('./imgs/marker.png'),
	shadowUrl: require('./imgs/marker-shadow.png'),
});

const chunkoffsetx = 16;
const chunkoffsetz = 16;

const mapsizex = 100;
const mapsizez = 200;

const chunksize = 64;

type ElevationConfig = { dxdy: number, dzdy: number }

const emptyElevationConfig = { dxdy: 0, dzdy: 0 };

export function pointToConsoleCoord(point: MapPoint) {
	return [
		point.level,
		Math.floor(point.x / chunksize),
		Math.floor(point.z / chunksize),
		point.x % chunksize,
		point.z % chunksize
	];
}

export class Marker3d extends leaflet.Marker {
	declare options: leaflet.MarkerOptions & { minZoom?: number };
	mapPoint: MapPoint;
	elevation = 0;
	constructor(p: MapPoint, opts?: leaflet.MarkerOptions & { minZoom?: number }) {
		super([p.z, p.x], opts);
		this.mapPoint = p;
		// this.on("click", () => {
		// 	console.log(this.elevation, this.mapPoint, pointToConsoleCoord(this.mapPoint).join(","));
		// });
	}

	_initIcon() {
		//@ts-ignore
		super._initIcon();
		let el = this.getElement();
		if (el) {
			let opts = this.getIcon().options;
			if (opts.iconAnchor) {
				let anchor = leaflet.point(opts.iconAnchor);
				el.style.transformOrigin = `${anchor.x}px ${anchor.y}px`;
			} else {
				el.style.transformOrigin = `50% 50%`;
			}
		}
	}

	//hack to actually get a transform:scale in without flickering
	_setPos(pos: leaflet.Point) {
		//@ts-ignore
		super._setPos(pos);
		let el = this.getElement();
		if (el) {
			let minzoom = this.options.minZoom ?? 0;
			let overzoom = minzoom - this._map.getZoom();
			if (overzoom > 2) {
				el.style.display = "none";
			} else if (overzoom > 0) {
				el.style.transform += ` scale(${0.5 ** overzoom})`;
				el.style.display = "";
			} else {
				el.style.display = "";
			}
		}
	}

	onAdd(map: leaflet.Map) {
		if (map instanceof Map3d) { map.registerMarker3d(this); }
		return super.onAdd(map);
	}
	onRemove(map: leaflet.Map) {
		if (map instanceof Map3d) { map.unregisterMarker3d(this); }
		return super.onRemove(map);
	}
	fixElevation(config: ElevationConfig) {
		this.setLatLng([
			this.mapPoint.z + this.elevation * config.dzdy,
			this.mapPoint.x + this.elevation * config.dxdy
		]);
	}
}

function mapOptions(): leaflet.MapOptions {
	//TODO stop breaking the leaflet built-ins and inherit somehow instead
	var crs = leaflet.CRS.Simple;
	//add 0.5 to so coords are center of tile
	//@ts-ignore
	crs.transformation = L.transformation(
		1, chunkoffsetx + 0.5,
		-1, mapsizez * chunksize + -1 * (chunkoffsetz + 0.5)
	);

	return {
		crs: crs,
		minZoom: -5,
		maxZoom: 7,
		zoomControl: false,
		attributionControl: false
		//maxBounds: [[0, 0], [mapsizez * chunksize * mip0pxpertile, mapsizex * chunksize * mip0pxpertile]]
	}
}

type HeightCacheEntry = {
	height: Uint16Array | null,
	markers: Set<Marker3d>,
	requested: boolean,
	chunkx: number,
	chunkz: number,
	level: number
};

class Map3d extends leaflet.Map {
	heightcache = new Map<number, HeightCacheEntry>();
	elevationConfig: ElevationConfig;
	visibleElevation: { x1: number, z1: number, x2: number, z2: number } | null = null;
	//TODO set this from map class at some point
	elevationsource = "";
	elevationZoomLevel: number;
	baselayer: RsBaseTileLayer | undefined = undefined;

	constructor(node: HTMLElement, opts: leaflet.MapOptions, elevationsource: string, elevationZoomLevel: number) {
		super(node, opts);
		this.elevationsource = elevationsource;
		this.elevationZoomLevel = elevationZoomLevel;
		this.elevationConfig = emptyElevationConfig;
		this.processElevation();

		this.on("moveend", this.processElevation);
		this.on("zoomend", this.processElevation);
		this.on("layeradd", this.layerAdd);
	}

	@boundMethod
	layerAdd(e: leaflet.LeafletEvent) {
		let layer = e.layer;
		if (layer instanceof RsBaseTileLayer) {
			this.baselayer = layer;
			this.processElevation();
		}
	}

	getHeightCacheEntry(pos: MapPoint) {
		let chunkx = Math.floor(Math.round(pos.x) / chunksize);
		let chunkz = Math.floor(Math.round(pos.z) / chunksize);
		let index = chunkx + chunkz * mapsizex + pos.level * mapsizex * mapsizez;
		let entry = this.heightcache.get(index);
		if (!entry) {
			entry = {
				height: null,
				markers: new Set(),
				requested: false,
				chunkx,
				chunkz,
				level: pos.level
			}
			this.heightcache.set(index, entry);
		}
		return entry;
	}

	registerMarker3d(marker: Marker3d) {
		let entry = this.getHeightCacheEntry(marker.mapPoint);
		entry.markers.add(marker);

		if (entry.height) {
			let pos = marker.mapPoint;
			let index = (Math.round(pos.x) % 64) + (Math.round(pos.z) % 64) * chunksize;
			marker.elevation = entry.height[index];
			marker.fixElevation(this.elevationConfig);
		} else if (!entry.requested && this.visibleElevation &&
			entry.chunkx >= this.visibleElevation.x1 && entry.chunkx < this.visibleElevation.x2 &&
			entry.chunkz >= this.visibleElevation.z1 && entry.chunkz < this.visibleElevation.z2) {
			this.fetchElevationEntry(entry);
		}
	}

	unregisterMarker3d(marker: Marker3d) {
		let entry = this.getHeightCacheEntry(marker.mapPoint);
		entry.markers.delete(marker);
	}

	@boundMethod
	processElevation() {
		let elevated = this.getZoom() >= this.elevationZoomLevel;
		let prevElevationConfig = this.elevationConfig;
		this.elevationConfig = (elevated ? this.baselayer?.getZoomConfig(this.getZoom())?.elevation : undefined) ?? emptyElevationConfig;
		if (elevated) {
			let bounds = this.getBounds();
			let x1 = Math.floor(bounds.getWest() / chunksize);
			let z1 = Math.floor(bounds.getSouth() / chunksize);
			let x2 = Math.ceil(bounds.getEast() / chunksize);
			let z2 = Math.ceil(bounds.getNorth() / chunksize);
			if (!this.visibleElevation || this.visibleElevation.x1 != x1 || this.visibleElevation.x2 != x2 || this.visibleElevation.z1 != z1 || this.visibleElevation.z2 != z2) {
				this.visibleElevation = { x1, x2, z1, z2 };
				for (let z = z1; z < z2; z++) {
					for (let x = x1; x < x2; x++) {
						for (let level = 0; level < 4; level++) {
							let index = x + z * mapsizex + level * mapsizex * mapsizez;
							let entry = this.heightcache.get(index);
							if (entry) {
								this.fetchElevationEntry(entry);
							}
						}
					}
				}
			}
		}
		if (prevElevationConfig != this.elevationConfig) {
			for (let entry of this.heightcache.values()) {
				for (let marker of entry.markers) {
					marker.fixElevation(this.elevationConfig);
				}
			}
		}
	}

	async fetchElevationEntry(entry: HeightCacheEntry) {
		if (entry.requested || entry.markers.size == 0 || !this.elevationsource) {
			return;
		}
		entry.requested = true;
		let req = await fetch(`${this.elevationsource}-${entry.level}/${entry.chunkx}-${entry.chunkz}.bin`);
		if (!req.ok) { return; }
		let buf = await req.arrayBuffer();
		//TODO this assumes little endian processor architecture!!!
		entry.height = new Uint16Array(buf);
		for (let marker of entry.markers) {
			let pos = marker.mapPoint;
			let index = (Math.round(pos.x) % 64) + (Math.round(pos.z) % 64) * chunksize;
			marker.elevation = entry.height[index];
			marker.fixElevation(this.elevationConfig);
		}
	}
}

type Layersource = { urls: string[], from?: number, to?: number, elevation?: ElevationConfig };

class RsBaseTileLayer extends leaflet.TileLayer {
	zoomurls: Layersource[];
	constructor(zoomurls: Layersource[], opts?: leaflet.TileLayerOptions) {
		super(zoomurls[0].urls[0], opts);
		this.zoomurls = zoomurls;

		this.on("tileerror", e => {
			let layer = e.sourceTarget as RsBaseTileLayer;
			let errcount = (e.tile.dataset.errcount ? +e.tile.dataset.errcount : 0) + 1;
			e.tile.dataset.errcount = errcount + "";
			let src = layer.getTileUrl(e.coords, errcount);
			if (src) {
				e.tile.src = src;
			}
		});
	}

	getZoomConfig(zoom: number) {
		for (let level of this.zoomurls) {
			if ((level.from ?? -Infinity) <= zoom && (level.to ?? Infinity) >= zoom) {
				return level;
			}
		}
		return undefined;
	}

	getTileUrl(coords: leaflet.Coords, retrycount = 0) {
		let cnf = this.getZoomConfig(coords.z);
		let url = cnf?.urls[retrycount] ?? "";
		return leaflet.Util.template(url, { x: coords.x, y: coords.y, z: coords.z });
	}
}

export type MapMode = "map" | "adaptive" | "3d" | "flat" | "flatwalled" | "collision";

const elevation3d: ElevationConfig = {
	//1/{tilesize}*{storagescale}*{dxdy}
	dxdy: 1 / 512 * 16 * 0.15,
	dzdy: 1 / 512 * 16 * 0.5
};

export class WorldMap extends TypedEmitter<{ mode: MapMode, floor: number, hideteleports: boolean }> {
	map: Map3d;
	baselayers: leaflet.Layer[] = [];
	root: HTMLElement;
	settings: MapSettings;
	mode: MapMode;
	floor = -1;
	zoomlevel3d = 3;
	teleportlayer!: leaflet.LayerGroup;
	version = 0;
	mapid = 0;

	constructor(rootnode: HTMLElement, initialMode = "3d" as MapMode) {
		super();

		//TODO hardcoded stuff
		this.mapid = 1;
		const heighturl = "/maps/map1/height";

		this.root = rootnode;
		this.mode = initialMode;
		this.settings = loadSettings();

		this.map = new Map3d(this.root, mapOptions(), heighturl, this.zoomlevel3d);
		this.map.on("click", (e: leaflet.LeafletMouseEvent) => { console.log(`x:${Math.round(e.latlng.lng)},z:${Math.round(e.latlng.lat)}`); });
		this.setBaseLayer(this.mode, 0);
		this.map.setView([3200, 3000], 0);
		this.map.doubleClickZoom.disable();

		this.onTeleportsChanged();

		globalThis.map = this;
	}

	@boundMethod
	onTeleportsChanged() {
		if (this.teleportlayer) { this.map.removeLayer(this.teleportlayer); }
		this.teleportlayer = drawTeleports(this.settings);
		if (!this.settings.hideTeleports) {
			this.map.addLayer(this.teleportlayer);
		}
	}

	toggleTeleports(show: boolean) {
		this.settings.hideTeleports = !show;
		saveSettings(this.settings);
		if (this.settings.hideTeleports) { this.map.removeLayer(this.teleportlayer); }
		else { this.map.addLayer(this.teleportlayer); }
		this.emit("hideteleports", this.settings.hideTeleports);
	}

	geturl = (filename: string) => {
		if (this.version == 0) {
			return `/maps/map${this.mapid}/${filename}`;
		} else {
			return `/node/map/getnamed?mapid=${this.mapid}&version=${this.version}&file=${(filename)}`;
		}
	}

	setBaseLayer(mode: MapMode, floor: number, version = this.version) {
		if (mode == this.mode && floor == this.floor && version == this.version) { return; }
		if (mode != this.mode) { this.emit("mode", mode); }
		if (floor != this.floor) { this.emit("floor", floor); }
		this.mode = mode;
		this.floor = floor;
		this.version = version;
		let baselayers: leaflet.TileLayer[] = [];

		if (mode == "map") {
			baselayers.push(new RsBaseTileLayer([
				{ to: 2, urls: [this.geturl(`map-${this.floor}/{z}/{x}-{y}.webp`)] },
				{ from: 3, to: 3, urls: [this.geturl(`map-${this.floor}/{z}/{x}-{y}.svg`)] }
			], {
				attribution: 'Skillbert',
				tileSize: 512,
				maxNativeZoom: 3,
				minZoom: -5
			}));
		} else if (mode == "adaptive") {
			baselayers.push(new RsBaseTileLayer([
				{ to: this.zoomlevel3d - 1, urls: [this.geturl(`topdown-${floor}/{z}/{x}-{y}.webp`), this.geturl(`topdown-0/{z}/{x}-{y}.webp`)] },
				{ from: this.zoomlevel3d, urls: [this.geturl(`level-${floor}/{z}/{x}-{y}.webp`), this.geturl(`level-0/{z}/{x}-{y}.webp`)], elevation: elevation3d }
			], {
				attribution: 'Skillbert',
				tileSize: 512,
				maxNativeZoom: 5,
				minZoom: -5
			}));
		} else if (mode == "3d" || mode == "flat" || mode == "flatwalled" || mode == "collision") {
			let name = mode == "3d" ? "level" : "topdown";
			baselayers.push(new RsBaseTileLayer([
				{ urls: [this.geturl(`${name}-${floor}/{z}/{x}-{y}.webp`), this.geturl(`${name}-0/{z}/{x}-{y}.webp`)], elevation: (mode == "3d" ? elevation3d : undefined) },
			], {
				attribution: 'Skillbert',
				tileSize: 512,
				maxNativeZoom: 5,
				minZoom: -5
			}));
		} else {
			throw new Error("unknown mode");
		}
		if (mode == "flatwalled") {
			baselayers.push(new RsBaseTileLayer([
				{ to: 2, urls: [this.geturl(`walls-${floor}/{z}/{x}-{y}.webp`)] },
				{ from: 3, to: 3, urls: [this.geturl(`walls-${floor}/{z}/{x}-{y}.svg`)] }
			], {
				attribution: 'Skillbert',
				tileSize: 512,
				maxNativeZoom: 3,
				minZoom: -5
			}));
		}
		if (mode == "collision") {
			baselayers.push(new RsBaseTileLayer([
				{ urls: [this.geturl(`collision-${floor}/{z}/{x}-{y}.png`)] }
			], {
				attribution: "Skillbert",
				tileSize: 512,
				maxNativeZoom: 3,
				minZoom: -5,
				className: "map-pixellayer"
			}));
		}
		let oldbase = this.baselayers;
		if (oldbase.length != 0) {
			//prevent loading of new tiles on old layer
			oldbase.forEach(q => q.on("tileloadstart", e => e.target.src = ""));
			baselayers[0].on("load", () => setTimeout(() => oldbase.forEach(q => q.remove()), 2000));
		}
		baselayers.forEach(q => q.on("error", e => console.log(e)));

		this.baselayers = baselayers;
		baselayers.forEach(q => this.map.addLayer(q));
	}
}

