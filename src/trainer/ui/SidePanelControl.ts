import {ClueStep, ClueType} from "lib/runescape/clues";
import {Constants} from "trainer/constants";
import {Modal} from "./widgets/modal";
import {Application} from "trainer/application";
import {SolvingMethods} from "../model/methods";
import ScanTreeMethodLayer from "./map/methodlayer";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import MethodWithClue = SolvingMethods.MethodWithClue;

function createMethodLayer(method: MethodWithClue, app: Application) {
    switch (method.type) {
        case "scantree":
            return new ScanTreeMethodLayer(method as ScanTreeWithClue, app)
    }
}

// This module is a literal pile of shit and needs refactoring as soon as there is anything that needs to be changed
export class CluePanel {
    selected_clue: ClueStep = null

    constructor(private panel: JQuery, private parent: SidePanelControl) {
    }

    selectClue(clue: ClueStep) {
        if (this.selected_clue && this.selected_clue.id == clue.id) return this

        this.clue(clue)

        if (!clue) return

        let methods = this.parent.app.data.methods.forStep(clue)

        // TODO: Handle more than 1 method
        if (methods.length > 0) this.showMethod(methods[0])
        //this.parent.app.howtotabs.map.setActiveLayer(createMethodLayer(methods[0]))
        else this.showSolution()
    }

    clue(clue: ClueStep): this {
        if (clue == null) {
            this.panel.hide()
            this.parent.methods_panel.setModal(null)
            return this
        }

        if (this.selected_clue && this.selected_clue.id == clue.id) return this

        this.selected_clue = clue

        $("#clue-panel-title").attr("title", `id ${clue.id}`)
        $("#cluetext").text(clue.clue)

        $("#activecluetier")
            .attr("src", clue.tier ? Constants.icons.tiers[clue.tier] : "")
            .attr("title", ClueType.pretty(clue.tier))
        $("#activecluetype")
            .attr("src", Constants.icons.types[clue.type])
            .attr("title", ClueType.pretty(clue.type))

        // TODO: Add selection for variant if multiple
        // TODO: Add selection for method if multiple

        this.panel.show()

        // Ignore solution panels for now
        this.parent.solution_panel.hide()

        return this
    }

    showSolution(): this {
        return this

        // TODO: This is deprecated and only kept while it's used
    }

    showMethod(method): this {
        // This stupid function is necessary to work around the stupid pile of shit that is Javascript Modules.
        this.parent.app.map.map.setActiveLayer(createMethodLayer(method, this.parent.app))

        return this
    }
}

export class MethodPanel {
    private explanation_modal: Modal = null
    private explanation_button: JQuery = $("#methodexplanation")

    constructor(private panel: JQuery, private parent: SidePanelControl) {
        this.explanation_button.on("click", () => {
            this.explanation_modal.show()
        })
    }

    hide() {
        this.panel.hide()
    }

    setModal(modal: Modal) {
        this.explanation_modal = modal

        if (modal) this.explanation_button.show()
        else this.explanation_button.hide()
    }

    showSection(section: string) {
        $(".cluemethodcontent").hide()
        $(`.cluemethodcontent[data-methodsection=${section}]`).show()
        this.panel.show()
    }
}

export default class SidePanelControl {
    public side_panels = $("#sidebar-panels")
    public clue_panel = new CluePanel($("#clue-panel"), this)
    public solution_panel = $("#solution-panel")
    public methods_panel = new MethodPanel($("#method-panel"), this)

    constructor(public app: Application) {
        this.clue_panel.selectClue(null)
        this.solution_panel.hide()
        this.methods_panel.hide()
    }
}