import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup} from "leaflet";
import {GameMapContextMenuEvent, GameMapKeyboardEvent, GameMapMouseEvent, GameMapViewChangedEvent} from "./MapEvents";
import {EwentHandlerPool} from "../reactive/EwentHandlerPool";
import {MapEntity} from "./MapEntity";
import * as tippy from "tippy.js";
import {followCursor} from "tippy.js";
import Widget from "../ui/Widget";

function childLike(l: leaflet.Layer): l is GameLayer | MapEntity {
    return l instanceof GameLayer || l instanceof MapEntity
}

export default class GameLayer extends leaflet.FeatureGroup {
    public handler_pool: EwentHandlerPool = new EwentHandlerPool()

    public parent: GameLayer | null = null
    protected map: GameMap | null = null

    private hovered_entity: MapEntity = null
    private active_entity: GameLayer.ActiveEntity = {entity: null}

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

    private async createActiveEntityTooltip(force_interactive: boolean = false) {
        if (this.active_entity.entity) {
            const tooltip = this.active_entity.entity.renderTooltip()

            const interactive = force_interactive || tooltip.interactive

            if (tooltip) {
                const anchor = await this.active_entity.entity.tooltip_hook.value() || document.body

                this.active_entity.tooltip_instance = tippy.default(anchor, {
                    content: c("<div style='background: rgb(10, 31, 41); border: 2px solid white;padding: 3px' class='ctr-entity-tooltip'></div>")
                        .append(tooltip.content).raw(),
                    arrow: true,
                    animation: false,
                    zIndex: 10001,
                    delay: 0,
                    followCursor: !interactive,
                    plugins: [followCursor],
                    interactive: interactive,
                    onHide: () => {
                        if (this.active_entity.locked) {
                            console.log("Prevented hide")
                            return false
                        }

                        console.log("Hiding")
                    },
                    onHidden: () => {
                        this.requestEntityActivation(null)
                    },
                    placement: "top",
                    offset: [0, 10],
                })

                this.active_entity.tooltip_instance.show()
            }

        }
    }

    async requestEntityActivation(entity: MapEntity, force_interactive: boolean = false): Promise<boolean> {
        if (!this.isRootLayer()) return this.parent.requestEntityActivation(entity)

        if (this.active_entity.locked) return false

        if (entity != this.active_entity.entity) {
            if (this.active_entity.entity) {
                this.active_entity.entity.highlighted.set(false)

                this.active_entity.tooltip_instance?.destroy()
                this.active_entity.tooltip_instance = null

                this.active_entity.entity = null
            }

            if (entity) {
                entity.highlighted.set(true)
                this.active_entity.entity = entity

                await this.createActiveEntityTooltip(force_interactive)
            }
        }

        return true
    }

    async lockEntity(entity: MapEntity): Promise<void> {
        if (this.active_entity.entity) {
            this.active_entity.locked = false
            await this.requestEntityActivation(null)

            console.log("Unlocking")
        }

        if (entity) {
            await this.requestEntityActivation(entity, true)
            this.active_entity.locked = true

            console.log("Locking")
            console.log(entity)
        }
    }

    updateHovering(entity: MapEntity, hovering: boolean) {
        if (!this.isRootLayer()) this.getRoot().updateHovering(entity, hovering)

        if (hovering) {
            this.hovered_entity = entity

            this.requestEntityActivation(entity)
        } else if (this.hovered_entity == entity) {
            this.hovered_entity = null
        }
    }

    getHoveredEntity(): MapEntity {
        return this.getRoot().hovered_entity
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

export namespace GameLayer {
    export type ActiveEntity = {
        entity: MapEntity,
        locked?: boolean,
        tooltip_instance?: tippy.Instance
    }
}