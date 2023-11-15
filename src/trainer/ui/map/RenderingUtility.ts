import * as leaflet from "leaflet";
import {Vector2} from "lib/math";
import {Path} from "lib/runescape/pathing";

export namespace RenderingUtility {
    import InteractionType = Path.InteractionType;

    export function interactionMarker(where: Vector2, how: InteractionType, simplified: boolean = false): leaflet.Marker {
        let icon = leaflet.icon({
            iconUrl: Path.InteractionType.meta(how).icon_url,
            iconSize: [28, 31],
            iconAnchor: [14, 16],
            className: simplified ? "ctr-inactive-overlay-marker" : undefined
        })

        return leaflet.marker(Vector2.toLatLong(where), {
            icon: icon,
            interactive: true
        })
    }
}