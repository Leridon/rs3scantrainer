import GameLayer from "../GameLayer";
import {MapCoordinate, MapRectangle} from "../../runescape/coordinates";
import {Observable, observe} from "../../properties/Observable";
import {GameMapMouseEvent} from "../MapEvents";

export default class GameMapDragAction extends GameLayer {
    dragstart: MapCoordinate = null

    area: Observable<{ area: MapRectangle, committed: boolean }> = observe({area: null, committed: false})

    constructor() {
        super();
    }

    start(tile: MapCoordinate): this {
        this.dragstart = tile

        return this
    }

    reset() {
        this.dragstart = null

        this.area.set({area: null, committed: false})
    }

    eventMouseDown(event: GameMapMouseEvent) {
        event.onPre(() => {
            if (!this.dragstart) {
                event.stopAllPropagation()

                this.dragstart = event.tile()

                this.preview(MapRectangle.fromTile(event.tile()))
            }
        })
    }

    eventMouseUp(event: GameMapMouseEvent) {
        event.onPre(() => {
            if (this.dragstart) {
                event.stopAllPropagation()

                this.commit(MapRectangle.from(this.dragstart, event.tile()))
            }
        })
    }

    eventClick(event: GameMapMouseEvent) {
        // Capture and consume the click event, so it does not get sent to the default interaction

        event.onPre(() => {
            event.stopAllPropagation()

            if (this.dragstart) this.commit(MapRectangle.from(this.dragstart, event.tile()))
            else this.commit(MapRectangle.fromTile(event.tile()))
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(() => {
            if (this.dragstart) {
                event.stopAllPropagation()

                this.preview(MapRectangle.from(this.dragstart, event.tile()))
            }
        })

    }

    private cancel() {
        this.commit(null)
    }

    private commit(area: MapRectangle) {
        this.area.set({area: area, committed: true})
        this.end()
    }

    private preview(area: MapRectangle) {
        this.area.set({area: area, committed: false})
    }

    private end() {
        let t = this.getMap()?.dragAction?.get()

        if (t == this) t.getMap().dragAction.set(null)
    }
}