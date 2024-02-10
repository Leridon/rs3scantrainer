import {TileCoordinates} from "../../../../lib/runescape/coordinates/TileCoordinates";
import Behaviour, {SingleBehaviour} from "../../../../lib/ui/Behaviour";
import {lazy, Lazy} from "../../../../lib/properties/Lazy";
import * as leaflet from "leaflet";
import {EquivalenceClass, ScanEquivalenceClasses, ScanEquivalenceClassOptions} from "../../../../lib/cluetheory/scans/EquivalenceClasses";
import {areaToPolygon} from "../../polygon_helpers";
import {type Application} from "../../../application";
import {ScanLayer, ScanRegionPolygon} from "../../neosolving/ScanLayer";
import {PathingGraphics} from "../../path_graphics";
import {PathEditor} from "../../pathedit/PathEditor";
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {OpacityGroup} from "../../../../lib/gamemap/layers/OpacityLayer";
import shortcuts from "../../../../data/shortcuts";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import {ewent, Observable, observe} from "../../../../lib/reactive";
import {InteractionGuard} from "../../../../lib/gamemap/interaction/InteractionLayer";
import ScanTreeNode = ScanTree.ScanTreeNode;
import ScanRegion = ScanTree.ScanRegion;
import {Path} from "../../../../lib/runescape/pathing";
import {GameMapControl} from "../../../../lib/gamemap/GameMapControl";
import ScanTools from "./ScanTools";
import {C} from "../../../../lib/ui/constructors";
import vbox = C.vbox;
import SpotOverview from "./SpotOverview";
import spacer = C.spacer;
import {Clues} from "../../../../lib/runescape/clues";
import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import {AugmentedMethod} from "../../../model/MethodPackManager";
import {SolvingMethods} from "../../../model/methods";
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import Widget from "../../../../lib/ui/Widget";
import TreeEdit from "./TreeEdit";
import MethodSubEditor from "../MethodSubEditor";
import ClueAssumptions = SolvingMethods.ClueAssumptions;
import * as lodash from "lodash";
import MethodEditor from "../MethodEditor";
import {PathStepEntity} from "../../pathing/PathStepEntity";

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
            candidates: this.parent.value.clue.spots,
            range: this.parent.builder.tree.assumed_range,
            complement: false,
            floor: this.parent.app.map.floor.value()
        }, this.parent.tools.normal)

        let complement = setup({
            candidates: this.parent.value.clue.spots,
            range: this.parent.builder.tree.assumed_range,
            complement: true,
            floor: this.parent.app.map.floor.value()
        }, this.parent.tools.complement)

        this.equivalence_classes = [normal, complement]

        this.parent.app.map.floor
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
    tree: ScanTree.ScanTree = null
    augmented: Observable<AugmentedScanTree> = observe(null)
    preview_invalid = ewent()

    assumptions: Observable<ClueAssumptions> = observe<ClueAssumptions>({}).equality(
        (a: ClueAssumptions, b: ClueAssumptions) => {
            return a.meerkats_active == b.meerkats_active
                && a.mobile_perk == b.mobile_perk
                && a.double_escape == b.double_escape
                && a.double_surge == b.double_surge
        })

    constructor(private clue: Clues.Scan) {
        this.assumptions.subscribe((v) => {
            this.cleanTree()
        })
    }

    public async cleanTree() {
        if (!this.tree) return

        this.tree.assumed_range = this.clue.range + (this.assumptions.value().meerkats_active ? 5 : 0)

        this.augmented.set(await ScanTree.Augmentation.augment({
                augment_paths: true,
                analyze_completeness: true,
                analyze_correctness: true,
                analyze_timing: true,
                path_assumptions: this.assumptions.value()
            },
            ScanTree.normalize(this.tree),
            this.clue
        ));

        this.preview_invalid.trigger(null)
    }

    set(tree: ScanTree.ScanTree) {
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
        this.parent.tree_edit.active.subscribe(() => this.updatePreview(), true)
        this.parent.builder.preview_invalid.on(() => this.updatePreview())
    }

    private async updatePreview() {
        let a = this.parent.tree_edit.active_node.value()

        let layer = new OpacityGroup()

        if (a) {
            for (const n of AugmentedScanTree.collect_parents(a, true)) {

                if (n.raw.region) {
                    (await this.parent.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                }

                if (n != a) PathStepEntity.renderPath(n.raw.path).addTo(layer);
            }

        } else {
            if (this.parent.tree_edit.root_widget) {
                AugmentedScanTree.traverse(this.parent.tree_edit.root_widget.node, async (n) => {
                    if (n.raw.region) {
                        (await this.parent.tree_edit.getNode(n)).region_preview = new ScanRegionPolygon(n.raw.region).addTo(layer)
                    }

                    return PathStepEntity.renderPath(n.raw.path).addTo(layer)
                }, true)
            }
        }

        if (this.path_layer) this.path_layer.remove()

        this.path_layer = layer.addTo(this.layer)
    }

    protected end() { }

}

export default class ScanEditor extends MethodSubEditor {

    public builder: ScanTreeBuilder
    candidates_at_active_node: Observable<TileCoordinates[]>

    layer: ScanEditLayerLight
    interaction_guard: InteractionGuard
    tree_edit: TreeEdit
    tools: ScanTools
    overview: SpotOverview

    equivalence_classes: EquivalenceClassHandling
    preview_layer: PreviewLayerControl

    path_editor: SingleBehaviour<PathEditor>

    constructor(
        public parent: MethodEditor,
        public app: Application,
        public value: AugmentedMethod<ScanTreeMethod, Clues.Scan>,
        public side_panel: Widget
    ) {
        super(parent);

        this.builder = new ScanTreeBuilder(value.clue)
        this.builder.assumptions.set(lodash.cloneDeep(value.method.assumptions))

        this.layer = new ScanEditLayerLight(this)
        this.interaction_guard = new InteractionGuard().setDefaultLayer(this.layer)

        this.equivalence_classes = this.withSub(new EquivalenceClassHandling(this))
        this.preview_layer = this.withSub(new PreviewLayerControl(this))
        this.path_editor = this.withSub(new SingleBehaviour<PathEditor>())

        this.assumptions.subscribe((v) => {
            this.value.method.tree.assumed_range = this.value.clue.range + (v.meerkats_active ? 5 : 0)

            this.builder.assumptions.set(lodash.cloneDeep(v))

            this.layer.scan_range.set(this.value.method.tree.assumed_range)
        })

        this.builder.augmented.subscribe(a => {
            this.value.method.expected_time = a.state.timing_analysis.average + 1
        })
    }

    relevantAssumptions(): Set<keyof SolvingMethods.ClueAssumptions> {
        return new Set<keyof SolvingMethods.ClueAssumptions>(["meerkats_active", "double_escape", "double_surge", "mobile_perk"])
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
                if (this.tree_edit.active_node.value() == node) this.tree_edit.setActiveNode(null)
            })
        )
    }

    begin() {
        this.builder.set(this.value.method.tree)

        c("<div style='font-weight: bold; text-align: center'>Scan Tree</div>").appendTo(this.side_panel)

        this.tree_edit = new TreeEdit(this, this.builder.tree.root)
            .css("overflow-y", "auto").appendTo(this.side_panel)

        new GameMapControl({
                position: "top-right",
                type: "floating"
            }, vbox(
                c("<div class='ctr-interaction-control-header'></div>")
                    .append(c().text(`Scan Tools`))
                    .append(spacer()),
                this.tools = new ScanTools(this),
                c("<div style='text-align: center; font-weight: bold'>Spot Overview</div>"),
                this.overview = new SpotOverview(this.builder)
            ).css2({
                "min-width": "300px",
                "max-height": "80vh",
                "padding": "5px"
            })
        ).addTo(this.layer)

        this.candidates_at_active_node = this.tree_edit.active
            .map(n => n ? n.node.remaining_candidates : this.value.clue.spots)

        // Initialize and set the main game layer
        this.layer.spots.set(this.value.clue.spots)
        this.layer.spot_order.set(this.builder.tree.ordered_spots)
        this.layer.active_spots.bindTo(this.candidates_at_active_node)
        this.layer.scan_range.set(this.builder.tree.assumed_range)
        this.app.map.addGameLayer(this.layer)

        this.tree_edit.active_node.subscribe(async node => {
            if (node) this.setPathEditor(node)
            else this.path_editor.set(null)
        })
    }

    end() {
        this.layer.remove()
        this.tree_edit.remove()
    }
}