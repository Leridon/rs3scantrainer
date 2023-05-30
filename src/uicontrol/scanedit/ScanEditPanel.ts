import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import AreaEdit from "./AreaEdit";
import TreeEdit from "./TreeEdit";
import {ScanStep} from "../../model/clues";
import {MapCoordinate} from "../../model/coordinates";
import {ScanSpot} from "../../model/methods";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import PathEdit from "./PathEdit";
import {ScanTree2} from "../../model/scans/ScanTree2";
import resolved_tree = ScanTree2.resolved_tree;


export default class ScanEditPanel extends Widget {
    spot_ordering: SpotOrderingEdit
    areas: AreaEdit
    tree_edit: TreeEdit
    path_edit: PathEdit

    constructor(public layer: ScanEditLayer, public clue: ScanStep, public value: resolved_tree) {
        super($(".cluemethodcontent[data-methodsection=scanedit]").empty())

        this.spot_ordering = new SpotOrderingEdit(layer, value.spot_ordering).appendTo(this)
        this.areas = new AreaEdit(this, value.areas, layer).appendTo(this)
        this.tree_edit = new TreeEdit(this, value.root).appendTo(this)
        this.path_edit = new PathEdit(this, this.value.methods).appendTo(this)

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.value.spot_ordering = v
            this.areas.areas.forEach((a) => a.updateSpotOrder())
            this.tree_edit.update()
        })

        this.areas
            .on("changed", (a: ScanSpot[]) => {
                this.value.areas = a
                this.tree_edit.update()
            })
            .on("decisions_changed", (decisions) => {
                this.layer.updateCandidates(decisions)
            })

        this.tree_edit.on("changed", (t) => {
            console.log("Changed")
            this.value.root = t
            this.path_edit.update()
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