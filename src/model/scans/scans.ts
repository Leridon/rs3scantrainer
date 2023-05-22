import * as leaflet from "leaflet";
import {areaToPolygon, Box, MapCoordinate} from "../coordinates";
import {Raster} from "../../util/raster";
import {ScanSpot} from "../methods";

export class EquivalenceClass {
    public information_gain: number
    private polygon: leaflet.FeatureGroup = null

    constructor(
        public id: number,
        private parent: ScanEquivalenceClasses,
        public profile: scan_profile,
        public area: number[]
    ) {
        this.information_gain = information_gain(profile)
    }

    getPolygon(): leaflet.FeatureGroup {
        if (!this.polygon) {
            let color = Math.abs(this.information_gain - this.parent.max_information) < 0.01
                ? "blue"
                : `rgb(${255 * (1 - (this.information_gain / this.parent.max_information))}, ${255 * this.information_gain / this.parent.max_information}, 0)`

            this.polygon = leaflet.featureGroup()
            areaToPolygon(
                this.parent.raster,
                (p: EquivalenceClass) => p.id == this.id,
                this.area[0]
            ).setStyle({
                color: "black",
                opacity: 1,
                weight: 3,
                fillOpacity: 0.25,
                fillColor: color
            }).addTo(this.polygon)

            leaflet.marker(this.polygon.getBounds().getCenter(), {
                icon: leaflet.divIcon({
                    iconSize: [50, 20],
                    className: "equivalence-class-information",
                    html: `${this.information_gain.toFixed(2)}b`,
                }),
            }).addTo(this.polygon)
        }

        return this.polygon
    }
}

export class ScanEquivalenceClasses {
    raster: Raster<EquivalenceClass> = null
    equivalence_classes: EquivalenceClass[] = null
    max_information: number

    constructor(private candidates: MapCoordinate[],
                private range: number) {
    }

    private calculate_classes() {

        let bounds = leaflet.bounds(this.candidates.map((c) => leaflet.point(c.x, c.y)))

        this.raster = new Raster<EquivalenceClass>({
            left: bounds.getTopLeft().x - 2 * this.range,
            right: bounds.getTopRight().x + 2 * this.range,
            top: bounds.getBottomLeft().y + 2 * this.range,    // the Y axis in leaflet.pounds is exactly opposite to what the map uses.
            bottom: bounds.getTopLeft().y - 2 * this.range
        })

        this.equivalence_classes = []

        function eq(a: scan_profile, b: scan_profile) {
            if (a.length != b.length) return false

            for (let i = 0; i < a.length; i++) {
                if (a[i] != b[i]) return false
            }

            return true
        }

        let next_id = 0
        for (let row = 0; row < this.raster.size.y; row++) {
            for (let col = 0; col < this.raster.size.x; col++) {
                let index = row * this.raster.size.x + col

                let tile = {
                    x: this.raster.bounds.left + col,
                    y: this.raster.bounds.bottom + row
                }

                let profile = this.get_scan_profile(tile)

                if (col > 0) {
                    let left_neighbour = this.raster.data[index - 1]

                    if (eq(profile, left_neighbour.profile)) {
                        this.raster.data[index] = left_neighbour

                        left_neighbour.area.push(index)
                        continue
                    }
                }
                if (row > 0) {
                    let down_neighour = this.raster.data[index - this.raster.size.x]

                    if (eq(profile, down_neighour.profile)) {
                        this.raster.data[index] = down_neighour

                        down_neighour.area.push(index)
                        continue
                    }
                }

                // Create new equivalence class
                this.raster.data[index] = new EquivalenceClass(next_id++, this, profile, [index])

                this.equivalence_classes.push(this.raster.data[index])
            }
        }

        this.max_information = Math.max(...this.equivalence_classes.map((c) => c.information_gain))
    }

    get_scan_profile(tile: MapCoordinate) {
        return this.candidates.map((s) => get_pulse(tile, s, this.range))
    }

    getClasses(): EquivalenceClass[] {
        if (!this.equivalence_classes) this.calculate_classes()

        return this.equivalence_classes
    }
}

export function get_pulse(spot: MapCoordinate, tile: MapCoordinate, range: number): PulseType {
    let d_x = Math.abs(spot.x - tile.x)
    let d_y = Math.abs(spot.y - tile.y)
    let d = Math.max(d_x, d_y)

    return 3 - Math.min(2, Math.floor(Math.max(0, (d - 1)) / range)) as PulseType
}

export function area_pulse(spot: MapCoordinate, area: Box, range: number) {
    let dx_min = spot.x - area.topleft.x

}

export type PulseType = 1 | 2 | 3

export type scan_profile = PulseType[]

export function information_gain(profile: scan_profile) {
    let counts = [0, 0, 0]

    profile.forEach((s) => counts[s - 1]++)

    let number_of_singles = counts[0]
    let number_of_doubles = counts[1]
    let number_of_triples = counts[2]

    let gain = 0

    if (number_of_singles > 0) gain += Math.log2(profile.length / number_of_singles) * (number_of_singles / profile.length)
    if (number_of_doubles > 0) gain += Math.log2(profile.length / number_of_doubles) * (number_of_doubles / profile.length)
    if (number_of_triples > 0) gain += Math.log2(profile.length) * (number_of_triples / profile.length)  // Triples are special: They narrow down to exactly one candidate instead of all triple candidates.

    return gain
}

export enum ChildType {
    SINGLE,
    DOUBLE,
    TRIPLE,
    DIFFERENTLEVEL,
    TOOFAR,
}

export namespace ChildType {
    export let all = [
        ChildType.SINGLE,
        ChildType.DOUBLE,
        ChildType.TRIPLE,
        ChildType.DIFFERENTLEVEL,
        ChildType.TOOFAR,
    ]

    type meta = {
        pretty: string,
        short: string
    }

    export function meta(type: ChildType): meta {
        return new Map([
            [ChildType.SINGLE, {pretty: "Single", short: "1"}],
            [ChildType.DOUBLE, {pretty: "Double", short: "2"}],
            [ChildType.TRIPLE, {pretty: "Triple", short: "3"}],
            [ChildType.DIFFERENTLEVEL, {pretty: "Different Level", short: "DL"}],
            [ChildType.TOOFAR, {pretty: "Too Far", short: "TF"}],
        ]).get(type)
    }
}