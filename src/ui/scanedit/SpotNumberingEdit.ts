import Widget from "../widgets/Widget";
import {eq, MapCoordinate} from "../../model/coordinates";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import SelectDigSpotsInteraction from "./SelectDigSpotsInteraction";
import Collapsible from "../widgets/modals/Collapsible";

export default class SpotOrderingWidget extends Widget<{
    changed: MapCoordinate[]
}> {
    collapsible: Collapsible
    list: JQuery
    reselect_button: JQuery

    interaction: SelectDigSpotsInteraction = null

    constructor(private layer: ScanEditLayer,
                private value: MapCoordinate[]) {
        super($("<div>"))

        this.collapsible = new Collapsible(this.container, "Dig spots").appendTo(this)

        this.reselect_button = $("<div class='lightbutton'>Select new spot numbering</div>")
            .on("click", (e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.collapsible.content.container))

        this.collapsible.content.append(this.list = $("<div>"))

        this.setValue(value)
    }

    private update() {
        this.list.empty()

        $("<div class='row'>")
            .append($("<div class='col-3' style='text-align: center'>").text("#"))
            .append($("<div class='col-3' style='text-align: center'>").text("x"))
            .append($("<div class='col-3' style='text-align: center'>").text("y"))
            .append($("<div class='col-3' style='text-align: center'>").text("Floor"))
            .appendTo(this.list)

        this.value.forEach((v, i) => {
            $("<div class='row'>")
                .append($("<div class='col-3' style='text-align: center'>").text(i + 1))
                .append($("<div class='col-3' style='text-align: center'>").text(v.x))
                .append($("<div class='col-3' style='text-align: center'>").text(v.y))
                .append($("<div class='col-3' style='text-align: center'>").text(v.level ?? 0))
                .appendTo(this.list)
        })

        // Draw ordering on map
        this.layer.setSpotOrder(this.value)
    }

    private old_value: MapCoordinate[] = null

    startSelection(): SelectDigSpotsInteraction {
        this.old_value = this.value

        let interaction = new SelectDigSpotsInteraction(this.layer)

        this.reselect_button.text("Save")

        let old_hightlight = this.layer.highlightedCandidates()

        interaction.events.on("changed", (l) => {
            //this.layer.highlightCandidates(l)
            this.setValue(l)
        })
            .on("done", (l) => {
                this.reselect_button.text("Select new order")

                let unaccounted = this.old_value.filter((c) => !l.some((i) => eq(i, c)))

                l = l.concat(...unaccounted)

                this.setValue(l)

                this.emit("changed", l)

                this.layer.highlightCandidates(old_hightlight)
            })

        this.setValue([])

        this.layer.highlightCandidates(this.layer.clue.solution.candidates)

        return this.interaction = interaction.activate()
    }

    setValue(value: MapCoordinate[]) {
        this.value = value
        this.update()
    }
}
