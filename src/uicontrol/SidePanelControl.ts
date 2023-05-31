import {ClueStep, pretty} from "../model/clues";
import {Constants} from "../constants";
import {Application} from "../application";
import {getSolutionLayer} from "./map/activeLayer";
import {Modal} from "./widgets/modal";

export class CluePanel {
    selected_clue: ClueStep = null

    constructor(private panel: JQuery, private parent: SidePanelControl) {
    }

    selectClue(clue: ClueStep) {
        if (clue == null) {
            this.panel.hide()
            this.parent.methods_panel.setModal(null)
            return
        }

        if (this.selected_clue && this.selected_clue.id == clue.id) return

        this.selected_clue = clue

        $("#clue-panel-title").attr("title", `id ${clue.id}`)
        $("#cluetext").text(clue.clue)

        $("#activecluetier")
            .attr("src", clue.tier ? Constants.icons.tiers[clue.tier] : "")
            .attr("title", pretty(clue.tier))
        $("#activecluetype")
            .attr("src", Constants.icons.types[clue.type])
            .attr("title", pretty(clue.type))

        // TODO: Add selection for variant if multiple
        // TODO: Add selection for method if multiple

        this.panel.show()

        // Ignore solution panels for now
        this.parent.solution_panel.hide()

        let methods = forClue(clue)

        // TODO: Handle more than 1 method
        if (methods.length > 0) {
            this.parent.app.howtotabs.map.setActiveLayer(methods[0].methodLayer(this.parent.app))
        } else {
            this.parent.app.howtotabs.map.setActiveLayer(getSolutionLayer(clue, this.parent.app))

            this.parent.methods_panel.hide()

            this.parent.app.howtotabs.setHowToTabs({})
        }
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