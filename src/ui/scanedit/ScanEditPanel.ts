import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import TreeEdit from "./TreeEdit";
import {ScanStep} from "../../model/clues";
import {MapCoordinate} from "../../model/coordinates";
import {indirect, resolve} from "../../model/methods";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import {ScanTree} from "../../model/scans/ScanTree";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import ScanTools from "./ScanTools";
import resolved_scan_tree = ScanTree.resolved_scan_tree;
import indirect_scan_tree = ScanTree.indirect_scan_tree;
import Collapsible from "../widgets/modals/Collapsible";
import {ActiveOpacityGroup} from "../map/layers/OpacityLayer";
import {ExportImport} from "../../util/exportString";
import imp = ExportImport.imp;
import exp = ExportImport.exp;
import {ScanTrainerCommands} from "../../application";
import {QueryLinks} from "../../query_functions";

export default class ScanEditPanel extends Widget<{
    "candidates_changed": MapCoordinate[]
}> {
    tools: ScanTools
    spot_ordering: SpotOrderingEdit
    tree_edit: TreeEdit

    private preview_layer: ActiveOpacityGroup

    candidates: MapCoordinate[]

    constructor(public layer: ScanEditLayer, public clue: ScanStep, public value: resolved_scan_tree
    ) {
        super($(".cluemethodcontent[data-methodsection=scanedit]").empty())

        {
            let control_row = $("<div style='text-align: center'></div>").appendTo(this.container)

            $("<div class='lightbutton'>Show JSON</div>")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(indirect(this.value), null, 2))
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Export</div>")
                .on("click", () => {
                    ExportStringModal.do(exp({
                        type: "scantree",
                        version: 0
                    }, true, true)(indirect(this.value)), "Copy the string below to share this scan route.")
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Import</div>")
                .on("click", () => {
                    ImportStringModal.do((s) => {
                        let i = imp<indirect_scan_tree>({expected_type: "scantree", expected_version: 0})(s)

                        if (i.clue != this.clue.id) throw new Error("This method is not for the currently loaded clue")

                        return resolve(i)
                    })
                        .then((obj: resolved_scan_tree) => {
                            this.setValue(obj)
                        })
                })
                .appendTo(control_row)

            $("<div class='lightbutton' title='Open the route in training mode.'>Try</div>")
                .on("click", () => {

                    // It's the year 2023 and TypeScript/Webpack can't properly deal with circular dependent files. What the actual fuck.
                    this.layer.app.sidepanels.clue_panel.showMethod(this.value)
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Share</div>")
                .on("click", () => {
                    ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_method, {method: indirect(this.value)}), "The link below is a direct link to this method.")
                })
                .appendTo(control_row)
        }

        this.tools = new ScanTools(this)
        this.spot_ordering = new SpotOrderingEdit(layer, value.spot_ordering)
        this.tree_edit = new TreeEdit(this, value.root)

        new Collapsible("Tools", this.tools).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Spot ordering", this.spot_ordering).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Decision/Movement Tree", this.tree_edit).addClass("fullwidth-in-panel").appendTo(this)

        this.candidates = this.clue.solution.candidates

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.value.spot_ordering = v
            this.tree_edit.update()
        })

        this.tree_edit.on("changed", (t) => {
            this.value.root = t
            this.updatePreview()
        }).on("preview_invalidated", () => {
            this.updatePreview()
        })

        this.layer.getMap().path_editor.on("active_changed", v => {
            this.preview_layer.setActive(!v)
        })

        this.updatePreview()
    }

    updatePreview() {
        if (this.preview_layer) {
            this.preview_layer.remove()
            this.preview_layer = null
        }

        this.preview_layer = new ActiveOpacityGroup(1, 0).addTo(this.layer)

        this.tree_edit.updatePreview(this.preview_layer)
    }

    setValue(value:
                 resolved_scan_tree
    ) {
        this.value = value

        this.spot_ordering.setValue(value.spot_ordering)
        this.tree_edit.setValue(value.root)

        this.updatePreview()
    }
}