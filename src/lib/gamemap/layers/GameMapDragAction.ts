import {MapCoordinate, MapRectangle} from "../../runescape/coordinates";
import {Observable, observe} from "../../properties/Observable";
import {GameMapMouseEvent} from "../MapEvents";
import InteractionLayer from "../interaction/InteractionLayer";
import * as leaflet from "leaflet"
import {boxPolygon} from "../../../trainer/ui/polygon_helpers";
import {GameMap} from "../GameMap";

export default class GameMapDragAction extends InteractionLayer {
    dragstart: MapCoordinate = null

    private _preview: leaflet.Layer = null

    area: Observable<{ area: MapRectangle, committed: boolean }> = observe({area: null, committed: false})

    constructor(public config: {
        preview_render?: (_: MapRectangle) => leaflet.Layer
    } = {}) {
        super();

        if (!this.config.preview_render) {
            this.config.preview_render = (area) => boxPolygon(area)
        }

        this.area.subscribe(({area, committed}) => {
            if (this._preview) this._preview.remove()

            if (!committed && area) this._preview = this.config.preview_render(area)?.addTo(this)
        })
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

    cancel() {
        if(!this.area.get().committed) this.area.set({area: null, committed: true})
        super.cancel()
    }

    private commit(area: MapRectangle) {
        this.area.set({area: area, committed: true})
        this.cancel()
    }

    private preview(area: MapRectangle) {
        this.area.set({area: area, committed: false})
    }

    onChange(handler: (_: { area: MapRectangle, committed: boolean }) => any): this {
        this.area.subscribe(handler)
        return this
    }

    onCommit(handler: (_: MapRectangle) => any): this {
        this.area.subscribe((v) => {if (v.committed && v.area) handler(v.area)})
        return this
    }

    onDiscarded(handler: () => any): this {
        this.area.subscribe((v) => {if (v.committed && !v.area) handler()})
        return this
    }
}