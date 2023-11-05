import {GameMapMouseEvent} from "../MapEvents";
import {ValueInteraction} from "./ValueInteraction";
import {TileCoordinates} from "../../runescape/coordinates";

export default class SelectTileInteraction extends ValueInteraction<TileCoordinates> {
    constructor(public config: ValueInteraction.option_t<TileCoordinates> = {}) {
        super(config)
    }

    eventHover(event: GameMapMouseEvent) {
        super.eventHover(event);

        event.onPre(() => {
            this.preview(event.tile())
        })
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(() => {
            event.stopAllPropagation()

            this.commit(event.tile())
        })
    }
}