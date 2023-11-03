import * as leaflet from "leaflet";
import {Vector2} from "../../../lib/math/Vector";
import {Path} from "../../../lib/runescape/pathing";

export namespace RenderingUtility {
    import InteractionType = Path.InteractionType;

    export function interactionMarker(where: Vector2, how: InteractionType): leaflet.Marker {
        return leaflet.marker(Vector2.toLatLong(where), {
            icon: leaflet.icon({
                iconUrl: Path.InteractionType.meta(how).icon_url,
                iconSize: [28, 31],
                iconAnchor: [14, 16],
            }),
            interactive: false
        })
    }
}