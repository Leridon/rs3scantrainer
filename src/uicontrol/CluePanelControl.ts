import {ClueStep, pretty, SetSolution, SimpleSolution, Solution, VariantSolution} from "../model/clues";
import {icons} from "../constants";
import {MarkerLayer, TileMarker} from "./map/map";
import {forClue} from "../data/methods";
import {Method} from "../model/methods";
import {Application} from "../application";

export default class CluePanelControl {

    private clue_panel =  $("#solutionpanel")

    constructor(private app: Application) {
        this.clue_panel.hide()
    }


    selectClue(clue: ClueStep) {
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

        function getSolutionLayer(solution: Solution) {
            if (clue.solution) {
                switch (clue.solution.type) {
                    case "coordset":
                        return new MarkerLayer((solution as SetSolution).candidates.map((e) => {
                            return new TileMarker(e).withMarker().withX("#B21319")
                        }))
                    case "simple":
                        return new MarkerLayer([
                            new TileMarker((solution as SimpleSolution).coordinates).withMarker().withX("#B21319")
                        ])
                    case "variants":
                        // TODO: Properly handle variant solutions
                        return getSolutionLayer((solution as VariantSolution).variants[0].solution)

                }
            }
        }

        this.app.howtotabs.map.setSolutionLayer(getSolutionLayer(clue.solution))

        let methods = forClue(clue)

        this.app.howtotabs.map.resetMethodLayers()
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