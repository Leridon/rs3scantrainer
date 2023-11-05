import {GameMap} from "./GameMap";
import * as leaflet from "leaflet";
import {TileCoordinates} from "../runescape/coordinates";
import {MenuEntry} from "../../trainer/ui/widgets/ContextMenu";

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

    stopAllPropagation() {
        this.propagation_state.trickle_stopped = false
        this.propagation_state.trickle_stopped_immediate = false
        this.propagation_state.trigger_post_order = false

        // TODO: Also stop leaflet's propagation?
    }
}

export class GameMapMouseEvent extends GameMapEvent {
    constructor(
        map: GameMap,
        public originalEvent: leaflet.LeafletMouseEvent,
        public coordinates: TileCoordinates) {
        super(map);
    }

    tile() {
        return TileCoordinates.snap(this.coordinates)
    }
}

export class GameMapContextMenuEvent extends GameMapEvent {
    entries: MenuEntry[] = []

    constructor(map: GameMap,
                public originalEvent: leaflet.LeafletMouseEvent,
                public coordinates: TileCoordinates
    ) {
        super(map);
    }

    add(...entries: MenuEntry[]): void {
        this.entries.push(...entries)
    }

    tile() {
        return TileCoordinates.snap(this.coordinates)
    }
}
