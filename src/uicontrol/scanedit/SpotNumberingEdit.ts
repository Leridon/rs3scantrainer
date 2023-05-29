import Widget from "../widgets/Widget";
import {eq, MapCoordinate} from "../../model/coordinates";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import SelectDigSpotsInteraction from "./SelectDigSpotsInteraction";

export default class SpotOrderingWidget extends Widget<{
    changed: MapCoordinate[]
}> {
    list: JQuery
    reselect_button: JQuery

    interaction: SelectDigSpotsInteraction = null

    constructor(private layer: ScanEditLayer,
                private value: MapCoordinate[]) {
        super($("<div>"))

        this.append($("<h4>Spot numbering</h4>"))

        this.append(this.list = $("<div>"))

        this.reselect_button = $("<div class='lightbutton'>Select new order</div>")
            .on("click", (e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))

        this.update(value)
    }

    private update(ordering: MapCoordinate[]) {
        this.value = ordering

        this.list.empty()

        $("<div class='row'>")
            .append($("<div class='col-2' style='text-align: center'>").text("#"))
            .append($("<div class='col-5' style='text-align: center'>").text("x"))
            .append($("<div class='col-5' style='text-align: center'>").text("y"))
            .appendTo(this.list)

        ordering.forEach((v, i) => {
            $("<div class='row'>")
                .append($("<div class='col-2' style='text-align: center'>").text(i + 1))
                .append($("<div class='col-5' style='text-align: center'>").text(v.x))
                .append($("<div class='col-5' style='text-align: center'>").text(v.y))
                .appendTo(this.list)
        })

        // Draw ordering on map
        this.layer.setSpotOrder(ordering)
    }

    private old_value: MapCoordinate[] = null

    startSelection(): SelectDigSpotsInteraction {
        this.old_value = this.value

        let interaction = new SelectDigSpotsInteraction(this.layer)

        this.reselect_button.text("Save")

        let old_hightlight = this.layer.highlightedCandidates()

        interaction.events.on("changed", (l) => {
            this.layer.highlightCandidates(l)
            this.update(l)
        })
            .on("done", (l) => {
                this.reselect_button.text("Select new order")

                let unaccounted = this.old_value.filter((c) => !l.some((i) => eq(i, c)))

                l = l.concat(...unaccounted)

                this.update(l)

                this.emit("changed", l)

                this.layer.highlightCandidates(old_hightlight)
            })

        this.update([])

        return this.interaction = interaction.activate()
    }
}
