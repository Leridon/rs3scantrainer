import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import {MovementAbilities} from "../../../lib/runescape/movement";
import * as leaflet from "leaflet";
import {Vector2} from "../../../lib/math";
import {arrow, createX} from "../path_graphics";
import InteractionType = Path.InteractionType;
import {TileCoordinates, TileRectangle} from "../../../lib/runescape/coordinates";
import {GameEntity} from "../../../lib/gamemap/GameEntity";

export class StepGraphics extends GameEntity {

    constructor(private step: Path.step) {
        super()

        this.render()
    }

    protected override render_implementation(options: GameEntity.RenderOptions) {
        const cls = "ctr-step-graphics"

        const step = this.step

        switch (step.type) {
            case "orientation":
                break;
            case "ability":
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

                leaflet.marker(Vector2.toLatLong(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
                    icon: leaflet.icon({
                        iconUrl: meta[step.ability].icon,
                        iconSize: options.highlight ? [36, 36] : [24, 24],
                        iconAnchor: options.highlight ? [18, 18] : [12, 12],
                        className: cls
                    })
                }).addTo(this)

                break;
            case "run":
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

                createX(step.waypoints[step.waypoints.length - 1],
                    "yellow",
                    options.highlight ? 30 : 20,
                    "ctr-step-graphics"
                )
                    .addTo(this)

                break;
            case "teleport":
                break;
            case "redclick":

                createX(step.where, "red",
                    options.highlight ? 30 : 20,
                    "ctr-step-graphics"
                ).addTo(this)

                leaflet.marker(Vector2.toLatLong(step.where), {
                    icon: leaflet.icon({
                        iconUrl: InteractionType.meta(step.how).icon_url,
                        iconSize: options.highlight ? [42, 48] : [28, 31],
                        iconAnchor: options.highlight ? [6, 2] : [4, 1],
                        className: cls
                    })
                }).addTo(this)

                break;
            case "powerburst":

                leaflet.marker(Vector2.toLatLong(step.where), {
                    icon: leaflet.icon({
                        iconUrl: "assets/icons/accel.png",
                        iconSize: options.highlight ? [26, 36] : [18, 24],
                        iconAnchor: options.highlight ? [13, 18] : [9, 12],
                        className: cls
                    })
                }).addTo(this)

                break;
            case "shortcut_v2":
                let start_tile = step.assumed_start

                let entity = step.internal
                let action = entity.actions[0]

                let ends_up: TileCoordinates = null
                switch (action.movement.type) {
                    case "offset":
                        ends_up = TileCoordinates.move(start_tile, action.movement.offset)
                        break;
                    case "fixed":
                        ends_up = action.movement.target
                        break;
                }

                arrow(step.assumed_start, ends_up)
                    .setStyle({
                        color: "#069334",
                        weight: options.highlight ? 6 : 4,
                        dashArray: '10, 10',
                        className: cls
                    }).addTo(this)

                leaflet.marker(Vector2.toLatLong(TileRectangle.center(step.internal.clickable_area)), {
                    icon: leaflet.icon({
                        iconUrl: InteractionType.meta(action.cursor).icon_url,
                        iconSize: options.highlight ? [42, 48] : [28, 31],
                        iconAnchor: options.highlight ? [6, 2] : [4, 1],
                        className: cls
                    }),
                }).addTo(this)

                break;
        }

        this.setStyle({
            interactive: true,
            className: "ctr-step-graphics"
        })
    }
}

export namespace PathGraphics {

    export function renderPath(path: Path.step[]): OpacityGroup {
        let group = new OpacityGroup()

        for (let step of path) new StepGraphics(step).addTo(group)

        return group
    }
}