import Widget from "../widgets/Widget";
import {ScanSpot} from "../../model/methods";
import AreaWidget from "./AreaWidget";
import {ScanEditLayer} from "../map/layers/ScanLayer";

export default class AreaEdit extends Widget<{
    changed: ScanSpot[]
}>{
    area_container: JQuery
    areas: AreaWidget[]

    add_button?: JQuery

    constructor(
        private value: ScanSpot[],
        private layer: ScanEditLayer
    ) {
        super($("<div>"))

        $("<h4>Scan Spots</h4>").appendTo(this.container)

        this.area_container = $("<div>").appendTo(this.container)
        this.areas = []


        this.add_button = $("<div class='lightbutton'>+ Add area</div>")
            .on("click", () => {
                let w = this.addArea({name: "New", area: {topleft: {x: 0, y: 0}, botright: {x: 0, y: 0}}})
                    .toggleEdit()
                w.startRedraw().events.on("done", () => (w.edit_panel.name[0] as HTMLInputElement).select())
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))

        this.setAreas(this.value)
    }

    private addArea(area: ScanSpot): AreaWidget {
        let w =
            new AreaWidget(this.layer, area)
                .on("deleted", () => this.areas.splice(this.areas.indexOf(w), 1))

        w.container.appendTo(this.area_container)
        this.areas.push(w)

        return w
    }

    setAreas(areas: ScanSpot[]) {
        this.areas.forEach((a) => a.delete())

        areas.forEach((a) => this.addArea(a))
    }
}