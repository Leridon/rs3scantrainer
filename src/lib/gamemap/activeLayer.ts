import {blue_icon, GameMap} from "./GameMap";
import {type TileCoordinates} from "../runescape/coordinates";
import {TileMarker} from "./TileMarker";
import GameLayer from "./GameLayer";

export class ActiveLayer extends GameLayer {

    constructor() {
        super()
    }

    protected _tilemarker: TileMarker = null

    setMarker(spot: TileCoordinates) {
        this.removeMarker()

        this._tilemarker = new TileMarker(spot)
            .withX("white").withMarker(blue_icon)
            .on("click", () => this.removeMarker())
            .addTo(this)
    }

    removeMarker() {
        if (this._tilemarker) {
            this._tilemarker.remove()
            this._tilemarker = null
        }
    }

    activate(map: GameMap) {
    }

    deactivate() {
        this.parent = null
    }
}


export class SimpleMarkerLayer extends ActiveLayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}