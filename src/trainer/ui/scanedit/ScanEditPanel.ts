import Widget from "../widgets/Widget";
import SpotOrderingEdit from "./SpotNumberingEdit";
import TreeEdit from "./TreeEdit";
import {MapCoordinate} from "lib/runescape/coordinates";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import ScanTools from "./ScanTools";
import Collapsible from "../widgets/modals/Collapsible";
import {ExportImport} from "../../../lib/util/exportString";
import imp = ExportImport.imp;
import exp = ExportImport.exp;
import {ScanTrainerCommands} from "trainer/application";
import {QueryLinks} from "trainer/query_functions";
import ScanEditor from "./ScanEditor";
import {omit, without} from "lodash";
import {SolvingMethods} from "../../model/methods";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import withoutClue = SolvingMethods.withoutClue;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import withClue = SolvingMethods.withClue;

export default class ScanEditPanel extends Widget<{
    "candidates_changed": MapCoordinate[]
}> {
    tools: ScanTools
    spot_ordering: SpotOrderingEdit
    tree_edit: TreeEdit

    candidates: MapCoordinate[]

    constructor(public parent: ScanEditor) {
        super($(".cluemethodcontent[data-methodsection=scanedit]").empty())

        {
            let control_row = $("<div style='text-align: center'></div>").appendTo(this.container)

            $("<div class='lightbutton'>Show JSON</div>")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(withoutClue(this.parent.value), null, 2))
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Export</div>")
                .on("click", () => {
                    ExportStringModal.do(exp({
                        type: "scantree",
                        version: 0
                    }, true, true)(withoutClue(this.parent.value)), "Copy the string below to share this scan route.")
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Import</div>")
                .on("click", () => {
                    ImportStringModal.do((s) => {
                        let i = imp<ScanTreeMethod>({expected_type: "scantree", expected_version: 0})(s)

                        if (i.clue_id != this.parent.options.clue.id) throw new Error("This method is not for the currently loaded clue")

                        return withClue(i, this.parent.options.clue)
                    })
                        .then((obj: ScanTreeWithClue) => {
                            // TODO: Reimplement import/set value
                        })
                })
                .appendTo(control_row)

            $("<div class='lightbutton' title='Open the route in training mode.'>Try</div>")
                .on("click", () => {

                    // It's the year 2023 and TypeScript/Webpack can't properly deal with circular dependent files. What the actual fuck.
                    this.parent.app.sidepanels.clue_panel.showMethod(this.parent.value)
                })
                .appendTo(control_row)

            $("<div class='lightbutton'>Share</div>")
                .on("click", () => {
                    ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_method, {method: omit(this.parent.value, "clue")}), "The link below is a direct link to this method.")
                })
                .appendTo(control_row)
        }

        this.tools = new ScanTools(this)
        this.spot_ordering = new SpotOrderingEdit(parent, this.parent.value.spot_ordering)
        this.tree_edit = new TreeEdit(this, this.parent.value.root)

        new Collapsible("Tools", this.tools).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Spot ordering", this.spot_ordering).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Movement Tree", this.tree_edit).addClass("fullwidth-in-panel").appendTo(this)

        this.candidates = this.parent.options.clue.solution.candidates

        this.spot_ordering.on("changed", (v: MapCoordinate[]) => {
            this.parent.value.spot_ordering = v
        })
    }
}