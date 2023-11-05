import {blue_icon, GameMap} from "./GameMap";
import {type TileCoordinates} from "../runescape/coordinates/TileCoordinates";
import LayerInteraction from "../../trainer/ui/map/interactions/LayerInteraction";
import {TileMarker} from "./TileMarker";
import GameLayer from "./GameLayer";

export class ActiveLayer extends GameLayer {
    protected interaction: LayerInteraction<ActiveLayer> = null

    constructor() {
        super()
    }

    setInteraction(interaction: LayerInteraction<ActiveLayer>) {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null
        }

        this.interaction = interaction

        this.interaction.start()
        this.interaction.events.emit("started", null)
    }

    cancelInteraction() {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction.events.emit("stopped", null)
            this.interaction = null
        }
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
        if(this.interaction) {
            this.interaction.cancel()
            this.interaction = null
        }

        this.parent = null
    }
}


export class SimpleMarkerLayer extends ActiveLayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}