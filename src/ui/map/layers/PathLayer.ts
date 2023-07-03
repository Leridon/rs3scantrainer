import * as leaflet from "leaflet"
import {step} from "../../../model/pathing";
import {createStepGraphics} from "../path_graphics";


/*
function arrowTip(): MapCoordinate[] {

}*/

export default class PathLayer extends leaflet.FeatureGroup {
    constructor(private path: step[]) {
        super()

        this.update()
    }


    private update() {
        this.clearLayers()


        this.path.reverse().forEach((p) => createStepGraphics(p)?.addTo(this))
    }
}