import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";
import {Path} from "../../../lib/runescape/pathing";
import {MovementAbilities} from "../../../lib/runescape/movement";
import * as leaflet from "leaflet";
import {Vector2} from "../../../lib/math";
import {arrow, createX} from "../path_graphics";
import {observe} from "../../../lib/reactive";


export class StepGraphics extends OpacityGroup {
    private rendering: boolean = false

    highlighted = observe(false)
    highlightable: boolean = false

    constructor(private step: Path.step) {
        super()

        this.highlighted.subscribe(() => {
            this.render()
        })

        this.on("mouseover", () => {
            if (!this.rendering && this.highlightable) this.highlighted.set(true)
        })

        this.on("mouseout", () => {
            if (!this.rendering && this.highlightable) this.highlighted.set(false)
        })

        this.render()
    }

    setHighlightable(v: boolean): this {
        this.highlightable = v
        if (!v) this.highlighted.set(false)
        return this
    }

    public isVisual(): boolean {
        switch (this.step.type) {
            case "orientation":
            case "teleport":
                return false
            case "ability":
            case "run":
            case "interaction":
            case "redclick":
            case "powerburst":
            case "shortcut_v2":
                return true
        }
    }

    private render() {
        this.rendering = true

        this.clearLayers()

        const step = this.step
        const highlighted = this.highlighted.value()

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
                        weight: highlighted ? 6 : 4,
                        interactive: true,
                    }).addTo(this)

                leaflet.marker(Vector2.toLatLong(Vector2.scale(1 / 2, Vector2.add(step.from, step.to))), {
                    icon: leaflet.icon({
                        iconUrl: meta[step.ability].icon,
                        iconSize: highlighted ? [36, 36] : [24, 24],
                        iconAnchor: highlighted ? [18, 18] : [12, 12],
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
                        weight: highlighted ? 6 : 4
                    }
                ).addTo(this)

                createX(step.waypoints[step.waypoints.length - 1], "yellow").addTo(this)

                break;
            case "teleport":
                break;
            case "interaction":
                break;
            case "redclick":
                break;
            case "powerburst":
                break;
            case "shortcut_v2":
                break;

        }

        this.setStyle({
            interactive: true
        })

        this.rendering = false
    }
}

export namespace PathGraphics {

}