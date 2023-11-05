import type {ActiveLayer} from "../../../../lib/gamemap/activeLayer";
import {TileCoordinates} from "../../../../lib/runescape/coordinates/TileCoordinates";
import * as leaflet from "leaflet";
import LayerInteraction from "./LayerInteraction";
import type Widget from "../../../../lib/ui/Widget";

export default class SimpleClickInteraction extends LayerInteraction<ActiveLayer> {

    constructor(layer: ActiveLayer, private handlers: {
        "click": (p: TileCoordinates) => void
    }) {
        super(layer);
    }

    private _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": (e) => {
            this.handlers.click({x: Math.round(e.latlng.lng), y: Math.round(e.latlng.lat), level: this.layer.getMap().floor.get()})
        }
    }

    cancel() {
        this.layer.getMap().off(this._maphooks)
    }

    start() {
        this.layer.getMap().on(this._maphooks)
    }

    getTopControl(): Widget {
        return null
    }
}