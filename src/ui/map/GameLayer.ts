import {MapCoordinate} from "../../model/coordinates";
import * as leaflet from "leaflet"
import {GameMap} from "./map";
import {LayerGroup, Map} from "leaflet";
import {MenuEntry} from "../widgets/ContextMenu";

export abstract class GameMapEvent {
    public propagation_state: {
        phase: "pre" | "post",
        trickle_stopped_immediate: boolean,
        trickle_stopped: boolean,
        trigger_post_order: boolean
    }

    protected constructor(public map: GameMap) {
        this.propagation_state = {
            phase: "pre",
            trickle_stopped_immediate: false,
            trickle_stopped: false,
            trigger_post_order: true
        }
    }

    handleFiltered(filter: (_: this) => boolean, handler: (_: this) => any) {
        if (filter(this)) handler(this)
    }

    onPre(f: (_: this) => any) {
        this.handleFiltered(e => e.propagation_state.phase == "pre", f)
    }

    onPost(f: (_: this) => any) {
        this.handleFiltered(e => e.propagation_state.phase == "post", f)
    }
}

export class GameMapClickEvent extends GameMapEvent {
    constructor(
        map: GameMap,
        public originalEvent: leaflet.LeafletMouseEvent,
        public coordinates: MapCoordinate) {
        super(map);
    }

    tile() {
        return MapCoordinate.snap(this.coordinates)
    }
}

export class GameMapTileHoverEvent extends GameMapEvent {

    constructor(map: GameMap,
                public originalEvent: leaflet.LeafletMouseEvent,
                public coordinates: MapCoordinate
    ) {
        super(map);
    }

    tile() {
        return MapCoordinate.snap(this.coordinates)
    }
}

export class GameMapContextMenuEvent extends GameMapEvent {
    entries: MenuEntry[] = []

    constructor(map: GameMap,
                public originalEvent: leaflet.LeafletMouseEvent,
                public coordinates: MapCoordinate
    ) {
        super(map);
    }

    add(...entries: MenuEntry[]): void {
        this.entries.push(...entries)
    }

    tile() {
        return MapCoordinate.snap(this.coordinates)
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
        else super.addTo(layer)

        return this
    }

    eventContextMenu(event: GameMapContextMenuEvent) {}

    eventClick(event: GameMapClickEvent) {}

    eventHover(event: GameMapTileHoverEvent) {}
}