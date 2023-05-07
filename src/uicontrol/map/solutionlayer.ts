import {ClueStep, ScanStep, SetSolution, SimpleSolution, VariantSolution} from "../../model/clues";
import {TileMarker} from "./map";
import * as leaflet from "leaflet"
import {Area, areaToPolygon, Box, boxPolygon, MapCoordinate} from "../../model/coordinates";
import {Raster} from "../../util/raster";
import {polygon} from "leaflet";

export class TileMarkerWithActive extends TileMarker {

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

export abstract class Solutionlayer extends leaflet.FeatureGroup {

    on_marker_set(marker: TileMarker) {
    }
}

class EquivalenceClass {
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

class ScanEquivalenceClasses {
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
        return this.candidates.map((s) => {
            let d_x = Math.abs(s.x - tile.x)
            let d_y = Math.abs(s.y - tile.y)
            let d = Math.max(d_x, d_y)

            let pulse = 3 - Math.min(2, Math.floor(Math.max(0, (d - 1)) / this.range))

            return pulse as (1 | 2 | 3)
        })
    }

    getClasses(): EquivalenceClass[] {
        if (!this.equivalence_classes) this.calculate_classes()

        return this.equivalence_classes
    }
}

type scan_profile = (1 | 2 | 3)[]

function information_gain(profile: scan_profile) {
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

export class ScanSolutionLayer extends Solutionlayer {
    protected markers: TileMarkerWithActive[]

    radius_polygon: leaflet.Polygon[]

    private ms: MapCoordinate[] = []

    constructor(private clue: ScanStep) {
        super()

        this.markers = (clue.solution as SetSolution).candidates.map((e) => {
            return new TileMarkerWithActive(e).withMarker().withX("#B21319")
        })

        // DO NOT REMOVE. Development code to easily assign numbers to scans
        this.markers.forEach((m) => {
            m.on("click", (e) => {
                this.ms.push(e.target.getSpot())
                e.target.withLabel(this.ms.length.toString(), "spot-number", [0, 0])

                console.log(JSON.stringify(this.ms))
            })
        })

        this.markers.forEach((m) => m.addTo(this))

        this.set_remaining_candidates(clue.solution.candidates)
    }

    remaining_candidates: MapCoordinate[] = this.clue.solution.candidates

    rule_out(spots: MapCoordinate[]) {

    }

    rule_out_but(spots: MapCoordinate[]) {

    }

    set_remaining_candidates(spots: MapCoordinate[]) {
        this.remaining_candidates = spots
        this.invalidate_equivalence_classes()
    }

    pulse(spot: MapCoordinate, pulse: 1 | 2 | 3) {

    }

    pulse_area(area: Box, pulse: 1 | 2 | 3) {

    }

    equivalence_classes: ScanEquivalenceClasses = null

    invalidate_equivalence_classes() {
        if (this.equivalence_classes) {
            this.equivalence_classes.getClasses().forEach((c) => {
                let p = c.getPolygon()
                if (p) p.remove()
            })
        }
    }

    drawEquivalenceClasses() {
        this.invalidate_equivalence_classes()

        {
            let startTime = performance.now()

            this.equivalence_classes = new ScanEquivalenceClasses(this.remaining_candidates, this.clue.range + 5)

            console.log(this.equivalence_classes.getClasses().map((c) => c.information_gain))

            let endTime = performance.now()
            console.log(`Created ${this.equivalence_classes.equivalence_classes.length} classes in ${endTime - startTime} milliseconds`)
        }

        {
            let startTime = performance.now()

            this.equivalence_classes.getClasses().forEach((c) => {
                c.getPolygon().addTo(this)
            })

            let endTime = performance.now()

            console.log(`Created ${this.equivalence_classes.equivalence_classes.length} polygons in ${endTime - startTime} milliseconds`)
        }
    }

    on_marker_set(marker: TileMarker | null) {
        if (this.radius_polygon) {
            this.radius_polygon.forEach((l) => l.remove())

            this.radius_polygon = []
        }


        if (!marker) return

        let center = marker.getSpot()

        let radius = this.clue.range + 5 // Always assume meerkats

        let inner: Box = {
            topleft: {x: center.x - radius, y: center.y + radius},
            botright: {x: center.x + radius, y: center.y - radius}
        }

        let outer: Box = {
            topleft: {x: center.x - 2 * radius, y: center.y + 2 * radius},
            botright: {x: center.x + 2 * radius, y: center.y - 2 * radius}
        }

        this.radius_polygon = [
            boxPolygon(inner).setStyle({color: "green", fillOpacity: 0.1}),
            boxPolygon(outer).setStyle({color: "yellow", fillOpacity: 0.1, dashArray: [5, 5]})
        ]

        this.radius_polygon.forEach((p) => p.addTo(this))
    }
}

export class SimpleMarkerLayer extends Solutionlayer {
    constructor(private markers: TileMarker[]) {
        super()

        this.markers.forEach((e) => e.addTo(this))
    }
}

export function getSolutionLayer(clue: ClueStep, variant: number = 0): Solutionlayer {
    if (clue.type == "scan") {
        return new ScanSolutionLayer(clue)
    }

    if (clue.solution) {
        switch (clue.solution.type) {
            case "coordset":
                return new SimpleMarkerLayer((clue.solution as SetSolution).candidates.map((e) => {
                    return new TileMarker(e).withMarker().withX("#B21319")
                }))
            case "simple":
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as SimpleSolution).coordinates).withMarker().withX("#B21319")
                ])
            case "variants":
                // TODO: Properly handle variant solutions
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as VariantSolution).variants[variant].solution.coordinates).withMarker().withX("#B21319")
                ])

        }
    }

}