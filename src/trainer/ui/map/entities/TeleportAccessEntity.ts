import {Rectangle, Vector2} from "lib/math";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {Transportation} from "../../../../lib/runescape/transportation";
import TeleportAccess = Transportation.TeleportAccess;
import {FloorLevels, ZoomLevels} from "../../../../lib/gamemap/ZoomLevels";
import {floor_t} from "../../../../lib/runescape/coordinates";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {GameMapContextMenuEvent} from "../../../../lib/gamemap/MapEvents";
import {MenuEntry} from "../../widgets/ContextMenu";
import {C} from "../../../../lib/ui/constructors";
import entity = C.entity;
import {CursorType} from "../../../../lib/runescape/CursorType";
import * as leaflet from "leaflet";
import {areaPolygon} from "../../polygon_helpers";
import {ShortcutViewLayer} from "../../shortcut_editing/ShortcutView";
import COLORS = ShortcutViewLayer.COLORS;
import TeleportGroup = Transportation.TeleportGroup;
import {deps} from "../../../dependencies";
import Widget from "../../../../lib/ui/Widget";
import Properties from "../../widgets/Properties";
import {direction} from "../../../../lib/runescape/movement";
import vbox = C.vbox;
import default_interactive_area = Transportation.EntityTransportation.default_interactive_area;

export class TeleportAccessEntity extends MapEntity {

    zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers
    floor_sensitivity_layers: FloorLevels<{ correct_level: boolean }>

    bounds(): Rectangle {
        return TileArea.toRect(this.config.access.clickable_area)
    }

    protected async render_implementation(options: MapEntity.RenderProps): Promise<Element> {
        const teleport = this.config.teleport;
        const access = this.config.access

        const scale = (options.highlight ? 1.5 : this.zoom_sensitivity_layers.get(options.zoom_group_index).value.scale)

        const marker = leaflet.marker(Vector2.toLatLong(Rectangle.center(TileArea.toRect(access.clickable_area), true)), {
            icon: leaflet.icon({
                iconUrl: CursorType.meta(access.cursor ?? "generic").icon_url,
                iconSize: CursorType.iconSize(scale),
                iconAnchor: CursorType.iconAnchor(scale, true),
            }),
            riseOnHover: true,
            interactive: true
        }).addTo(this);

        if (options.highlight) {
            areaPolygon(access.interactive_area ?? default_interactive_area(TileArea.toRect(access.clickable_area))).setStyle({
                color: COLORS.interactive_area,
                fillColor: COLORS.interactive_area,
                interactive: true,
                fillOpacity: 0.1,
                weight: 2
            }).addTo(this)
        }

        return marker.getElement()
    }

    constructor(private config: TeleportAccessEntity.Config) {
        super({interactive: true, highlightable: true});

        this.zoom_sensitivity_layers = new ZoomLevels<{ scale: number }>([
            {min: -100, value: {scale: 0.5}},
            {min: 1.5, value: {scale: 1}},
        ])

        this.floor_sensitivity_layers = new FloorLevels<{ correct_level: boolean }>([
            {floors: [config.access.clickable_area.origin.level], value: {correct_level: true}},
            {floors: floor_t.all, hidden_here: true, value: {correct_level: false}},
        ])
    }


    async contextMenu(event: GameMapContextMenuEvent): Promise<(MenuEntry & { type: "submenu" }) | null> {
        const teleport = this.config.teleport;
        const access = this.config.access

        event.addForEntity({
            type: "submenu",
            text: "Jump to Target",
            children: teleport.spots.map(spot => {

                const s = new TeleportGroup.Spot(teleport, spot, access, deps().app.teleport_settings)

                return {
                    type: "basic",
                    icon: `assets/icons/teleports/${s.image().url}`,
                    text: s.code() ? `${spot.code}: ${spot.name}` : spot.name,
                    handler: () => {
                        this.parent?.getMap()?.fitView(TileArea.toRect(spot.target))
                    }
                }
            })
        })

        return {
            type: "submenu",
            icon: CursorType.meta(access.cursor ?? "generic").icon_url,
            text: entity(access.name),
            children: []
        }
    }

    async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        let props = new Properties()

        const teleport = this.config.teleport
        const access = this.config.access

        props.header(c().append(`Access to ${teleport.name} via `, entity(access.name)))

        props.named("Targets", vbox(
            ...teleport.spots.map(spot => {
                return c().text(spot.name)
            })
        ))

        return {
            content: props,
            interactive: false
        }
    }


}

export namespace TeleportAccessEntity {
    export type Config = MapEntity.SetupOptions & {
        teleport: Transportation.TeleportGroup,
        access: TeleportAccess & { type: "entity" }
    }
}