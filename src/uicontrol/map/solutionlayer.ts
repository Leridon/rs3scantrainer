import {ClueStep, ScanStep, SetSolution, SimpleSolution, VariantSolution} from "../../model/clues";
import {GameMapControl, TileMarker} from "./map";
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
    map: GameMapControl = null

    activate(map: GameMapControl) {
        this.map = map
    }

    deactivate() {
        this.map = null
    }

    on_marker_set(marker: TileMarker) {
    }
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
        this.drawEquivalenceClasses()
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