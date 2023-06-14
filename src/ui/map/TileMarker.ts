import * as leaflet from "leaflet";
import {MapCoordinate} from "../../model/coordinates";
import {blue_icon, green_icon, red_icon, yellow_icon} from "./map";

export class TileMarker extends leaflet.FeatureGroup {
    marker: leaflet.Marker
    label: leaflet.Tooltip
    x_marks_the_spot: leaflet.Polyline

    constructor(protected spot: MapCoordinate) {
        super()

        this.setOpacity(1)
    }

    withMarker(icon: leaflet.Icon = null) {
        const level_markers = [red_icon, blue_icon, green_icon, yellow_icon]

        if (this.marker) this.marker.remove()

        this.marker = leaflet.marker([this.spot.y, this.spot.x], {
            icon: icon || level_markers[this.spot.level],
            title: `[${this.spot.x}, ${this.spot.y}]`
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
            direction: "center"
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
                interactive: false
            }
        ).addTo(this)

        return this
    }

    getSpot(): MapCoordinate {
        return this.spot
    }

    private setOpacity(opacity: number) {
        if (this.marker) this.marker.setOpacity(opacity)
        if (this.x_marks_the_spot)
            this.x_marks_the_spot.setStyle(
                Object.assign(this.x_marks_the_spot.options, {
                    opacity: opacity * 0.75,
                    fillOpacity: opacity * 0.25,
                }))
        if (this.label) this.label.setOpacity(opacity)
    }

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