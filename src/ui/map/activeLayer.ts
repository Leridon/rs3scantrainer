import {blue_icon, GameMapControl} from "./map";
import * as leaflet from "leaflet"
import {eq, MapCoordinate} from "../../model/coordinates";
import SimpleClickInteraction from "./interactions/SimpleClickInteraction";
import LayerInteraction from "./interactions/LayerInteraction";
import {TileMarker} from "./TileMarker";

export class ActiveLayer extends leaflet.FeatureGroup {
    protected map: GameMapControl = null
    private controls: leaflet.Control[] = []
    private interaction: LayerInteraction<ActiveLayer>

    constructor() {
        super()
    }

    getMap(): GameMapControl {
        return this.map
    }

    setInteraction(interaction: LayerInteraction<ActiveLayer>) {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null
        }

        this.interaction = interaction
        this.interaction.start()
    }

    cancelInteraction() {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null

            this.loadDefaultInteraction().activate()
        }
    }

    protected addControl(control: leaflet.Control) {
        this.controls.push(control)

        if (this.map) this.map.map.addControl(control)
    }

    private _tilemarker: TileMarker = null

    loadDefaultInteraction(): LayerInteraction<ActiveLayer> {

        console.log("Loading")
        let self = this

        return new SimpleClickInteraction(this, {
            "click": (p) => {
                if (self._tilemarker && eq(p, self._tilemarker.getSpot())) self.removeMarker()
                else self.setMarker(p)
            }
        })
    }

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

    activate(map: GameMapControl) {
        this.map = map

        this.loadDefaultInteraction().activate()

        this.controls.forEach((e) => e.addTo(map.map))
    }

    deactivate() {
        this.cancelInteraction()

        this.map = null

        this.controls.forEach((e) => e.remove())
    }
}


export class SimpleMarkerLayer extends ActiveLayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}