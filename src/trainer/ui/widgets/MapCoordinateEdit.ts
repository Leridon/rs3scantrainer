import Widget from "lib/ui/Widget";
import {floor_t} from "lib/runescape/coordinates";
import * as lodash from "lodash"
import SelectTileInteraction from "lib/gamemap/interaction/SelectTileInteraction";
import AbstractEditWidget from "./AbstractEditWidget";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import {SmallImageButton} from "./SmallImageButton";

export default class MapCoordinateEdit extends AbstractEditWidget<TileCoordinates> {
    x: Widget
    y: Widget
    floor: Widget

    constructor(initial: TileCoordinates,
                private interaction_f: (coordinate: TileCoordinates) => SelectTileInteraction = null
    ) {
        super()

        this.value = lodash.clone(initial)

        this.container.css("min-width", "0")
        this.css("display", "flex")

        this.x = c("<input type='text' inputmode='numeric' class='nisinput' min='0' style='text-align: right'>").appendTo(this)
        this.x.container.on("change", () => {
            this.value.x = Number(this.x.container.val())
            this.emit("changed", this.value)
        })
        c("<div> | </div>").appendTo(this)
        this.y = c("<input type='text' inputmode='numeric' class='nisinput' min='0'>").appendTo(this)
        this.y.container.on("change", () => {
            this.value.y = Number(this.y.container.val())
            this.emit("changed", this.value)
        })

        c("<div> | </div>").appendTo(this)
        this.floor = c("<input type='number' class='nisinput' min='0' max='3' style='width: 30%'>").appendTo(this)
        this.floor.container.on("change", () => {
            this.value.level = Number(this.floor.container.val()) as floor_t
            this.emit("changed", this.value)
        })

        if (initial) {
            this.x.container.val(initial.x)
            this.y.container.val(initial.y)
            this.floor.container.val(initial.level)
        }

        if (this.interaction_f) {
            SmallImageButton.new("assets/icons/marker.png").appendTo(this)
                .on("click", () =>
                    this.interaction_f(this.value).onCommit((v) => {
                        this.value = v

                        this.x.container.val(v.x)
                        this.y.container.val(v.y)
                        this.floor.container.val(v.level)

                        this.emit("changed", this.value)
                    })
                )
                .css("margin-left", "3px")
        }
    }
}