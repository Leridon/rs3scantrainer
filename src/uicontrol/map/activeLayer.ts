import {GameMapControl, TileMarker} from "./map";
import * as leaflet from "leaflet"

export class TileMarkerWithActive extends TileMarker {

    private active: boolean = true

    isActive() {
        return this.active
    }

    setActive(isActive: boolean) {
        this.active = isActive

        if (isActive) this.setOpacity(1)
        else this.setOpacity(0.2)
    }
}

export abstract class LayerInteraction<T extends ActiveLayer> {
    private is_active: boolean

    protected constructor(protected layer: T) {
    }

    activate(): this {
        if (!this.is_active) {
            this.layer.setInteraction(this)
            this.is_active = true
        }
        return this
    }

    deactivate(): this {
        if (this.is_active) {
            this.layer.cancelInteraction()
            this.is_active = false
        }
        return this
    }

    abstract start()

    abstract cancel()
}

export abstract class ActiveLayer extends leaflet.FeatureGroup {
    protected map: GameMapControl = null
    private controls: leaflet.Control[] = []
    private interaction: LayerInteraction<ActiveLayer>

    protected constructor() {
        super();
    }

    getMap(): GameMapControl {
        return this.map
    }

    setInteraction(interaction: LayerInteraction<ActiveLayer>) {
        this.cancelInteraction()

        this.interaction = interaction
        this.interaction.start()
    }

    cancelInteraction() {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null
        }
    }

    protected addControl(control: leaflet.Control) {
        this.controls.push(control)

        if (this.map) this.map.map.addControl(control)
    }

    activate(map: GameMapControl) {
        this.map = map

        this.controls.forEach((e) => e.addTo(map.map))
    }

    deactivate() {
        this.cancelInteraction()

        this.map = null

        this.controls.forEach((e) => e.remove())
    }

    on_marker_set(marker: TileMarker) {
    }
}


export class SimpleMarkerLayer extends ActiveLayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}