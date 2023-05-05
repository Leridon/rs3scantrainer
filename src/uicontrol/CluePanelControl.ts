import {ClueStep, pretty, SetSolution, SimpleSolution, Solution, VariantSolution} from "../model/clues";
import {icons} from "../constants";
import {forClue} from "../data/methods";
import {Method} from "../model/methods";
import {Application} from "../application";
import {getSolutionLayer} from "./map/solutionlayer";

export default class CluePanelControl {

    private clue_panel = $("#solutionpanel")

    selected_clue: ClueStep = null

    constructor(private app: Application) {
        this.clue_panel.hide()
    }

    selectClue(clue: ClueStep) {
        if (this.selected_clue && this.selected_clue.id == clue.id) return
        
        this.selected_clue = clue

        this.clue_panel.show()

        $("#clue-panel-title").attr("title", clue.id)
        $("#cluetext").text(clue.clue)

        $("#activecluetier")
            .attr("src", clue.tier ? icons.tiers[clue.tier] : "")
            .attr("title", pretty(clue.tier))
        $("#activecluetype")
            .attr("src", icons.types[clue.type])
            .attr("title", pretty(clue.type))

        if (clue.solution && false) {
            // TODO: Reenable solutions when they are ready.
            $("#cluesolution").show()

            if (clue.solution.type == "simple") {
                // TODO: Display coordinates with map
                $("#cluesolutioncontent").text((clue.solution as SimpleSolution).answer)
            }
            // TODO: Display other solution types.
        } else {
            $("#cluesolution").hide()
        }

        this.app.howtotabs.map.setSolutionLayer(getSolutionLayer(clue))

        let methods = forClue(clue)

        // TODO: Handle more than 1 method
        if (methods.length > 0) {
            this.setMethod(methods[0])
        } else {
            $("#cluemethod").hide()
            this.app.howtotabs.setHowToTabs({})
        }
    }

    setMethod(method: Method) {
        $(".cluemethodcontent").hide()
        method.sendToUi(this.app)
        $(`.cluemethodcontent[data-methodtype=${method.type}]`).show()

        $("#cluemethod").show()
        this.app.howtotabs.setHowToTabs(method.howto())
    }
}