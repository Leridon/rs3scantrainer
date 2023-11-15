import SpotOrderingEdit from "./SpotOverview";
import TreeEdit from "./TreeEdit";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import ScanTools from "./ScanTools";
import Collapsible from "../widgets/modals/Collapsible";
import {ExportImport} from "lib/util/exportString";
import imp = ExportImport.imp;
import exp = ExportImport.exp;
import {ScanTrainerCommands} from "trainer/application";
import {QueryLinks} from "trainer/query_functions";
import ScanEditor from "./ScanEditor";
import {omit} from "lodash";
import {SolvingMethods} from "../../model/methods";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import withoutClue = SolvingMethods.withoutClue;
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import withClue = SolvingMethods.withClue;
import {SidePanel} from "../SidePanelControl";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import LightButton from "../widgets/LightButton";

export default class ScanEditPanel extends SidePanel {
    tools: ScanTools
    spot_ordering: SpotOrderingEdit
    tree_edit: TreeEdit

    candidates: TileCoordinates[]

    constructor(public parent: ScanEditor) {
        super()

        this.title.set("Scan Tree Edit")

        {
            hbox(
                new LightButton("Show JSON")
                    .on("click", () => {
                        ExportStringModal.do(JSON.stringify(withoutClue(this.parent.builder.tree), null, 2))
                    }),

                new LightButton("Export")
                    .on("click", () => {
                        ExportStringModal.do(exp({
                            type: "scantree",
                            version: 0
                        }, true, true)(withoutClue(this.parent.builder.tree)), "Copy the string below to share this scan route.")
                    }),

                new LightButton("Import")
                    .on("click", () => {
                        ImportStringModal.do((s) => {
                            let i = imp<ScanTreeMethod>({expected_type: "scantree", expected_version: 0})(s)

                            if (i.clue_id != this.parent.options.clue.id) throw new Error("This method is not for the currently loaded clue")

                            return withClue(i, this.parent.options.clue)
                        })
                            .then((obj: ScanTreeWithClue) => {
                                // TODO: Reimplement import/set value
                            })
                    }),

                new LightButton("Try")
                    .tooltip('Open the route in training mode.')
                    .on("click", () => {

                        this.parent.app.showMethod(this.parent.builder.tree)
                    }),

                new LightButton("Share")
                    .on("click", () => {
                        ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_method, {method: omit(this.parent.builder.tree, "clue")}), "The link below is a direct link to this method.")
                    })
            ).addClass("ctr-button-container").appendTo(this.container)
        }

        this.tools = new ScanTools(this).appendTo(this)
        this.spot_ordering = new SpotOrderingEdit(parent.builder)
        this.tree_edit = new TreeEdit(this, this.parent.builder.tree.root)

        new Collapsible("Overview", this.spot_ordering).addClass("fullwidth-in-panel").appendTo(this)
        new Collapsible("Movement Tree", this.tree_edit).addClass("fullwidth-in-panel").appendTo(this)

        this.candidates = this.parent.options.clue.solution.candidates
    }
}