import * as leaflet from "leaflet"
import {step} from "../../../model/pathing";
import {createStepGraphics} from "../path_graphics";


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


    private update() {
        this.clearLayers()


        this.path.reverse().forEach((p) => createStepGraphics(p)?.addTo(this))
    }
}