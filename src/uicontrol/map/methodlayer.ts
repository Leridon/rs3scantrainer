import {ScanSpot, ScanTree} from "../../model/methods";
import {boxPolygon, tilePolygon} from "../../model/coordinates";
import {ScanSolutionLayer} from "./solutionlayer";
import * as leaflet from "leaflet"
import {CustomControl} from "./map";

class SpotPolygon extends leaflet.FeatureGroup {
    polygon: leaflet.Polygon
    label: leaflet.Tooltip

    constructor(public spot: ScanSpot) {
        super()

        this.polygon = spot.area ? boxPolygon(spot.area) : tilePolygon(spot.spot)

        this.label = leaflet.tooltip({
            interactive: false,
            permanent: true,
            className: "area-name",
            offset: [0, 0],
            direction: "center",
            content: spot.name
        })

        this.polygon
            .setStyle({
                color: "#00FF21",
                fillColor: "#00FF21",
                interactive: false,
            })
            .bindTooltip(this.label)
            .addTo(this)
    }

    setActive(active: boolean) {
        let opacity = active ? 1 : 0.2

        this.polygon.setStyle(
            Object.assign(this.polygon.options, {
                opacity: opacity,
                fillOpacity: opacity * 0.2,
            }))

        this.label.setOpacity(opacity)
    }
}

export class ScanTreeMethodLayer extends ScanSolutionLayer {

    polygons: SpotPolygon[] = []

    public setRelevant(spots: number[],
                       areas: string[],
                       fit: boolean,
    ) {
        let bounds = leaflet.latLngBounds([])

        this.markers.forEach((e, i) => {
            let relevant = spots.includes(i + 1)
            e.setActive(relevant)

            if (relevant) bounds.extend(e.getBounds())
        })

        this.polygons.forEach((p) => {
            let relevant = areas.includes(p.spot.name)

            p.setActive(relevant)

            if (relevant && !p.spot.is_far_away) bounds.extend(p.getBounds())
        })

        if (areas[0] && this.scantree.area(areas[0]).is_far_away) {
            bounds = this.polygons.find((p) => p.spot.name == areas[0]).getBounds()
        }

        if (fit) {
            this._map.fitBounds(bounds.pad(0.1), {
                maxZoom: 4
            })
        }

        this.set_remaining_candidates(spots.map((s) => this.scantree.spot(s)))
        this.drawEquivalenceClasses()

        new CustomControl({
            position: "bottomleft"
        }).addTo(this._map);
        new CustomControl({
            position: "bottomleft"
        }).addTo(this._map);
        new CustomControl().addTo(this._map);
    }

    constructor(private scantree: ScanTree) {
        super(scantree.clue);

        // sort markers to correlate to the spot mapping
        this.markers.sort((a, b) => scantree.spotToNumber(a.getSpot()) - scantree.spotToNumber(b.getSpot()))

        this.polygons = this.scantree.scan_spots.map((s) => new SpotPolygon(s))

        this.polygons.forEach((p) => p.addTo(this))

        // Create labels
        this.markers.forEach((m, i) => {
            m.withLabel((i + 1).toString(), "spot-number", [0, 10])
        })
    }
}