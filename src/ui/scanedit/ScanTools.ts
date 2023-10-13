import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import * as leaflet from "leaflet"
import Checkbox from "../widgets/inputs/Checkbox";
import {ScanEquivalenceClasses} from "../../model/scans/scans";
import {ScanTree} from "../../model/scans/ScanTree";
import assumedRange = ScanTree.assumedRange;
import LightButton from "../widgets/LightButton";
import {Vector2} from "../../util/math";

export default class ScanTools extends Widget {
    equivalence_classes: {
        normal?: ScanEquivalenceClasses,
        complement?: ScanEquivalenceClasses
    } = {}

    constructor(private parent: ScanEditPanel) {
        super();

        let btn_container = c("<div style='text-align: center'>").appendTo(this.container)

        new LightButton("Center on Spots")
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.clue.solution.candidates.forEach((c) => bounds.extend(Vector2.toLatLong(c)))

                bounds.pad(0.1)

                this.parent.layer.getMap().map.fitBounds(bounds)
            })
            .appendTo(btn_container)

        new LightButton("Center on Complement")
            .on("click", () => {
                let bounds = leaflet.latLngBounds([])

                this.parent.clue.solution.candidates.forEach((c) => {
                    bounds.extend(Vector2.toLatLong({
                        x: c.x,
                        y: (c.y < 6400 ? c.y + 6400 : c.y - 6400)
                    }))
                })
                bounds.pad(0.1)

                this.parent.layer.getMap().map.fitBounds(bounds)
            })
            .appendTo(btn_container)

        c("<div style='font-weight: bold'>Show Equivalence Classes</div>").appendTo(this)

        c("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                if (v) this.equivalence_classes.normal.getLayer().addTo(this.parent.layer)
                else {
                    this.equivalence_classes.normal.getLayer().remove()
                    this.equivalence_classes.normal.layer = null
                }
            }))
            .append(c("<div class='col-4' style='margin-left: 5px'>Spots</div>"))
            .appendTo(this)

        c("<div style='display: flex; padding-left: 5px'>")
            .append(new Checkbox().on("changed", (v) => {
                if (v) this.equivalence_classes.complement.getLayer().addTo(this.parent.layer)
                else {
                    this.equivalence_classes.complement.getLayer().remove()
                    this.equivalence_classes.complement.layer = null
                }
            }).container)
            .append(c("<div class='col-4' style='margin-left: 5px'>Complement</div>"))
            .appendTo(this)

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