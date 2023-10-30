import Widget from "../../../lib/ui/Widget";
import ScanEditPanel from "./ScanEditPanel";
import * as leaflet from "leaflet"
import Checkbox from "../../../lib/ui/controls/Checkbox";
import LightButton from "../widgets/LightButton";
import {Vector2} from "lib/math/Vector";
import {observe} from "lib/properties/Observable";

export default class ScanTools extends Widget {
    normal = observe(false)
    complement = observe(false)

    constructor(private parent: ScanEditPanel) {
        super();

        let btn_container = c("<div style='text-align: center'>").appendTo(this.container)

        new LightButton("Center on Spots")
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.parent.options.clue.solution.candidates.forEach((c) => bounds.extend(Vector2.toLatLong(c)))

                bounds.pad(0.1)

                this.parent.parent.options.map.fitBounds(bounds)
            })
            .appendTo(btn_container)

        new LightButton("Center on Complement")
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.parent.options.clue.solution.candidates.forEach((c) => {
                    bounds.extend(Vector2.toLatLong({
                        x: c.x,
                        y: (c.y < 6400 ? c.y + 6400 : c.y - 6400)
                    }))
                })
                bounds.pad(0.1)

                this.parent.parent.options.map.fitBounds(bounds)
            })
            .appendTo(btn_container)

        c("<div style='font-weight: bold'>Show Equivalence Classes</div>").appendTo(this)

        c("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                this.normal.set(v)
            }))
            .append(c("<div class='col-4' style='margin-left: 5px'>Spots</div>"))
            .appendTo(this)

        c("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                this.complement.set(v)
            }).container)
            .append(c("<div class='col-4' style='margin-left: 5px'>Complement</div>"))
            .appendTo(this)
    }
}