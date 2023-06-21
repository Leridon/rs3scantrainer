import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate, tilePolygon, Vector2} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {dive, HostedMapData, move, PlayerPosition} from "../../../model/movement";
import LightButton from "../../widgets/LightButton";

export class DrawDiveInteraction extends LayerInteraction<ActiveLayer> {
    _overlay_position: MapCoordinate = null
    _overlay: leaflet.FeatureGroup = null

    instruction_div: JQuery
    cancel_button: LightButton

    events = new TypedEmitter<{
        "done": [MapCoordinate, PlayerPosition],
        "cancelled": null
    }>()

    constructor(layer: ActiveLayer, private start_position: MapCoordinate | null) {
        super(layer);

        this.instruction_div = $("<div>").appendTo(this.getTopControl().container)
        this.cancel_button = new LightButton("Cancel")
            .on("click", () => {
                this.events.emit("cancelled", null)
                this.deactivate()
            })
            .appendTo($("<div style='text-align: center'>").appendTo(this.getTopControl().container))

        if (start_position) this.create_overlay(start_position)

        this.updateInstructions()
    }

    private async create_overlay(p: MapCoordinate) {
        if (this._overlay_position && MapCoordinate.eq(p, this._overlay_position)) return

        if (this._overlay) this._overlay.remove()

        this._overlay_position = p

        this._overlay = leaflet.featureGroup()

        for (let dx = -10; dx <= 10; dx++) {
            for (let dy = -10; dy <= 10; dy++) {

                tilePolygon(Vector2.add(p, {x: dx, y: dy}))
                    .setStyle({
                        fillOpacity: 0.5,
                        stroke: false,
                        fillColor: (await dive(HostedMapData.get(), p, move(p, {x: dx, y: dy}))) ? "green" : "red"
                    })
                    .addTo(this._overlay)
            }
        }

        this._overlay.addTo(this.layer)
    }

    updateInstructions() {
        if (!this.start_position) this.instruction_div.text("Click the start location of the dive")
        else this.instruction_div.text("Click where the dive should land")
    }

    cancel() {
        if (this._overlay) this._overlay.remove()

        this.layer.getMap().map.off(this._maphooks)
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": async (e: LeafletMouseEvent) => {
            // Capture and consume the click event so it does not get sent to the default interaction

            console.log("Click")

            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this.start_position) {
                this.start_position = tile
                this.create_overlay(this.start_position)
                this.updateInstructions()
            } else {
                let res = await dive(HostedMapData.get(), this.start_position, tile)

                if (res) {
                    this.events.emit("done", [this.start_position, res])

                    this.deactivate()
                }

            }
        },

        "mousemove": async (e: LeafletMouseEvent) => {
            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this.start_position) {
                this.create_overlay(tile)
            } else {
                let res = await dive(HostedMapData.get(), this.start_position, tile)


            }
        },
    }
}