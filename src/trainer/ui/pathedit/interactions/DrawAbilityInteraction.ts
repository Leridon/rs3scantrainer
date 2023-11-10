import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import * as leaflet from "leaflet";
import {HostedMapData, move, MovementAbilities} from "lib/runescape/movement";
import {arrow, createStepGraphics} from "../../path_graphics";
import {Path} from "lib/runescape/pathing";
import {tilePolygon} from "../../polygon_helpers";
import {Vector2} from "lib/math";
import {GameMapKeyboardEvent, GameMapMouseEvent} from "lib/gamemap/MapEvents";
import InteractionTopControl from "../../map/InteractionTopControl";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import {Observable, observe} from "../../../../lib/reactive";

export class DrawAbilityInteraction extends ValueInteraction<Path.step_ability> {

    _overlay_position: TileCoordinates = null
    _possibility_overlay: leaflet.FeatureGroup = null

    _dive_target: TileCoordinates = null
    _dive_preview: leaflet.Layer = null

    _previewed: {
        from: TileCoordinates,
        to: TileCoordinates
    }

    private top_control: InteractionTopControl

    private start_position: Observable<TileCoordinates> = observe(null)
    private target: Observable<{ tile: TileCoordinates, forced: boolean }> = observe(null)
    private reverse: Observable<boolean> = observe(false)

    constructor(private ability: MovementAbilities.movement_ability) {
        super({})

        this.attachTopControl(this.top_control = new InteractionTopControl().setName(`Drawing ${ability}`))

        // TODO: observe combined for hover/reverse/start to update overlays. Don't use built in preview

        /*
        c("<div style='display: flex'></div>")
            .append(new Checkbox().on("changed", v => {
                this.reverse = v

                if (this._possibility_overlay) {
                    this._overlay_position = null
                    this._possibility_overlay.remove()
                    this._possibility_overlay = null
                    this.update_overlay(this.start_position)
                }
                if (this._dive_preview) {
                    this._dive_preview.remove()
                    this._dive_preview = null
                }
            }))
            .append(c().text("Reverse"))
            .appendTo(top_control.content)*/

        this.start_position.subscribe(() => this.updateInstructions(), true)
    }

    updateInstructions() {
        if (this.start_position.value()) {
            this.top_control.setContent(
                c("<div style='font-family: monospace; white-space:pre'></div>")
                    .append(c().text(`[Click] valid target tile to confirm.`))
                    .append(c().text(`[Shift + Click] to force any target tile.`))
            )
        } else {
            this.top_control.setContent(
                c("<div style='font-family: monospace; white-space:pre'></div>")
                    .append(c().text(`[Click] the origin tile of the ability.`))
            )
        }
    }

    setStartPosition(pos: TileCoordinates): this {
        this.start_position.set(pos)

        return this
    }

    private async update_overlay(p: TileCoordinates | null) {
        if (this.ability != "barge" && this.ability != "dive") return

        if (TileCoordinates.eq2(p, this._overlay_position)) return

        if (this._possibility_overlay) this._possibility_overlay.remove()

        this._overlay_position = p

        if (p == null) return

        this._possibility_overlay = leaflet.featureGroup()


        for (let dx = -10; dx <= 10; dx++) {
            for (let dy = -10; dy <= 10; dy++) {

                if (dx != 0 || dy != 0) {

                    let [from, to] = this.fromTo(p, move(p, {x: dx, y: dy}))

                    let works = (await MovementAbilities.dive(from, to))

                    tilePolygon(Vector2.add(p, {x: dx, y: dy}))
                        .setStyle({
                            fillOpacity: 0.5,
                            stroke: false,
                            fillColor: works ? "green" : "red"
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

        this._possibility_overlay.addTo(this)
    }

    private async update_preview(p: TileCoordinates) {
        if (TileCoordinates.eq2(p, this._dive_target)) return
        this._dive_target = p

        if (p == null) {
            this._dive_preview.remove()
            this._dive_preview = null
            return
        }

        let [from, to] = this.fromTo(this.start_position.value(), p)

        if (this._previewed
            && TileCoordinates.eq2(this._previewed.to, to)
            && TileCoordinates.eq2(this._previewed.from, from)) return

        let res = await MovementAbilities.generic(HostedMapData.get(), this.ability, from, to)

        this._previewed = {
            from: from,
            to: to,
        }

        if (this._dive_preview) {
            this._dive_preview.remove()
            this._dive_preview = null
        }

        if (res) {
            this._dive_preview = createStepGraphics({
                type: "ability",
                ability: this.ability,
                description: "",
                from: this._previewed.from,
                to: res.tile
            }).addTo(this)
        } else {
            this._dive_preview = arrow(this._previewed.from, this._previewed.to).setStyle({
                weight: 3,
                color: "red"
            }).addTo(this)
        }

    }

    private fromTo(a: TileCoordinates, b: TileCoordinates): [TileCoordinates, TileCoordinates] {
        if (this.reverse.value()) return [b, a]
        else return [a, b]
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(async () => {
            event.stopAllPropagation()

            let tile = event.tile()

            if (!this.start_position.value()) {
                this.start_position.set(tile)
            } else {
                let [from, to] = this.fromTo(this.start_position.value(), tile)

                if (event.original.shiftKey) {
                    this.commit({
                        type: "ability",
                        ability: this.ability,
                        description: `Use {{${this.ability}}}`,
                        from: from,
                        to: to
                    })
                } else {
                    let res = await MovementAbilities.generic(HostedMapData.get(), this.ability, from, to)

                    if (res) {
                        this.commit({
                            type: "ability",
                            ability: this.ability,
                            description: `Use {{${this.ability}}}`,
                            from: from,
                            to: res.tile
                        })
                    }
                }


            }
        })
    }

    eventHover(event: GameMapMouseEvent) {
        this.target.set({tile: event.tile(), forced: event.original.shiftKey})
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        super.eventKeyDown(event);

        // Update force when shift is added
    }
}