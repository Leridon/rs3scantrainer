import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import {MapCoordinate} from "../../../model/coordinates";
import type Widget from "../../widgets/Widget";

export default class SelectTileInteraction extends LayerInteraction<ActiveLayer, {
    "selected": MapCoordinate,
    "cancelled": null
}> {
    constructor(layer: ActiveLayer, private text: string = "Click the map to select a tile on the currently selected floor.") {
        super(layer);
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
    }

    override getTopControl(): Widget {
        let c =  super.getTopControl();

        c.text(this.text)

        return c
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)
            this.events.emit("selected", tile)

            this.deactivate()
        }
    }
}