import {ScanTree} from "../../model/methods";
import {boxPolygon, tilePolygon} from "../../model/coordinates";
import {ScanSolutionLayer} from "./solutionlayer";

export class ScanTreeMethodLayer extends ScanSolutionLayer {

    public spotsLeft(candidates: number[]) {
        this.markers.forEach((e, i) => {
            e.setActive(candidates.findIndex((j) => j == (i + 1)) >= 0)
        })
    }

    constructor(private scantree: ScanTree) {
        super(scantree.clue);

        // sort markers to correlate to the spot mapping
        this.markers.sort((a, b) => scantree.spotToNumber(a.getSpot()) - scantree.spotToNumber(b.getSpot()))

        // Create labels
        this.markers.forEach((m, i) => {
            m.withLabel((i + 1).toString(), "spot-number", [0, 10])
        })

        for (let spot of scantree.scan_spots) {
            /*
            let self = this

            let clear = function (bounds: leaflet.Bounds): boolean {
                for (let spot of self.scantree.scan_spots) if (bounds.overlaps(toBounds(spot.area))) return false
                for (let spot of self.scantree.dig_spot_mapping) if (bounds.contains(leaflet.point(spot))) return false

                return true
            }

            let bounds = toBounds(spot.area)
            let size = bounds.getSize().x * bounds.getSize().y

            let offset: Vector2

            // TODO: Figure out a good spot for labels
            // TODO: Actually implement something smart

            if (size >= 3) offset = {x: 0, y: 0}
            else offset = {x: 0, y: 0}*/

            let polygon = spot.area ? boxPolygon(spot.area) : tilePolygon(spot.spot)

            polygon
                .setStyle({
                    color: "#00FF21",
                    fillColor: "#00FF21",
                    interactive: false
                })
                .bindTooltip(spot.name, {
                    interactive: false,
                    permanent: true,
                    className: "area-name",
                    offset: [0, 0],
                    direction: "center"
                })
                .addTo(this)


            /*
            leaflet.marker([spot.coords.y + 2, spot.coords.x], {
                icon: leaflet.divIcon({
                    className: "area-name",
                    html: spot.name
                }),
                interactive: false,
            }).addTo(layer)*/

        }
    }
}