import {ScanLayer, ScanRegionPolygon} from "./layers/ScanLayer";
import {Application} from "trainer/application";
import {GameMap} from "./map";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {Modal, modal} from "../widgets/modal";
import {util} from "../../../lib/util/util";
import * as leaflet from "leaflet"
import spotNumber = ScanTree.spotNumber;
import LightButton from "../widgets/LightButton";
import {TextRendering} from "../TextRendering";
import render_digspot = TextRendering.render_digspot;
import natural_join = util.natural_join;
import shorten_integer_list = util.shorten_integer_list;
import {PathingGraphics} from "./path_graphics";
import Order = util.Order;
import {floor_t, MapRectangle} from "lib/runescape/coordinates";
import {Vector2} from "lib/math/Vector";
import {Scans} from "lib/runescape/clues/scans";
import Pulse = Scans.Pulse;
import {SolvingMethods} from "../../model/methods";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import AugmentedDecisionTree = ScanTree.Augmentation.AugmentedDecisionTree;

export function scan_tree_template_resolvers(node: AugmentedDecisionTree): Record<string, (args: string[]) => string> {
    return {
        "target": () => {
            if (node.remaining_candidates.length == 1) {
                // TODO: There's a bug hidden here where is always resolves the same digspot number for all triples
                return render_digspot(spotNumber(node.raw_root, node.remaining_candidates[0]))
            } else if (node.region) {
                return `{{scanarea ${node.region.name}}}`
            } else {
                return "{ERROR: No target}"
            }
        },
        "candidates":
            () => {
                return util.natural_join(
                    shorten_integer_list(node.remaining_candidates
                            .map(c => spotNumber(node.raw_root, c)),
                        render_digspot
                    ))
            }
    }
}

export class ScanExplanationModal extends Modal {
    protected hidden() {
        ($("#pingexplanationvideo").get(0) as HTMLVideoElement).pause();
    }
}

export default class ScanTreeMethodLayer extends ScanLayer {
    private readonly root: Promise<AugmentedDecisionTree>
    private node: AugmentedDecisionTree
    private areas: ScanRegionPolygon[] = []
    private path_graphics: leaflet.FeatureGroup

    private fit() {
        let bounds = leaflet.bounds([])

        //1. If no children: All Candidates
        if (this.node.children.length == 0)
            this.node.remaining_candidates.map(Vector2.toPoint).forEach((c) => bounds.extend(c))

        //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
        /* //TODO: Rethink this, disabled to get the build working again
        this.node.children.filter(c => c.value.is_leaf)
            .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

         */

        //4. "Where"
        if (this.node.region) {
            bounds.extend(Vector2.toPoint(this.node.region.area.topleft))
            bounds.extend(Vector2.toPoint(this.node.region.area.botright))
        }

        // 5. parent.where if not far away
        if (this.node.parent && this.node.parent.node.region) {
            let o = leaflet.bounds([])

            o.extend(Vector2.toPoint(this.node.parent.node.region.area.topleft))
            o.extend(Vector2.toPoint(this.node.parent.node.region.area.botright))

            if (o.getCenter().distanceTo(bounds.getCenter()) < 60) {
                bounds.extend(o)
            }
        }

        // 6. The path
        // TODO: Include path bounds, without augmenting it!

        this.getMap().fitBounds(util.convert_bounds(bounds).pad(0.1), {
            maxZoom: 4,
            animate: true,
        })
    }

    getTree(): ScanTreeWithClue {
        return this.scantree;
    }

    public setNode(node: AugmentedDecisionTree) {
        this.node = node
        this.fit()

        let candidates = this.node.remaining_candidates
        let relevant_areas = this.node.region ? [this.node.region] : []
        if (this.node.parent && this.node.parent.node.region) relevant_areas.push(this.node.parent.node.region);

        if (node.region) {
            this.getMap().floor.set(node.region.area.level)

            let c = MapRectangle.center(node.region.area)

            this.setMarker(c, false, false)
        } else {
            this.getMap().floor.set(Math.min(...node.remaining_candidates.map((c) => c.level)) as floor_t)

            this.removeMarker()
        }

        this.highlightCandidates(candidates)

        this.areas.forEach((p) => p.setActive(relevant_areas.some((a) => a.name == (p.spot().name))))

        // 1. Path here
        // 2. Path to all leaf children

        // Render pathing with appropriate opacity
        this.path_graphics.clearLayers()

        if (node.path) PathingGraphics.renderPath(node.raw.path).setOpacity(1).addTo(this.path_graphics)

        AugmentedDecisionTree.traverse_parents(node, n => {
            if (n.path) {
                PathingGraphics.renderPath(n.raw.path).setOpacity(0.2).addTo(this.path_graphics)
            }
        })

        // Children paths to dig spots are rendered wit 0.5
        node.children.filter(c => c.value.remaining_candidates.length == 1).forEach(c => {
            PathingGraphics.renderPath(c.value.raw.path).setOpacity(0.5).addTo(this.path_graphics)
        })

        /*
        node.children.filter(c => c.key && c.key.pulse == 3).forEach(c => {
            c.value.children.forEach(gc => {
                PathingGraphics.renderPath(gc.value.path).setOpacity(0.3).addTo(this.path_graphics)
            })
        })*/


        this.update()
    }

    constructor(private scantree: ScanTreeWithClue, app: Application) {
        super(scantree.clue, app, {
            show_edit_button: true
        });

        this.root = ScanTree.Augmentation.augment(scantree)

        this.setSpotOrder(scantree.spot_ordering)

        this.areas = []// TODO: Area polygons! //scantree.areas.map((s) => new SpotPolygon(s).addTo(this))

        this.path_graphics = leaflet.featureGroup().addTo(this)

        this.setMeerkats(scantree.assumes_meerkats)
    }

    public async activate(map: GameMap) {
        super.activate(map);

        this.app.sidepanels.methods_panel.setModal(modal("modal-scantree-method-explanation", ScanExplanationModal))

        this.app.sidepanels.methods_panel.showSection("scantree")

        this.setNode(await this.root)
    }

    deactivate() {
        super.deactivate();

        this.app.sidepanels.methods_panel.hide()
    }
}