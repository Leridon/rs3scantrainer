import * as leaflet from "leaflet"
import {GameMap} from "./GameMap";
import {LayerGroup} from "leaflet";
import {GameMapContextMenuEvent, GameMapMouseEvent} from "./MapEvents";
import {GameMapControl} from "./GameMapControl";
import {TileMarker} from "./TileMarker";

export default class GameLayer extends leaflet.FeatureGroup {
    private controls: GameMapControl[] = []
    protected parent: GameLayer | null = null
    protected map: GameMap | null = null

    constructor() {
        super();
        new TileMarker({x: 0, y: 0, level: 0}).withMarker().addTo(this)
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

        layer.parent = this

        return this
    }

    addTo(layer: GameMap | LayerGroup | GameLayer): this {
        if (layer instanceof GameLayer) layer.add(this)
        else if (layer instanceof GameMap) layer.addGameLayer(this)
        else super.addTo(layer)

        return this
    }

    onAdd(map: GameMap): this {
        this.map = map

        this.controls.forEach(c => map.addControl(c))

        return super.onAdd(map)
    }

    onRemove(map: GameMap): this {
        this.map = null

        this.controls.forEach(c => c.remove())

        return super.onRemove(map);
    }

    addControl(control: GameMapControl): this {
        this.controls.push(control)
        control.parent = this

        if (this.map) this.map.addControl(control)

        return this
    }

    removeControl(control: GameMapControl) {
        let i = this.controls.findIndex(c => c == control);

        if (i >= 0) {
            this.controls.splice(i, 1)

            control.parent = null

            if (this.map) control.remove()
        }
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapMouseEvent) {}

    eventHover(event: GameMapMouseEvent) {}

    eventMouseUp(event: GameMapMouseEvent) {}

    eventMouseDown(event: GameMapMouseEvent) {}
}