import {GameMap} from "./GameMap";
import * as leaflet from "leaflet";
import {TileCoordinates} from "../runescape/coordinates";
import {MenuEntry} from "../../trainer/ui/widgets/ContextMenu";
import {LeafletEvent} from "leaflet";

export abstract class GameMapEvent<LeafletT extends leaflet.LeafletEvent, OriginalT extends Event> {
    public propagation_state: {
        phase: "pre" | "post",
        trickle_stopped_immediate: boolean,
        trickle_stopped: boolean,
        trigger_post_order: boolean
    }

    protected constructor(public map: GameMap,
                          public leaflet: LeafletT,
                          public original: OriginalT
                          ) {
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

    stopAllPropagation() {
        this.original.stopPropagation()

        this.propagation_state.trickle_stopped = false
        this.propagation_state.trickle_stopped_immediate = false
        this.propagation_state.trigger_post_order = false
    }
}

export class GameMapMouseEvent extends GameMapEvent<leaflet.LeafletMouseEvent, MouseEvent> {
    constructor(
        map: GameMap,
        public leaflet: leaflet.LeafletMouseEvent,
        public coordinates: TileCoordinates) {
        super(map, leaflet, leaflet.originalEvent);
    }

    tile() {
        return TileCoordinates.snap(this.coordinates)
    }
}

export class GameMapKeyboardEvent extends GameMapEvent<leaflet.LeafletKeyboardEvent, KeyboardEvent> {
    constructor(
        map: GameMap,
        public leaflet: leaflet.LeafletKeyboardEvent) {
        super(map, leaflet, leaflet.originalEvent);
    }
}

export class GameMapContextMenuEvent extends GameMapEvent<leaflet.LeafletMouseEvent, MouseEvent> {
    entries: MenuEntry[] = []

    constructor(map: GameMap,
                public leaflet: leaflet.LeafletMouseEvent,
                public coordinates: TileCoordinates
    ) {
        super(map, leaflet, leaflet.originalEvent);
    }

    add(...entries: MenuEntry[]): void {
        this.entries.push(...entries)
    }

    tile() {
        return TileCoordinates.snap(this.coordinates)
    }
}
