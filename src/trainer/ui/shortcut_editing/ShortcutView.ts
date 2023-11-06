import GameLayer from "lib/gamemap/GameLayer";
import {Shortcuts} from "lib/runescape/shortcuts";
import * as leaflet from "leaflet";
import {boxPolygon, boxPolygon2} from "../polygon_helpers";
import {RenderingUtility} from "../map/RenderingUtility";
import {Rectangle, Vector2} from "lib/math";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {Path} from "lib/runescape/pathing";
import {arrow} from "../path_graphics";
import {Observable, ObservableArray, observe} from "../../../lib/reactive";

export class ShortcutViewLayer extends GameLayer {
    previews: ShortcutViewLayer.ShortcutPolygon[]

    constructor(public data: ObservableArray<Shortcuts.shortcut>) {
        super();


        // TODO: Reuse existing polygons and only create new ones for actually new elements
        data.array_changed.filtered(s => s.set).on(() => this.render())

        this.render()
    }

    private render() {
        this.clearLayers()

        this.previews = this.data.value().map(s => new ShortcutViewLayer.ShortcutPolygon(s).addTo(this))
    }

    getView(s: ObservableArray.ObservableArrayValue<Shortcuts.shortcut>): ShortcutViewLayer.ShortcutPolygon {
        return this.previews.find(p => p.data == s)
    }
}

export namespace ShortcutViewLayer {
    export const COLORS = {
        interactive_area: "#FFFF00",
        clickable_area: "#35540f"
    }

    import InteractionType = Path.InteractionType;

    export class ShortcutPolygon extends OpacityGroup {
        public clickable: OpacityGroup
        public action_areas: OpacityGroup[]

        public config = observe({
            draw_clickable: true,
            hidden_actions: []
        })

        constructor(public data: Observable<Shortcuts.shortcut>) {
            super();

            this.config.subscribe(() => this.render())
            data.subscribe(() => this.render())

            if (data instanceof ObservableArray.ObservableArrayValue<any>) {
                data.removed.on(() => this.remove())
            }

            this.render()
        }

        public render() {
            this.clearLayers()

            let shortcut = Shortcuts.normalize(this.data.value())

            this.action_areas = shortcut.actions
                .filter(a => !this.config.value().hidden_actions.includes(a))
                .map(action => render_interactive_area(action.interactive_area).addTo(this))

            if (this.config.value().draw_clickable) {
                this.clickable = render_clickable(shortcut.clickable_area, shortcut.actions[0]?.cursor || "generic").addTo(this)
            }

        }
    }

    export function render_clickable(area: Rectangle, cursor: InteractionType): OpacityGroup {
        return new OpacityGroup()
            .addLayer(leaflet.polygon(boxPolygon2(area), {
                color: COLORS.clickable_area,
                fillColor: COLORS.clickable_area,
                interactive: false,
            }))
            .addLayer(RenderingUtility.interactionMarker(Rectangle.center(area, false), cursor))
    }

    export function render_interactive_area(area: Rectangle): OpacityGroup {
        return new OpacityGroup().addLayer(boxPolygon(area).setStyle({
            color: COLORS.interactive_area,
            fillColor: COLORS.interactive_area,
            interactive: false,
        }))
    }

    export function render_transport_arrow(from: Vector2, to: Vector2): OpacityGroup {
        return new OpacityGroup().addLayer(arrow(from, to).setStyle({
            color: COLORS.clickable_area
        }))
    }
}