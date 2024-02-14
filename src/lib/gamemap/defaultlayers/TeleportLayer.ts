import * as leaflet from "leaflet"
import {Rectangle, Vector2} from "../../math";
import {MapEntity} from "../MapEntity";
import {C} from "../../ui/constructors";
import {OpacityGroup} from "../layers/OpacityLayer";
import div = C.div;
import img = C.img;
import Widget from "../../ui/Widget";
import Properties from "../../../trainer/ui/widgets/Properties";
import {Transportation} from "../../runescape/transportation";
import {floor_t, TileCoordinates, TileRectangle} from "../../runescape/coordinates";
import {areaPolygon, boxPolygon2} from "../../../trainer/ui/polygon_helpers";
import {arrow} from "../../../trainer/ui/path_graphics";
import {direction} from "../../runescape/movement";
import {TileArea} from "../../runescape/coordinates/TileArea";
import {CursorType} from "../../runescape/CursorType";
import {ZoomLevels} from "../ZoomLevels";
import {DivIcon} from "leaflet";
import {identity} from "lodash";
import default_interactive_area = Transportation.EntityTransportation.default_interactive_area;

export class TeleportEntity extends MapEntity {

    zoom_sensitivity_layers = MapEntity.default_zoom_scale_layers

    constructor(public config: TeleportEntity.Config) {
        super(config);

        this.floor_sensitive = true
        this.zoom_sensitive = true
    }

    render_implementation(options: MapEntity.RenderOptions) {
        const scale = (options.highlight ? 1.5 : (this.zoom_sensitivity_layers.get(options.viewport.zoom).scale))

        leaflet.marker(Vector2.toLatLong(this.config.teleport.target()), {
            icon: new TeleportMapIcon(this.config.teleport, scale, w => {
                if (options.viewport.rect.level != this.config.teleport.target().level) w.css("filter", "grayscale(1) brightness(0.5)")

                return w
            }),
            riseOnHover: true
        }).addTo(this)
    }

    renderTooltip(): Widget | null {
        let props = new Properties()

        props.named("Group", c().text(this.config.teleport.group.name))
        props.named("Name", c().text(this.config.teleport.spot.name))
        props.header("Timing")
        props.named("Interface", c().text(this.config.teleport.props.menu_ticks + " ticks"))
        props.named("Blocked", c().text(this.config.teleport.props.animation_ticks + " ticks"))

        return props
    }
}

export class ShortcutEntity extends MapEntity {
    zoom_sensitivity_layers: ZoomLevels<{ scale: number }> = MapEntity.default_zoom_scale_layers

    constructor(public config: ShortcutEntity.Config) {
        super(config)

        this.floor_sensitive = true
        this.zoom_sensitive = true
    }

    render_implementation(options: MapEntity.RenderOptions) {
        const shortcut = Transportation.normalize(this.config.shortcut)

        if (options.viewport.rect.level != shortcut.clickable_area.level) return

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

        let floor = options.viewport.rect.level

        const scale = (options.highlight ? 1.5 : (this.zoom_sensitivity_layers.get(options.viewport.zoom).scale))

        // Render main marker
        leaflet.marker(Vector2.toLatLong(Rectangle.center(shortcut.clickable_area, false)), {
            icon: leaflet.icon({
                iconUrl: CursorType.meta(shortcut.actions[0]?.cursor ?? "generic").icon_url,
                iconSize: CursorType.iconSize(scale),
                iconAnchor: CursorType.iconAnchor(scale, true),
            }),
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
                        if (movement.fixed_target.target.level == floor) {
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
    }

    renderTooltip(): Widget | null {
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

        return props
    }
}

export namespace ShortcutEntity {
    import EntityTransportation = Transportation.EntityTransportation;
    export type Config = MapEntity.SetupOptions & {
        shortcut: EntityTransportation
    }
}

export namespace TeleportEntity {
    export type Config = MapEntity.SetupOptions & {
        teleport: Transportation.TeleportGroup.Spot
    }
}

export class TeleportMapIcon extends leaflet.DivIcon {
    constructor(tele: Transportation.TeleportGroup.Spot, scale: number = 1, transformer: (w: Widget) => Widget = identity) {
        let i = img(`./assets/icons/teleports/${tele.image().url}`)

        i.css2({
            "width": tele.image().width ? tele.image().width + "px" : "auto",
            "height": tele.image().height ? tele.image().height + "px" : "auto",
        })

        super({
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            html: transformer(div(
                i,
                tele.code ? c().text(tele.code()) : undefined
            ).css("scale", scale.toString()).addClass("ctr-map-teleport-icon")).raw()
        });
    }
}