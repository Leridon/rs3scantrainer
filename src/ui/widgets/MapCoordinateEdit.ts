import Widget from "./Widget";
import {floor_t, MapCoordinate} from "../../model/coordinates";
import {ActiveLayer} from "../map/activeLayer";
import SmallImageButton from "./SmallImageButton";
import SelectTileInteraction from "../map/interactions/SelectTileInteraction";
import * as lodash from "lodash"

export default class MapCoordinateEdit extends Widget<{
    "changed": MapCoordinate
}> {

    x: Widget
    y: Widget
    floor: Widget

    constructor(private layer: ActiveLayer, private value: MapCoordinate) {
        super()

        this.value = lodash.clone(value)

        this.css("display", "flex")

        this.x = Widget.wrap($("<input type='number' class='nisinput' min='0' style='max-width: 50pt'>")).appendTo(this)
        this.x.container.on("input", () => {
            this.value.x = Number(this.x.container.val())
            this.emit("changed", this.value)
        })
        Widget.wrap($("<div> | </div>")).appendTo(this)
        this.y = Widget.wrap($("<input type='number' class='nisinput' min='0' style='max-width: 50pt'>")).appendTo(this)
        this.y.container.on("input", () => {
            this.value.y = Number(this.y.container.val())
            this.emit("changed", this.value)
        })

        Widget.wrap($("<div> | </div>")).appendTo(this)
        this.floor = Widget.wrap($("<input type='number' class='nisinput' min='0' max='3' style='max-width: 50pt'>")).appendTo(this)
        this.floor.container.on("input", () => {
            this.value.level = Number(this.floor.container.val()) as floor_t
            this.emit("changed", this.value)
        })

        if (value) {
            this.x.container.val(value.x)
            this.y.container.val(value.y)
            this.floor.container.val(value.level)
        }

        if (layer) {
            SmallImageButton.new("assets/icons/marker.png").appendTo(this)
                .on("click", () => new SelectTileInteraction(this.layer)
                    .tapEvents((e) =>
                        e.on("selected", (c => {
                            this.value = c
                            this.emit("changed", this.value)
                        }))
                    )
                    .activate())
        }
    }
}