import Widget from "../widgets/Widget";
import AreaWidget from "./AreaWidget";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "../../model/scans/ScanTree";
import ScanSpot = ScanTree.ScanSpot;
import ScanDecision = ScanTree.ScanDecision;
import Collapsible from "../widgets/modals/Collapsible";

export default class AreaEdit extends Widget<{
    changed: ScanSpot[],
    decisions_changed: ScanDecision[],
    renamed: { old: string, new: string }
}> {
    collapsible: Collapsible

    area_container: JQuery
    areas: AreaWidget[]

    add_button?: JQuery

    constructor(
        public parent: ScanEditPanel,
        private value: ScanSpot[],
        private layer: ScanEditLayer
    ) {
        super($("<div>"))

        this.collapsible = new Collapsible(this.container, "Scan Spots")

        this.area_container = $("<div>").appendTo(this.collapsible.content.container)
        this.areas = []

        this.add_button = $("<div class='lightbutton'>+ Add area</div>")
            .on("click", () => {
                let w = this.addWidget({name: "New", level: 0, area: {topleft: {x: 0, y: 0}, botright: {x: 0, y: 0}}})
                    .toggleEdit()

                w.startRedraw().events.on("done", () => {
                    (w.edit_panel.name[0] as HTMLInputElement).select()

                    this.emit("changed", this.value)
                })

                this.value.push(w.value)
                this.emit("changed", this.value)
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.collapsible.content.container))

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

                    this.value = this.areas.map((a) => a.value)

                    this.emit("decisions_changed", this.getDecisions())
                    this.emit("changed", this.value)
                })
                .on("decision_changed", (d) => {
                    this.emit("decisions_changed", this.getDecisions())
                })
                .on("changed", () => {
                    this.emit("changed", this.value)
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