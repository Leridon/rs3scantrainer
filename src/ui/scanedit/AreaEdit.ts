import Widget from "../widgets/Widget";
import AreaWidget from "./AreaWidget";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "../../model/scans/ScanTree";
import ScanSpot = ScanTree.ScanRegion;
import ScanInformation = ScanTree.ScanInformation;
import LightButton from "../widgets/LightButton";
import {OpacityGroup} from "../map/layers/OpacityLayer";
import DrawAreaInteraction from "./DrawAreaInteraction";
import {MapRectangle} from "../../model/coordinates";

export default class AreaEdit extends Widget<{
    changed: ScanSpot[],
    decisions_changed: ScanInformation[],
    renamed: { old: string, new: string }
}> {
    area_container: Widget
    areas: AreaWidget[]

    add_button?: LightButton

    constructor(
        public parent: ScanEditPanel,
        private value: ScanSpot[],
        private layer: ScanEditLayer
    ) {
        super()

        this.area_container = c("<div>").appendTo(this)
        this.areas = []

        this.add_button = new LightButton("+ Add area")
            .on("click", () => this.create_new_area())
            .appendTo(c("<div style='text-align: center'></div>").appendTo(this))

        this.update()
    }

    public async create_new_area(): Promise<ScanSpot> {
        return new Promise(resolve => {
            let interaction = new DrawAreaInteraction(this.layer)

            interaction.events.on("done", (v) => {
                let area = ScanTree.createNewSpot(this.parent.value, v)

                this.addWidget(area).toggleEdit()

                this.emit("changed", this.value)

                resolve(area)
            })

            interaction.activate()
        })
    }

    public update() {
        this.areas.forEach((a) => a.remove())
        this.areas = []
        this.value.forEach((a) => this.addWidget(a))
    }

    public getDecisions(): ScanInformation[] {
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
                .appendTo(this)

        this.areas.push(w)

        return w
    }

    setDecisions(decisions: ScanInformation[]) {
        this.areas.forEach((a) => {
            let d = decisions.find((e) => false /*e.area == a.value*/)

            // TODO: This needs to be completely rethought after the refactor

            if (d != null) a.setDecision(d)
            else a.setDecision(null)
        })

        this.emit("decisions_changed", decisions)
    }

    setValue(value: ScanSpot[]) {
        this.value = value
        this.update()
    }

    updatePreview(layer: OpacityGroup) {
        this.areas.forEach(a => a.updatePreview(layer))
    }
}