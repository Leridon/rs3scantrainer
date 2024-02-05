import * as leaflet from "leaflet"
import {Path} from "lib/runescape/pathing";
import {TileCoordinates, TileRectangle} from "../../lib/runescape/coordinates";
import {direction, MovementAbilities} from "lib/runescape/movement";
import Widget from "lib/ui/Widget";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {Vector2} from "lib/math";
import InteractionType = Path.InteractionType;
import {Teleports} from "lib/runescape/teleports";
import {teleport_data} from "../../data/teleport_data";

export namespace PathGraphics {
    import movement_ability = MovementAbilities.movement_ability;
    type HTMLString = string

    export function text_icon(icon: string, hover: string = ""): HTMLString {
        return `<img class='text-icon' src='${icon}' title="${hover}">`
    }

    export namespace Teleport {
        export function asSpan(tele: Teleports.flat_teleport): HTMLString {
            return `<span style="position: relative" title="${tele.hover}">${text_icon(`assets/icons/teleports/${typeof tele.icon == "string" ? tele.icon : tele.icon.url}`, tele.hover)}<div class="tele-icon-code-overlay">${tele.code ? tele.code : ""}</div></span>`
        }
    }

    export function ability_icon(ability: movement_ability): string {
        switch (ability) {
            case "surge":
                return 'assets/icons/surge.png'
            case "escape":
                return 'assets/icons/escape.png'
            case "barge":
                return 'assets/icons/barge.png'
            case "dive":
                return 'assets/icons/dive.png'
        }
    }

    export function asSpan(step: Path.step): HTMLString {
        switch (step.type) {
            case "orientation":
                return text_icon('assets/icons/compass.png') + direction.toShortString(step.direction)
            case "ability":
                return text_icon(ability_icon(step.ability))
            case "run":
                return text_icon('assets/icons/run.png') + (step.waypoints.length - 1)
            case "teleport":
                let tele = Teleports.find(teleport_data.getAllFlattened(), step.id)

                if (!tele) return text_icon('assets/teleports/homeport.png')

                return PathGraphics.Teleport.asSpan(tele)
            case "shortcut_v2":
                return text_icon(InteractionType.meta(step.internal.actions[0].cursor).icon_url)
            case "redclick":
                return text_icon('assets/icons/redclick.png')
            case "powerburst":
                return text_icon('assets/icons/accel.png')
        }
    }

}

export function createX(coordinate: TileCoordinates,
                        color: "red" | "yellow",
                        size: number = 16,
                        className: string = undefined
): leaflet.Marker {
    const click_icons = {
        "red": "assets/icons/redclick.png",
        "yellow": "assets/icons/yellowclick.png",
    }

    return leaflet.marker(Vector2.toLatLong(coordinate), {
        icon: leaflet.icon({
            iconUrl: click_icons[color],
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            className:
                className ? `no-antialiasing ${className}`
                    : "no-antialiasing"
        }),
        interactive: false,
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
        .setStyle({
            interactive: true
        })
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
            case "redclick":
                return `{{icon ${InteractionType.meta(step.how).short_icon}}}`
            case "shortcut_v2":
                return `{{icon ${InteractionType.meta(step.internal.actions[0].cursor).short_icon}}}`
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
            case "redclick":
                return c(`<img class='text-icon' src='assets/icons/redclick.png'>`)
            case "powerburst":
                return c(`<img class='text-icon' src='assets/icons/accel.png'>`)
        }
    }
}