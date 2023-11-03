import GameMapDragAction from "../../../lib/gamemap/layers/GameMapDragAction";
import InteractionLayer from "../../../lib/gamemap/interaction/InteractionLayer";
import InteractionTopControl from "../map/InteractionTopControl";
import {Shortcuts} from "../../../lib/runescape/shortcuts";
import {Rectangle} from "../../../lib/math/Vector";
import {boxPolygon} from "../polygon_helpers";

export default class DrawDoor extends InteractionLayer {

    private dragInteraction: GameMapDragAction = null

    constructor(public config: {
        done_handler: (_: Shortcuts.new_shortcut_door) => void
    }) {
        super();

        new InteractionTopControl({
            name: "Draw Door",
            cancel_handler: () => this.cancel()
        }).setText("Draw an area containing all tiles on both sides of the door.")
            .addTo(this)

        this.dragInteraction = new GameMapDragAction({
            preview_render: (area) => {
                let okay = Rectangle.width(area) == 2 || Rectangle.height(area) == 2

                let color = okay ? "green" : "red"

                return boxPolygon(area)
                    .setStyle({
                        color: color,
                        fillColor: color
                    })
            }

        }).addTo(this)
            .onEnd(() => this.cancel())

        this.dragInteraction.area.subscribe(({area, committed}) => {
            if (committed) {
                let width = Rectangle.width(area)
                let height = Rectangle.height(area)

                if (width == 2 && height == 2) {
                    // TODO: Context menu for direction
                } else if (width == 2) {
                    this.config.done_handler({
                        type: "door",
                        name: "Door",
                        area: area,
                        direction: "eastwest"
                    })
                } else if (height == 2) {
                    this.config.done_handler({
                        type: "door",
                        name: "Door",
                        area: area,
                        direction: "northsouth"
                    })
                }
                this.cancel()
            }
        })
    }
}