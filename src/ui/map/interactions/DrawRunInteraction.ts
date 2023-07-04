import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {PathFinder} from "../../../model/movement";
import {step_run} from "../../../model/pathing";
import LightButton from "../../widgets/LightButton";
import {createStepGraphics} from "../path_graphics";

export default class DrawRunInteraction extends LayerInteraction<ActiveLayer, {
    "done": step_run,
    "cancelled": null
}> {
    pathfinding_state: PathFinder.state = null

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

    last_previewed_to: MapCoordinate = null

    cancel() {
        this.layer.getMap().map.off(this._maphooks)

        if (this._preview) this._preview.remove()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    setStartPosition(pos: MapCoordinate): this {
        if (pos) this.pathfinding_state = PathFinder.init_djikstra(pos)
        else this.pathfinding_state = null

        this.update_preview(null)
        return this
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this.pathfinding_state) {
                this.setStartPosition(tile)
                await this.update_preview(null)
            } else {
                let path = await PathFinder.find(this.pathfinding_state, tile)

                if (path) {
                    this.events.emit("done", {
                        type: "run",
                        waypoints: path,
                        description: `Run to ${tile.x} | ${tile.y}`
                    })

                    this.deactivate()
                    return
                }
            }
        },

        "mousemove": (e: LeafletMouseEvent) => {
            let tile = this.layer.getMap().tileFromMouseEvent(e)

            this.update_preview(tile)
        }
    }

    _preview: leaflet.Layer = null

    async update_preview(to: MapCoordinate) {
        if (to == null || !this.pathfinding_state || !MapCoordinate.eq2(this.last_previewed_to, to)) {
            if (this._preview) {
                this._preview.remove()
                this._preview = null
            }
        }

        if (this.pathfinding_state && to && !MapCoordinate.eq2(this.last_previewed_to, to)) {
            let path = await PathFinder.find(this.pathfinding_state, to)

            if (this._preview) {
                this._preview.remove()
                this._preview = null
            }

            if (path) {
                this._preview = createStepGraphics({
                    type: "run",
                    description: "",
                    waypoints: path
                }).addTo(this.layer)
            }
        }

        this.last_previewed_to = to

        this.reset_button.setVisible(!!this.pathfinding_state)

        //
        if (!this.pathfinding_state) {
            this.instruction_div.text(`Click where you want to start running.`)
        } else {
            this.instruction_div.html(`Running from ${this.pathfinding_state.start.x} | ${this.pathfinding_state.start.y}.<br> Click where to run to.`)
        }

        //let path = await PathFinder.pathFinder(HostedMapData.get(), this._start, this._to)
        /*let path = await PathFinder.find(PathFinder.init_djikstra(this._start), this._to)

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
       }*/
    }
}