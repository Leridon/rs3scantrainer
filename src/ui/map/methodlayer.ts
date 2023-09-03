import {ScanLayer, SpotPolygon} from "./layers/ScanLayer";
import {Application, scantrainer} from "../../application";
import {GameMapControl} from "./map";
import {ScanTree} from "../../model/scans/ScanTree";
import {modal} from "../widgets/modal";
import {util} from "../../util/util";
import * as leaflet from "leaflet"
import resolved_scan_tree = ScanTree.resolved_scan_tree;
import augmented_decision_tree = ScanTree.augmented_decision_tree;
import ScanExplanationModal = ScanTree.ScanExplanationModal;
import augment = ScanTree.augment;
import ScanDecision = ScanTree.ScanDecision;
import template_resolvers = ScanTree.template_resolvers;
import spotNumber = ScanTree.spotNumber;
import {Pulse} from "../../model/scans/scans";
import LightButton from "../widgets/LightButton";
import {TextRendering} from "../TextRendering";
import render_digspot = TextRendering.render_digspot;
import natural_join = util.natural_join;
import shorten_integer_list = util.shorten_integer_list;
import {createStepGraphics, PathingGraphics} from "./path_graphics";
import {Path} from "../../model/pathing";
import Order = util.Order;
import {MapRectangle} from "../../model/coordinates";
import {Vector2} from "../../util/math";

export default class ScanTreeMethodLayer extends ScanLayer {
    private readonly root: Promise<augmented_decision_tree>
    private node: augmented_decision_tree
    private areas: SpotPolygon[] = []
    private path_graphics: leaflet.FeatureGroup

    private fit() {
        let bounds = leaflet.bounds([])

        //1. If no children: All Candidates
        if (this.node.children.length == 0)
            this.node.remaining_candidates.map(Vector2.toPoint).forEach((c) => bounds.extend(c))

        //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
        this.node.children.filter(c => c.value.is_leaf)
            .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

        //4. "Where"
        if (this.node.scan_spot) {
            bounds.extend(Vector2.toPoint(this.node.scan_spot.area.topleft))
            bounds.extend(Vector2.toPoint(this.node.scan_spot.area.botright))
        }

        // 5. parent.where if not far away
        if (this.node.parent && this.node.parent.node.scan_spot) {
            let o = leaflet.bounds([])

            o.extend(Vector2.toPoint(this.node.parent.node.scan_spot.area.topleft))
            o.extend(Vector2.toPoint(this.node.parent.node.scan_spot.area.botright))

            if (o.getCenter().distanceTo(bounds.getCenter()) < 60) {
                bounds.extend(o)
            }
        }

        // 6. The path
        // TODO: Include path bounds, without augmenting it!

        this.getMap().map.fitBounds(util.convert_bounds(bounds).pad(0.1), {
            maxZoom: 4,
            animate: true,
        })
    }

    getTree(): resolved_scan_tree {
        return this.scantree;
    }

    public setNode(node: augmented_decision_tree) {
        this.node = node
        this.fit()

        let candidates = this.node.remaining_candidates
        let relevant_areas = this.node.scan_spot ? [this.node.scan_spot] : []
        if (this.node.parent && this.node.parent.node.scan_spot) relevant_areas.push(this.node.parent.node.scan_spot);

        if (node.scan_spot) {
            this.getMap().setFloor(node.scan_spot.area.level)

            let c = MapRectangle.center(node.scan_spot.area)

            this.setMarker(c, false, false)
        } else {
            this.getMap().setFloor(Math.min(...node.remaining_candidates.map((c) => c.level)))

            this.removeMarker()
        }

        this.highlightCandidates(candidates)

        this.areas.forEach((p) => p.setActive(relevant_areas.some((a) => a.name == (p.spot().name))))

        let opaque_paths: Path.raw[] = []
        if (node.path) opaque_paths.push(node.path)

        node.children.forEach(c => {
            if (c.key == null && c.value.is_leaf && c.value.path) opaque_paths.push(c.value.path)
        })

        // 1. Path here
        // 2. Path to all leaf children

        // Render pathing with appropriate opacity
        this.path_graphics.clearLayers()

        if (node.path) PathingGraphics.renderPath(node.path).setOpacity(1).addTo(this.path_graphics)

        augmented_decision_tree.traverse_parents(node, n => {
            if (n.path) {
                PathingGraphics.renderPath(n.path).setOpacity(0.2).addTo(this.path_graphics)
            }
        })

        node.children.filter(c => c.value.is_leaf).forEach(c => {
            PathingGraphics.renderPath(c.value.path).setOpacity(c.key == null ? 1 : 0.5).addTo(this.path_graphics)
        })

        node.children.filter(c => c.key && c.key.pulse == 3).forEach(c => {
            c.value.children.forEach(gc => {
                PathingGraphics.renderPath(gc.value.path).setOpacity(0.3).addTo(this.path_graphics)
            })
        })


        this.update()
    }

    constructor(private scantree: resolved_scan_tree, app: Application) {
        super(scantree.clue, app, {
            show_edit_button: true
        });

        this.root = augment(scantree)

        this.setSpotOrder(scantree.spot_ordering)

        this.areas = scantree.areas.map((s) => new SpotPolygon(s).addTo(this))

        this.path_graphics = leaflet.featureGroup().addTo(this)

        this.setMeerkats(scantree.assumes_meerkats)
    }

    public async activate(map: GameMapControl) {
        super.activate(map);

        this.app.sidepanels.methods_panel.setModal(modal("modal-scantree-method-explanation", ScanExplanationModal))

        this.app.sidepanels.methods_panel.showSection("scantree")

        this.setNode(await this.root)
    }

    private update() {
        {
            let list = $("#pathview").empty()

            let buildPathNavigation = (node: augmented_decision_tree) => {
                let text: string

                if (!node.parent) {
                    text = "Start"
                } else if (node.is_leaf) {
                    text = `Spot ${spotNumber(node.raw_root, node.remaining_candidates[0])}`
                } else {
                    text = ScanDecision.toString(node.decisions[node.decisions.length - 1])
                }

                $("<a>").attr("href", "javascript:;")
                    .on("click", () => this.setNode(node))
                    .text(text)
                    .appendTo($("<li>").addClass("breadcrumb-item").prependTo(list))

                if (node.parent) buildPathNavigation(node.parent.node)
            }

            buildPathNavigation(this.node)

            let last = list.children().last()

            last.text(last.children().first().text()).addClass("active")
        }

        let text: string = "INVALID DATA"

        if (this.node.directions) {
            text = scantrainer.template_resolver
                .with(template_resolvers(this.node))
                .resolve(this.node.directions)
        } else {
            if (this.node.remaining_candidates.length > 1) {
                if (this.node.parent && this.node.parent.kind.pulse == 3) {
                    text = `Which spot of ${natural_join(shorten_integer_list(this.node.remaining_candidates.map(c => spotNumber(this.node.raw_root, c)), render_digspot))}?`
                } else {
                    text = `No more instructions. Check remaining spots:`
                }
            }
        }

        $("#nextscanstep").html(text)

        this.generateChildren(this.node, 0, $("#scantreeview").empty())

        return
    }

    generateList(node: augmented_decision_tree, depth: number, container: JQuery) {
        let resolver = scantrainer.template_resolver.with(template_resolvers(node))

        let line = $("<div>")
            .addClass("scantreeline")
            .css("padding-left", `${depth * 18}px`)
            .css("margin-top", "3px")
            .css("margin-bottom", "3px")
            .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

        let link_html = node.parent.kind
            ? Pulse.meta(node.parent.kind).pretty // TODO: Make this depend on the siblings to avoid redundant "different level"
            : resolver.resolve(`Spot {{digspot ${spotNumber(node.raw_root, node.remaining_candidates[0])}}}`)             // Nodes without a parent kind always have exactly one remaining candidate as they are synthetic

        if (depth == 0) {
            new LightButton().on("click", () => this.setNode(node))
                .setHTML(link_html)
                .appendTo(line)
        } else if (depth > 0) {
            $("<span>- <span class='lightlink'></span>: </span>").appendTo(line)
                .children("span")
                .html(link_html)
                .on("click", () => this.setNode(node))
        }

        if (node.directions != null) {
            $("<span>")
                .html(scantrainer.template_resolver
                    .with(template_resolvers(node))
                    .resolve(node.directions))
                .appendTo(line)
        } else if (node.children.some(c => c.key == null)) {
            // This node only has synthetic children left

            if (node?.parent?.kind && node.parent.kind.pulse == 3) {
                // Directly link to triple spots

                line.append($("<span>").text("at"))

                node.children.map(c => c.value)
                    .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.raw_root, c.remaining_candidates[0])))
                    .forEach((child) => {
                        new LightButton()
                            .setHTML(render_digspot(spotNumber(node.raw_root, child.remaining_candidates[0])))
                            .on("click", () => this.setNode(child))
                            .appendTo(line)
                    })
            } else {
                $("<span>No more instructions</span>").appendTo(line)
            }
        }

        line.appendTo(container)

        this.generateChildren(node, depth + 1, container)
    }

    generateChildren(node: augmented_decision_tree, depth: number, container: JQuery) {
        if (depth >= 2) return

        let children = []

        if (depth == 0) children = children.concat(node.children.filter(c => c.key == null).sort(Order.comap(Order.natural_order, (a) => spotNumber(node.raw_root, a.value.remaining_candidates[0]))))

        children = children.concat(node.children.filter(c => c.key != null).sort(Order.comap(Pulse.compare, (a) => a.key)))

        children.forEach((e) => this.generateList(e.value, depth, container))
    }

    deactivate() {
        super.deactivate();

        this.app.sidepanels.methods_panel.hide()
    }
}