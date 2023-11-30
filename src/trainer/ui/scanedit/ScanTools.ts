import Widget from "lib/ui/Widget";
import * as leaflet from "leaflet"
import Checkbox from "lib/ui/controls/Checkbox";
import LightButton from "../widgets/LightButton";
import {Vector2} from "lib/math";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import hboxc = C.hboxc;
import centered = C.centered;
import {observe} from "../../../lib/reactive";
import ScanEditor from "./ScanEditor";

export default class ScanTools extends Widget {
    normal = observe(false)
    complement = observe(false)

    constructor(private editor: ScanEditor) {
        super();

        centered(
            c("<div style='font-weight: bold'>Center On</div>"),
            hbox(
                new LightButton("Spots", "rectangle")
                    .on("click", () => {
                        let bounds = leaflet.latLngBounds([])

                        this.editor.value.clue.spots.forEach((c) => bounds.extend(Vector2.toLatLong(c)))

                        bounds.pad(0.1)

                        this.editor.app.map.fitBounds(bounds)
                    }),
                new LightButton("Complement", "rectangle")
                    .on("click", () => {
                        let bounds = leaflet.latLngBounds([])

                        this.editor.value.clue.spots.forEach((c) => {
                            bounds.extend(Vector2.toLatLong({
                                x: c.x,
                                y: (c.y < 6400 ? c.y + 6400 : c.y - 6400)
                            }))
                        })
                        bounds.pad(0.1)

                        this.editor.app.map.fitBounds(bounds)
                    })
            ).addClass("ctr-button-container"),
            c("<div style='font-weight: bold'>Show Equivalence Classes</div>"),

            hboxc(
                c("<div style='display: flex; padding-left: 5px'>")
                    .append(new Checkbox().on("changed", (v) => {
                        this.normal.set(v)
                    }))
                    .append(c("<div class='col-4' style='margin-left: 5px'>Spots</div>")),

                c("<div style='display: flex; padding-left: 5px'>")
                    .append(new Checkbox().on("changed", (v) => {
                        this.complement.set(v)
                    }).container)
                    .append(c("<div class='col-4' style='margin-left: 5px'>Complement</div>"))
            )
        ).appendTo(this)
    }
}