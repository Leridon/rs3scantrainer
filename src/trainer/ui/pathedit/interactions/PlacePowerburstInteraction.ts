import {Path} from "lib/runescape/pathing";
import * as leaflet from "leaflet";
import {Vector2} from "lib/math";
import InteractionTopControl from "../../map/InteractionTopControl";
import SelectTileInteraction from "../../../../lib/gamemap/interaction/SelectTileInteraction";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";

export default class PlacePowerburstInteraction extends ValueInteraction<Path.step_powerburst> {

    constructor() {
        super({
            preview_render: (s) => leaflet.marker(Vector2.toLatLong(s.where), {
                icon: leaflet.icon({
                    iconUrl: "assets/icons/accel.png",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                }),
                interactive: false
            })
        });

        new SelectTileInteraction()
            .onCommit((t) => this.commit(Path.auto_describe({
                type: "powerburst",
                description: "",
                where: t
            })))
            .onPreview((t) =>
                this.preview(Path.auto_describe({
                        type: "powerburst",
                        description: "",
                        where: t
                    })
                )
            )
            .addTo(this)

        let control = new InteractionTopControl({
            name: "Placing Powerburst",
            cancel_handler: () => this.cancel()
        }).addTo(this)

        control.content.append(c().text("Click any tile to place the powerburst activation."))
    }
}