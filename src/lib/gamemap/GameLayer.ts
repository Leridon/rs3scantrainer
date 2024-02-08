import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup} from "leaflet";
import {GameMapContextMenuEvent, GameMapKeyboardEvent, GameMapMouseEvent, GameMapViewChangedEvent} from "./MapEvents";
import {EwentHandlerPool} from "../reactive/EwentHandlerPool";
import {MapEntity} from "./MapEntity";
import * as tippy from "tippy.js";
import {followCursor} from "tippy.js";

function childLike(l: leaflet.Layer): l is GameLayer | MapEntity {
    return l instanceof GameLayer || l instanceof MapEntity
}

export default class GameLayer extends leaflet.FeatureGroup {
    public handler_pool: EwentHandlerPool = new EwentHandlerPool()

    public parent: GameLayer | null = null
    protected map: GameMap | null = null

    private active_entity: {
        entity: MapEntity,
        is_selected: boolean,
        tooltip_instance?: tippy.Instance
    } = null

    private selected_entity: {
        entity: MapEntity,
        is_selected: boolean,
        tooltip_instance?: tippy.Instance
    } = null

    constructor() {
        super();

        this.on("layeradd", (l) => {
            if (childLike(l.layer)) l.layer.parent = this

            if (l.layer instanceof MapEntity) {
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

    getRoot(): GameLayer {
        if (this.isRootLayer()) return this

        return this.parent.getRoot()
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

    eachEntity(f: (_: MapEntity) => void): this {
        this.eachLayer(lay => {
            if (lay instanceof MapEntity) f(lay)
        })

        return this
    }

    requestEntityActivation(entity: MapEntity, selected: boolean = false): void {
        if (!this.isRootLayer()) return this.parent.requestEntityActivation(entity, selected)

        if (entity != this.active_entity?.entity) {
            if (this.active_entity) {
                this.active_entity.entity.highlighted.set(false)

                this.active_entity.tooltip_instance?.destroy()

                this.active_entity = null
            }

            if (entity) {
                entity.highlighted.set(true)

                const tooltip = entity.renderTooltip(selected)

                this.active_entity = {
                    entity: entity,
                    is_selected: selected
                }

                if (tooltip) {
                    this.active_entity.tooltip_instance = tippy.default($("body").get()[0], {
                        content: c("<div style='background: rgb(10, 31, 41); border: 2px solid white;padding: 3px'></div>")
                            .append(tooltip).raw(),
                        arrow: true,
                        animation: false,
                        trigger: "manual",
                        zIndex: 10001,
                        delay: 0,
                        followCursor: true,
                        plugins: [followCursor]
                    })

                    this.active_entity.tooltip_instance.show()
                }
            }


        }
    }

    getActiveEntity(): MapEntity {
        return this.getRoot().active_entity?.entity
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapMouseEvent) {}

    eventHover(event: GameMapMouseEvent) {}

    eventMouseUp(event: GameMapMouseEvent) {}

    eventMouseDown(event: GameMapMouseEvent) {}

    eventKeyDown(event: GameMapKeyboardEvent) {}

    eventKeyUp(event: GameMapKeyboardEvent) {}

    eventViewChanged(event: GameMapViewChangedEvent) {
        if (event.floor_changed || event.zoom_changed) {
            this.eachEntity(e => {

                const render = (() => {
                    if (e.floor_sensitive && event.floor_changed) return true

                    if (e.zoom_sensitive && e.zoom_sensitivity_layers.getIndex(event.old_view.zoom) != e.zoom_sensitivity_layers.get(event.new_view.zoom)) return true

                    return false
                })()

                if (render) e.render()
            })
        }
    }
}