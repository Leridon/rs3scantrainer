import Widget from "lib/ui/Widget";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import LightButton from "../widgets/LightButton";
import ScanEditor from "./ScanEditor";
import {Observable} from "lib/properties/Observable";

export default class SpotOrderingWidget extends Widget<{
    changed: TileCoordinates[]
}> {
    list: Widget
    reselect_button: LightButton

    spot_order: Observable<TileCoordinates[]>

    constructor(private parent: ScanEditor,
                private value: TileCoordinates[]) {
        super()

        /*
        this.reselect_button = new LightButton("Select new spot numbering")
            .on("click", (e) => {
                if (this.interaction) {
                    this.interaction.deactivate()
                    this.interaction = null
                } else this.startSelection()
            })
            .appendTo($("<div style='text-align: center'></div>").appendTo(this.container))*/

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
    }

    setValue(value: TileCoordinates[]) {
        this.value = value
        this.update()
    }
}
