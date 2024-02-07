import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup} from "leaflet";
import {GameMapContextMenuEvent, GameMapKeyboardEvent, GameMapMouseEvent, GameMapViewChangedEvent} from "./MapEvents";
import {EwentHandlerPool} from "../reactive/EwentHandlerPool";
import {MapEntity} from "./MapEntity";

function childLike(l: leaflet.Layer): l is GameLayer | MapEntity {
    return l instanceof GameLayer || l instanceof MapEntity
}

export default class GameLayer extends leaflet.FeatureGroup {
    public handler_pool: EwentHandlerPool = new EwentHandlerPool()

    public parent: GameLayer | null = null
    protected map: GameMap | null = null

    public active_entities: MapEntity[] = []

    constructor() {
        super();

        this.on("layeradd", (l) => {
            if (childLike(l.layer)) l.layer.parent = this

            if (l.layer instanceof MapEntity) {
                const lay = l.layer

                l.layer.mouseover.subscribe(v => {
                    if (v) {
                        this.active_entities.push(lay)
                    } else {
                        this.active_entities = this.active_entities.filter(e => e != lay)
                    }
                })

                if (this.map) l.layer.render()
            }
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

        this.eachEntity(e => {
            e.render()
        })

        return super.onAdd(map)
    }

    onRemove(map: GameMap): this {
        this.map = null

        this.handler_pool.kill()

        return super.onRemove(map);
    }

    collectActiveEntities(accumulator: MapEntity[][] = []): MapEntity[][] {
        accumulator.push(this.active_entities)

        this.eachLayer(lay => {
            if (lay instanceof GameLayer) lay.collectActiveEntities(accumulator)
        })

        return accumulator
    }

    eachEntity(f: (_: MapEntity) => void): this {
        this.eachLayer(lay => {
            if (lay instanceof MapEntity) f(lay)
        })

        return this
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapMouseEvent) {}

    eventHover(event: GameMapMouseEvent) {}

    eventMouseUp(event: GameMapMouseEvent) {}

    eventMouseDown(event: GameMapMouseEvent) {}

    eventKeyDown(event: GameMapKeyboardEvent) {}

    eventKeyUp(event: GameMapKeyboardEvent) {}

    eventViewChanged(event: GameMapViewChangedEvent) {
        if (event.floorChanged()) {
            this.eachEntity(e => {
                if (e.floor_sensitive) e.render()
            })
        }
    }
}