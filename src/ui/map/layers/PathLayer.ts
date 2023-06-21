import * as leaflet from "leaflet"
import {movement_ability, step} from "../../../model/pathing";
import {boxPolygon, MapCoordinate, toLL, Vector2} from "../../../model/coordinates";
import PathEditLayer from "../../scanedit/PathEditLayer";


function createX(coordinate: MapCoordinate, color: "red" | "yellow"): leaflet.Layer {
    const click_icons = {
        "red": "assets/icons/redclick.png",
        "yellow": "assets/icons/yellowclick.png",
    }

    return leaflet.marker(toLL(coordinate), {
        icon: leaflet.icon({
            iconUrl: click_icons[color],
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        })
    })
}

/*
function arrowTip(): MapCoordinate[] {

}*/

export default class PathLayer extends leaflet.FeatureGroup {
    constructor(private path: step[]) {
        super()

        // TODO: Remove
        this.path = [
            {
                type: "teleport",
                id: {
                    main: "ringofduelling",
                    sub: "castlewars"
                }
            }, {
                type: "run",
                waypoints: [
                    {x: 2444, y: 3089},
                    {x: 2448, y: 3090},
                    {x: 2451, y: 3090},
                ]
            }, {
                type: "redclick",
                where: {x: 2462, y: 3077}
            }, {
                type: "ability",
                ability: "surge",
                from: {x: 2451, y: 3090},
                to: {x: 2461, y: 3080}
            }, {
                type: "run",
                waypoints: [
                    {x: 2461, y: 3080},
                    {x: 2460, y: 3076},
                ]
            }, {
                type: "ability",
                ability: "dive",
                from: {x: 2460, y: 3076},
                to: {x: 2450, y: 3066}
            }, {
                type: "ability",
                ability: "barge",
                from: {x: 2450, y: 3066},
                to: {x: 2440, y: 3056}
            }
        ]

        this.update()
    }


    private create(step: step): leaflet.Layer {
        switch (step.type) {
            case "teleport":
                break;
            case "ability": {
                let group = leaflet.featureGroup()

                const meta: Record<movement_ability, { color: string, icon: string }> = {
                    barge: {color: "#a97104", icon: "assets/icons/barge.png"},
                    dive: {color: "#e7d82c", icon: "assets/icons/dive.png"},
                    escape: {color: "#56ba0f", icon: "assets/icons/escape.png"},
                    surge: {color: "#0091f2", icon: "assets/icons/surge.png"}
                }

                leaflet.polyline(
                    [toLL(step.from), toLL(step.to)],
                    {
                        color: meta[step.ability].color
                    }
                ).addTo(group)

                leaflet.marker(toLL(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
                    icon: leaflet.icon({
                        iconUrl: meta[step.ability].icon,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    })
                }).addTo(group)

                return group
            }
            case "run": {
                let lines: [Vector2, Vector2][] = []

                for (let i = 0; i < step.waypoints.length - 1; i++) {
                    const from = step.waypoints[i]
                    const to = step.waypoints[i + 1]

                    const delta = Vector2.sub(to, from)

                    const diagonal_part = Math.min(Math.abs(delta.x), Math.abs(delta.y))

                    let straight_vector: Vector2 = {
                        x: delta.x - Math.sign(delta.x) * diagonal_part,
                        y: delta.y - Math.sign(delta.x) * diagonal_part
                    }

                    let checkpoint = Vector2.add(from, straight_vector)

                    lines.push([from, checkpoint])
                    lines.push([checkpoint, to])
                }

                lines = lines.filter((l) => !Vector2.eq(l[0], l[1]))

                let group = leaflet.featureGroup()

                leaflet.polyline(
                    lines.map((t) => t.map(toLL)),
                    {
                        color: "#b4b4b4",
                        weight: 3
                    }
                ).addTo(group)

                createX(step.waypoints[step.waypoints.length - 1], "yellow").addTo(group)

                return group
            }
            case "interaction":
                boxPolygon(step.area).setStyle({
                    weight: 2,
                    color: "#888888",
                    fillColor: "#888888",
                    fillOpacity: 0.3,
                })
                break;
            case "redclick": {
                return createX(step.where, "red").addTo(this)
            }
            case "powerburst": {
                return leaflet.marker(toLL(step.where), {
                    icon: leaflet.icon({
                        iconUrl: "assets/icons/accel.png",
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                    })
                })
            }
        }
    }

    private update() {
        this.clearLayers()

        this.path.forEach((p) => this.create(p)?.addTo(this))
    }
}