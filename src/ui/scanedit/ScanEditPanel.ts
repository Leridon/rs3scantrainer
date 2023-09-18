import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import AreaEdit from "./AreaEdit";
import TreeEdit from "./TreeEdit";
import {ScanStep} from "../../model/clues";
import {MapCoordinate} from "../../model/coordinates";
import {indirect, resolve} from "../../model/methods";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import {ScanTree} from "../../model/scans/ScanTree";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import ScanTools from "./ScanTools";
import ScanRegion = ScanTree.ScanRegion;
import resolved_scan_tree = ScanTree.resolved_scan_tree;
import indirect_scan_tree = ScanTree.indirect_scan_tree;
import narrow_down = ScanTree.narrow_down;
import assumedRange = ScanTree.assumedRange;
import Collapsible from "../widgets/modals/Collapsible";
import {ActiveOpacityGroup} from "../map/layers/OpacityLayer";
import {ExportImport} from "../../util/exportString";
import imp = ExportImport.imp;
import exp = ExportImport.exp;
import {ScanTrainerCommands} from "../../application";
import {QueryLinks} from "../../query_functions";
import Commands = QueryLinks.Commands;

export default class ScanEditPanel extends Widget<{
    "candidates_changed": MapCoordinate[]
}> {
    tools: ScanTools
    spot_ordering: SpotOrderingEdit
    areas: AreaEdit
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

                    // It's the year 2023 and TypeScript/Webpac can't deal with ciruclar dependent files. What the actual fuck.
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
        this.areas = new AreaEdit(this, value.areas, layer)
        this.tree_edit = new TreeEdit(this, value.root)

        new Collapsible("Tools", this.tools).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Spot ordering", this.spot_ordering).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Scan Areas", this.areas).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Decision/Movement Tree", this.tree_edit).addClass("fullwidth-in-panel").appendTo(this)

        this.candidates = this.clue.solution.candidates

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.value.spot_ordering = v
            this.areas.areas.forEach((a) => a.updateSpotOrder())
            this.tree_edit.update()
        })

        this.areas
            .on("changed", async (a: ScanRegion[]) => {
                this.value.areas = a

                await ScanTree.normalize(this.value)
                await this.tree_edit.update()

                this.updatePreview()
            })
            .on("decisions_changed", (decisions) => {
                this.candidates = decisions.reduce((candidates, decision) => {
                    return narrow_down(candidates, decision, assumedRange(this.value))
                }, this.clue.solution.candidates)

                this.layer.highlightCandidates(this.candidates)

                this.emit("candidates_changed", this.candidates)
            })
            .on("renamed", async (e) => {
                /*// This is old code from when scan spots were identified by name and is no longer necessary now that they are identified by an id

                function tree_renamer(node: ScanTree.decision_tree) {
                    if (!node) return

                    if (node.where_to == e.old) node.where_to = e.new

                    node.children.forEach((c) => tree_renamer(c.value))
                }

                tree_renamer(this.value.root)*/

                await this.tree_edit.update()

                this.updatePreview()
            })

        this.tree_edit.on("changed", (t) => {
            this.value.root = t
            this.updatePreview()
        }).on("decisions_loaded", (decisions) => {
            this.areas.setDecisions(decisions)
        }).on("preview_invalidated", () => {
            this.updatePreview()
        })

        this.layer.getMap().path_editor.on("active_changed", v => {
            this.preview_layer.setActive(!v)
        })

        this.updatePreview()
    }

    updatePreview() {
        console.log("Updating preview")
        if (this.preview_layer) {
            this.preview_layer.remove()
            this.preview_layer = null
        }

        this.preview_layer = new ActiveOpacityGroup(1, 0).addTo(this.layer)

        this.areas.updatePreview(this.preview_layer)
        this.tree_edit.updatePreview(this.preview_layer)
    }

    setValue(value:
                 resolved_scan_tree
    ) {
        this.value = value

        this.spot_ordering.setValue(value.spot_ordering)
        this.areas.setValue(value.areas)
        this.tree_edit.setValue(value.root)

        this.updatePreview()
    }
}