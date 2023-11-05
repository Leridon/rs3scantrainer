import InteractionLayer from "./InteractionLayer";
import {GameMapMouseEvent} from "../MapEvents";
import {MapCoordinate, MapRectangle} from "../../runescape/coordinates";
import {Observable, observe} from "../../properties/Observable";
import {ValueInteraction} from "./ValueInteraction";

export default class SelectTileInteraction extends ValueInteraction<MapCoordinate> {
    constructor(public config: ValueInteraction.option_t<MapCoordinate> = {}) {
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