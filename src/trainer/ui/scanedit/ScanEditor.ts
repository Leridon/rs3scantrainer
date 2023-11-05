import {GameMap} from "../../../lib/gamemap/GameMap";
import {ScanStep} from "lib/runescape/clues";
import {Observable, observe} from "lib/properties/Observable";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import Behaviour from "../../../lib/ui/Behaviour";
import assumedRange = ScanTree.assumedRange;
import {lazy, Lazy} from "lib/properties/Lazy";
import * as leaflet from "leaflet";
import {EquivalenceClass, ScanEquivalenceClasses, ScanEquivalenceClassOptions} from "lib/cluetheory/scans/EquivalenceClasses";
import {areaToPolygon} from "../polygon_helpers";
import {type Application} from "trainer/application";
import {ScanLayer, ScanRegionPolygon} from "../solving/scans/ScanLayer";
import {PathingGraphics} from "../path_graphics";
import {PathEditor} from "../pathedit/PathEditor";
import {SolvingMethods} from "../../model/methods";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {CluePanel} from "../SidePanelControl";
import {OpacityGroup} from "../../../lib/gamemap/layers/OpacityLayer";

class ScanEditLayerLight extends ScanLayer {

    constructor(private editor: ScanEditor) {
        super();
    }
}

type T = {
    options: Observable<ScanEquivalenceClassOptions>,
    layer: Observable<Lazy<leaflet.FeatureGroup>>
}

class EquivalenceClassHandling extends Behaviour {
    equivalence_classes: T[] = []

    constructor(private parent: ScanEditor) {super();}

    private render_equivalence_classes(ecs: ScanEquivalenceClasses): leaflet.FeatureGroup {
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

    protected begin() {
        let self = this

        function setup(o: ScanEquivalenceClassOptions,
                       visibility: Observable<boolean>
        ): T {
            let options = observe(o)
            let layer = options.map(o => lazy(() => self.render_equivalence_classes(new ScanEquivalenceClasses(o))))

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

class PreviewLayerControl extends Behaviour {
    private layer: OpacityGroup

    constructor(public parent: ScanEditor) {super();}

    private path_layer: OpacityGroup = null

    protected begin() {
        this.layer = new OpacityGroup().addTo(this.parent.layer)

        // Render path preview
        this.parent.panel.tree_edit.active.subscribe(() => this.updatePreview(), true)
        this.parent.panel.tree_edit.on("preview_invalid", () => this.updatePreview())
    }

    private async updatePreview() {
        let a = this.parent.panel.tree_edit.active_node.get()

        let layer = new OpacityGroup()

        if (a) {
            for (const n of AugmentedScanTree.collect_parents(a, false)) {
                if (n.raw.region) {
                    (await this.parent.panel.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                }

                PathingGraphics.renderPath(n.raw.path).addTo(layer);
            }

            AugmentedScanTree.traverse(a, async (n) => {
                // TODO: Decreasing opacity

                if (n.raw.region) {
                    (await this.parent.panel.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer).setOpacity(0.3)
                }

                return PathingGraphics.renderPath(n.raw.path).addTo(layer).setOpacity(0.3)
            }, false)
        } else {
            AugmentedScanTree.traverse((await this.parent.panel.tree_edit.root_widget).node, async (n) => {
                if (n.raw.region) {
                    (await this.parent.panel.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                }

                return PathingGraphics.renderPath(n.raw.path).addTo(layer)
            }, true)
        }

        if (this.path_layer) this.path_layer.remove()

        this.path_layer = layer.addTo(this.layer)
    }

    protected end() { }

}

export default class ScanEditor extends Behaviour {
    public value: ScanTreeWithClue

    layer: ScanEditLayerLight
    panel: ScanEditPanel

    equivalence_classes: EquivalenceClassHandling
    preview_layer: PreviewLayerControl
    path_editor: PathEditor

    candidates: Observable<TileCoordinates[]>

    constructor(public app: Application,
                public readonly options: {
                    clue: ScanStep,
                    map: GameMap, // This is already available via the app, ditch this option?
                    initial?: ScanTreeWithClue
                }) {
        super();

        this.layer = new ScanEditLayerLight(this)

        this.equivalence_classes = this.withSub(new EquivalenceClassHandling(this))
        this.preview_layer = this.withSub(new PreviewLayerControl(this))
        this.path_editor = this.withSub(new PathEditor(this.layer, this.app.template_resolver))
    }

    begin() {
        this.value = this.options.initial ?? {
            clue_id: this.options.clue.id,
            assumes_meerkats: true,
            clue: this.options.clue,
            root: ScanTree.init_leaf(),
            spot_ordering: this.options.clue.solution.candidates,
            type: "scantree"
        }

        this.panel = new ScanEditPanel(this)
        this.app.sidepanels
            .add(new CluePanel(this.value.clue), 0)
            .add(this.panel, 1)

        this.candidates = this.panel.tree_edit.active
            .map(n => n ? n.node.remaining_candidates : this.options.clue.solution.candidates)

        // Initialize and set the main game layer
        this.layer.spots.set(this.value.clue.solution.candidates)
        this.layer.spot_order.set(this.value.spot_ordering)
        this.layer.active_spots.bind_to(this.candidates)
        this.options.map.addGameLayer(this.layer)

        this.panel.tree_edit.active_node.subscribe(async node => {
            if (node) {

                this.path_editor.load(node.path.raw, {
                    target: node.path.target,
                    start_state: node.path.pre_state,
                    discard_handler: () => {
                        this.panel.tree_edit.setActiveNode(null)
                    },
                    commit_handler: (p) => {
                        node.raw.path = p

                        this.panel.tree_edit.cleanTree()
                    }
                })
            } else {
                this.path_editor.reset()
            }
        })

        this.panel.tree_edit.on("region_changed", async (node) => {
            if (node.raw == this.panel.tree_edit.active_node.get()?.raw) {
                await this.path_editor.load(node.path.raw, {
                    target: node.path.target,
                    start_state: node.path.pre_state,
                    discard_handler: () => {
                        this.panel.tree_edit.setActiveNode(null)
                    },
                    commit_handler: (p) => {
                        node.raw.path = p

                        this.panel.tree_edit.cleanTree()
                    }
                })
            }
        })
    }

    end() {
        this.app.sidepanels.empty()
        this.layer.remove()
    }
}