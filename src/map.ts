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
    label: leaflet.Tooltip
    x_marks_the_spot: leaflet.Polyline

    constructor(private spot: MapCoordinate
    ) {
        super()

        this.setActive(true)
    }

    withMarker(icon: leaflet.Icon = leaflet.icon({
        iconUrl: "data:image/png;base64,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",
        iconSize: [12, 20],
        iconAnchor: [6, 20],
        className: "marker-icon"
    })) {
        if(this.marker) this.marker.remove()

        this.marker = leaflet.marker([this.spot.y, this.spot.x], {
            icon: leaflet.icon({
                iconUrl: "data:image/png;base64,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",
                iconSize: [18, 30],
                iconAnchor: [9, 30],
                className: "marker-icon"
            }),

            /*icon: new DivIcon({
                html: $("<div>").text(`[${spot.x}, ${spot.y}]`)
                    .css("color", "gold")
                    .css("font-size", "18pt")
                    .get()[0]

            }),*/

            title: `[${this.spot.x}, ${this.spot.y}]`
        }).addTo(this)

        return this
    }

    withLabel(text: string, className: string, offset: [number, number]) {
        this.label = leaflet.tooltip({
            content: text,
            className: className,
            offset: offset,
            permanent: true,
            direction: "center"
        })

        this.bindTooltip(this.label)

        return this
    }

    withX(color: string) {
        if (this.x_marks_the_spot) this.x_marks_the_spot.remove()

        this.x_marks_the_spot = leaflet.polyline(
            [
                [[this.spot.y + 0.5, this.spot.x - 0.5], [this.spot.y - 0.5, this.spot.x + 0.5]],
                [[this.spot.y - 0.5, this.spot.x - 0.5], [this.spot.y + 0.5, this.spot.x + 0.5]]
            ], {
                color: color,
                fillColor: color,
            }
        ).addTo(this)

        return this
    }

    private setOpacity(opacity: number) {
        if (this.marker) this.marker.setOpacity(opacity)
        if (this.x_marks_the_spot)
            this.x_marks_the_spot.setStyle(
                Object.assign(this.x_marks_the_spot.options, {
                    opacity: opacity * 0.75,
                    fillOpacity: opacity * 0.25,
                }))
        if (this.label) this.label.setOpacity(opacity)
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

    markerBySpot(tile: MapCoordinate) {
        return this.getMarkers().find((m) => {
            let spot = m.getSpot()

            return spot.x == tile.x && spot.y == tile.y
        })
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