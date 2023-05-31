import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import AreaEdit from "./AreaEdit";
import TreeEdit from "./TreeEdit";
import {ScanStep} from "../../model/clues";
import {MapCoordinate} from "../../model/coordinates";
import {indirect} from "../../model/methods";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import PathEdit from "./PathEdit";
import {ScanTree2} from "../../model/scans/ScanTree2";
import ScanSpot = ScanTree2.ScanSpot;
import resolved_scan_tree = ScanTree2.resolved_scan_tree;

export default class ScanEditPanel extends Widget {
    spot_ordering: SpotOrderingEdit
    areas: AreaEdit
    tree_edit: TreeEdit
    path_edit: PathEdit

    constructor(public layer: ScanEditLayer, public clue: ScanStep, public value: resolved_scan_tree) {
        super($(".cluemethodcontent[data-methodsection=scanedit]").empty())

        this.spot_ordering = new SpotOrderingEdit(layer, value.spot_ordering).appendTo(this)
        this.areas = new AreaEdit(this, value.areas, layer).appendTo(this)
        this.tree_edit = new TreeEdit(this, value.root).appendTo(this)
        this.path_edit = new PathEdit(this, this.value.methods).appendTo(this)

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.value.spot_ordering = v
            this.areas.areas.forEach((a) => a.updateSpotOrder())
            this.tree_edit.update()
            this.path_edit.update()
        })

        this.areas
            .on("changed", (a: ScanSpot[]) => {
                console.log("Changed areas")
                this.value.areas = a
                this.tree_edit.update()
                this.path_edit.clean()
            })
            .on("decisions_changed", (decisions) => {
                this.layer.updateCandidates(decisions)
            })
            .on("renamed", (e) => {
                function tree_renamer(node: ScanTree2.decision_tree) {
                    if (node.where == e.old) node.where = e.new

                    node.children.forEach((c) => tree_renamer(c.value))
                }

                tree_renamer(this.value.root)

                this.tree_edit.update()

                this.value.methods.forEach((m) => {
                    if (m.from == e.old) m.from = e.new
                    if (m.to == e.old) m.to = e.new
                })

                this.path_edit.update()
            })

        this.tree_edit.on("changed", (t) => {
            console.log("Changed tree")
            this.value.root = t
            this.path_edit.clean()
        }).on("decisions_loaded", (decisions) => {
            this.areas.setDecisions(decisions)
        })

        this.path_edit.on("changed", (v) => {
            console.log("Changed paths")
            this.value.methods = v
        })

        $("<div class='lightbutton'>Export</div>")
            .on("click", () => {
                console.log(JSON.stringify(indirect(this.value)))
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))
    }
}