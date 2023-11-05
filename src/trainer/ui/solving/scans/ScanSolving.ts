import {util} from "../../../../lib/util/util";
import {modal, Modal} from "../../widgets/modal";
import {ScanLayer, ScanRegionPolygon} from "./ScanLayer";
import {Observable, observe} from "../../../../lib/properties/Observable";
import * as leaflet from "leaflet";
import {Vector2} from "../../../../lib/math";
import {floor_t} from "../../../../lib/runescape/coordinates";
import {PathingGraphics} from "../../path_graphics";
import Widget from "../../../../lib/ui/Widget";
import TemplateResolver from "../../../../lib/util/TemplateResolver";
import LightButton from "../../widgets/LightButton";
import {Scans} from "../../../../lib/runescape/clues/scans";
import Behaviour from "../../../../lib/ui/Behaviour";
import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import SolveBehaviour from "../SolveBehaviour";
import {SolvingMethods} from "../../../model/methods";
import ScanTreeWithClue = SolvingMethods.ScanTreeWithClue;
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import {TextRendering} from "../../TextRendering";
import render_digspot = TextRendering.render_digspot;
import spotNumber = ScanTree.spotNumber;
import shorten_integer_list = util.shorten_integer_list;
import MethodPanel from "../MethodPanel";
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import Pulse = Scans.Pulse;
import Order = util.Order;
import natural_join = util.natural_join;
import {OpacityGroup} from "../../../../lib/gamemap/layers/OpacityLayer";
import assumedRange = ScanTree.assumedRange;
import {ScanStep} from "../../../../lib/runescape/clues";
import ScanEditor from "../../scanedit/ScanEditor";
import {TileRectangle} from "../../../../lib/runescape/coordinates/TileRectangle";


export function scan_tree_template_resolvers(node: AugmentedScanTreeNode): Record<string, (args: string[]) => string> {
    return {
        "target": () => {
            if (node.remaining_candidates.length == 1) {
                // TODO: There's a bug hidden here where is always resolves the same digspot number for all triples
                return render_digspot(spotNumber(node.root.raw, node.remaining_candidates[0]))
            } else if (node.region) {
                return `{{scanarea ${node.region.name}}}`
            } else {
                return "{ERROR: No target}"
            }
        },
        "candidates":
            () => {
                return util.natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.root.raw, c)), render_digspot))
            }
    }
}


class ScanExplanationModal extends Modal {
    protected hidden() {
        ($("#pingexplanationvideo").get(0) as HTMLVideoElement).pause();
    }
}

class ScanTreeSolvingLayer extends ScanLayer {
    node: Observable<AugmentedScanTreeNode> = observe(null)

    path_graphics: OpacityGroup

    /**
     * Zooms the map to the relevant area for the active node
     * @private
     */
    private fit(node: AugmentedScanTreeNode) {
        // TODO: This is a copy of the old implementation

        let bounds = leaflet.bounds([])

        //1. If no children: All Candidates
        if (node.children.length == 0)
            node.remaining_candidates.map(Vector2.toPoint).forEach((c) => bounds.extend(c))

        //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
        /* //TODO: Rethink this, disabled to get the build working again
        this.node.get().children.filter(c => c.value.is_leaf)
            .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

         */

        //4. "Where"
        if (node.region) {
            bounds.extend(Vector2.toPoint(node.region.area.topleft))
            bounds.extend(Vector2.toPoint(node.region.area.botright))
        }

        // 5. parent.where if not far away
        if (node.parent && node.parent.node.region) {
            let o = leaflet.bounds([])

            o.extend(Vector2.toPoint(node.parent.node.region.area.topleft))
            o.extend(Vector2.toPoint(node.parent.node.region.area.botright))

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

    private render(node: AugmentedScanTreeNode) {

        // TODO: This is a copy of the old implementation, adjust!

        let candidates = node.remaining_candidates
        let relevant_areas = node.region ? [node.region] : []
        if (node.parent && node.parent.node.region) relevant_areas.push(node.parent.node.region);

        // Set marker and map floor
        if (node.region) {
            this.getMap().floor.set(node.region.area.level)

            let c = TileRectangle.center(node.region.area)

            this.marker_spot.set({coordinates: c, with_marker: false, click_to_remove: false})
        } else {
            this.getMap().floor.set(Math.min(...node.remaining_candidates.map((c) => c.level)) as floor_t)

            this.marker_spot.set(null)
        }

        this.active_spots.set(candidates)

        // 1. Path here
        // 2. Path to all leaf children

        // Render pathing with appropriate opacity
        this.path_graphics.clearLayers()

        PathingGraphics.renderPath(node.raw.path).setOpacity(1).addTo(this.path_graphics)
        if (node.raw.region) new ScanRegionPolygon(node.raw.region).setOpacity(1).addTo(this.path_graphics)

        AugmentedScanTree.collect_parents(node, false).forEach(n => {
            new ScanRegionPolygon(n.raw.region).setOpacity(0.2).addTo(this.path_graphics)
            PathingGraphics.renderPath(n.raw.path).setOpacity(0.2).addTo(this.path_graphics)
        })

        // Children paths to dig spots are rendered with 0.5
        node.children.filter(c => c.value.remaining_candidates.length == 1).forEach(c => {
            PathingGraphics.renderPath(c.value.raw.path).setOpacity(0.5).addTo(this.path_graphics)
        })

        /*
        node.children.filter(c => c.key && c.key.pulse == 3).forEach(c => {
            c.value.children.forEach(gc => {
                PathingGraphics.renderPath(gc.value.path).setOpacity(0.3).addTo(this.path_graphics)
            })
        })*/
    }

    constructor(options: {
        show_edit_button?: boolean
    } = {}) {
        super(options);

        this.path_graphics = new OpacityGroup().addTo(this)


        this.node.subscribe((node, old_node) => {
            if (old_node == null) {
                this.spots.set(node.root.raw.clue.solution.candidates)
                this.spot_order.set(node.root.raw.spot_ordering)
                this.scan_range.set(assumedRange(node.root.raw))
            }

            if (node) {
                this.render(node)
                this.fit(node)
            }
            // TODO: Render paths
        })
    }

}

class ScanTreeMethodPanel extends MethodPanel {
    node: Observable<AugmentedScanTreeNode> = observe(null)

    private ui_nav: Widget
    private ui_next_step: Widget
    private ui_tree: Widget

    constructor(private template_resolver: TemplateResolver, options: {
        edit_handler?: () => any
    } = {}) {
        super({
            explanation_modal: modal("modal-scantree-method-explanation", ScanExplanationModal),
            edit_handler: () => options.edit_handler()
        });

        this.ui_nav = c(`<nav style='display: inline-block;'></nav>`)
            .css("--bs-breadcrumb-divider", "'>'")
            .appendTo(this)
        c("<div class='nextstep'>Next: </div>").append(this.ui_next_step = c("<span>")).appendTo(this)
        this.ui_tree = c("<div style='padding-left: 15px;'></div>").appendTo(this)

        this.title.set("Scan Tree")

        this.node.subscribe(() => this.render())
    }

    private render() {
        let node = this.node.get()

        {
            this.ui_nav.empty()
            let list = c("<ol class='breadcrumb' style='margin-bottom: unset'></ol>").appendTo(this.ui_nav)

            AugmentedScanTree.collect_parents(node)
                .map(n =>
                    c("<span class='nisl-textlink'>")
                        .tapRaw(e => e.on("click", () => this.node.set(n)))
                        .text(AugmentedScanTree.decision_string(n))
                ).forEach(w => w.appendTo(c("<li>").addClass("breadcrumb-item").appendTo(list)))

            let last = list.container.children().last()

            last.text(last.children().first().text()).addClass("active")
        }

        let text: string = "INVALID DATA"

        if (node.raw.directions) {
            text = this.template_resolver
                .with(scan_tree_template_resolvers(node))
                .resolve(node.raw.directions)
        } else {
            if (node.remaining_candidates.length > 1) {
                if (node.parent && node.parent.key.pulse == 3) {
                    text = `Which spot of ${natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.root.raw, c)), render_digspot))}?`
                } else {
                    text = `No more instructions. Check remaining spots:`
                }
            }
        }

        this.ui_next_step.container.html(text)

        this.renderChildren(node, 0, this.ui_tree.empty())
    }

    private renderList(node: AugmentedScanTreeNode, depth: number, container: Widget): void {
        let resolver = this.template_resolver.with(scan_tree_template_resolvers(node))

        let line = c("<div>")
            .addClass("scantreeline")
            .css("padding-left", `${depth * 18}px`)
            .css("margin-top", "3px")
            .css("margin-bottom", "3px")
            .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

        let link_html = node.parent.key
            ? Pulse.pretty_with_context(node.parent.key, node.parent.node.children.map(c => c.key))
            : resolver.resolve(`Spot {{digspot ${spotNumber(node.root.raw, node.remaining_candidates[0])}}}`)             // Nodes without a parent kind always have exactly one remaining candidate as they are synthetic

        if (depth == 0) {
            new LightButton().on("click", () => this.node.set(node))
                .setHTML(link_html)
                .appendTo(line)
        } else if (depth > 0) {
            c("<span>- <span class='lightlink'></span>: </span>").appendTo(line)
                .container
                .children("span")
                .html(link_html)
                .on("click", () => this.node.set(node))
        }

        if (node.raw.directions != null) {
            c("<span>")
                .setInnerHtml(resolver.resolve(node.raw.directions))
                .appendTo(line)
        } else if (node.children.some(c => c.key == null)) {
            // This node only has synthetic children left

            if (node?.parent?.key && node.parent.key.pulse == 3) {
                // Directly link to triple spots

                line.append(c("<span>").text("at"))

                node.children.map(c => c.value)
                    .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.root.raw, c.remaining_candidates[0])))
                    .forEach((child) => {
                        new LightButton()
                            .setHTML(render_digspot(spotNumber(node.root.raw, child.remaining_candidates[0])))
                            .on("click", () => this.node.set(child))
                            .appendTo(line)
                    })
            } else {
                c("<span>No more instructions</span>").appendTo(line)
            }
        }

        line.appendTo(container)

        this.renderChildren(node, depth + 1, container)
    }

    private renderChildren(node: AugmentedScanTreeNode, depth: number, container: Widget): void {
        if (depth >= 2) return

        node.children
            .filter((e) => e.key.pulse != 3)
            .sort(Order.comap(Scans.Pulse.compare, (a) => a.key))
            .forEach((e) => this.renderList(e.value, depth, container))

        let triples = node.children.filter(e => e.key.pulse == 3)

        if (triples.length > 0) {

            let line = c("<div>")
                .appendTo(container)
                .addClass("scantreeline")
                .css("padding-left", `${(depth) * 18}px`)
                .css("margin-top", "3px")
                .css("margin-bottom", "3px")
                .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

            c("<span>- Triple at </span>").appendTo(line)

            triples
                .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.root.raw, c.value.remaining_candidates[0])))
                .forEach((child) => {
                    new LightButton()
                        .setHTML(render_digspot(spotNumber(node.root.raw, child.value.remaining_candidates[0])))
                        .on("click", () => this.node.set(child.value))
                        .appendTo(line)
                })
        }
    }
}

export class SolveScanTreeSubBehaviour extends Behaviour {
    node: Observable<AugmentedScanTreeNode> = observe(null)

    panel: ScanTreeMethodPanel = null
    layer: ScanTreeSolvingLayer = null

    constructor(private parent: SolveBehaviour, private method: ScanTreeWithClue) {
        super();
    }

    protected begin() {
        this.parent.parent.sidepanels.add(this.panel = new ScanTreeMethodPanel(this.parent.parent.template_resolver, {
            edit_handler: this.parent.parent.in_alt1 ? undefined : () => {
                this.parent.parent.behaviour.set(new ScanEditor(this.parent.parent, {
                    clue: this.method.clue,
                    map: this.parent.parent.map.map,
                    initial: this.method
                }))
            }
        }), 2)
        this.layer = new ScanTreeSolvingLayer({show_edit_button: !this.parent.parent.in_alt1}).addTo(this.parent.parent.map.map)

        this.node.bind(this.panel.node).bind(this.layer.node)

        this.node.set(ScanTree.Augmentation.basic_augmentation(this.method).root_node)
    }

    protected end() {
        this.panel.remove()

        this.layer.remove()
    }
}