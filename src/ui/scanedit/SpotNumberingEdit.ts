import Widget from "../widgets/Widget";
import {MapCoordinate, Vector2} from "../../model/coordinates";
import {ScanEditLayer} from "../map/layers/ScanLayer";
import SelectDigSpotsInteraction from "./SelectDigSpotsInteraction";
import Collapsible from "../widgets/modals/Collapsible";
import LightButton from "../widgets/LightButton";

export default class SpotOrderingWidget extends Widget<{
    changed: MapCoordinate[]
}> {
    list: Widget
    reselect_button: LightButton

    interaction: SelectDigSpotsInteraction = null

    constructor(private layer: ScanEditLayer,
                private value: MapCoordinate[]) {
        super()

        this.reselect_button = new LightButton("Select new spot numbering")
            .on("click", (e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))

        this.append(this.list = c("<div>"))

        this.setValue(value)
    }

    private update() {
        this.list.empty()

        c("<div class='row'>")
            .append(c("<div class='col-3' style='text-align: center'>").text("#"))
            .append(c("<div class='col-3' style='text-align: center'>").text("x"))
            .append(c("<div class='col-3' style='text-align: center'>").text("y"))
            .append(c("<div class='col-3' style='text-align: center'>").text("Floor"))
            .appendTo(this.list)

        this.value.forEach((v, i) => {
            c("<div class='row'>")
                .append(c("<div class='col-3' style='text-align: center'>").text(i + 1))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.x))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.y))
                .append(c("<div class='col-3' style='text-align: center'>").text(v.level ?? 0))
                .appendTo(this.list)
        })

        // Draw ordering on map
        this.layer.setSpotOrder(this.value)
    }

    startSelection(): SelectDigSpotsInteraction {
        let old_value = this.value

        let interaction = new SelectDigSpotsInteraction(this.layer)

        this.reselect_button.setVisible(false)

        let old_hightlight = this.layer.highlightedCandidates()

        interaction.events
            .on("changed", (l) => {
                this.setValue(l)
            })
            .on("done", (l) => {
                this.interaction = null

                this.reselect_button.setVisible(true)

                let unaccounted = old_value.filter((c) => !l.some((i) => Vector2.eq(i, c)))

                l = l.concat(...unaccounted)

                this.setValue(l)

                this.emit("changed", l)

                this.layer.highlightCandidates(old_hightlight)
            })
            .on("cancelled", () => {
                this.interaction = null

                this.reselect_button.setVisible(true)

                this.setValue(old_value)

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
