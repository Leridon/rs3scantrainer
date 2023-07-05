import {blue_icon, GameMapControl} from "./map";
import * as leaflet from "leaflet"
import {MapCoordinate, Vector2} from "../../model/coordinates";
import SimpleClickInteraction from "./interactions/SimpleClickInteraction";
import LayerInteraction from "./interactions/LayerInteraction";
import {TileMarker} from "./TileMarker";
import PathEditLayer from "../scanedit/PathEditLayer";

/*
class DrawDiveInteraction extends LayerInteraction<ActiveLayer> {
    _start: MapCoordinate = null
    _to: MapCoordinate = null

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

        "click": async (e: LeafletMouseEvent) => {
            // Capture and consume the click event so it does not get sent to the default interaction

            leaflet.DomEvent.stopPropagation(e)

            if (this._start) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                await this.update(now)

                this._start = null
            }
        },

        "mousedown": async (e: LeafletMouseEvent) => {
            if (!this._start) {
                leaflet.DomEvent.stopPropagation(e)

                this._start = this.layer.getMap().tileFromMouseEvent(e)
            }
        },

        "mousemove": async (e: LeafletMouseEvent) => {

            if (this._start) {
                leaflet.DomEvent.stopPropagation(e)

                let now = this.layer.getMap().tileFromMouseEvent(e)

                await this.update(now)
            }
        },
    }

    _polygon: leaflet.Polyline = null

    async update(to: MapCoordinate) {
        if (!this._to || !Vector2.eq(to, this._to)) {
            this._to = to

            let tile = await dive(HostedMapData.get(), this._start, to)
            //let tile = await movement.escape(HostedMapData.get(), {tile: this._start, direction: movement.direction.fromVector(Vector2.sub(to, this._start))})

            if (this._polygon) this._polygon.remove()

            if (tile) {

                this._polygon = leaflet.polyline(
                    [toLL(this._start), toLL(tile.tile)]
                ).addTo(this.layer)
            } else {

                this._polygon = leaflet.polyline(
                    [toLL(this._start), toLL(to)]
                ).setStyle({
                    color: "red"
                }).addTo(this.layer)
            }
        }
    }
}*/

export class ActiveLayer extends leaflet.FeatureGroup {
    protected map: GameMapControl = null
    private controls: leaflet.Control[] = []
    protected interaction: LayerInteraction<ActiveLayer>

    constructor() {
        super()

        new PathEditLayer(this, {
            description: "",
            steps: []/*[
                {
                    type: "teleport",
                    id: {
                        main: "ringofduelling",
                        sub: "castlewars"
                    }
                }, {
                    type: "run",
                    waypoints: [
                        {x: 2444, y: 3089},
                        {x: 2448, y: 3090},
                        {x: 2451, y: 3090},
                    ]
                }, {
                    type: "redclick",
                    where: {x: 2462, y: 3077}
                }, {
                    type: "ability",
                    ability: "surge",
                    from: {x: 2451, y: 3090},
                    to: {x: 2461, y: 3080}
                }, {
                    type: "run",
                    waypoints: [
                        {x: 2461, y: 3080},
                        {x: 2460, y: 3076},
                    ]
                }, {
                    type: "ability",
                    ability: "dive",
                    from: {x: 2460, y: 3076},
                    to: {x: 2450, y: 3066}
                }, {
                    type: "ability",
                    ability: "barge",
                    from: {x: 2450, y: 3066},
                    to: {x: 2440, y: 3056}
                }
            ]*/
        }).addTo(this)
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

            de.activate()
        }
    }

    public addControl(control: leaflet.Control) {
        this.controls.push(control)

        if (this.map) this.map.map.addControl(control)
    }

    private _tilemarker: TileMarker = null

    private abc: leaflet.FeatureGroup = null

    loadDefaultInteraction(): LayerInteraction<ActiveLayer> {
        let self = this

        return new SimpleClickInteraction(this, {
            "click": async (p) => {
                if (self.abc) self.abc.remove()

                self.abc = leaflet.featureGroup().addTo(self)

                if (self._tilemarker && Vector2.eq(p, self._tilemarker.getSpot())) {
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