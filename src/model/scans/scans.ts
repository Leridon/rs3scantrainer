import * as leaflet from "leaflet";
import {areaToPolygon, Box, clampInto, MapCoordinate, Vector2} from "../coordinates";
import {Raster} from "../../util/raster";
import {rangeRight} from "lodash";
import {ScanTree} from "./ScanTree";
import ScanSpot = ScanTree.ScanSpot;
import {util} from "../../util/util";

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
            })
                //.on("click", () => console.log(this.profile))
                .addTo(this.polygon)
        }

        return this.polygon
    }
}

export type ScanEquivalenceClassOptions = {
    candidates: MapCoordinate[],
    range: number,
    complement: boolean,
    floor: number
}

export class ScanEquivalenceClasses {
    raster: Raster<EquivalenceClass> = null
    equivalence_classes: EquivalenceClass[] = null
    max_information: number

    layer: leaflet.FeatureGroup = null

    constructor(public options: ScanEquivalenceClassOptions) {
        this.invalidate()
    }

    private calculate_classes() {
        if (this.equivalence_classes != null) return;

        if (this.options.candidates.length == 0) {
            this.max_information = 0
            this.equivalence_classes = []
            return
        }

        let bounds = leaflet.bounds(this.options.candidates.map((c) => leaflet.point(c.x, c.y)))

        this.raster = new Raster<EquivalenceClass>(this.options.complement ?
            {
                topleft: {
                    x: bounds.getTopLeft().x - (this.options.range + 15),
                    y: ((bounds.getBottomLeft().y + (this.options.range + 15) + 1) + 6400) % 12800,    // the Y axis in leaflet.bounds is exactly opposite to what the map uses.
                },
                botright: {
                    x: bounds.getTopRight().x + (this.options.range + 15) + 1,
                    y: ((bounds.getTopLeft().y - (this.options.range + 15)) + 6400) % 12800
                }
            }
            : {
                topleft: {
                    x: bounds.getTopLeft().x - 2 * this.options.range,
                    y: bounds.getBottomLeft().y + 2 * this.options.range + 1,    // the Y axis in leaflet.bounds is exactly opposite to what the map uses.
                },
                botright: {
                    x: bounds.getTopRight().x + 2 * this.options.range + 1,
                    y: bounds.getTopLeft().y - 2 * this.options.range
                },
            })

        this.equivalence_classes = []

        let next_id = 0
        for (let row = 0; row < this.raster.size.y; row++) {
            for (let col = 0; col < this.raster.size.x; col++) {
                let index = row * this.raster.size.x + col

                let tile: MapCoordinate = {
                    x: this.raster.bounds.topleft.x + col,
                    y: this.raster.bounds.botright.y + row,
                    level: this.options.floor
                }

                let profile = ScanProfile.compute(tile, this.options.candidates, this.options.range)

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

    getLayer(): leaflet.FeatureGroup {
        this.calculate_classes()

        if (this.layer == null) {
            this.layer = leaflet.featureGroup()

            this.equivalence_classes.forEach((c) => c.getPolygon().addTo(this.layer))
        }

        return this.layer
    }

    invalidate(options?: ScanEquivalenceClassOptions) {
        if (options) this.options = options

        this.equivalence_classes = null
        this.max_information = null

        this.calculate_classes()

        let old_layer = this.layer
        this.layer = null

        // @ts-ignore
        let old_map = old_layer?._map
        if (old_map) {
            old_layer.remove()

            this.getLayer().addTo(old_map)
        }
    }
}

export function get_pulse(spot: MapCoordinate, tile: MapCoordinate, range: number): Pulse {
    let d = distance(spot, tile)

    let p = 3 - Math.min(2, Math.floor(Math.max(0, (d - 1)) / range)) as 1 | 2 | 3

    if (p > 3) console.log("PANIC")

    let different_level = spot.level != tile.level || distance(complementSpot(spot), tile) <= range + 15

    return {
        pulse: p,
        different_level: different_level
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

        let complement_spot = complementSpot(spot)

        if (spot.level != area.level || distance(complement_spot, clampInto(complement_spot, area.area)) <= (range + 15)) {
            // Any tile in area triggers different level
            pulses.push({
                pulse: 1,
                different_level: true
            })
        }

        if ((distance(complement_spot, area.area.topleft) > (range + 15)
                || distance(complement_spot, area.area.botright) > (range + 15))
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
    import natural_order = util.Order.natural_order;
    export type hash_t = 0 | 1 | 2 | 3 | 4 | 5

    export function hash(pulse: Pulse): hash_t {
        return (pulse.pulse - 1) + (pulse.different_level ? 3 : 0) as hash_t
    }

    export function unhash(hash: hash_t): Pulse {
        return {
            pulse: (hash % 3) + 1 as 1 | 2 | 3,
            different_level: hash >= 3
        }
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

    export function compare(a: Pulse, b: Pulse): number {
        return natural_order(hash(a), hash(b))
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

export function complementSpot(spot: MapCoordinate) {
    return {
        x: spot.x,
        y: (spot.y + 6400) % 12800,
        level: spot.level
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