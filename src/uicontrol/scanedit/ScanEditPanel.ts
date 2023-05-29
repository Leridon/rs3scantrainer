import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import AreaEdit from "./AreaEdit";
import TreeEdit from "./TreeEdit";
import {ScanStep} from "../../model/clues";
import {MapCoordinate} from "../../model/coordinates";
import {ScanSpot} from "../../model/methods";
import {ScanEditLayer, tree} from "../map/layers/ScanLayer";


export default class ScanEditPanel extends Widget {
    spot_ordering: SpotOrderingEdit
    areas: AreaEdit
    tree_edit: TreeEdit

    constructor(public layer: ScanEditLayer, public clue: ScanStep, public value: tree) {
        super($(".cluemethodcontent[data-methodsection=scanedit]").empty())

        this.spot_ordering = new SpotOrderingEdit(layer, value.spot_ordering).appendTo(this.container)
        this.areas = new AreaEdit(this, value.areas, layer).appendTo(this.container)
        this.tree_edit = new TreeEdit(this, value.root).appendTo(this.container)

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.value.spot_ordering = v
            this.areas.areas.forEach((a) => a.updateSpotOrder())
            this.tree_edit.update()
        })

        this.areas
            .on("changed", (a: ScanSpot[]) => {
                this.value.areas = a
                console.log("Registered")
                this.tree_edit.update()
            })
            .on("decisions_changed", (decisions) => {
                this.layer.updateCandidates(decisions)
            })

        this.tree_edit.on("changed", (t) => {
            this.value.root = t
        }).on("decisions_loaded", (decisions) => {
            this.areas.setDecisions(decisions)
        })

        $("<div class='lightbutton'>Export</div>")
            .on("click", () => {
                console.log(this.value)
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))
    }
}