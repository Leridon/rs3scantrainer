import * as leaflet from "leaflet"
import {Rectangle, Vector2} from "../../math";
import {Teleports} from "../../runescape/teleports";
import {MapEntity} from "../MapEntity";
import {C} from "../../ui/constructors";
import {OpacityGroup} from "../layers/OpacityLayer";
import div = C.div;
import img = C.img;
import ManagedTeleportData = Teleports.ManagedTeleportData;
import full_teleport_id = Teleports.full_teleport_id;
import Widget from "../../ui/Widget";
import Properties from "../../../trainer/ui/widgets/Properties";
import {Shortcuts} from "../../runescape/shortcuts";
import shortcut = Shortcuts.shortcut;
import {floor_t, TileRectangle} from "../../runescape/coordinates";
import {boxPolygon, boxPolygon2} from "../../../trainer/ui/polygon_helpers";
import {RenderingUtility} from "../../../trainer/ui/map/RenderingUtility";
import shortcuts from "../../../data/shortcuts";
import {arrow} from "../../../trainer/ui/path_graphics";

export class TeleportEntity extends MapEntity {

    constructor(public config: TeleportEntity.Config) {
        super(config);

        this.render()
    }

    protected render_implementation(options: MapEntity.RenderOptions) {
        leaflet.marker(Vector2.toLatLong(this.config.teleport.spot), {
            icon: new TeleportMapIcon(this.config.teleport, options.highlight ? "ctr-map-teleport-icon-highlighted" : null),
            riseOnHover: true
        }).addTo(this)
    }

    protected renderTooltip(): Widget | null {
        let props = new Properties()

        props.named("Group", c().text(this.config.teleport.group.name))
        props.named("Name", c().text(this.config.teleport.sub.name))
        props.header("Timing")
        props.named("Interface", c().text(this.config.teleport.menu_ticks + " ticks"))
        props.named("Blocked", c().text(this.config.teleport.animation_ticks + " ticks"))

        return props
    }
}

export class ShortcutEntity extends MapEntity {
    constructor(public config: ShortcutEntity.Config) {
        super(config)

        this.render()
    }

    protected render_implementation(options: MapEntity.RenderOptions) {
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

        let all_floors = false
        let floor = 0 // TODO

        function fs(f: floor_t): leaflet.PolylineOptions {
            if (f < floor) return {
                className: "ctr-shortcut-different-level",
            }
            else if (f > floor) return {
                className: "ctr-shortcut-different-level",
                dashArray: "10, 10",
            }
            else return {}
        }

        let shortcut = Shortcuts.normalize(this.config.shortcut)

        let index_of_first_action_on_floor = shortcut.actions.findIndex(a => a.interactive_area.level == floor)

        let render_main = all_floors || (index_of_first_action_on_floor >= 0) || shortcut.clickable_area.level == floor

        for (let action of shortcut.actions) {

            if (render_main) {
                boxPolygon(action.interactive_area).setStyle({
                    color: COLORS.interactive_area,
                    fillColor: COLORS.interactive_area,
                    interactive: true,
                    fillOpacity: 0.1,
                    weight: 2
                })
                    .setStyle(fs(action.interactive_area.level))
                    .addTo(this)
            }

            switch (action.movement.type) {
                case "offset":

                    if (options.highlight) {

                        let center = TileRectangle.center(action.interactive_area, true)
                        let target = Vector2.add(center, action.movement.offset)

                        render_transport_arrow(center, target, action.movement.offset.level).addTo(this)
                    }

                    break;

                case "fixed":
                    if (render_main || action.movement.target.level == floor) {
                        leaflet.circle(Vector2.toLatLong(action.movement.target), {
                            color: COLORS.target_area,
                            weight: 2,
                            radius: 0.4,
                            fillOpacity: 0.1,
                        })
                            .setStyle(fs(action.movement.target.level))
                            .addTo(this)
                    }

                    if (options.highlight) {

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

            RenderingUtility.interactionMarker(Rectangle.center(shortcut.clickable_area, false), shortcut.actions[i]?.cursor || "generic", true)
                .addTo(this)

            leaflet.polygon(boxPolygon2(shortcut.clickable_area), {
                color: COLORS.clickable_area,
                fillColor: COLORS.clickable_area,
                fillOpacity: 0.1,
                interactive: true
            }).addTo(this)
        }
    }

    protected renderTooltip(): Widget | null {
        return c().text(this.config.shortcut.source_loc)
    }
}

export namespace ShortcutEntity {
    export type Config = MapEntity.SetupOptions & {
        shortcut: shortcut
    }
}

export namespace TeleportEntity {
    export type Config = MapEntity.SetupOptions & {
        teleport: Teleports.flat_teleport
    }
}

export class TeleportMapIcon extends leaflet.DivIcon {
    constructor(tele: Teleports.flat_teleport, cls: string = undefined) {
        let i = img(`./assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`)

        if (typeof tele.icon != "string") {
            i.css2({
                "width": tele.icon.width ? tele.icon.width + "px" : "auto",
                "height": tele.icon.height ? tele.icon.height + "px" : "auto",
            })
        }

        super({
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            html: div(
                i,
                tele.code ? c().text(tele.code) : undefined
            ).addClass("ctr-map-teleport-icon").addClass(cls).raw()
        });
    }
}

export class TeleportLayer extends OpacityGroup {
    entities: Map<full_teleport_id, TeleportEntity> = new Map<full_teleport_id, TeleportEntity>()

    constructor(public teleports: ManagedTeleportData) {
        super()

        for (let tele of teleports.getAll()) {
            this.entities.set(tele.id, new TeleportEntity({
                highlightable: true,
                teleport: tele
            }).addTo(this))
        }

        for (let short of shortcuts) {
            new ShortcutEntity({
                highlightable: true,
                shortcut: short
            }).addTo(this)
        }
    }
}