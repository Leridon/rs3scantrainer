import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup, Map} from "leaflet";
import {GameMapContextMenuEvent, GameMapMouseEvent} from "./MapEvents";

export default class GameLayer extends leaflet.FeatureGroup {
    protected parent: GameMap | GameLayer | null = null

    getMap(): GameMap {
        if (!this.parent) return null
        else if (this.parent instanceof GameMap) return this.parent
        else return this.parent.getMap()
    }

    remove(): this {
        if (this.parent) this.parent.removeLayer(this)
        else super.remove()

        return this
    }

    add(layer: GameLayer): this {
        this.addLayer(layer)

        layer.parent = this

        return this
    }

    addTo(layer: Map | LayerGroup): this {
        if (layer instanceof GameLayer) layer.add(this)
        else {
            if (layer instanceof GameMap) this.parent = layer
            super.addTo(layer)
        }

        return this
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapMouseEvent) {}

    eventHover(event: GameMapMouseEvent) {}

    eventMouseUp(event: GameMapMouseEvent) {}

    eventMouseDown(event: GameMapMouseEvent) {}
}