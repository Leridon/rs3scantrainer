import {ScanLayer, SpotPolygon} from "./layers/ScanLayer";
import {Application, scantrainer} from "../../application";
import {GameMapControl} from "./map";
import {ScanTree2} from "../../model/scans/ScanTree2";
import {modal} from "../widgets/modal";
import {box_center, eq, toPoint} from "../../model/coordinates";
import {util} from "../../util/util";
import * as leaflet from "leaflet"
import resolved_scan_tree = ScanTree2.resolved_scan_tree;
import augmented_decision_tree = ScanTree2.augmented_decision_tree;
import ScanExplanationModal = ScanTree2.ScanExplanationModal;
import augment = ScanTree2.augment;
import ScanDecision = ScanTree2.ScanDecision;
import template_resolvers = ScanTree2.template_resolvers;
import spotNumber = ScanTree2.spotNumber;
import natural_join = util.natural_join;
import natural_order = util.natural_order;
import {Pulse} from "../../model/scans/scans";
import comap = util.comap;

function synthetic_triple_children(node: augmented_decision_tree): augmented_decision_tree[] {
    return node.remaining_candidates.map((child) => {
        return {
            children: [],
            decisions: node.decisions,
            depth: node.depth + 1,
            parent: {kind: {pulse: 3, different_level: node.parent.kind.different_level}, node: node},
            path: node.root.methods.find((m) => ScanTree2.edgeSame(m, {from: node.parent.node.where.name, to: [child]})),
            raw: undefined,
            remaining_candidates: [child],
            root: node.root,
            where: null
        }
    })
}

export default class ScanTreeMethodLayer extends ScanLayer {
    private readonly root: augmented_decision_tree
    private node: augmented_decision_tree
    private areas: SpotPolygon[] = []

    private fit() {

        /*
            4. parent.where if not far away
         */

        let bounds = leaflet.bounds([])

        //1. If no children: All Candidates
        //2. If Triple: All Candidates
        if (this.node.children.length == 0 || (this.node.parent && this.node.parent.kind.pulse == 3))
            this.node.remaining_candidates.map(toPoint).forEach((c) => bounds.extend(c))


        //3. All triple children
        this.node.children.filter((c) => c.key.pulse == 3).forEach((c) => {
            c.value.remaining_candidates.forEach((c) => bounds.extend(toPoint(c)))
        })

        //4. "Where"
        if (this.node.where) {
            bounds.extend(toPoint(this.node.where.area.topleft))
            bounds.extend(toPoint(this.node.where.area.botright))
        }

        // 5. parent.where if not far away
        if (this.node.parent && this.node.parent.node.where) {
            let o = leaflet.bounds([])

            o.extend(toPoint(this.node.parent.node.where.area.topleft))
            o.extend(toPoint(this.node.parent.node.where.area.botright))

            if (o.getCenter().distanceTo(bounds.getCenter()) < 60) {
                bounds.extend(o)
            }
        }

        leaflet.latLngBounds([
            [bounds.getTopLeft().y, bounds.getTopLeft().x],
            [bounds.getBottomRight().y, bounds.getBottomRight().x],
        ])

        this.getMap().map.fitBounds(leaflet.latLngBounds([
            [bounds.getTopLeft().y, bounds.getTopLeft().x],
            [bounds.getBottomRight().y, bounds.getBottomRight().x],
        ]).pad(0.1), {
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
        let relevant_areas = this.node.where ? [this.node.where] : []
        if (this.node.parent && this.node.parent.node.where) relevant_areas.push(this.node.parent.node.where);

        if (node.where) {
            this.getMap().setFloor(node.where.level)

            let c = box_center(node.where.area)

            this.setMarker({
                x: c.x,
                y: c.y,
                level: node.where.level,
            }, false, false)
        } else {
            this.getMap().setFloor(Math.min(...node.remaining_candidates.map((c) => c.level)))

            this.removeMarker()
        }

        this.highlightCandidates(candidates)

        this.areas.forEach((p) => p.setActive(relevant_areas.some((a) => a.name == (p.spot().name))))

        this.update()
    }

    constructor(private scantree: resolved_scan_tree, app: Application) {
        super(scantree.clue, app, {
            show_edit_button: true
        });

        this.root = augment(scantree)

        this.setSpotOrder(scantree.spot_ordering)

        this.areas = scantree.areas.map((s) => new SpotPolygon(s).addTo(this))

        this.setMeerkats(scantree.assumes_meerkats)
    }

    public activate(map: GameMapControl) {
        super.activate(map);

        this.app.sidepanels.methods_panel.setModal(modal("modal-scantree-method-explanation", ScanExplanationModal))

        this.app.sidepanels.methods_panel.showSection("scantree")

        this.setNode(this.root)
    }

    private update() {

        {
            let list = $("#pathview").empty()

            let buildPathNavigation = (node: augmented_decision_tree) => {
                let text: string

                if (!node.parent) {
                    text = "Start"
                } else if (node.parent.node.parent && node.parent.kind.pulse == 3 && node.parent.node.parent.kind.pulse == 3) {
                    text = `Spot ${spotNumber(node.root, node.remaining_candidates[0])}`
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

        let text: string = ""

        if (!this.node.path) {
            if (this.node.parent && this.node.parent.kind.pulse == 3 && this.node.remaining_candidates.length > 1) {
                // Triple children with more than one candidate do not have an associated path, synthesize one
                text = scantrainer.template_resolver
                    .with(template_resolvers(this.node.root, {
                        from: this.node.parent.node.where.name,
                        to: this.node.remaining_candidates
                    }))
                    .resolve("Which spot of {{target}}?")
            } else {
                // When created by the editor, this case should never happen, output error instead
                text = "INVALID DATA"
            }
        } else {
            text = scantrainer.template_resolver
                .with(template_resolvers(this.node.root, this.node.path))
                .resolve(this.node.path.short_instruction)
        }

        $("#nextscanstep").html(text)

        this.generateChildren(this.node, 0, $("#scantreeview").empty())

        return
    }

    generateList(node: augmented_decision_tree, depth: number, container: JQuery) {
        let resolver = scantrainer.template_resolver.with(template_resolvers(node.root, node.path))

        let line = $("<div>")
            .addClass("scantreeline")
            .css("padding-left", `${depth * 18}px`)
            .css("margin-top", "3px")
            .css("margin-bottom", "3px")
            .css("font-size", `${13 /*/ (Math.pow(1.25, depth))*/}px`)

        if (depth == 0) {
            if (node.parent.kind.pulse == 3 && node.parent.node.parent && node.parent.node.parent.kind.pulse == 3) {
                $("<span>")
                    .addClass("lightbutton")
                    .html(resolver.resolve(`Spot {{digspot ${spotNumber(node.root, node.remaining_candidates[0])}}}`))
                    .on("click", () => this.setNode(node))
                    .appendTo(line)
            } else {

                $("<span>")
                    .addClass("lightbutton")
                    .text(Pulse.meta(node.parent.kind).pretty)      // Parent can't be null when being here... I think
                    .on("click", () => this.setNode(node))
                    .appendTo(line)
            }
        } else if (depth > 0) {
            // TODO: Link
            let el = $("<span>- <span></span>: </span>")

            el.children("span")
                .text(Pulse.meta(node.parent.kind).pretty)
                .addClass("lightlink")
                .on("click", () => this.setNode(node))

            el.appendTo(line)
        }

        if (node.parent.kind.pulse == 3) {

            if (depth == 0 && node.remaining_candidates.length > 1) {
                line.append($("<span>").text("at"))

                synthetic_triple_children(node).sort(comap(natural_order, (c) => spotNumber(node.root, c.remaining_candidates[0]))/*comparator_by((c) => spotNumber(node.root, c.remaining_candidates[0]))*/).forEach((child) => {
                    $("<span>")
                        .html(resolver.resolve(`{{digspot ${spotNumber(node.root, child.remaining_candidates[0])}}}`))
                        .addClass("lightbutton")
                        .on("click", () => this.setNode(child))
                        .appendTo(line)
                })
            } else {

                if (node.parent.kind.pulse == 3 && node.parent.node.parent && node.parent.node.parent.kind.pulse == 3) {
                    $("<span>")
                        .html(scantrainer.template_resolver
                            .with(template_resolvers(node.root, node.path))
                            .resolve(node.path ? node.path.short_instruction : "WTF"))
                        .appendTo(line)
                } else {
                    let synthetic_children = synthetic_triple_children(node).sort(comap(natural_order, (c) => spotNumber(node.root, c.remaining_candidates[0])))

                    let el = $("<span>")
                        .html(`Spot ${natural_join(synthetic_children.map((e) => e.remaining_candidates[0]).map((e) => `<span class="lightlink spot-number">${spotNumber(node.root, e)}</span>`), "or")}`)
                        .appendTo(line)

                    for (let i = 0; i < synthetic_children.length; i++) {
                        $(el.children("span").get()[i]).on("click", () => this.setNode(synthetic_children[i]))
                    }

                }
            }
        } else {
            $("<span>")
                .html(scantrainer.template_resolver
                    .with(template_resolvers(node.root, node.path))
                    .resolve(node.path.short_instruction))
                .appendTo(line)
        }


        line.appendTo(container)

        this.generateChildren(node, depth + 1, container)
    }


    generateChildren(node: augmented_decision_tree, depth: number, container: JQuery) {
        if (depth >= 2) return

        if (depth == 0 && node.parent && node.parent.kind.pulse == 3 && node.remaining_candidates.length > 1) {
            synthetic_triple_children(node).forEach((child) => this.generateList(child, depth, container))
        }

        node.children.sort(comap(Pulse.compare, (a) => a.key)).forEach((e) => this.generateList(e.value, depth, container))
    }

    deactivate() {
        super.deactivate();

        this.app.sidepanels.methods_panel.hide()
    }
}