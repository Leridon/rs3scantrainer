import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import {MapCoordinate, MapRectangle} from "../../model/coordinates";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {SpotPolygon} from "../map/layers/ScanLayer";
import * as lodash from "lodash"
import LayerInteraction from "../map/interactions/LayerInteraction";
import TopControl from "../map/TopControl";
import {Vector2} from "../../util/math";
import {ActiveLayer} from "../map/activeLayer";

class DrawTopControl extends TopControl {
    constructor(private parent: DrawAreaInteraction) {
        super()

        this.container.text("Click and drag the map to draw an area.")
    }
}

export default class DrawAreaInteraction extends LayerInteraction<ActiveLayer, {
    "changed": MapRectangle,
    "done": MapRectangle
    "cancelled": MapRectangle
}> {
    dragstart: MapCoordinate = null
    last_area: MapRectangle = null

    _preview_polygon: SpotPolygon = null

    constructor(layer: ActiveLayer) {
        super(layer);
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
        this.layer.getMap().map.dragging.enable()

        if (this._preview_polygon) this._preview_polygon.remove()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
        this.layer.getMap().map.dragging.disable()
    }

    update_preview() {
        if (this._preview_polygon) this._preview_polygon.remove()

        this._preview_polygon = new SpotPolygon({name: "", area: this.last_area}).addTo(this.layer)
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": (e: LeafletMouseEvent) => {
            // Capture and consume the click event so it does not get sent to the default interaction

            leaflet.DomEvent.stopPropagation(e)

            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                this.events.emit("done", lodash.cloneDeep(this.last_area))

                this.layer.cancelInteraction()
            }
        },
        "mouseup": (e: LeafletMouseEvent) => {
            // Capture and consume the click event so it does not get sent to the default interaction

            leaflet.DomEvent.stopPropagation(e)

            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                this.events.emit("done", lodash.cloneDeep(this.last_area))

                this.layer.cancelInteraction()
            }
        },

        "mousedown": (e: LeafletMouseEvent) => {
            if (!this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                this.dragstart = this.layer.getMap().tileFromMouseEvent(e)

                this.last_area = {
                    topleft: Vector2.copy(this.dragstart),
                    botright: Vector2.copy(this.layer.getMap().tileFromMouseEvent(e)),
                    level: this.dragstart.level
                }

                this.update_preview()

                this.events.emit("changed", lodash.cloneDeep(this.last_area))
            }
        },

        "mousemove": (e: LeafletMouseEvent) => {
            if (this.dragstart) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                this.last_area =
                    {
                        topleft: {
                            x: Math.min(this.dragstart.x, now.x),
                            y: Math.max(this.dragstart.y, now.y),
                        },
                        botright: {
                            x: Math.max(this.dragstart.x, now.x),
                            y: Math.min(this.dragstart.y, now.y),
                        },
                        level: this.dragstart.level
                    }

                this.update_preview()

                this.events.emit("changed", lodash.cloneDeep(this.last_area))
            }
        },
    }

    protected constructTopControl(): TopControl {
        return new DrawTopControl(this);
    }

}

