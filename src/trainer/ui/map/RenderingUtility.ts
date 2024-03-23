import * as leaflet from "leaflet";
import {Vector2} from "lib/math";
import {CursorType} from "../../../lib/runescape/CursorType";

export namespace RenderingUtility {

  export function interactionMarker(where: Vector2, how: CursorType, simplified: boolean = false, centered: boolean = true): leaflet.Marker {
    let icon = leaflet.icon({
      iconUrl: CursorType.meta(how).icon_url,
      iconSize: [28, 31],
      iconAnchor: centered ? [14, 16] : [3, 0],
      className: simplified ? "ctr-inactive-overlay-marker" : undefined
    })

    return leaflet.marker(Vector2.toLatLong(where), {
      icon: icon,
      interactive: true
    })
  }
}