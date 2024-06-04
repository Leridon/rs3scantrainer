import * as leaflet from "leaflet";
import {TileCoordinates} from "../runescape/coordinates";
import {levelIcon} from "./GameMap";
import {ActiveOpacityGroup} from "./layers/OpacityLayer";

export class TileMarker extends ActiveOpacityGroup {
  marker: leaflet.Marker
  label: leaflet.Tooltip
  x_marks_the_spot: leaflet.Polyline

  constructor(protected spot: TileCoordinates) {
    super(1, 0.2)

    this.setOpacity(1)
  }

  withMarker(icon: leaflet.Icon = null, scale: number = 1) {
    if (this.marker) this.marker.remove()

    this.marker = leaflet.marker([this.spot.y, this.spot.x], {
      icon: icon ?? levelIcon(this.spot.level, scale),
      opacity: this.options.opacity,
      interactive: true,
      bubblingMouseEvents: true,
    }).addTo(this)

    return this
  }

  withLabel(text: string, className: string, offset: [number, number]) {
    if (this.label) this.removeLabel()

    this.label = leaflet.tooltip({
      content: text,
      className: className,
      offset: offset,
      permanent: true,
      direction: "center",
      opacity: this.options.opacity
    })

    this.bindTooltip(this.label)

    return this
  }

  removeLabel() {
    if (this.label) {
      this.label.remove()
      this.label = null
    }
  }

  withX(color: string) {
    if (this.x_marks_the_spot) this.x_marks_the_spot.remove()

    this.x_marks_the_spot = leaflet.polyline(
      [
        [[this.spot.y + 0.5, this.spot.x - 0.5], [this.spot.y - 0.5, this.spot.x + 0.5]],
        [[this.spot.y - 0.5, this.spot.x - 0.5], [this.spot.y + 0.5, this.spot.x + 0.5]]
      ], {
        color: color,
        fillColor: color,
        interactive: false,
        opacity: this.options.opacity
      }
    ).addTo(this)

    return this
  }

  getSpot(): TileCoordinates {
    return this.spot
  }
}