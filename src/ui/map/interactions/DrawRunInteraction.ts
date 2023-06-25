import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {HostedMapData, PathFinder} from "../../../model/movement";
import {createStepGraphics} from "../path_graphics";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {step_run} from "../../../model/pathing";

export default class DrawRunInteraction extends LayerInteraction<ActiveLayer> {
    events = new TypedEmitter<{
        "done": step_run
    }>()

    constructor(layer: ActiveLayer) {
        super(layer);
    }

    _start: MapCoordinate = null
    _to: MapCoordinate = null

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this._start) this._start = tile
            else if (!this._to) {
                this._to = tile
                this.done()
            }

            this.update()
        },
    }

    _preview: leaflet.Layer = null

    private async done() {
        let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)

        this.events.emit("done", {
            type: "run",
            waypoints: path
        })
    }


    async update() {
        let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)

        if (this._preview) {
            this._preview.remove()
            this._preview = null
        }

        if (path) {
            this._preview = createStepGraphics({
                type: "run",
                waypoints: path
            }).addTo(this.layer)
        }
    }
}