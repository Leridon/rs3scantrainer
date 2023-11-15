import {ValueInteraction} from "lib/gamemap/interaction/ValueInteraction";
import {Vector2} from "lib/math";
import {arrow} from "../../path_graphics";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import {GameMapMouseEvent} from "lib/gamemap/MapEvents";
import InteractionTopControl from "../../map/InteractionTopControl";
import {TileRectangle} from "../../../../lib/runescape/coordinates";
import {ShortcutViewLayer} from "../ShortcutView";


export class DrawOffset extends ValueInteraction<DrawOffset.value_t> {
    constructor(config: ValueInteraction.option_t<DrawOffset.value_t> = {}, private start_area: TileRectangle) {
        if (!config.preview_render) {
            config.preview_render = ({origin, offset}) => ShortcutViewLayer.render_transport_arrow(origin, Vector2.add(origin, offset), offset.level)
        }

        super(config);

        this.attachTopControl(new InteractionTopControl({
            name: "Draw Transportation Offset"
        }).setText("Click an interactive tile and draw an arrow to enter the transportation offset."))
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(() => {
            event.stopAllPropagation()

            if (this.value.get().value?.origin == null) {
                if (TileRectangle.contains(this.start_area, event.tile())) {
                    this.preview({
                        origin: event.tile(),
                        offset: {x: 0, y: 0, level: 0}
                    })
                }
            } else {
                this.commit({
                    origin: this.value.get().value.origin,
                    offset: {...Vector2.sub(event.tile(), this.value.get().value.origin), level: event.tile().level - this.value.get().value.origin.level},
                })
            }
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(() => {
            if (this.value.get().value?.origin != null) {
                this.preview({
                    origin: this.value.get().value.origin,
                    offset: {...Vector2.sub(event.tile(), this.value.get().value.origin), level: event.tile().level - this.value.get().value.origin.level},
                })
            }
        })
    }
}

export namespace DrawOffset {
    export type value_t = { origin: TileCoordinates, offset: Vector2 & { level: number } }
}