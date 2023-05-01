import * as leaflet from "leaflet";
import {MapCoordinate, GieliCoordinates} from "./clues";
import {DivIcon, FeatureGroup, Layer, Marker, PathOptions} from "leaflet";
import {shapes} from "./map/shapes";

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

export class TileMarker extends leaflet.FeatureGroup {
    marker: leaflet.Marker
    area: leaflet.Polygon

    constructor(private spot: MapCoordinate,
                private tileColor?: string
    ) {
        super()

        this.marker = leaflet.marker([spot.y, spot.x], {
            /*icon: new DivIcon({
                html: $("<div>").text(`[${spot.x}, ${spot.y}]`)
                    .css("color", "gold")
                    .css("font-size", "18pt")
                    .get()[0]

            }),*/
            title: `[${spot.x}, ${spot.y}]`
        }).addTo(this)

        if (tileColor)
            this.area = shapes.tilePolygon(spot).addTo(this).setStyle({
                color: tileColor,
                fillColor: tileColor
            })


        this.setActive(true)
    }

    setOpacity(opacity: number) {
        this.marker.setOpacity(opacity)
        if (this.area)
            this.area.setStyle({
                color: this.tileColor,
                fillColor: this.tileColor,
                opacity: opacity,
                fillOpacity: opacity * 0.4,
                interactive: false,
                weight: 3
            })
    }

    setActive(isActive: boolean) {
        if (isActive) this.setOpacity(1)
        else this.setOpacity(0.2)
    }

    getSpot(): MapCoordinate {
        return this.spot
    }
}

export class MarkerLayer extends FeatureGroup {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }

    getMarkers() {
        return this.markers
    }
}

/**
 * This map class wraps a leaflet map view and provides features needed for the solver.
 * Map data is sourced from Skillbert's amazing runeapps.org.
 */
export class GameMapControl {
    map: leaflet.Map
    solutionLayer: leaflet.Layer
    method_layers: leaflet.Layer[]

    geturl(filename: string) {
        return `https://runeapps.org/maps/map1/${filename}`;
    }

    constructor(map_id: string) {
        this.method_layers = [null, null]

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
            zoomSnap: 0.5,
            minZoom: -5,
            maxZoom: 7,
            zoomControl: false,
            doubleClickZoom: false,
            attributionControl: true,
        }).setView([3200, 3000], 0);

        let layer = new RsBaseTileLayer([
            {urls: [this.geturl(`topdown-0/{z}/{x}-{y}.webp`), this.geturl(`topdown-0/{z}/{x}-{y}.webp`)]}
        ], {
            attribution: 'Skillbert (<a href="https://runeapps.org/">RuneApps.org</a>',
            tileSize: 512,
            maxNativeZoom: 5,
            minZoom: -5
        }).addTo(this.map)

        let wall_layer = new RsBaseTileLayer([
            {to: 2, urls: [this.geturl(`walls-0/{z}/{x}-{y}.webp`)]},
            {from: 3, to: 3, urls: [this.geturl(`walls-0/{z}/{x}-{y}.svg`)]}
        ], {
            attribution: 'Skillbert',
            tileSize: 512,
            maxNativeZoom: 3,
            minZoom: -5
        }).addTo(this.map)
    }

    setSolutionLayer(layer: leaflet.FeatureGroup, fit: boolean = true) {
        if (this.solutionLayer) this.solutionLayer.remove()
        this.solutionLayer = layer
        layer.addTo(this.map)

        if (fit) this.map.fitBounds(layer.getBounds(), {
            maxZoom: 2
        })
    }

    getSolutionLayer() {
        return this.solutionLayer
    }

    setMethodLayer(i: number, layer: Layer) {
        if (this.method_layers[i]) this.method_layers[i].remove()

        this.method_layers[i] = layer
        layer.addTo(this.map)
    }

    resetMethodLayers() {
        this.method_layers.forEach((e) => {
            if (e) e.remove()
        })
    }

    getMethodLayer(i: number) {
        return this.method_layers[i]
    }
}