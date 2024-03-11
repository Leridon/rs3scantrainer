import {Rectangle, Vector2} from "lib/math";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {Transportation} from "../../../../lib/runescape/transportation";
import * as leaflet from "leaflet";
import {ShortcutViewLayer} from "../../shortcut_editing/ShortcutView";
import COLORS = ShortcutViewLayer.COLORS;
import {FloorLevels, ZoomLevels} from "../../../../lib/gamemap/ZoomLevels";
import {floor_t, TileRectangle} from "../../../../lib/runescape/coordinates";
import {GameMapContextMenuEvent} from "../../../../lib/gamemap/MapEvents";
import {Menu, MenuEntry} from "../../widgets/ContextMenu";
import {CursorType} from "../../../../lib/runescape/CursorType";
import {C} from "../../../../lib/ui/constructors";
import entity = C.entity;
import Widget from "../../../../lib/ui/Widget";
import Properties from "../../widgets/Properties";
import {direction} from "../../../../lib/runescape/movement";

export class RemoteEntityTransportTarget extends MapEntity {

    zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers
    floor_sensitivity_layers: FloorLevels<{ correct_level: boolean }>

    constructor(private config: RemoteEntityTransportTarget.Config) {
        super(config);

        if (!config.movement.fixed_target) debugger

        this.zoom_sensitivity_layers = new ZoomLevels<{ scale: number }>([
            {min: -100, value: {scale: 0.5}},
            {min: 1.5, value: {scale: 1}},
        ])

        this.floor_sensitivity_layers = new FloorLevels<{ correct_level: boolean }>([
            {floors: [config.movement.fixed_target.target.level], value: {correct_level: true}},
            {floors: floor_t.all, hidden_here: true, value: {correct_level: false}},
        ])
    }

    bounds(): Rectangle {
        return Rectangle.from(this.config.movement.fixed_target.target)
    }

    protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {
        const scale = (props.highlight ? 1.5 : (this.zoom_sensitivity_layers.get(props.zoom_group_index).value.scale))

        const circle = leaflet.circle(Vector2.toLatLong(this.config.movement.fixed_target.target), {
            color: COLORS.target_area,
            weight: 2,
            radius: scale * 0.4,
            fillOpacity: 0.1,
        }).addTo(this)

        return circle.getElement()
    }

    async contextMenu(event: GameMapContextMenuEvent): Promise<Menu | null> {

        event.addForEntity({
            type: "basic",
            text: "Jump to Origin",
            handler: () => {
                this.parent?.getMap()?.fitView(this.config.transport.clickable_area)
            }
        })

        return {
            type: "submenu",
            icon: CursorType.meta(this.config.action.cursor ?? "generic").icon_url,
            text: () => c().append("Target of ", entity(this.config.transport.entity)),
            children: []
        }
    }

    async renderTooltip(): Promise<{ content: Widget; interactive: boolean } | null> {
        let props = new Properties()

        props.header(c().append(`Target of `, entity(this.config.transport.entity)))

        return {
            content: props,
            interactive: false
        }

    }
}

export namespace RemoteEntityTransportTarget {
    import GeneralEntityTransportation = Transportation.GeneralEntityTransportation;
    import EntityAction = Transportation.EntityAction;
    import EntityActionMovement = Transportation.EntityActionMovement;
    export type Config = MapEntity.SetupOptions & {
        transport: GeneralEntityTransportation,
        action: EntityAction,
        movement: EntityActionMovement
    }
}