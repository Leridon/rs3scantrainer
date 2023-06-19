import {blue_icon, GameMapControl} from "./map";
import * as leaflet from "leaflet"
import {Box, eq, MapCoordinate, toLL} from "../../model/coordinates";
import SimpleClickInteraction from "./interactions/SimpleClickInteraction";
import LayerInteraction from "./interactions/LayerInteraction";
import {TileMarker} from "./TileMarker";
import {LeafletMouseEvent} from "leaflet";
import {dive, RuneAppsMapData} from "../../model/movement";

class DrawDiveInteraction extends LayerInteraction<ActiveLayer> {
    _start: MapCoordinate = null

    constructor(layer: ActiveLayer) {
        super(layer);
    }

    cancel() {
        this.layer.getMap().map.off(this._maphooks)
        this.layer.getMap().map.dragging.enable()
    }

    start() {
        this.layer.getMap().map.on(this._maphooks)
        this.layer.getMap().map.dragging.disable()
    }

    _maphooks: leaflet.LeafletEventHandlerFnMap = {

        "click": (e: LeafletMouseEvent) => {
            // Capture and consume the click event so it does not get sent to the default interaction

            leaflet.DomEvent.stopPropagation(e)

            if (this._start) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                this.update(now)
            }
        },

        "mousedown": (e: LeafletMouseEvent) => {
            if (!this._start) {
                leaflet.DomEvent.stopPropagation(e)

                this._start = this.layer.getMap().tileFromMouseEvent(e)
            }
        },

        "mousemove": (e: LeafletMouseEvent) => {

            if (this._start) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                this.update(now)
            }
        },
    }

    _polygon: leaflet.Polyline = null

    update(to: MapCoordinate){
        let tile = dive(new RuneAppsMapData(), this._start, to)

        if(this._polygon) this._polygon.remove()

        if (tile) {

            this._polygon = leaflet.polyline(
                [toLL(this._start), toLL(tile.tile)]
            ).addTo(this.layer)
        }
    }
}

export class ActiveLayer extends leaflet.FeatureGroup {
    protected map: GameMapControl = null
    private controls: leaflet.Control[] = []
    protected interaction: LayerInteraction<ActiveLayer>

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

            this.map.setTopControl(null)
        }

        this.interaction = interaction

        this.map.setTopControl(this.interaction.getTopControl())

        this.interaction.start()
    }

    cancelInteraction() {
        if (this.interaction) {
            this.interaction.cancel()
            this.interaction = null

            this.map.setTopControl(null)

            let de = this.loadDefaultInteraction()

            console.log(de.constructor.name)

            de.activate()
        }
    }

    protected addControl(control: leaflet.Control) {
        this.controls.push(control)

        if (this.map) this.map.map.addControl(control)
    }

    private _tilemarker: TileMarker = null

    loadDefaultInteraction(): LayerInteraction<ActiveLayer> {
        let self = this

        return new DrawDiveInteraction(this)

        return new SimpleClickInteraction(this, {
            "click": (p) => {
                if (self._tilemarker && eq(p, self._tilemarker.getSpot())) {
                    self.removeMarker()
                } else self.setMarker(p)
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

        let de = this.loadDefaultInteraction()

        de.activate()

        this.controls.forEach((e) => e.addTo(map.map))
    }

    deactivate() {
        this.interaction.cancel()
        this.interaction = null

        this.map.setTopControl(null)

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