import {ClueStep, SetSolution, SimpleSolution, VariantSolution} from "../../model/clues";
import {GameMapControl, TileMarker} from "./map";
import * as leaflet from "leaflet"
import {ScanLayer} from "./layers/ScanLayer";
import {Application} from "../../application";

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
    constructor(protected layer: T) {
    }

    activate() {
        this.layer.setInteraction(this)
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
        if (this.interaction) this.interaction.cancel()
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

export function getSolutionLayer(clue: ClueStep, app: Application, variant: number = 0): ActiveLayer {
    if (clue.type == "scan") {
        return new ScanLayer(clue, app, {show_edit_button: true})
    }

    if (clue.solution) {
        switch (clue.solution.type) {
            case "coordset":
                return new SimpleMarkerLayer((clue.solution as SetSolution).candidates.map((e) => {
                    return new TileMarker(e).withMarker().withX("#B21319")
                }))
            case "simple":
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as SimpleSolution).coordinates).withMarker().withX("#B21319")
                ])
            case "variants":
                // TODO: Properly handle variant solutions
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as VariantSolution).variants[variant].solution.coordinates).withMarker().withX("#B21319")
                ])
        }
    }

}