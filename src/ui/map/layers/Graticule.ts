import * as leaflet from "leaflet"
import {Vector2} from "../../../model/coordinates";

/**
 *  File: leaflet.SimpleGraticule.ts
 *  Desc: A graticule for Leaflet maps in the leaflet.CRS.Simple coordinate system.
 *  Original Author: Andrew Blakey (ablakey@gmaileaflet.com)
 *  Ported to typescript and adjusted to this projects needs
 */
export default class Graticule extends leaflet.FeatureGroup {

    _bounds: leaflet.LatLngBounds

    lineStyle: {
        stroke: boolean,
        color: string,
        opacity: number,
        weight: number
    }

    constructor(private options: {
        offset: Vector2
    }, private interval: number = 1) {
        super()

        this.lineStyle = {
            stroke: true,
            color: '#111',
            opacity: 0.6,
            weight: 1
        }
    }

    onAdd(map): this {
        this._map = map;

        console.log("test")

        this._map.on('viewreset', () => this.redraw());

        this.eachLayer(map.addLayer, map);

        return this
    }

    onRemove(map): this {
        map.off('viewreset', () => this.redraw());
        this.eachLayer(this.removeLayer, this);
        return this
    }

    redraw() {
        this._bounds = this._map.getBounds().pad(0.5);

        this.clearLayers();

        /*
        var currentZoom = this._map.getZoom();

        for (var i = 0; i < this.options.zoomIntervals.length; i++) {
            if (currentZoom >= this.options.zoomIntervals[i].start && currentZoom <= this.options.zoomIntervals[i].end) {
                this.interval = this.options.zoomIntervals[i].interval;
                break;
            }
        }*/

        this.constructLines(this.getMins(), this.getLineCounts());

        return this;
    }

    getLineCounts() {
        return {
            x: Math.ceil((this._bounds.getEast() - this._bounds.getWest()) /
                this.interval),
            y: Math.ceil((this._bounds.getNorth() - this._bounds.getSouth()) /
                this.interval)
        };
    }

    getMins() {
        //rounds up to nearest multiple of x
        var s = this.interval;
        return {
            x: Math.floor(this._bounds.getWest() / s) * s,
            y: Math.floor(this._bounds.getSouth() / s) * s
        };
    }

    constructLines(mins, counts) {
        var lines = new Array(counts.x + counts.y);
        var labels = new Array(counts.x + counts.y);

        //for horizontal lines
        for (var i = 0; i <= counts.x; i++) {
            var x = mins.x + i * this.interval;
            lines[i] = this.buildXLine(x);
        }

        //for vertical lines
        for (var j = 0; j <= counts.y; j++) {
            var y = mins.y + j * this.interval;
            lines[j + i] = this.buildYLine(y);
        }

        lines.forEach(this.addLayer, this);
        labels.forEach(this.addLayer, this);
    }

    buildXLine(x) {
        var bottomLL = new leaflet.LatLng(this._bounds.getSouth(), x);
        var topLL = new leaflet.LatLng(this._bounds.getNorth(), x);

        return new leaflet.Polyline([bottomLL, topLL], this.lineStyle)
    }

    buildYLine(y) {
        var leftLL = new leaflet.LatLng(y, this._bounds.getWest());
        var rightLL = new leaflet.LatLng(y, this._bounds.getEast());

        return new leaflet.Polyline([leftLL, rightLL], this.lineStyle);
    }
}