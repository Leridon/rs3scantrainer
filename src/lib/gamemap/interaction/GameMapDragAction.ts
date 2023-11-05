import {MapCoordinate, MapRectangle} from "../../runescape/coordinates";
import {Observable, observe} from "../../properties/Observable";
import {GameMapMouseEvent} from "../MapEvents";
import {boxPolygon} from "../../../trainer/ui/polygon_helpers";
import {GameMap} from "../GameMap";
import {ValueInteraction} from "./ValueInteraction";

export default class GameMapDragAction extends ValueInteraction<MapRectangle> {
    dragstart: MapCoordinate = null

    area: Observable<{ area: MapRectangle, committed: boolean }> = observe({area: null, committed: false})

    constructor(public config: ValueInteraction.option_t<MapRectangle>) {
        if (!config.preview_render) {
            config.preview_render = (area) => boxPolygon(area)
        }

        super(config);
    }

    onAdd(map: GameMap): this {
        super.onAdd(map)

        map.dragging.disable()
        return this
    }

    onRemove(map: GameMap): this {
        super.onRemove(map)
        map.dragging.enable()
        return this
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
}