import * as leaflet from "leaflet";
import {TileLayer} from "leaflet";
import {Coordinate, GieliCoordinates} from "./clues";

type ElevationConfig = { dxdy: number, dzdy: number }
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
        return leaflet.Util.template(url, {x: coords.x, y: coords.y, z: coords.z});
    }
}

function sextantToCoord(comp: GieliCoordinates): { x: number, y: number } {
    const sextant = {
        offsetx: 2440,
        offsetz: 3161,
        degreespertile: 1.875
    }

    return {
        x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.degreespertile),
        y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.degreespertile)
    }
}

/**
 * This map class wraps a leaflet map view and provides features needed for the solver.
 * Map data is sourced from Skillbert's amazing runeapps.org.
 */
export class GameMap {
    map

    geturl(filename: string) {
        return `https://runeapps.org/maps/map1/${filename}`;
    }

    constructor(map_id: string) {
        const chunkoffsetx = 16;
        const chunkoffsetz = 16;

        const mapsizex = 100;
        const mapsizez = 200;

        const chunksize = 64;

        var crs = leaflet.CRS.Simple;
        //add 0.5 to so coords are center of tile
        //@ts-ignore
        crs.transformation = L.transformation(
            1, chunkoffsetx + 0.5,
            -1, mapsizez * chunksize + -1 * (chunkoffsetz + 0.5)
        );

        this.map = leaflet.map(map_id, {
            crs: crs,
            minZoom: -5,
            maxZoom: 7,
            zoomControl: false,
            doubleClickZoom: false,
            attributionControl: true,
        }).setView([3200, 3000], 0);

        /*
        leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map)

        "https://runeapps.org/maps/map1/topdown-0/{z}/{x}-{y}.webp"*/
        /*
    `map-0/{z}/{x}-{y}.webp`
    `/node/map/getnamed?mapid=1&version=${this.version}&file=${(filename)}`*/

        let layer = new RsBaseTileLayer([
            {to: 2, urls: [this.geturl(`map-0/{z}/{x}-{y}.webp`)]},
            {from: 3, to: 3, urls: [this.geturl(`map-0/{z}/{x}-{y}.svg`)]}
        ], {
            attribution: 'Skillbert (<a href="https://runeapps.org/">RuneApps.org</a>',
            tileSize: 512,
            maxNativeZoom: 3,
            minZoom: -5
        })

        layer.addTo(this.map)

        let origin: GieliCoordinates = {
            latitude: {
                degrees: 0,
                minutes: 0,
                direction: "north"
            },
            longitude: {
                degrees: 0,
                minutes: 0,
                direction: "east"
            }
        }

        let or = sextantToCoord(origin)

        leaflet.marker([or.y, or.x]).addTo(this.map)

        /*
                leaflet.tileLayer("https://runeapps.org/maps/map1/topdown-0/{z}/{x}-{y}.webp", {
                    attribution: 'Skillbert (<a href="https://runeapps.org/">RuneApps.org</a>',
                    tileSize: 512,
                    maxNativeZoom: 5,
                    minZoom: -5
                }).addTo(this.map)*/
    }
}