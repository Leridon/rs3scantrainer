import GameLayer from "../../../lib/gamemap/GameLayer";
import {new_shortcut_entity_action, Shortcuts} from "../../../lib/runescape/shortcuts";
import * as leaflet from "leaflet";
import {boxPolygon, boxPolygon2} from "../polygon_helpers";
import {Constants} from "../../constants";
import {RenderingUtility} from "../map/RenderingUtility";
import {Rectangle} from "../../../lib/math/Vector";
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import {LeafletEventHandlerFn} from "leaflet";

export class ShortcutViewLayer extends GameLayer {
    previews: ShortcutViewLayer.ShortcutPolygon[]

    data: Shortcuts.new_shortcut[] = []

    constructor() {
        super();
    }

    public setValue(data: Shortcuts.new_shortcut[]): this {
        this.data = data

        this.render()

        return this
    }

    private render() {
        this.clearLayers()

        this.previews = this.data.map(s => new ShortcutViewLayer.ShortcutPolygon().setValue(s).addTo(this))
    }

    getView(s: Shortcuts.new_shortcut): ShortcutViewLayer.ShortcutPolygon {
        return this.previews.find(p => p.value == s)
    }
}

export namespace ShortcutViewLayer {
    import InteractionType = Path.InteractionType;
    export type ShortcutPolygonConfig = {
        draw_clickable: boolean,
        hidden_actions: Shortcuts.new_shortcut_entity_action[]
    }

    export class ShortcutPolygon extends OpacityGroup {
        public clickable: OpacityGroup
        public action_areas: OpacityGroup[]

        public value: Shortcuts.new_shortcut = null
        private config: ShortcutPolygonConfig = {
            draw_clickable: true,
            hidden_actions: []
        }

        constructor() {
            super();
        }

        public setValue(v: Shortcuts.new_shortcut): this {
            this.value = v

            this.render()

            return this
        }

        setConfig(config: ShortcutPolygonConfig): this {
            this.config = config
            this.render()
            return this
        }

        updateConfig(f: (_: ShortcutPolygonConfig) => void): this {
            f(this.config)

            this.render()

            return this
        }

        public render() {
            this.clearLayers()

            if (this.value) {
                let shortcut = Shortcuts.new_shortcut.normalize(this.value)

                this.action_areas = shortcut.actions
                    .filter(a => !this.config.hidden_actions.includes(a))
                    .map(action => render_interactive_area(action.interactive_area).addTo(this))

                if (this.config.draw_clickable) {
                    this.clickable = render_clickable(shortcut.clickable_area, shortcut.actions[0]?.cursor || "generic").addTo(this)
                }
            }
        }
    }

    export function render_clickable(area: Rectangle, cursor: InteractionType): OpacityGroup {
        return new OpacityGroup()
            .addLayer(leaflet.polygon(boxPolygon2(area), {
                color: Constants.colors.shortcuts.clickable_area,
                fillColor: Constants.colors.shortcuts.clickable_area,
                interactive: false,
            }))
            .addLayer(RenderingUtility.interactionMarker(Rectangle.center(area, false), cursor))
    }

    export function render_interactive_area(area: Rectangle): OpacityGroup {
        return new OpacityGroup().addLayer(boxPolygon(area).setStyle({
            color: Constants.colors.shortcuts.interactive_area,
            fillColor: Constants.colors.shortcuts.interactive_area,
            interactive: false,
        }))
    }
}