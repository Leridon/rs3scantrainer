import * as leaflet from "leaflet"
import {Vector2} from "../../../model/coordinates";
import {PolylineOptions} from "leaflet";

/**
 *  File: leaflet.SimpleGraticule.ts
 *  Desc: A graticule for Leaflet maps in the leaflet.CRS.Simple coordinate system.
 *  Original Author: Andrew Blakey (ablakey@gmaileaflet.com)
 *  Ported to typescript and adjusted to this project's needs
 */
export default class Graticule extends leaflet.FeatureGroup {

    last_drawn: {
        bounds: leaflet.LatLngBounds,
        interval: number
    } = null

    constructor(public _options: {
        intervals: {
            min_zoom: number,
            interval: number
        }[],
        offset?: Vector2,
        lineStyle?: PolylineOptions
    }) {
        super()

        if (!this._options.offset) this._options.offset = {x: 0.5, y: 0.5}

        if (!this._options.lineStyle) this._options.lineStyle = {
            stroke: true,
            color: '#111',
            opacity: 0.6,
            weight: 1
        }
    }

    override onAdd(map): this {
        super.onAdd(map)

        this._map = map;

        this._map.on('zoomend', () => this.redraw())
        this._map.on('moveend', () => this.redraw())

        this.redraw()

        return this
    }

    onRemove(map): this {
        map.off('viewreset', () => this.redraw());
        this.eachLayer(this.removeLayer, this);
        return this
    }

    redraw() {
        let bounds = this._map.getBounds()
        console.log("Zoom " + this._map.getZoom())

        let interval = Math.min(...this._options.intervals.filter((i) => this._map.getZoom() >= i.min_zoom).map((i) => i.interval))
        console.log("Interval " + interval)

        if (!this.last_drawn || !this.last_drawn.bounds.contains(bounds) || this.last_drawn.interval != interval) {
            this.constructLines(this._map.getBounds().pad(0.5), interval)
        }

        /*
        let currentZoom = this._map.getZoom();

        for (let i = 0; i < this._options.zoomIntervals.length; i++) {
            if (currentZoom >= this._options.zoomIntervals[i].start && currentZoom <= this._options.zoomIntervals[i].end) {
                this.interval = this._options.zoomIntervals[i].interval;
                break;
            }
        }*/
    }

    constructLines(bounds: leaflet.LatLngBounds, interval: number) {
        this.last_drawn = {
            bounds: bounds,
            interval: interval
        }

        console.log("Redrawing")

        this.clearLayers()

        let counts = {
            x: Math.ceil((bounds.getEast() - bounds.getWest()) / interval),
            y: Math.ceil((bounds.getNorth() - bounds.getSouth()) / interval)
        }

        let mins = {
            x: Math.floor(bounds.getWest() / interval) * interval,
            y: Math.floor(bounds.getSouth() / interval) * interval
        };

        //for horizontal lines
        for (let i = 0; i <= counts.x; i++) {
            let x = mins.x + i * interval + this._options.offset.x;

            new leaflet.Polyline([
                new leaflet.LatLng(bounds.getSouth(), x),
                new leaflet.LatLng(bounds.getNorth(), x)
            ], this._options.lineStyle)
                .addTo(this)
        }

        //for vertical lines
        for (let j = 0; j <= counts.y; j++) {
            let y = mins.y + j * interval + this._options.offset.y;

            new leaflet.Polyline([
                new leaflet.LatLng(y, bounds.getWest()),
                new leaflet.LatLng(y, bounds.getEast())
            ], this._options.lineStyle)
                .addTo(this)
        }
    }
}