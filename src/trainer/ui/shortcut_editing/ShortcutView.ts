import GameLayer from "lib/gamemap/GameLayer";
import {Shortcuts} from "lib/runescape/shortcuts";
import * as leaflet from "leaflet";
import {boxPolygon, boxPolygon2} from "../polygon_helpers";
import {RenderingUtility} from "../map/RenderingUtility";
import {Rectangle, Vector2} from "lib/math";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {arrow} from "../path_graphics";
import {Observable, ObservableArray, observe} from "../../../lib/reactive";
import {floor_t, TileRectangle} from "../../../lib/runescape/coordinates";
import {GameMap} from "../../../lib/gamemap/GameMap";
import {GameMapMouseEvent} from "../../../lib/gamemap/MapEvents";
import {util} from "../../../lib/util/util";
import profile = util.profile;

export class ShortcutViewLayer extends GameLayer {
    constructor(public data: ObservableArray<Shortcuts.shortcut>, private simplified: boolean = false) {
        super();

        data.element_added.on(s => {
            new ShortcutViewLayer.ShortcutPolygon(s, {type: "regular", draw_arrows: true, from_floor: this.getMap().floor.value()}).addTo(this)
        })
    }

    onAdd(map: GameMap): this {
        map.floor.subscribe((floor) => {
            this.eachLayer((l: ShortcutViewLayer.ShortcutPolygon) => {
                l.style.update2(s => s.from_floor = floor)
            })
        }, false, (h) => this.handler_pool.bind(h))

        super.onAdd(map);

        this.renderAll()

        return this
    }

    eventHover(event: GameMapMouseEvent) {

        profile(() => {
            this.eachLayer((l: ShortcutViewLayer.ShortcutPolygon) => {
                l.style.update2(s => {
                    let shortcut = l.data.value()
                    s.draw_arrows = shortcut.type == "entity" &&
                        (TileRectangle.contains(shortcut.clickable_area, event.tile())
                            || shortcut.actions.some(a => TileRectangle.contains(a.interactive_area, event.tile()))
                        )
                })
            })
        }, "hovering")

    }

    private renderAll() {
        this.clearLayers()

        this.data.value().map(s => new ShortcutViewLayer.ShortcutPolygon(s, {
            type: this.simplified ? "simplified" : "regular",
            draw_arrows: false,
            from_floor: this.getMap().floor.value()
        }).addTo(this))
    }

    getView(s: ObservableArray.ObservableArrayValue<Shortcuts.shortcut>): ShortcutViewLayer.ShortcutPolygon {
        return this.getLayers().find(v => (v instanceof ShortcutViewLayer.ShortcutPolygon) && v.data == s) as ShortcutViewLayer.ShortcutPolygon
    }
}

export namespace ShortcutViewLayer {
    export const COLORS = {
        interactive_area: "#72bb46",
        target_area: "#cca927",
        clickable_area: "#00ffff"
    }

    export class ShortcutPolygon extends OpacityGroup {
        // Components:
        // - Marker             | When any action on current floor (use that marker)
        // - Click-Area         | When any action on current floor
        //   (Per action:)
        // - Interactive Area   | When on current floor
        // - Target             | When on current floor
        // - Arrows             | Hover only and either area or target on current floor

        // Arrows: on Hover
        // Scale marker on zoom
        // Regular:
        //      - Marker, click area
        //      - Target tiles: Circle
        public style = observe<ShortcutPolygon.style_t>(null).equality((a, b) => a?.type == b?.type && a?.draw_arrows == b?.draw_arrows && a?.from_floor == b?.from_floor)

        constructor(public data: Observable<Shortcuts.shortcut>, style: ShortcutPolygon.style_t = {
            type: "regular",
            draw_arrows: true,
            from_floor: null
        }) {
            super();

            data.subscribe(() => this.render())

            if (data instanceof ObservableArray.ObservableArrayValue<any>) {
                data.removed.on(() => this.remove())
            }

            this.style.set(style)

            this.style.subscribe((s) => {
                this.render()
            }, true)

            this.setStyle({
                interactive: true,
            })
        }

        public render() {
            this.clearLayers()

            let all_floors = this.style.value().from_floor == null

            let shortcut = Shortcuts.normalize(this.data.value())

            let index_of_first_action_on_floor = shortcut.actions.findIndex(a => a.interactive_area.level == this.style.value().from_floor)
            let render_main = all_floors || (index_of_first_action_on_floor >= 0)

            for (let action of shortcut.actions) {

                if (all_floors || action.interactive_area.level == this.style.value().from_floor) {

                    boxPolygon(action.interactive_area).setStyle({
                        color: COLORS.interactive_area,
                        fillColor: COLORS.interactive_area,
                        interactive: true
                    }).addTo(this)
                }

                switch (action.movement.type) {
                    case "offset":

                        if (this.style.value().draw_arrows) {

                            let center = TileRectangle.center(action.interactive_area, true)
                            let target = Vector2.add(center, action.movement.offset)

                            render_transport_arrow(center, target, action.movement.offset.level).addTo(this)
                        }

                        break;

                    case "fixed":
                        if (all_floors || action.movement.target.level == this.style.value().from_floor) {
                            leaflet.circle(Vector2.toLatLong(action.movement.target), {
                                color: COLORS.target_area,
                                weight: 4,
                                dashArray: '10, 10',
                                radius: 0.5
                            }).addTo(this)
                        }

                        if (this.style.value().draw_arrows) {

                            let center = TileRectangle.center(action.interactive_area, false)
                            let target = action.movement.target

                            render_transport_arrow(center, target, target.level - center.level).addTo(this)
                            break;
                        }

                        break
                }

            }

            if (render_main) {
                let i = index_of_first_action_on_floor >= 0 ? index_of_first_action_on_floor : 0

                RenderingUtility.interactionMarker(Rectangle.center(shortcut.clickable_area, false), shortcut.actions[i]?.cursor || "generic", this.style.value().type == "simplified")
                    .addTo(this)

                leaflet.polygon(boxPolygon2(shortcut.clickable_area), {
                    color: COLORS.clickable_area,
                    fillColor: COLORS.clickable_area,
                    interactive: true
                }).addTo(this)
            }

            if (this.style.value().type == "simplified") {
                this.setStyle({
                    className: "ctr-inactive-overlay"
                })
            }
        }
    }

    export namespace ShortcutPolygon {
        export type style_t = {
            type: "regular" | "simplified",
            draw_arrows: boolean,
            from_floor: floor_t
        }
    }

    export function render_transport_arrow(from: Vector2, to: Vector2, level_offset: number): OpacityGroup {
        return new OpacityGroup().addLayer(arrow(from, to).setStyle({
            color: COLORS.interactive_area,
            weight: 4,
            dashArray: '10, 10'
        })).setStyle({interactive: true})

        // TODO: Level icons
    }
}