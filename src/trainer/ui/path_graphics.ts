import * as leaflet from "leaflet"
import {Path} from "lib/runescape/pathing";
import {TileCoordinates} from "../../lib/runescape/coordinates";
import {direction, MovementAbilities} from "lib/runescape/movement";
import Widget from "lib/ui/Widget";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {Vector2} from "lib/math";
import InteractionType = Path.InteractionType;
import {Teleports} from "lib/runescape/teleports";
import {teleport_data} from "../../data/teleport_data";

export namespace PathGraphics {
    type HTMLString = string

    export function text_icon(icon: string, hover: string = ""): HTMLString {
        return `<img class='text-icon' src='${icon}' title="${hover}">`
    }

    export namespace Teleport {
        export function asSpan(tele: Teleports.flat_teleport): HTMLString {
            return `<span style="position: relative" title="${tele.hover}">${text_icon(`assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`, tele.hover)}<div class="tele-icon-code-overlay">${tele.code ? tele.code : ""}</div></span>`
        }
    }

    export function asSpan(step: Path.step): HTMLString {
        switch (step.type) {
            case "orientation":
                return text_icon('assets/icons/compass.png') + direction.toShortString(step.direction)
            case "ability":
                switch (step.ability) {
                    case "surge":
                        return text_icon('assets/icons/surge.png')
                    case "escape":
                        return text_icon('assets/icons/escape.png')
                    case "barge":
                        return text_icon('assets/icons/barge.png')
                    case "dive":
                        return text_icon('assets/icons/dive.png')
                }
            case "run":
                return text_icon('assets/icons/run.png') + (step.waypoints.length - 1)
            case "teleport":
                let tele = Teleports.find(teleport_data.getAllFlattened(), step.id)

                if (!tele) return text_icon('assets/teleports/homeport.png')

                return PathGraphics.Teleport.asSpan(tele)
            case "interaction":
                return text_icon(InteractionType.meta(step.how).icon_url)
            case "redclick":
                return text_icon('assets/icons/redclick.png')
            case "powerburst":
                return text_icon('assets/icons/accel.png')
        }
    }

}

function createX(coordinate: TileCoordinates, color: "red" | "yellow"): leaflet.Layer {
    const click_icons = {
        "red": "assets/icons/redclick.png",
        "yellow": "assets/icons/yellowclick.png",
    }

    return leaflet.marker(Vector2.toLatLong(coordinate), {
        icon: leaflet.icon({
            iconUrl: click_icons[color],
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        }),
        interactive: false
    })
}

const pi = 3.1415

export function arrow(from: Vector2, to: Vector2): leaflet.Polyline {
    let off = Vector2.sub(from, to)

    if (Vector2.lengthSquared(off) < 1) return leaflet.polyline([])

    let arm1_offset = Vector2.scale(0.7, Vector2.rotate(Vector2.normalize(off), pi / 4))
    let arm2_offset = Vector2.scale(0.7, Vector2.rotate(Vector2.normalize(off), -pi / 4))

    let tip = Vector2.toLatLong(to)

    return leaflet.polyline([
            [Vector2.toLatLong(from), Vector2.toLatLong(to)],
            [tip, Vector2.toLatLong(Vector2.add(to, arm1_offset))],
            [tip, Vector2.toLatLong(Vector2.add(to, arm2_offset))],
        ]
    )
}

export namespace PathingGraphics {

    import InteractionType = Path.InteractionType;

    export function templateString(step: Path.step): string {
        switch (step.type) {
            case "orientation":
                return `Face ${direction.toString(step.direction)}`
            case "run":
                return `{{icon run}}`
            case "ability":
                return `{{${step.ability}}}`
            case "teleport":
                return `{{teleport ${step.id.group} ${step.id.sub}}}`
            case "powerburst":
                return `{{icon accel}}`
            case "interaction":
            case "redclick":
                return `{{icon ${InteractionType.meta(step.how).short_icon}}}`
        }
    }

    export function getIcon(step: Path.step): Widget {
        switch (step.type) {
            case "orientation":
                return c(`<img class='text-icon' src='assets/icons/compass.png'>`)
            case "run":
                return c(`<img class='text-icon' src='assets/icons/run.png'>`)
            case "ability":
                switch (step.ability) {
                    case "surge":
                        return c(`<img class='text-icon' src='assets/icons/surge.png'>`)
                    case "escape":
                        return c(`<img class='text-icon' src='assets/icons/escape.png'>`)
                    case "barge":
                        return c(`<img class='text-icon' src='assets/icons/barge.png'>`)
                    case "dive":
                        return c(`<img class='text-icon' src='assets/icons/dive.png'>`)
                }
                break;
            case "teleport":
                return c(`<img class='text-icon' src='assets/icons/teleports/homeport.png'>`)
            case "interaction":
                return c(`<img class='text-icon' src='assets/icons/shortcut.png'>`)
            case "redclick":
                return c(`<img class='text-icon' src='assets/icons/redclick.png'>`)
            case "powerburst":
                return c(`<img class='text-icon' src='assets/icons/accel.png'>`)
        }
    }

    export function renderPath(path: Path.step[]): OpacityGroup {
        let group = new OpacityGroup()

        for (let step of path) createStepGraphics(step).addTo(group)

        return group
    }
}

export function createStepGraphics(step: Path.step): OpacityGroup {
    let layer = new OpacityGroup()
        .setStyle({interactive: false})

    switch (step.type) {
        case "teleport":

            // TODO: Implement
            break;
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
                    weight: 4
                }).addTo(layer)

            leaflet.marker(Vector2.toLatLong(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
                icon: leaflet.icon({
                    iconUrl: meta[step.ability].icon,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                })
            }).addTo(layer)

            break
        }
        case "run": {
            let lines: [Vector2, Vector2][] = []

            for (let i = 0; i < step.waypoints.length - 1; i++) {
                const from = step.waypoints[i]
                const to = step.waypoints[i + 1]

                lines.push([from, to])
            }

            lines = lines.filter((l) => !Vector2.eq(l[0], l[1]))

            layer.setStyle({
                interactive: false
            })

            leaflet.polyline(
                lines.map((t) => t.map(Vector2.toLatLong)),
                {
                    color: "#b4b4b4",
                    weight: 3
                }
            ).addTo(layer)

            createX(step.waypoints[step.waypoints.length - 1], "yellow").addTo(layer)

            break
        }
        case "redclick": {
            createX(step.where, "red").addTo(layer)

            leaflet.marker(Vector2.toLatLong(step.where), {
                icon: leaflet.icon({
                    iconUrl: InteractionType.meta(step.how).icon_url,
                    iconSize: [28, 31],
                    iconAnchor: [4, 1],
                }),
                interactive: false
            }).addTo(layer)

            break
        }
        case "powerburst": {
            leaflet.marker(Vector2.toLatLong(step.where), {
                icon: leaflet.icon({
                    iconUrl: "assets/icons/accel.png",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                }),
                interactive: false
            }).addTo(layer)
            break
        }
        case "interaction":
            arrow(step.starts, step.ends_up)
                .setStyle({
                    color: "#069334",
                    weight: 4,
                    dashArray: '10, 10'
                }).addTo(layer)

            leaflet.marker(Vector2.toLatLong(step.where), {
                icon: leaflet.icon({
                    iconUrl: InteractionType.meta(step.how).icon_url,
                    iconSize: [28, 31],
                    iconAnchor: [14, 16],
                }),
                interactive: false
            }).addTo(layer)

            break
        case "orientation":
        default:
    }

    return layer
}