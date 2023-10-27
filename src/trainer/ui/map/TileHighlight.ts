import * as leaflet from "leaflet"
import {Vector2} from "lib/math/Vector";
import {tilePolygon} from "./polygon_helpers";

export default class TileHighlight extends leaflet.FeatureGroup {
    _polygon: leaflet.Polygon = null

    constructor(private position: Vector2 = {x: 0, y: 0}) {
        super()

        this.update()
    }

    setPosition(position: Vector2) {
        if (Vector2.eq(position, this.position)) return

        this.position = position

        this.update()
    }

    private update() {
        if (this._polygon) {
            this._polygon.remove()
            this._polygon = null
        }

        this._polygon = tilePolygon(this.position).setStyle({
            fillOpacity: 0.2,
            opacity: 0.8,
            color: "#F0780C",
            fillColor: "#F0780C"
        }).addTo(this)
    }
}