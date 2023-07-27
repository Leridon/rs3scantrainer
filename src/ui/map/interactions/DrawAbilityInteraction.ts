import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import {MapCoordinate, tilePolygon, Vector2} from "../../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {HostedMapData, move, MovementAbilities} from "../../../model/movement";
import LightButton from "../../widgets/LightButton";
import {arrow, createStepGraphics} from "../path_graphics";
import {step_ability} from "../../../model/pathing";
import {capitalize} from "lodash";

export class DrawAbilityInteraction extends LayerInteraction<ActiveLayer, {
    "done": step_ability,
    "cancelled": null
}> {
    private start_position: MapCoordinate = null

    _overlay_position: MapCoordinate = null
    _possibility_overlay: leaflet.FeatureGroup = null

    _dive_target: MapCoordinate = null
    _dive_land_up: MapCoordinate = null
    _dive_preview: leaflet.Layer = null

    instruction_div: JQuery
    reset_button: LightButton
    cancel_button: LightButton

    constructor(layer: ActiveLayer, private ability: MovementAbilities.movement_ability) {
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

        this.updateInstructions()
    }

    setStartPosition(pos: MapCoordinate): this {
        this.start_position = pos

        this.update_overlay(pos)
        this.update_preview(null)
        this.updateInstructions()

        return this
    }

    private async update_overlay(p: MapCoordinate | null) {
        if (this.ability != "barge" && this.ability != "dive") return

        if (MapCoordinate.eq2(p, this._overlay_position)) return

        if (this._possibility_overlay) this._possibility_overlay.remove()

        this._overlay_position = p

        if (p == null) return

        this._possibility_overlay = leaflet.featureGroup()

        for (let dx = -10; dx <= 10; dx++) {
            for (let dy = -10; dy <= 10; dy++) {

                if (dx != 0 || dy != 0) {
                    tilePolygon(Vector2.add(p, {x: dx, y: dy}))
                        .setStyle({
                            fillOpacity: 0.5,
                            stroke: false,
                            fillColor: (await MovementAbilities.dive(HostedMapData.get(), p, move(p, {x: dx, y: dy}))) ? "green" : "red"
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

    private async update_preview(p: MapCoordinate) {
        if (MapCoordinate.eq2(p, this._dive_target)) return
        this._dive_target = p

        if (p == null) {
            this._dive_preview.remove()
            this._dive_preview = null
            return
        }

        let res = await MovementAbilities.generic(HostedMapData.get(), this.ability, this.start_position, p)

        if (res != null && MapCoordinate.eq2(this._dive_land_up, res?.tile)) return
        this._dive_land_up = res?.tile

        if (this._dive_preview) {
            this._dive_preview.remove()
            this._dive_preview = null
        }

        if (!this.start_position || !p) return

        if (res) {
            this._dive_preview = createStepGraphics({
                type: "ability",
                ability: this.ability,
                description: "",
                from: this.start_position,
                to: res.tile
            }).addTo(this.layer)
        } else {
            this._dive_preview = arrow(this.start_position, p).setStyle({
                weight: 3,
                color: "red"
            }).addTo(this.layer)
        }

    }

    updateInstructions() {
        this.reset_button.setVisible(!!this.start_position)

        if (!this.start_position) {
            this.instruction_div.text(`Click the start location of the ${this.ability}.`)
        } else {
            this.instruction_div.html(`${capitalize(this.ability)} from ${this.start_position.x} | ${this.start_position.y}.<br> Click where the ability is targeted.`)
        }
    }

    cancel() {
        if (this._possibility_overlay) this._possibility_overlay.remove()
        if (this._dive_preview) this._dive_preview.remove()

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
                await this.update_overlay(this.start_position)
                this.updateInstructions()
            } else {
                let res = await MovementAbilities.generic(HostedMapData.get(), this.ability, this.start_position, tile)

                if (res) {
                    this.events.emit("done", {
                        type: "ability",
                        ability: this.ability,
                        description: `Use {{${this.ability}}}`,
                        from: this.start_position,
                        to: res.tile
                    })

                    this.deactivate()
                }
            }
        },

        "mousemove": async (e: LeafletMouseEvent) => {
            let tile = this.layer.getMap().tileFromMouseEvent(e)

            if (!this.start_position) this.update_overlay(tile)
            else this.update_preview(tile)
        },
    }
}