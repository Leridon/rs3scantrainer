import InteractionLayer from "../../../../lib/gamemap/interaction/InteractionLayer";
import {GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {Path} from "../../../../lib/runescape/pathing";
import * as leaflet from "leaflet";
import {Vector2} from "../../../../lib/math/Vector2";
import InteractionTopControl from "../../map/InteractionTopControl";

export default class PlacePowerburstInteraction extends InteractionLayer {

    _preview: leaflet.Layer = null

    constructor(private config: {
        done_handler: (_: Path.step_powerburst) => void
    }) {
        super();

        let control = new InteractionTopControl({
            name: "Placing Powerburst",
            cancel_handler: () => this.cancel()
        }).addTo(this)

        control.content.append(c().text("Click any tile to place the powerburst activation."))
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(() => {
            event.stopAllPropagation()

            this.config.done_handler(Path.auto_describe({
                type: "powerburst",
                description: "",
                where: event.tile()
            }))

            this.cancel()
        })
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(() => {
            if (this._preview) {
                this._preview.remove()
                this._preview = null
            }

            this._preview = leaflet.marker(Vector2.toLatLong(event.tile()), {
                icon: leaflet.icon({
                    iconUrl: "assets/icons/accel.png",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                }),
                interactive: false
            }).addTo(this)
        })
    }
}