import InteractionLayer from "../../../../lib/gamemap/interaction/InteractionLayer";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";

export default class SelectTileInteraction extends InteractionLayer {
    constructor() {
        super()
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(() => {
            event.stopAllPropagation()

            this.done_handler(event.tile())
            this.cancel()
        })
    }
}