import Widget from "../widgets/Widget";
import AreaWidget from "./AreaWidget";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree2} from "../../model/scans/ScanTree2";
import ScanSpot = ScanTree2.ScanSpot;
import ScanDecision = ScanTree2.ScanDecision;

export default class AreaEdit extends Widget<{
    changed: ScanSpot[],
    decisions_changed: ScanDecision[],
    renamed: { old: string, new: string }
}> {
    area_container: JQuery
    areas: AreaWidget[]

    add_button?: JQuery

    constructor(
        public parent: ScanEditPanel,
        private value: ScanSpot[],
        private layer: ScanEditLayer
    ) {
        super($("<div>"))

        $("<h4>Scan Spots</h4>").appendTo(this.container)

        this.area_container = $("<div>").appendTo(this.container)
        this.areas = []

        this.add_button = $("<div class='lightbutton' style='width: 100%'>+ Add area</div>")
            .on("click", () => {
                let w = this.addWidget({name: "New", area: {topleft: {x: 0, y: 0}, botright: {x: 0, y: 0}}})
                    .on("deleted", (spot) => {
                        this.value.splice(this.value.indexOf(spot), 1)
                        this.emit("changed", this.value)
                    })
                    .on("changed", () => {
                        this.emit("changed", this.value)
                    })
                    .toggleEdit()

                w.startRedraw().events.on("done", () => {
                    (w.edit_panel.name[0] as HTMLInputElement).select()
                    this.emit("changed", this.value)
                })

                this.value.push(w.value)
                this.emit("changed", this.value)
            })
            .appendTo(this.container)

        this.update()
    }

    private update() {
        this.areas.forEach((a) => a.remove())
        this.areas = []
        this.value.forEach((a) => this.addWidget(a))
    }

    public getDecisions(): ScanDecision[] {
        return this.areas.map((a) => a.getActiveDecision()).filter((d) => d != null)
    }

    private addWidget(area: ScanSpot): AreaWidget {
        let w =
            new AreaWidget(this, this.layer, area)
                .on("deleted", () => {
                    this.areas.splice(this.areas.indexOf(w), 1)
                    this.emit("decisions_changed", this.getDecisions())
                    this.emit("changed", this.value)
                })
                .on("decision_changed", (d) => {
                    this.emit("decisions_changed", this.getDecisions())
                })
                .on("renamed", (e) => this.emit("renamed", e))

        w.container.appendTo(this.area_container)
        this.areas.push(w)

        return w
    }

    setDecisions(decisions: ScanDecision[]) {
        this.areas.forEach((a) => {
            let d = decisions.find((e) => e.area == a.value)

            if (d != null) a.setDecision(d.ping)
            else a.setDecision(null)
        })

        this.emit("decisions_changed", decisions)
    }

    setValue(value: ScanSpot[]) {
        this.value = value
        this.update()
    }
}