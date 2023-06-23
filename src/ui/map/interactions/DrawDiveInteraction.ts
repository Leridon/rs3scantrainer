import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate, tilePolygon, Vector2} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {dive, HostedMapData, move, PlayerPosition} from "../../../model/movement";
import LightButton from "../../widgets/LightButton";
import {arrow, createStepGraphics} from "../path_graphics";

export class DrawDiveInteraction extends LayerInteraction<ActiveLayer> {
    _overlay_position: MapCoordinate = null
    _possibility_overlay: leaflet.FeatureGroup = null

    _dive_target: MapCoordinate = null
    _dive_land_up: MapCoordinate = null
    _dive_polygon: leaflet.Layer = null

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

        if (start_position) this.update_overlay(start_position)

        this.updateInstructions()
    }

    private async update_overlay(p: MapCoordinate) {
        if (this._overlay_position && MapCoordinate.eq(p, this._overlay_position)) return

        if (this._possibility_overlay) this._possibility_overlay.remove()

        this._overlay_position = p

        this._possibility_overlay = leaflet.featureGroup()

        for (let dx = -10; dx <= 10; dx++) {
            for (let dy = -10; dy <= 10; dy++) {

                if (dx != 0 || dy != 0) {
                    tilePolygon(Vector2.add(p, {x: dx, y: dy}))
                        .setStyle({
                            fillOpacity: 0.5,
                            stroke: false,
                            fillColor: (await dive(HostedMapData.get(), p, move(p, {x: dx, y: dy}))) ? "green" : "red"
                        })
                        .addTo(this._possibility_overlay)
                }
            }
        }

        tilePolygon(p)
            .setStyle({
                fillOpacity: 0.5,
                stroke: false,
                fillColor: "blue",
            })
            .addTo(this._possibility_overlay)

        this._possibility_overlay.addTo(this.layer)
    }

    private async update_dive(p: MapCoordinate) {
        if (this._dive_target && MapCoordinate.eq(p, this._dive_target)) return
        this._dive_target = p

        let res = await dive(HostedMapData.get(), this.start_position, p)

        if (res != null && MapCoordinate.eq2(this._dive_land_up, res?.tile)) return
        this._dive_land_up = res?.tile

        if (this._dive_polygon) {
            this._dive_polygon.remove()
            this._dive_polygon = null
        }

        if (!this.start_position) return

        if (res) {
            this._dive_polygon = createStepGraphics({
                type: "ability",
                ability: "dive",
                from: this.start_position,
                to: res.tile
            }).addTo(this.layer)
        } else {
            this._dive_polygon = arrow(this.start_position, p).setStyle({
                weight: 3,
                color: "red"
            }).addTo(this.layer)
        }

    }

    updateInstructions() {
        if (!this.start_position) this.instruction_div.text("Click the start location of the dive")
        else this.instruction_div.text("Click where the dive should land")
    }

    cancel() {
        if (this._possibility_overlay) this._possibility_overlay.remove()
        if (this._dive_polygon) this._dive_polygon.remove()

        this.layer.getMap().map.off(this._maphooks)
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this.start_position) {
                this.start_position = tile
                this.update_overlay(this.start_position)
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

            if (!this.start_position) this.update_overlay(tile)
            else this.update_dive(tile)
        },
    }
}