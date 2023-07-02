import Widget from "./Widget";
import {MapCoordinate} from "../../model/coordinates";
import {ActiveLayer} from "../map/activeLayer";
import SmallImageButton from "./SmallImageButton";

export default class MapCoordinateEdit extends Widget<{
    "changed": MapCoordinate
}> {

    x: Widget
    y: Widget
    floor: Widget

    constructor(private layer: ActiveLayer, private value: MapCoordinate) {
        super()

        this.css("display", "flex")

        this.x = Widget.wrap($("<input type='number' class='nisinput' min='0' style='max-width: 50pt'>")).appendTo(this)
        Widget.wrap($("<div> | </div>")).appendTo(this)
        this.y = Widget.wrap($("<input type='number' class='nisinput' min='0' style='max-width: 50pt'>")).appendTo(this)
        Widget.wrap($("<div> | </div>")).appendTo(this)
        this.floor = Widget.wrap($("<input type='number' class='nisinput' min='0' max='3' style='max-width: 50pt'>")).appendTo(this)

        if (value) {
            this.x.container.val(value.x)
            this.y.container.val(value.y)
            this.floor.container.val(value.level)
        }

        if (layer) {
            SmallImageButton.new("assets/icons/marker.png").appendTo(this)
        }
    }
}