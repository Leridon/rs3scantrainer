import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup} from "leaflet";
import {GameMapContextMenuEvent, GameMapKeyboardEvent, GameMapMouseEvent} from "./MapEvents";
import {EwentHandlerPool} from "../reactive/EwentHandlerPool";
import {MapEntity} from "./MapEntity";

function childLike(l: leaflet.Layer): l is GameLayer | MapEntity {
    return l instanceof GameLayer || l instanceof MapEntity
}

export default class GameLayer extends leaflet.FeatureGroup {
    public handler_pool: EwentHandlerPool = new EwentHandlerPool()

    public parent: GameLayer | null = null
    protected map: GameMap | null = null

    constructor() {
        super();

        this.on("layeradd", (l) => {
            if (childLike(l.layer)) l.layer.parent = this
        })

        this.on("layerremove", (l) => {
            if (childLike(l.layer) && l.layer.parent == this) l.layer.parent = null
        })
    }

    isRootLayer(): boolean {
        return this.parent == null
    }

    getMap(): GameMap {
        return this.map
    }

    remove(): this {
        if (this.parent) this.parent.removeLayer(this)
        else super.remove()

        return this
    }

    add(layer: GameLayer): this {
        this.addLayer(layer)

        return this
    }


    addTo(layer: GameMap | LayerGroup | GameLayer): this {
        if (layer instanceof GameMap) {
            layer.addGameLayer(this)
            return this
        }

        return super.addTo(layer)
    }

    onAdd(map: GameMap): this {
        this.map = map

        return super.onAdd(map)
    }

    onRemove(map: GameMap): this {
        this.map = null

        this.handler_pool.kill()

        return super.onRemove(map);
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapMouseEvent) {}

    eventHover(event: GameMapMouseEvent) {}

    eventMouseUp(event: GameMapMouseEvent) {}

    eventMouseDown(event: GameMapMouseEvent) {}

    eventKeyDown(event: GameMapKeyboardEvent) {}

    eventKeyUp(event: GameMapKeyboardEvent) {}
}