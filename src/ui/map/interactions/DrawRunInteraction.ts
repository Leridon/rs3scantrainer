import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {HostedMapData, PathFinder} from "../../../model/movement";
import {createStepGraphics} from "../path_graphics";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {step_run} from "../../../model/pathing";
import LightButton from "../../widgets/LightButton";

export default class DrawRunInteraction extends LayerInteraction<ActiveLayer> {
    /* TODO:
        - Proper preview of tiles
        - Live preview of path? Caching of pathfinding needed, ideally limit pathlength
     */

    events = new TypedEmitter<{
        "done": step_run,
        "cancelled": null
    }>()

    instruction_div: JQuery
    reset_button: LightButton
    cancel_button: LightButton

    constructor(layer: ActiveLayer) {
        super(layer)

        this.instruction_div = $("<div style='text-align: center'>").appendTo(this.getTopControl().container)

        let control_row = $("<div style='text-align: center'>").appendTo(this.getTopControl().container)

        this.cancel_button = new LightButton("Cancel")
            .on("click", () => {
                this.events.emit("cancelled", null)
                this.deactivate()
            })
            .appendTo(control_row)

        this.reset_button = new LightButton("Reset Start")
            .on("click", () => this.setStartPosition(null))
            .appendTo(control_row)
    }

    _start: MapCoordinate = null
    _to: MapCoordinate = null

    cancel() {
        this.layer.getMap().map.off(this._maphooks)

        if (this._preview) this._preview.remove()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    setStartPosition(pos: MapCoordinate) {
        this._start = pos

        this.update()
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this._start) this._start = tile
            else if (!this._to) {
                this._to = tile
                await this.done()
                return
            }

            await this.update()
        },
    }

    _preview: leaflet.Layer = null

    private async done() {
        let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)

        this.events.emit("done", {
            type: "run",
            waypoints: path,
            description: `Run to ${this._to.x} | ${this._to.y}`
        })

        this.deactivate()
    }

    async update() {
        this.reset_button.setVisible(!!this._start)

        if (!this._start) {
            this.instruction_div.text(`Click where you want to start running.`)
        } else {
            this.instruction_div.html(`Running from ${this._start.x} | ${this._start.y}.<br> Click where to run to.`)
        }

        let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)

        if (this._preview) {
            this._preview.remove()
            this._preview = null
        }

        if (path) {
            this._preview = createStepGraphics({
                type: "run",
                waypoints: path,
                description: ""
            }).addTo(this.layer)
        }
    }
}