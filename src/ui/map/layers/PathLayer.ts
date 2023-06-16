import * as leaflet from "leaflet"
import {step} from "../../../model/pathing";
import {toLeafletLatLngExpression} from "../../../model/coordinates";


export default class PathLayer extends leaflet.FeatureGroup {
    constructor(private path: step[]) {
        super()

        this.update()

    }

    private create(step: step) {

        if (step.type == "ability") {
            let color = {
                "escape": "#56ba0f",
                "surge": "#0091f2",
                "dive": "#e7d82c"
            }[step.ability]

            leaflet.polyline(
                [toLeafletLatLngExpression(step.from), toLeafletLatLngExpression(step.to)],
                {
                    color: color
                }
            ).addTo(this)
        }
    }

    private update() {
        this.clearLayers()

        this.path.forEach((p) => this.create(p))
    }
}