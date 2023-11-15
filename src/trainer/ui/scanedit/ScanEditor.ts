import {GameMap} from "lib/gamemap/GameMap";
import {ScanStep} from "lib/runescape/clues";
import {TileCoordinates} from "lib/runescape/coordinates/TileCoordinates";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import Behaviour, {SingleBehaviour} from "lib/ui/Behaviour";
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
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import shortcuts from "../../../data/shortcuts";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import {ewent, Observable, observe} from "lib/reactive";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import ScanTreeNode = ScanTree.ScanTreeNode;
import ScanRegion = ScanTree.ScanRegion;
import {Path} from "../../../lib/runescape/pathing";

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

    constructor(private parent: ScanEditor) {
        super();
    }

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
                if (visibility.value()) self.parent.layer.addLayer(l.get())
            })

            visibility.subscribe(v => {
                if (v) self.parent.layer.addLayer(layer.value().get())
                else if (layer.value().hasValue()) self.parent.layer.removeLayer(layer.value().get())
            })

            return {
                options: options,
                layer: layer,
            }
        }

        let normal = setup({
            candidates: this.parent.options.clue.solution.candidates,
            range: assumedRange(this.parent.builder.tree),
            complement: false,
            floor: this.parent.options.map.floor.get()
        }, this.parent.panel.tools.normal)

        let complement = setup({
            candidates: this.parent.options.clue.solution.candidates,
            range: assumedRange(this.parent.builder.tree),
            complement: true,
            floor: this.parent.options.map.floor.get()
        }, this.parent.panel.tools.complement)

        this.equivalence_classes = [normal, complement]

        this.parent.options.map.floor
            .subscribe(f => this.equivalence_classes.forEach(t => t.options.update(o => o.floor = f)))

        this.parent.candidates_at_active_node
            .subscribe(cs => this.equivalence_classes.forEach(t => t.options.update(o => o.candidates = cs)))
    }

    protected end() {
        this.equivalence_classes.forEach(e => {
            if (e.layer.value().hasValue()) e.layer.value().get().remove()
        })

        this.equivalence_classes = []
    }
}

export class ScanTreeBuilder {
    tree: ScanTreeWithClue = null
    augmented: Observable<AugmentedScanTree> = observe(null)
    preview_invalid = ewent()

    constructor() { }

    public async cleanTree() {
        this.augmented.set(await ScanTree.Augmentation.augment({
            augment_paths: true,
            analyze_completeness: true,
            analyze_correctness: true,
            analyze_timing: true
        }, ScanTree.normalize(this.tree)));

        this.preview_invalid.trigger(null)
    }

    set(tree: ScanTreeWithClue) {
        this.tree = tree
        this.cleanTree()
    }

    setRegion(node: ScanTreeNode, region: ScanRegion) {
        node.region = region

        this.cleanTree()
    }

    setPath(node: ScanTreeNode, path: Path.raw) {
        node.path = path

        this.cleanTree()
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
        this.parent.builder.preview_invalid.on(() => this.updatePreview())
    }

    private async updatePreview() {
        let a = this.parent.panel.tree_edit.active_node.value()

        let layer = new OpacityGroup()

        if (a) {
            for (const n of AugmentedScanTree.collect_parents(a, false)) {
                if (n.raw.region) {
                    (await this.parent.panel.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                }

                PathingGraphics.renderPath(n.raw.path).addTo(layer);
            }

        } else {
            if(this.parent.panel.tree_edit.root_widget) {
                AugmentedScanTree.traverse(this.parent.panel.tree_edit.root_widget.node, async (n) => {
                    if (n.raw.region) {
                        (await this.parent.panel.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                    }

                    return PathingGraphics.renderPath(n.raw.path).addTo(layer)
                }, true)
            }
        }

        if (this.path_layer) this.path_layer.remove()

        this.path_layer = layer.addTo(this.layer)
    }

    protected end() { }

}

export default class ScanEditor extends Behaviour {

    public builder: ScanTreeBuilder
    candidates_at_active_node: Observable<TileCoordinates[]>

    layer: ScanEditLayerLight
    interaction_guard: InteractionGuard
    panel: ScanEditPanel

    equivalence_classes: EquivalenceClassHandling
    preview_layer: PreviewLayerControl

    path_editor: SingleBehaviour<PathEditor>


    constructor(public app: Application,
                public readonly options: {
                    clue: ScanStep,
                    map: GameMap, // This is already available via the app, ditch this option?
                    initial?: ScanTreeWithClue
                }) {
        super();

        this.builder = new ScanTreeBuilder()

        this.layer = new ScanEditLayerLight(this)
        this.interaction_guard = new InteractionGuard().setDefaultLayer(this.layer)

        this.equivalence_classes = this.withSub(new EquivalenceClassHandling(this))
        this.preview_layer = this.withSub(new PreviewLayerControl(this))
        this.path_editor = this.withSub(new SingleBehaviour<PathEditor>())
    }

    private setPathEditor(node: AugmentedScanTreeNode): void {
        this.path_editor.set(new PathEditor(this.layer,
            this.app.template_resolver, {
                teleports: this.app.data.teleports.getAll(),
                shortcuts: shortcuts
            }, {
                initial: node.path.raw,

                target: node.path.target,
                start_state: node.path.pre_state,
                discard_handler: () => {},
                commit_handler: (p) => {
                    this.builder.setPath(node.raw, p)
                }
            })
            .onStop(() => {
                if (this.panel.tree_edit.active_node.value() == node) this.panel.tree_edit.setActiveNode(null)
            })
        )
    }


    begin() {
        this.builder.set(this.options.initial ?? {
            clue_id: this.options.clue.id,
            assumes_meerkats: true,
            clue: this.options.clue,
            root: ScanTree.init_leaf(),
            spot_ordering: this.options.clue.solution.candidates,
            type: "scantree"
        })

        this.panel = new ScanEditPanel(this)
        this.app.sidepanels
            .add(new CluePanel(this.options.clue), 0)
            .add(this.panel, 1)

        this.candidates_at_active_node = this.panel.tree_edit.active
            .map(n => n ? n.node.remaining_candidates : this.options.clue.solution.candidates)

        // Initialize and set the main game layer
        this.layer.spots.set(this.options.clue.solution.candidates)
        this.layer.spot_order.set(this.builder.tree.spot_ordering)
        this.layer.active_spots.bindTo(this.candidates_at_active_node)
        this.options.map.addGameLayer(this.layer)

        this.panel.tree_edit.active_node.subscribe(async node => {
            if (node) this.setPathEditor(node)
            else this.path_editor.set(null)
        })
    }

    end() {
        this.app.sidepanels.empty()
        this.layer.remove()
    }
}