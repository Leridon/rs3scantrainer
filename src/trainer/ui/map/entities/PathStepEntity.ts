import {Path} from "../../../../lib/runescape/pathing";
import {MovementAbilities} from "../../../../lib/runescape/movement";
import * as leaflet from "leaflet";
import {Vector2} from "../../../../lib/math";
import {arrow, createX} from "../../path_graphics";
import {TileCoordinates, TileRectangle} from "../../../../lib/runescape/coordinates";
import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import Widget from "../../../../lib/ui/Widget";
import {PathStepProperties} from "../../pathing/PathStepProperties";
import Dependencies from "../../../dependencies";
import GameLayer from "../../../../lib/gamemap/GameLayer";
import {CursorType} from "../../../../lib/runescape/CursorType";
import {TransportData} from "../../../../data/transports";
import {TeleportSpotEntity} from "./TeleportSpotEntity";
import {GameMapContextMenuEvent} from "../../../../lib/gamemap/MapEvents";
import {MenuEntry} from "../../widgets/ContextMenu";

export class PathStepEntity extends MapEntity {
    constructor(public config: PathStepEntity.Config) {
        super(config)

        this.floor_sensitive = true
    }

    protected override async render_implementation(options: MapEntity.RenderOptions): Promise<Element> {
        const step = this.config.step

        const cls = Path.Step.level(step) == options.viewport.rect.level ? "ctr-step-graphics" : "ctr-step-graphics-dl"

        const element: Element = (() => {
            switch (step.type) {
                case "orientation":
                    return null
                case "ability": {
                    const meta: Record<MovementAbilities.movement_ability, { color: string, icon: string }> = {
                        barge: {color: "#a97104", icon: "assets/icons/barge.png"},
                        dive: {color: "#e7d82c", icon: "assets/icons/dive.png"},
                        escape: {color: "#56ba0f", icon: "assets/icons/escape.png"},
                        surge: {color: "#0091f2", icon: "assets/icons/surge.png"}
                    }

                    arrow(step.from, step.to)
                        .setStyle({
                            color: meta[step.ability].color,
                            weight: options.highlight ? 6 : 4,
                            interactive: true,
                            className: cls
                        }).addTo(this)

                    const marker = leaflet.marker(Vector2.toLatLong(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
                        icon: leaflet.icon({
                            iconUrl: meta[step.ability].icon,
                            iconSize: options.highlight ? [36, 36] : [24, 24],
                            iconAnchor: options.highlight ? [18, 18] : [12, 12],
                            className: cls
                        })
                    }).addTo(this)

                    return marker.getElement()
                }
                case "run": {
                    let lines: [Vector2, Vector2][] = []

                    for (let i = 0; i < step.waypoints.length - 1; i++) {
                        const from = step.waypoints[i]
                        const to = step.waypoints[i + 1]

                        lines.push([from, to])
                    }

                    lines = lines.filter((l) => !Vector2.eq(l[0], l[1]))

                    leaflet.polyline(
                        lines.map((t) => t.map(Vector2.toLatLong)),
                        {
                            color: "#b4b4b4",
                            weight: options.highlight ? 6 : 4,
                            className: cls
                        }
                    ).addTo(this)

                    let marker = createX(step.waypoints[step.waypoints.length - 1],
                        "yellow",
                        options.highlight ? 30 : 20,
                        cls
                    ).addTo(this)

                    return marker.getElement()
                }
                case "teleport": {
                    let teleport = TransportData.resolveTeleport(step.id, Dependencies.instance().app.teleport_settings)

                    const marker = leaflet.marker(Vector2.toLatLong(step.spot ?? teleport.target()), {
                        icon: new TeleportSpotEntity.TeleportMapIcon(teleport, options.highlight ? 1.5 : 1),
                        riseOnHover: true
                    }).addTo(this)

                    return marker.getElement()
                }
                case "redclick": {

                    createX(step.where, "red",
                        options.highlight ? 30 : 20,
                        "ctr-step-graphics"
                    ).addTo(this)

                    const marker = leaflet.marker(Vector2.toLatLong(step.where), {
                        icon: leaflet.icon({
                            iconUrl: CursorType.meta(step.how).icon_url,
                            iconSize: options.highlight ? [42, 48] : [28, 31],
                            iconAnchor: options.highlight ? [6, 2] : [4, 1],
                            className: cls
                        })
                    }).addTo(this)

                    return marker.getElement()
                }
                case "powerburst": {

                    const marker = leaflet.marker(Vector2.toLatLong(step.where), {
                        icon: leaflet.icon({
                            iconUrl: "assets/icons/accel.png",
                            iconSize: options.highlight ? [26, 36] : [18, 24],
                            iconAnchor: options.highlight ? [13, 18] : [9, 12],
                            className: cls
                        })
                    }).addTo(this)

                    return marker.getElement()
                }
                case "transport": {
                    let entity = step.internal
                    let action = entity.actions[0]

                    let ends_up: TileCoordinates = Path.ends_up([step])

                    arrow(step.assumed_start, ends_up)
                        .setStyle({
                            color: "#069334",
                            weight: options.highlight ? 6 : 4,
                            dashArray: '10, 10',
                            className: cls
                        }).addTo(this)

                    const marker = leaflet.marker(Vector2.toLatLong(TileRectangle.center(step.internal.clickable_area)), {
                        icon: leaflet.icon({
                            iconUrl: CursorType.meta(action.cursor).icon_url,
                            iconSize: options.highlight ? [42, 48] : [28, 31],
                            iconAnchor: options.highlight ? [6, 2] : [4, 1],
                            className: cls
                        }),
                    }).addTo(this)

                    return marker.getElement();
                }
                case "cheat": {
                    return arrow(step.assumed_start, step.target)
                        .setStyle({
                            color: "#069334",
                            weight: options.highlight ? 6 : 4,
                            dashArray: '10, 10',
                            className: cls
                        }).addTo(this).getElement()
                }

            }
        })()

        this.setStyle({
            interactive: true,
            className: "ctr-step-graphics"
        })

        return element
    }

    async renderTooltip(): Promise<{ content: Widget, interactive: boolean } | null> {
        return {
            content: new PathStepProperties(this.config.step, Dependencies.instance().app.template_resolver),
            interactive: false
        }
    }

    override async contextMenu(event: GameMapContextMenuEvent): Promise<(MenuEntry & { type: "submenu" }) | null> {
        return {
            type: "submenu",
            text: Path.Step.name(this.config.step),
            children: []
        }
    }
}

export namespace PathStepEntity {
    export type Config = MapEntity.SetupOptions & {
        step: Path.Step
    }

    export function renderPath(path: Path.Step[]): GameLayer {
        let group = new GameLayer()

        for (let step of path) new PathStepEntity({
            highlightable: true,
            step: step,
        }).addTo(group)

        return group
    }
}