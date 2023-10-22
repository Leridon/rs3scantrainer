import {blue_icon, GameMap, type GameMapWidget} from "./map";
import * as leaflet from "leaflet"
import {type MapCoordinate} from "../../model/coordinates";
import SimpleClickInteraction from "./interactions/SimpleClickInteraction";
import LayerInteraction from "./interactions/LayerInteraction";
import {TileMarker} from "./TileMarker";
import {Vector2} from "../../util/math";
import GameLayer from "./GameLayer";

export class ActiveLayer extends GameLayer {
    private controls: leaflet.Control[] = []
    protected interaction: LayerInteraction<ActiveLayer> = null

    constructor() {
        super()
    }

    setInteraction(interaction: LayerInteraction<ActiveLayer>) {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null

            this.getMap().setTopControl(null)
        }

        this.interaction = interaction

        this.getMap().setTopControl(this.interaction.getTopControl())

        this.interaction.start()
        this.interaction.events.emit("started", null)
    }

    cancelInteraction() {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction.events.emit("stopped", null)
            this.interaction = null

            this.getMap().setTopControl(null)
        }
    }

    public addControl(control: leaflet.Control) {
        this.controls.push(control)

        this.getMap()?.addControl(control)
    }

    protected _tilemarker: TileMarker = null

    setMarker(spot: MapCoordinate) {
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
        this.parent = map

        this.controls.forEach((e) => e.addTo(map))
    }

    deactivate() {
        if(this.interaction) {
            this.interaction.cancel()
            this.interaction = null
        }

        this.getMap().setTopControl(null)

        this.parent = null

        this.controls.forEach((e) => e.remove())
    }
}


export class SimpleMarkerLayer extends ActiveLayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}