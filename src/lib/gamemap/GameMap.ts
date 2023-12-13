import * as leaflet from "leaflet";
import {TeleportLayer} from "./defaultlayers/TeleportLayer";
import {floor_t} from "../runescape/coordinates";
import Graticule from "./defaultlayers/Graticule";
import Widget from "../ui/Widget";
import {Constants} from "../../trainer/constants";
import GameLayer from "./GameLayer";
import ContextMenu from "../../trainer/ui/widgets/ContextMenu";
import {FitBoundsOptions, LatLngBounds, MapOptions} from "leaflet";
import TileHighlightLayer from "./defaultlayers/TileHighlightLayer";
import {GameMapContextMenuEvent, GameMapEvent, GameMapKeyboardEvent, GameMapMouseEvent} from "./MapEvents";
import {GameMapControl} from "./GameMapControl";
import BaseTileLayer from "./defaultlayers/BaseTileLayer";
import FloorControl from "./defaultlayers/FloorControl";
import {Rectangle, Vector2} from "../math";
import {util} from "../util/util";
import {TileCoordinates} from "../runescape/coordinates";
import {TileRectangle} from "../runescape/coordinates";
import {Observable, observe} from "../reactive";
import * as lodash from "lodash";

export const red_marker = "data:image/png;base64,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"
export const blue_marker = "data:image/png;base64,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"
export const green_marker = "data:image/png;base64,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"
export const yellow_marker = "data:image/png;base64,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"

export const red_icon = leaflet.icon({
    iconUrl: red_marker,
    iconSize: [18, 30],
    iconAnchor: [9, 30],
    className: "marker-icon"
})
export const blue_icon = leaflet.icon({
    iconUrl: blue_marker,
    iconSize: [18, 30],
    iconAnchor: [9, 30],
    className: "marker-icon"
})
export const green_icon = leaflet.icon({
    iconUrl: green_marker,
    iconSize: [18, 30],
    iconAnchor: [9, 30],
    className: "marker-icon"
})

export const yellow_icon = leaflet.icon({
    iconUrl: yellow_marker,
    iconSize: [18, 30],
    iconAnchor: [9, 30],
    className: "marker-icon"
})

/**
 * This map class wraps a leaflet map view and provides features needed for the solver.
 * Map data is sourced from Skillbert's amazing runeapps.org.
 */
export class GameMap extends leaflet.Map {
    floor: Observable<floor_t> = observe(0)
    private bounds: Observable<LatLngBounds> = observe(null)
    public viewport = this.bounds.map(s =>
        s ? Rectangle.extend(Rectangle.from(Vector2.fromLatLong(s.getNorthEast()), Vector2.fromLatLong(s.getSouthWest())), 1)
            : null
    )

    container: JQuery
    private ui_container: Widget

    private teleportLayer: TeleportLayer

    private internal_root_layer: GameLayer

    private baseLayers: leaflet.TileLayer[]

    private _lastHoveredTile: TileCoordinates = null

    constructor(element: HTMLElement) {
        super(element, GameMap.gameMapOptions());

        this.container = $(element)

        // Set up UI layers
        {
            this.ui_container = c().addClass("gamemap-ui-container").appendTo(this.container)
            //this.top_control_container.container.on("click", (e) => e.stopPropagation())
            // TODO: prevent event propagation like above?

            for (let key in GameMap.position_layer_class_mapping) {
                c().addClass(GameMap.position_layer_class_mapping[key])
                    .appendTo(this.ui_container)
            }
        }

        this.internal_root_layer = new GameLayer()
        this.addLayer(this.internal_root_layer)

        this.addGameLayer(new FloorControl())
            .addGameLayer(new TileHighlightLayer())

        // Set up all the event handlers to translate into GameMapEvents
        {

            this.on("contextmenu", async (e) => {
                let event = this.event(new GameMapContextMenuEvent(this, e, this.eventCoordinate(e)), (l) => (e) => l.eventContextMenu(e))

                new ContextMenu(event.entries)
                    .show(this.container.get()[0], {x: e.originalEvent.clientX, y: e.originalEvent.clientY})
                    .onClosed(() => {
                        this.container.focus()
                    })

                // TODO: Give focus back to map on exit
            })

            this.on("click", (e) => {
                this.event(new GameMapMouseEvent(this, e, this.eventCoordinate(e)), (l) => (e) => l.eventClick(e))
            })

            this.on("mousemove", (e) => {
                let t = this.eventCoordinate(e)

                if (!TileCoordinates.eq2(t, this._lastHoveredTile)) {
                    this._lastHoveredTile = t
                    this.event(new GameMapMouseEvent(this, e, t), (l) => (e) => l.eventHover(e))
                }
            })

            this.on("mouseup", (e) => {
                this.event(new GameMapMouseEvent(this, e, this.eventCoordinate(e)), (l) => (e) => l.eventMouseUp(e))
            })

            this.on("mousedown", (e) => {
                this.event(new GameMapMouseEvent(this, e, this.eventCoordinate(e)), (l) => (e) => l.eventMouseDown(e))
            })

            this.on("keydown", (e) => {
                this.event(new GameMapKeyboardEvent(this, e), l => e => l.eventKeyDown(e))
            })

            this.on("keyup", (e) => {
                this.event(new GameMapKeyboardEvent(this, e), l => e => l.eventKeyUp(e))
            })

            this.on("moveend", () => this.bounds.set(this.getBounds()))
            this.on("zoomend", () => this.bounds.set(this.getBounds()))
        }

        // Add subtle gridlines
        new Graticule({
            intervals: [
                {min_zoom: -Infinity, interval: 64},
                {min_zoom: 0.5, interval: 8},
                {min_zoom: 1, interval: 4},
                {min_zoom: 2, interval: 1},
            ],
            lineStyle: {
                weight: 1,
                color: '#111111',
                opacity: 0.25,
                interactive: false
            }
        })
            .setZIndex(10)
            .addTo(this)

        /*
        new Graticule({
            intervals: [
                {min_zoom: -Infinity, interval: 64},
            ],
            lineStyle: {
                weight: 4,
                color: '#000000',
                opacity: 0.5,
                interactive: false
            }
        })
            .setZIndex(10)
            .addTo(this)*/

        this.updateBaseLayers()

        this.floor.subscribe(() => this.updateBaseLayers())
    }

    public fitView(view: TileRectangle, options?: FitBoundsOptions): this {
        this.fitBounds(util.convert_bounds(Rectangle.toBounds(view)).pad(0.1), options)
        this.floor.set(view.level)
        return this
    }

    getClientPos(coordinates: Vector2): Vector2 {
        return Vector2.add(this.latLngToContainerPoint(Vector2.toLatLong(coordinates)), {
            x: this.container.get()[0].getBoundingClientRect().left,
            y: this.container.get()[0].getBoundingClientRect().top
        })
    }

    public getTeleportLayer(): TeleportLayer {
        return this.teleportLayer
    }

    public addGameLayer(layer: GameLayer): this {
        this.internal_root_layer.add(layer)

        return this
    }

    public override addControl(control: leaflet.Control | GameMapControl): this {
        if (!(control instanceof GameMapControl)) {
            super.addControl(control)
        } else {
            let self = this

            function getPositionLayer(position: GameMapControl.position_t): JQuery {
                return self.ui_container.container.children(`.${GameMap.position_layer_class_mapping[position]}`)
            }

            control.content.appendTo(getPositionLayer(control.config.position))
        }

        return this
    }

    private updateBaseLayers() {
        // Hardcoded
        const MAP_ID = 4
        const SKILLBERT_ATTRIBUTION = '<a href="https://runeapps.org/" title="Creator of Alt1 and RuneApps.org">Skillbert</a>'

        function backupUrl(filename: string, version: number) {
            return `https://runeapps.org/node/map/getnamed?mapid=${MAP_ID}&version=${version}&file=${filename}`;
        }

        function geturls(filename: string) {
            return [
                `https://runeapps.org/s3/map${MAP_ID}/live/${filename}`,
                `https://runeapps.org/node/map/getnamed?mapid=${MAP_ID}&version=${Constants.map_version}&file=${filename}`
            ];
        }

        let layers: leaflet.TileLayer[] = [
            // Rendered Top Down Layer
            new BaseTileLayer([
                {urls: geturls(`topdown-${this.floor.value()}/{z}/{x}-{y}.webp`)}
            ], {
                attribution: SKILLBERT_ATTRIBUTION,
                tileSize: 512,
                maxNativeZoom: 5,
                minZoom: -5
            }),
            // Walls SVG Layer
            new BaseTileLayer([
                {to: 2, urls: geturls(`walls-${this.floor.value()}/{z}/{x}-{y}.webp`)},
                {from: 3, to: 3, urls: geturls(`walls-${this.floor.value()}/{z}/{x}-{y}.svg`)}
            ], {
                attribution: SKILLBERT_ATTRIBUTION,
                tileSize: 512,
                maxNativeZoom: 3,
                minZoom: -5
            }),
            // Filtered Collision Layer
            new BaseTileLayer([
                {urls: geturls(`collision-${this.floor.value()}/{z}/{x}-{y}.png`)}
            ], {
                attribution: SKILLBERT_ATTRIBUTION,
                tileSize: 512,
                maxNativeZoom: 3,
                minZoom: -5,
                className: "map-collisionlayer"
            })
        ]

        let oldbase = this.baseLayers;
        if (oldbase && oldbase.length > 0) {
            //prevent loading of new tiles on old layer
            oldbase.forEach(q => q.on("tileloadstart", e => e.target.src = ""));
            layers[0].on("load", () => setTimeout(() => oldbase.forEach(q => q.remove()), 2000));
        }

        this.baseLayers = layers

        layers.forEach((l) => l.addTo(this))
    }

    setTeleportLayer(layer: TeleportLayer): this {
        if (this.teleportLayer) this.teleportLayer.remove()

        this.teleportLayer = layer

        layer.addTo(this).setZIndex(100)

        return this
    }

    eventCoordinate(e: leaflet.LeafletMouseEvent): TileCoordinates {
        return {
            x: e.latlng.lng,
            y: e.latlng.lat,
            level: this.floor.value()
        }
    }

    private event<T extends GameMapEvent<any, any>>(event: T, h: (_: GameLayer) => (_: T) => any): T {

        function getLayers(l: leaflet.Map | leaflet.LayerGroup) {
            let accu: leaflet.Layer[] = []

            l.eachLayer(c => accu.push(c))

            return accu
        }

        function propagate(l: GameLayer) {
            if (!l) return;

            event.propagation_state.phase = "pre"
            h(l)(event)

            if (!event.propagation_state.trickle_stopped && !event.propagation_state.trickle_stopped_immediate) {
                for (let lay of getLayers(l)) if (lay instanceof GameLayer) propagate(lay)
            }

            if (event.propagation_state.trigger_post_order) {
                event.propagation_state.phase = "post"
                h(l)(event)
            }

            event.propagation_state.trickle_stopped_immediate = false
        }

        propagate(this.internal_root_layer)

        return event
    }
}

export namespace GameMap {


    export function gameMapOptions(): MapOptions {

        function getCRS(): leaflet.CRS {
            const chunkoffset = {
                x: 16,
                z: 16
            }

            const mapsize = {
                x: 100,
                z: 200
            }

            const chunksize = 64;

            let crs = leaflet.CRS.Simple;

            //add 0.5 to so coords are center of tile
            // @ts-ignore
            crs.transformation = leaflet.transformation(
                1, chunkoffset.x + 0.5,
                -1, mapsize.z * chunksize + -1 * (chunkoffset.z + 0.5)
            );

            return crs
        }

        return {
            crs: getCRS(),
            zoomSnap: 0.25,
            minZoom: -5,
            maxZoom: 7,
            zoomControl: false,
            dragging: true,
            doubleClickZoom: false,
            boxZoom: false,
            attributionControl: true
        }
    }

    export const position_layer_class_mapping: Record<GameMapControl.position_t, string> = {
        "bottom-center": "gamemap-ui-layer-bc",
        "bottom-left": "gamemap-ui-layer-bl",
        "bottom-right": "gamemap-ui-layer-br",
        "left-bottom": "gamemap-ui-layer-lb",
        "left-center": "gamemap-ui-layer-lc",
        "left-top": "gamemap-ui-layer-lt",
        "right-bottom": "gamemap-ui-layer-rb",
        "right-center": "gamemap-ui-layer-rc",
        "right-top": "gamemap-ui-layer-rt",
        "top-center": "gamemap-ui-layer-tc",
        "top-left": "gamemap-ui-layer-tl",
        "top-right": "gamemap-ui-layer-tr"
    }
}

export class GameMapWidget extends Widget {
    map: GameMap

    constructor(container: JQuery) {
        super(container)

        this.map = new GameMap(container.get()[0])
            .setView([3200, 3000], 0);
    }
}