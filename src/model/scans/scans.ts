import * as leaflet from "leaflet";
import {areaToPolygon, Box, clampInto, MapCoordinate, Vector2} from "../coordinates";
import {Raster} from "../../util/raster";
import {rangeRight} from "lodash";
import {ScanTree2} from "./ScanTree2";
import ScanSpot = ScanTree2.ScanSpot;

export class EquivalenceClass {
    public information_gain: number
    private polygon: leaflet.FeatureGroup = null

    constructor(
        public id: number,
        private parent: ScanEquivalenceClasses,
        public profile: ScanProfile,
        public area: number[]
    ) {
        this.information_gain = ScanProfile.information_gain(profile)
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

        if (this.candidates.length == 0) {
            this.max_information = 0
            this.equivalence_classes = []
            return
        }

        let bounds = leaflet.bounds(this.candidates.map((c) => leaflet.point(c.x, c.y)))

        this.raster = new Raster<EquivalenceClass>({
            left: bounds.getTopLeft().x - 2 * this.range,
            right: bounds.getTopRight().x + 2 * this.range + 1,
            top: bounds.getBottomLeft().y + 2 * this.range + 1,    // the Y axis in leaflet.bounds is exactly opposite to what the map uses.
            bottom: bounds.getTopLeft().y - 2 * this.range
        })

        this.equivalence_classes = []

        let next_id = 0
        for (let row = 0; row < this.raster.size.y; row++) {
            for (let col = 0; col < this.raster.size.x; col++) {
                let index = row * this.raster.size.x + col

                let tile = {
                    x: this.raster.bounds.left + col,
                    y: this.raster.bounds.bottom + row
                }

                let profile = ScanProfile.compute(tile, this.candidates, this.range)

                if (col > 0) {
                    let left_neighbour = this.raster.data[index - 1]

                    if (ScanProfile.equals(profile, left_neighbour.profile)) {
                        this.raster.data[index] = left_neighbour

                        left_neighbour.area.push(index)
                        continue
                    }
                }
                if (row > 0) {
                    let down_neighour = this.raster.data[index - this.raster.size.x]

                    if (ScanProfile.equals(profile, down_neighour.profile)) {
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

    getClasses(): EquivalenceClass[] {
        if (!this.equivalence_classes) this.calculate_classes()

        return this.equivalence_classes
    }
}


export function get_pulse(spot: MapCoordinate, tile: MapCoordinate, range: number): Pulse {
    let d = distance(spot, tile)

    let p = 3 - Math.min(2, Math.floor(Math.max(0, (d - 1)) / range)) as 1 | 2 | 3

    let different_level = spot.level != tile.level || distance(levelled_spot(spot), levelled_spot(tile)) <= range + 15

    return {
        pulse: p,
        different_level: different_level
    }
}

function levelled_spot(spot: Vector2): Vector2 {
    return {
        x: spot.x,
        y: spot.y % 6400
    }
}

function leveled_area(area: Box): Box {
    return {
        topleft: levelled_spot(area.topleft),
        botright: levelled_spot(area.botright),
    }
}

function distance(a: Vector2, b: Vector2): number {
    let d_x = Math.abs(a.x - b.x)
    let d_y = Math.abs(a.y - b.y)
    return Math.max(d_x, d_y)
}

export function area_pulse(spot: MapCoordinate, area: ScanSpot, range: number): Pulse[] {
    let pulses: Pulse[] = null

    let max = get_pulse(spot, clampInto(spot, area.area), range).pulse

    // This breaks if areas are so large they cover both cases. But in that case: Wtf are you doing?
    if (max == 1) {
        pulses = []

        let spot_levelled = levelled_spot(spot)
        let area_levelled = leveled_area(area.area)

        if (spot.level != area.level || distance(spot_levelled, clampInto(spot_levelled, area_levelled)) <= (range + 15)) {
            // Any tile in area triggers different level
            pulses.push({
                pulse: 1,
                different_level: true
            })
        }

        if ((distance(spot_levelled, area_levelled.topleft) > (range + 15)
            || distance(spot_levelled, area_levelled.botright) > (range + 15))
            && spot.level == area.level
        ) { // Any tile in area does not trigger different level
            pulses.push({
                pulse: 1,
                different_level: false
            })
        }
    } else {
        let tl = area.area.topleft
        let br = area.area.botright

        let min = Math.min(
            get_pulse(spot, tl, range).pulse,
            get_pulse(spot, br, range).pulse,
        )

        pulses = rangeRight(min, max + 1, 1).map((p: 1 | 2 | 3) => {
            return {
                pulse: p,
                different_level: spot.level != area.level
            }
        })
    }

    return pulses
}

export type Pulse = {
    pulse: 1 | 2 | 3,
    different_level: boolean
}

export namespace Pulse {
    export type hash_t = 0 | 1 | 2 | 3 | 4 | 5

    export function hash(pulse: Pulse): hash_t {
        return (pulse.pulse - 1) + (pulse.different_level ? 3 : 0) as hash_t
    }

    export function equals(a: Pulse, b: Pulse): boolean {
        return a.pulse == b.pulse && a.different_level == b.different_level
    }

    export let all: Pulse[] = [
        // CAREFUL: This is sorted by the hash of the pulse (0 to 5), and MUST stay this way to not break some optimized code!
        {pulse: 1, different_level: false},
        {pulse: 2, different_level: false},
        {pulse: 3, different_level: false},
        {pulse: 1, different_level: true},
        {pulse: 2, different_level: true},
        {pulse: 3, different_level: true},
    ]

    type meta = {
        pretty: string,
        short: string,
        shorted: string
    }

    export function meta(type: Pulse): meta {
        let pretty = ["Single", "Double", "Triple"][type.pulse - 1]

        // TODO: Clean this pos up

        if (type.different_level) {
            return {
                pretty: type.pulse == 1 ? "Different Level" : pretty + " (DL)",
                short: type.pulse == 1 ? "DL" : "DL" + type.pulse,
                shorted: type.pulse == 1 ? "\"DL\"" : "\"DL\"" + type.pulse
            }
        } else {
            return {
                pretty: pretty,
                short: type.pulse.toString(),
                shorted: type.pulse.toString()
            }
        }
    }
}

export type ScanProfile = number[]

namespace ScanProfile {
    export function compute(tile: MapCoordinate, candidates: MapCoordinate[], range: number): ScanProfile {
        return candidates.map((s) => Pulse.hash(get_pulse(tile, s, range)))
    }

    export function equals(a: ScanProfile, b: ScanProfile): boolean {
        if (a.length != b.length) return false

        for (let i = 0; i < a.length; i++) {
            if (a[i] != b[i]) return false
        }

        return true
    }

    export function information_gain(profile: ScanProfile): number {
        let n = profile.length

        let counts: number[] = [0, 0, 0, 0, 0, 0, 0, 0]

        profile.forEach((s) => counts[s]++)

        let gain = 0

        // TODO: Somehow get rid of those branches
        if (counts[0] > 0) gain += counts[0] * Math.log2(n / counts[0])
        if (counts[1] > 0) gain += counts[1] * Math.log2(n / counts[1])
        if (counts[2] > 0) gain += counts[2] * Math.log2(n)
        if (counts[3] > 0) gain += counts[3] * Math.log2(n / counts[3])
        if (counts[4] > 0) gain += counts[4] * Math.log2(n / counts[4])
        if (counts[5] > 0) gain += counts[5] * Math.log2(n)

        gain /= n

        /*counts.forEach()

        let number_of_singles = counts[0]
        let number_of_doubles = counts[1]
        let number_of_triples = counts[2]


        if (number_of_singles > 0) gain += Math.log2(profile.length / number_of_singles) * (number_of_singles / profile.length)
        if (number_of_doubles > 0) gain += Math.log2(profile.length / number_of_doubles) * (number_of_doubles / profile.length)
        if (number_of_triples > 0) gain += Math.log2(profile.length) * (number_of_triples / profile.length)  // Triples are special: They narrow down to exactly one candidate instead of all triple candidates.

         */
        return gain
    }
}
/*
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
        short: string,
        shorted: string
    }

    export function meta(type: ChildType): meta {
        return new Map([
            [ChildType.SINGLE, {pretty: "Single", short: "1", shorted: "1"}],
            [ChildType.DOUBLE, {pretty: "Double", short: "2", shorted: "2"}],
            [ChildType.TRIPLE, {pretty: "Triple", short: "3", shorted: "3"}],
            [ChildType.DIFFERENTLEVEL, {pretty: "Different Level", short: "DL", shorted: "\"DL\""}],
            [ChildType.TOOFAR, {pretty: "Too Far", short: "TF", shorted: "\"TF\""}],
        ]).get(type)
    }

    export function fromPulse(pulse: PulseType): ChildType {
        return [
            ChildType.SINGLE,
            ChildType.DOUBLE,
            ChildType.TRIPLE,
        ][pulse - 1]
    }
}*/