import {GameMapControl} from "../map/map";
import {ScanStep, SetSolution} from "../../model/clues";
import {Observable, observe} from "../../util/Observable";
import {MapCoordinate} from "../../model/coordinates";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "../../model/scans/ScanTree";
import resolved_scan_tree = ScanTree.resolved_scan_tree;
import Behaviour from "../../lib/ui/Behaviour";
import {ActiveLayer} from "../map/activeLayer";
import assumedRange = ScanTree.assumedRange;
import {lazy, Lazy} from "../../util/Lazy";
import * as leaflet from "leaflet";
import {EquivalenceClass, ScanEquivalenceClasses, ScanEquivalenceClassOptions} from "../../model/scans/EquivalenceClasses";
import {areaToPolygon} from "../map/polygon_helpers";
import {OpacityGroup} from "../map/layers/OpacityLayer";
import {TileMarker} from "../map/TileMarker";
import {complementSpot} from "../../model/scans/scans";
import {Vector2} from "../../util/math";
import {type Application} from "../../application";

class ScanEditLayerLight extends ActiveLayer {

}

function render_equivalence_classes(ecs: ScanEquivalenceClasses): leaflet.FeatureGroup {
    let layer = leaflet.featureGroup()

    ecs.equivalence_classes.map((c) => {
        let color = Math.abs(c.information_gain - ecs.max_information) < 0.01
            ? "blue"
            : `rgb(${255 * (1 - (c.information_gain / ecs.max_information))}, ${255 * c.information_gain / ecs.max_information}, 0)`

        let polygon = leaflet.featureGroup()

        areaToPolygon(
            ecs.raster,
            (p: EquivalenceClass) => p.id == c.id,
            c.area[0]
        ).setStyle({
            color: "black",
            opacity: 1,
            weight: 3,
            fillOpacity: 0.25,
            fillColor: color
        }).addTo(polygon)

        leaflet.marker(polygon.getBounds().getCenter(), {
            icon: leaflet.divIcon({
                iconSize: [50, 20],
                className: "equivalence-class-information",
                html: `${c.information_gain.toFixed(2)}b`,
            }),
        }).addTo(polygon)

        return polygon
    }).forEach(p => layer.addLayer(p))

    return layer
}

type T = {
    options: Observable<ScanEquivalenceClassOptions>,
    layer: Observable<Lazy<leaflet.FeatureGroup>>
}

class EquivalenceClassHandling extends Behaviour<ScanEditor> {
    equivalence_classes: T[] = []

    protected begin() {
        let self = this

        function setup(o: ScanEquivalenceClassOptions,
                       visibility: Observable<boolean>
        ): T {
            let options = observe(o)
            let layer = options.map(o => lazy(() => render_equivalence_classes(new ScanEquivalenceClasses(o))))

            layer.subscribe((l, old) => {
                if (old.hasValue()) self.parent.layer.removeLayer(old.get())
                if (visibility.get()) self.parent.layer.addLayer(l.get())
            })

            visibility.subscribe(v => {
                if (v) self.parent.layer.addLayer(layer.get().get())
                else if (layer.get().hasValue()) self.parent.layer.removeLayer(layer.get().get())
            })

            return {
                options: options,
                layer: layer,
            }
        }

        let normal = setup({
            candidates: this.parent.options.clue.solution.candidates,
            range: assumedRange(this.parent.value),
            complement: false,
            floor: this.parent.options.map.floor.get()
        }, this.parent.panel.tools.normal)

        let complement = setup({
            candidates: this.parent.options.clue.solution.candidates,
            range: assumedRange(this.parent.value),
            complement: true,
            floor: this.parent.options.map.floor.get()
        }, this.parent.panel.tools.complement)

        this.equivalence_classes = [normal, complement]

        this.parent.options.map.floor
            .subscribe(f => this.equivalence_classes.forEach(t => t.options.update(o => o.floor = f)))

        this.parent.candidates
            .subscribe(cs => this.equivalence_classes.forEach(t => t.options.update(o => o.candidates = cs)))
    }

    protected end() {
        this.equivalence_classes.forEach(e => {
            if (e.layer.get().hasValue()) e.layer.get().get().remove()
        })

        this.equivalence_classes = []
    }
}

class PreviewLayerControl extends Behaviour<ScanEditor> {
    private layer: OpacityGroup

    private markers: {
        spots: TileMarker[],
        complement: TileMarker[]
    }

    protected begin() {
        this.layer = new OpacityGroup().addTo(this.parent.layer)

        this.markers = {
            spots: [],
            complement: [],
        }

        this.markers.spots = this.parent.options.clue.solution.candidates.map((e) => {
            let m = new TileMarker(e).withMarker().withX("#B21319").addTo(this.layer)

            // m.on("click", (e) => this.events.emit("dig_spot_clicked", m))

            return m
        })

        this.markers.complement = this.parent.options.clue.solution.candidates.map((e) => {
            return new TileMarker(complementSpot(e)).withMarker().withX("#B21319").addTo(this.layer)
        })

        this.parent.candidates.subscribe(spots => {
            this.markers.spots.forEach((m) => m.setActive(spots.some((c) => Vector2.eq(c, m.getSpot()))))
            this.markers.complement.forEach((m) => m.setActive(spots.some((c) => Vector2.eq(complementSpot(c), m.getSpot()))))
        })
    }

    protected end() {
    }

}

export default class ScanEditor extends Behaviour {
    public value: resolved_scan_tree

    layer: ScanEditLayerLight
    panel: ScanEditPanel

    candidates: Observable<MapCoordinate[]>

    equivalence_classes: EquivalenceClassHandling
    preview_layer: PreviewLayerControl

    constructor(private app: Application,
                public readonly options: {
                    clue: ScanStep,
                    map: GameMapControl,
                    initial?: resolved_scan_tree
                }) {
        super();

        this.equivalence_classes = this.withSub(new EquivalenceClassHandling())
        this.preview_layer = this.withSub(new PreviewLayerControl())
    }

    begin() {
        this.value = this.options.initial ?? {
            assumes_meerkats: true,
            clue: this.options.clue,
            root: ScanTree.init_leaf(),
            spot_ordering: this.options.clue.solution.candidates,
            type: "scantree"
        }

        this.layer = new ScanEditLayerLight()
        this.panel = new ScanEditPanel(this)

        // Take control of main map interactions
        this.options.map.setActiveLayer(this.layer)

        this.app.sidepanels.methods_panel.showSection("scanedit")

        this.candidates = this.panel.tree_edit.active
            .map(n => n ? n.node.remaining_candidates : this.options.clue.solution.candidates)

        // Handle change in remaining candidates
        this.candidates.subscribe((candidates) => {

        })
    }

    end() {
        this.layer.remove()
        this.panel.remove()
    }
}