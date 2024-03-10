import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {FloorLevels, ZoomLevels} from "../../../../lib/gamemap/ZoomLevels";
import {Transportation} from "../../../../lib/runescape/transportation";
import {Rectangle, Vector2} from "../../../../lib/math";
import {OpacityGroup} from "../../../../lib/gamemap/layers/OpacityLayer";
import {arrow} from "../../path_graphics";
import * as leaflet from "leaflet";
import {CursorType} from "../../../../lib/runescape/CursorType";
import {areaPolygon, boxPolygon2} from "../../polygon_helpers";
import {floor_t, TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import Widget from "../../../../lib/ui/Widget";
import Properties from "../../widgets/Properties";
import {C} from "../../../../lib/ui/constructors";
import {direction} from "../../../../lib/runescape/movement";
import default_interactive_area = Transportation.EntityTransportation.default_interactive_area;
import GeneralEntityTransportation = Transportation.GeneralEntityTransportation;
import EntityTransportation = Transportation.EntityTransportation;

export class EntityTransportEntity extends MapEntity {
    private normalized_shortcut: GeneralEntityTransportation

    constructor(public config: EntityTransportEntity.Config) {
        super(config)

        this.normalized_shortcut = Transportation.normalize(this.config.shortcut)

        if(EntityTransportation.isLocal(this.normalized_shortcut)) {
            this.zoom_sensitivity_layers = MapEntity.default_local_zoom_scale_layers
        } else {
            this.zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers
        }

        this.floor_sensitivity_layers = new FloorLevels([
            {floors: [this.normalized_shortcut.clickable_area.level], value: {}},
            {floors: floor_t.all, hidden_here: true, value: {}},
        ])
    }

    bounds(): Rectangle {
        return Transportation.bounds(this.config.shortcut)
    }

    async render_implementation(options: MapEntity.RenderProps): Promise<Element> {
        const shortcut = this.normalized_shortcut

        const COLORS = {
            interactive_area: "#72bb46",
            target_area: "#cca927",
            clickable_area: "#00ffff"
        }

        function render_transport_arrow(from: Vector2, to: Vector2, level_offset: number): OpacityGroup {
            let group = new OpacityGroup().addLayer(arrow(from, to).setStyle({
                color: COLORS.target_area,
                weight: 4,
            })).setStyle({interactive: true})

            if (level_offset != 0) {

                leaflet.marker(Vector2.toLatLong(to), {
                    icon: leaflet.icon({
                        iconUrl: level_offset < 0 ? "assets/icons/down.png" : "assets/icons/up.png",
                        iconSize: [14, 16],
                    }),
                    interactive: true
                }).addTo(group)
            }

            return group
        }


        const scale = (options.highlight ? 1.5 : this.zoom_sensitivity_layers.get(options.zoom_group_index).value.scale)

        // Render main marker
        const marker = leaflet.marker(Vector2.toLatLong(Rectangle.center(shortcut.clickable_area, false)), {
            icon: leaflet.icon({
                iconUrl: CursorType.meta(shortcut.actions[0]?.cursor ?? "generic").icon_url,
                iconSize: CursorType.iconSize(scale),
                iconAnchor: CursorType.iconAnchor(scale, true),
            }),
            riseOnHover: true,
            interactive: true
        }).addTo(this);

        if (options.highlight) {
            leaflet.polygon(boxPolygon2(shortcut.clickable_area), {
                color: COLORS.clickable_area,
                fillColor: COLORS.clickable_area,
                fillOpacity: 0.1,
                opacity: 0.5,
                interactive: true
            }).addTo(this)

            for (let action of shortcut.actions) {

                if (action.interactive_area) {
                    areaPolygon(action.interactive_area).setStyle({
                        color: COLORS.interactive_area,
                        fillColor: COLORS.interactive_area,
                        interactive: true,
                        fillOpacity: 0.1,
                        weight: 2
                    }).addTo(this)
                }

                action.movement.forEach(movement => {

                    if (movement.offset) {
                        let center = TileRectangle.center(TileArea.toRect(movement.valid_from || action.interactive_area || default_interactive_area(TileRectangle.extend(shortcut.clickable_area, -0.5))), true)

                        let target = Vector2.add(center, movement.offset)

                        render_transport_arrow(center, target, movement.offset.level).addTo(this)

                    } else if (movement.fixed_target && !movement.fixed_target.relative) {
                        if (movement.fixed_target.target.level == this.parent.getMap().floor.value()) {
                            leaflet.circle(Vector2.toLatLong(movement.fixed_target.target), {
                                color: COLORS.target_area,
                                weight: 2,
                                radius: 0.4,
                                fillOpacity: 0.1,
                            })
                                .addTo(this)
                        }

                        const center = TileRectangle.center(shortcut.clickable_area, false)
                        const target = movement.fixed_target.target

                        render_transport_arrow(center, target, target.level - center.level).addTo(this)
                    }
                })
            }

        }

        return marker.getElement()
    }

    async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        const props = new Properties()
        const s = this.config.shortcut

        switch (s.type) {
            case "entity":
                props.header(C.entity(s.entity))
                break;
            case "door":
                props.header(C.staticentity(s.name))
                break;
        }

        if (s.source_loc) {
            props.named("Object ID", s.source_loc.toString())
        }

        if (s.type == "door") {
            props.named("Position", TileCoordinates.toString(s.position))
            props.named("Direction", direction.toString(s.direction))
        }

        return {
            content: props,
            interactive: false
        }
    }
}

export namespace EntityTransportEntity {
    import EntityTransportation = Transportation.EntityTransportation;
    export type Config = MapEntity.SetupOptions & {
        shortcut: EntityTransportation
    }
}