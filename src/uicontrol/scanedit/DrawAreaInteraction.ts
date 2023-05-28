import {LayerInteraction} from "../map/activeLayer";
import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {Box, MapCoordinate} from "../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {ScanEditLayer} from "../map/layers/ScanLayer";

export default class DrawAreaInteraction extends LayerInteraction<ScanEditLayer> {
    events = new TypedEmitter<{
        "changed": Box,
        "done": Box
        "cancelled": Box
    }>()

    dragstart: MapCoordinate = null
    last_area: Box = null

    constructor(layer: ScanEditLayer) {
        super(layer);
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
        this.layer.getMap().map.dragging.enable()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
        this.layer.getMap().map.dragging.disable()
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "mousedown": (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            this.dragstart = this.layer.getMap().tileFromMouseEvent(e)

            this.last_area = {topleft: this.dragstart, botright: this.dragstart}

            this.events.emit("changed", this.last_area)
        },

        "mousemove": (e: LeafletMouseEvent) => {
            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                this.last_area =
                    {
                        topleft: {
                            x: Math.min(this.dragstart.x, now.x),
                            y: Math.max(this.dragstart.y, now.y),
                        },
                        botright: {
                            x: Math.max(this.dragstart.x, now.x),
                            y: Math.min(this.dragstart.y, now.y),
                        }
                    }

                this.events.emit("changed", this.last_area)
            }
        },

        "mouseup": (e: LeafletMouseEvent) => {
            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                this.events.emit("done", this.last_area)

                this.layer.cancelInteraction()
            }
        }
    }

}

