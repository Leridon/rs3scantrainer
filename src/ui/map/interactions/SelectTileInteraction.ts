import LayerInteraction from "./LayerInteraction";
import {ActiveLayer} from "../activeLayer";
import * as leaflet from "leaflet";
import {LeafletMouseEvent} from "leaflet";
import TileHighlight from "../TileHighlight";
import {MapCoordinate} from "../../../model/coordinates";
import type Widget from "../../widgets/Widget";

export default class SelectTileInteraction extends LayerInteraction<ActiveLayer, {
    "selected": MapCoordinate
}> {
    _highlight = new TileHighlight({x: 0, y: 0})

    cancel() {
        this.layer.getMap().map.off(this._maphooks)

        this._highlight.remove()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)

        this._highlight.addTo(this.layer)
    }

    override getTopControl(): Widget {
        let c =  super.getTopControl();

        c.text("Click the map to select a tile on the currently selected floor.")

        return c
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {
        "click": async (e: LeafletMouseEvent) => {
            leaflet.DomEvent.stopPropagation(e)

            let tile = this.layer.getMap().tileFromMouseEvent(e)
            this.events.emit("selected", tile)

            this.deactivate()
        },
        "mousemove": (e: LeafletMouseEvent) => {

            console.log("Move")
            this._highlight.setPosition(this.layer.getMap().tileFromMouseEvent(e))
        }
    }

}