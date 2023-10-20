import {MapCoordinate} from "../../model/coordinates";
import * as leaflet from "leaflet"
import {GameMap, GameMapWidget} from "./map";
import {LayerGroup, Map} from "leaflet";
import {MenuEntry} from "../widgets/ContextMenu";

export abstract class GameMapEvent<data_t extends Record<string, any> = {}> {
    data: {
        map: GameMapWidget
    } & data_t

    isHandled: boolean = false

    stopPropagation() {
        this.isHandled = true
    }
}

class GameMapClickEvent extends GameMapEvent<{
    coordinates: MapCoordinate
}> {
    originalEvent: leaflet.LeafletMouseEvent
}

class GameMapDragEvent extends GameMapEvent {

}

class GameMapHoverEvent extends GameMapEvent<{
    tile: MapCoordinate
}> {

}

export class GameMapContextMenuEvent extends GameMapEvent<{
    coordinates: MapCoordinate
}> {
    entries: MenuEntry[] = []

    add(...entries: MenuEntry[]): void {
        this.entries.push(...entries)
    }
}

export default class GameLayer extends leaflet.FeatureGroup {
    protected parent: GameMap | GameLayer | null = null

    enabled: boolean

    getMap(): GameMap {
        if (!this.parent) return null
        else if (this.parent instanceof GameMap) return this.parent
        else return this.parent.getMap()
    }

    enable() {
        this.setEnabled(true)
    }

    disable() {
        this.setEnabled(false)
    }

    setEnabled(v: boolean) {
        this.enabled = v
    }

    add(layer: GameLayer) {
        this.addLayer(layer)

        layer.parent = this
    }

    addTo(layer: Map | LayerGroup): this {
        if (layer instanceof GameLayer) layer.add(this)

        return this
    }

    eventContextMenu(event: GameMapContextMenuEvent) {

    }
}