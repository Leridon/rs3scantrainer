import Widget from "../widgets/Widget";
import Collapsible from "../widgets/modals/Collapsible";
import ScanEditPanel from "./ScanEditPanel";

import * as leaflet from "leaflet"
import {toLeafletLatLngExpression} from "../../model/coordinates";
import Checkbox from "../widgets/Checkbox";
import {ScanEquivalenceClasses} from "../../model/scans/scans";
import {ScanTree2} from "../../model/scans/ScanTree2";
import assumedRange = ScanTree2.assumedRange;

export default class ScanTools extends Widget {
    collapsible: Collapsible

    equivalence_classes: {
        normal?: ScanEquivalenceClasses,
        complement?: ScanEquivalenceClasses
    } = {}

    constructor(private parent: ScanEditPanel) {
        super();

        this.collapsible = new Collapsible(this.container, "Tools")

        $("<div class='lightbutton'>Center on Spots</div>")
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.clue.solution.candidates.forEach((c) => bounds.extend(toLeafletLatLngExpression(c)))

                bounds.pad(0.1)

                this.parent.layer.getMap().map.fitBounds(bounds)
            })
            .appendTo($("<div style='text-align: center'>").appendTo(this.collapsible.content.container))

        $(`<div class='lightbutton'>Center on Complement</div>`)
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.clue.solution.candidates.forEach((c) => {
                    bounds.extend(toLeafletLatLngExpression({
                        x: c.x,
                        y: (c.y < 6400 ? c.y + 6400 : c.y - 6400)
                    }))
                })
                bounds.pad(0.1)

                this.parent.layer.getMap().map.fitBounds(bounds)
            })
            .appendTo($("<div style='text-align: center'>").appendTo(this.collapsible.content.container))

        $("<div style='font-weight: bold'>Show Equivalence Classes</div>").appendTo(this.collapsible.content.container)

        $("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                console.log("Changed S: " + v)
                if (v) {
                    console.log("Adding")
                    this.equivalence_classes.normal.getLayer().addTo(this.parent.layer)
                    console.log("Added")
                }
                else {
                    this.equivalence_classes.normal.getLayer().remove()
                    this.equivalence_classes.normal.layer = null
                }
            }).container)
            .append($("<div class='col-4' style='margin-left: 5px'>Spots</div>"))
            .appendTo(this.collapsible.content.container)

        $("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                console.log("Changed C")
                if (v) this.equivalence_classes.complement.getLayer().addTo(this.parent.layer)
                else {
                    this.equivalence_classes.complement.getLayer().remove()
                    this.equivalence_classes.complement.layer = null
                }
            }).container)
            .append($("<div class='col-4' style='margin-left: 5px'>Complement</div>"))
            .appendTo(this.collapsible.content.container)

        this.equivalence_classes.normal = new ScanEquivalenceClasses({
            candidates: this.parent.clue.solution.candidates,
            range: assumedRange(this.parent.value),
            complement: false,
            floor: this.parent.layer.getMap().floor
        })

        this.equivalence_classes.complement = new ScanEquivalenceClasses({
            candidates: this.parent.clue.solution.candidates,
            range: assumedRange(this.parent.value),
            complement: true,
            floor: this.parent.layer.getMap().floor
        })

        this.parent.layer.getMap().on("floorChanged", (f) => {
            this.equivalence_classes.normal.options.floor = f
            this.equivalence_classes.normal.invalidate()

            this.equivalence_classes.complement.options.floor = f
            this.equivalence_classes.complement.invalidate()
        })

        this.parent.on("candidates_changed", (candidates) => {
            this.equivalence_classes.normal.options.candidates = candidates
            this.equivalence_classes.complement.options.candidates = candidates
            this.equivalence_classes.normal.invalidate()
            this.equivalence_classes.complement.invalidate()
        })
    }
}