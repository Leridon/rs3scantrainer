import * as leaflet from "leaflet"
import {createStepGraphics} from "../path_graphics";
import {Path} from "../../../model/pathing";


export default class PathLayer extends leaflet.FeatureGroup {
    constructor(private path: Path.step[]) {
        super()

        this.update()
    }


    private update() {
        this.clearLayers()

        this.path.reverse().forEach((p) => createStepGraphics(p)?.addTo(this))
    }
}