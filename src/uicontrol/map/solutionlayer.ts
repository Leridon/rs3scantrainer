import {ClueStep, ScanStep, SetSolution, SimpleSolution, Solution, VariantSolution} from "../../model/clues";
import {TileMarker} from "./map";
import * as leaflet from "leaflet"
import {Box, boxPolygon, MapCoordinate, tilePolygon} from "../../model/coordinates";
import {Point} from "leaflet";

export class TileMarkerWithActive extends TileMarker {

    setActive(isActive: boolean) {
        if (isActive) this.setOpacity(1)
        else this.setOpacity(0.2)
    }
}

export abstract class Solutionlayer extends leaflet.FeatureGroup {

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
    }

    equivalence_class_polygons: leaflet.Polygon[] = []
    cands: MapCoordinate[] = []

    draw_equivalence_classes(candidates: MapCoordinate[]) {
        this.cands = candidates

        function rainbow(h: number) {
            // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
            // Adam Cole, 2011-Sept-14
            // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
            var r, g, b;
            var i = ~~(h * 6);
            var f = h * 6 - i;
            var q = 1 - f;
            switch (i % 6) {
                case 0:
                    r = 1;
                    g = f;
                    b = 0;
                    break;
                case 1:
                    r = q;
                    g = 1;
                    b = 0;
                    break;
                case 2:
                    r = 0;
                    g = 1;
                    b = f;
                    break;
                case 3:
                    r = 0;
                    g = q;
                    b = 1;
                    break;
                case 4:
                    r = f;
                    g = 0;
                    b = 1;
                    break;
                case 5:
                    r = 1;
                    g = 0;
                    b = q;
                    break;
            }
            var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
            return (c);
        }

        this.equivalence_class_polygons.forEach((p) => p.remove())

        let range = this.clue.range + 5
        let bounds = leaflet.bounds(this.clue.solution.candidates.map((c) => leaflet.point(c.x, c.y)))

        let class_cache = {}

        for (let x = bounds.getTopLeft().x - range; x <= bounds.getTopRight().x + range; x++) {
            for (let y = bounds.getTopLeft().y - range; y <= bounds.getBottomLeft().y + range; y++) {

                let hash = JSON.stringify(candidates.map((s) => Math.min(2, Math.floor(Math.max(Math.abs(s.x - x) - 1, Math.abs(s.y - y) - 1) / range))))

                if (!class_cache[hash]) {
                    class_cache[hash] = rainbow(Math.random())
                }

                let color = class_cache[hash]

                this.equivalence_class_polygons.push(
                    tilePolygon({x: x, y: y}).setStyle({
                        color: color,
                        opacity: 0
                    }).addTo(this))
            }
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

        console.log("Center: " + JSON.stringify(center))
        console.log("Inner: " + JSON.stringify(inner))
        console.log("Outer: " + JSON.stringify(outer))

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