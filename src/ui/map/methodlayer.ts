import {ScanLayer, SpotPolygon} from "./layers/ScanLayer";
import {Application, scantrainer} from "../../application";
import {GameMapControl} from "./map";
import {ScanTree2} from "../../model/scans/ScanTree2";
import {modal} from "../widgets/modal";
import {eq, toPoint} from "../../model/coordinates";
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
import comparator_by = util.comparator_by;
import {Pulse} from "../../model/scans/scans";

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

export class ScanTreeMethodLayer extends ScanLayer {
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


        this._map.fitBounds(leaflet.latLngBounds([
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

        this.set_remaining_candidates(candidates)
        this.markers.forEach((e) => e.setActive(candidates.some((c) => eq(c, e.getSpot()))))

        this.areas.forEach((p) => p.setActive(relevant_areas.some((a) => a.name == (p.spot().name))))

        this.update()
    }

    constructor(private scantree: resolved_scan_tree, app: Application) {
        super(scantree.clue, app, {
            show_edit_button: true,
            show_equivalence_classes_button: false
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
            .css("margin-left", `${depth * 12}px`)
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
            $("<span>")
                .text(Pulse.meta(node.parent.kind).pretty + ": ")
                .appendTo(line)
        }

        if (node.parent.kind.pulse == 3) {

            if (depth == 0 && node.remaining_candidates.length > 1) {
                line.append($("<span>").text("at"))

                synthetic_triple_children(node).sort(comparator_by((c) => spotNumber(node.root, c.remaining_candidates[0]))).forEach((child) => {
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
                    $("<span>")
                        .html(scantrainer.template_resolver.resolve(`Spot ${natural_join(node.remaining_candidates.map((e) => spotNumber(node.root, e)).sort(natural_order).map((e) => `{{digspot ${e}}}`), "or")}`))
                        .appendTo(line)
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

        /*
        if (this.is_synthetic_triple_node) {
            this.children().filter((e) => e.parent.key.kind .pulse == 3)
                .forEach((e) => e.generateList(depth, container, app, e.solved.toString()))

            return;
        }*/

        /*let triples = this.children().filter((e) => e.parent.key.kind .pulse == 3)

        if (triples.length >= 1) {
            let line = $("<div>")
                .addClass("scantreeline")
                .css("margin-left", `${depth * 12}px`)
                .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

            if (depth == 0) {

                let triple_span = $("<span>")
                    .addClass("nextchoice")
                    .text("Triple")
                    .on("click", () => {
                        if (triples.length == 1) {
                            triples[0].sendToUI(app)
                        } else if (this.is_synthetic_triple_node) {
                            this.sendToUI(app) // This does nothing
                        } else {
                            let synthetic = new ScanTreeNode("Which spot?",
                                null,
                                this.where,
                                triples.map((e) => {
                                    return [{
                                        key: e.solved.toString(),
                                        kind: ChildType.TRIPLE
                                    }, e]
                                }),
                                null,
                                true
                            )
                            synthetic.parent = {node: this, key: {key: "Triple", kind: ChildType.TRIPLE}}
                            synthetic.root = this.root

                            synthetic.sendToUI(app)
                        }
                    })
                    .appendTo(line)

                line.append($("<span>").text("at"))

                for (let child of triples) {
                    $("<span>")
                        .text(`${child.solved}`)
                        .addClass("nextchoice")
                        .addClass("tripleping")
                        .on("click", () => child.sendToUI(app))
                        .appendTo(line)
                }
            } else {
                $("<span>")
                    .text(`Triple ping at ${triples.map((e) => e.solved).join(", ")}`)
                    .appendTo(line)
            }

            container.append(line)
        }
        */

        if (depth == 0 && node.parent && node.parent.kind.pulse == 3 && node.remaining_candidates.length > 1) {
            synthetic_triple_children(node).forEach((child) => this.generateList(child, depth, container))
        }

        node.children.sort((a, b) => {
            if (a.key.different_level != b.key.different_level) return (a.key.different_level ? 1 : -1)

            return a.key.pulse - b.key.pulse


            //comparator_by((c) => [ChildType.TRIPLE, ChildType.DOUBLE, ChildType.SINGLE, ChildType.DIFFERENTLEVEL, ChildType.TOOFAR].indexOf(c.key))
        }).forEach((e) => this.generateList(e.value, depth, container))

        /*
        this.children().filter((e) => e.parent.key.kind == ChildType.DOUBLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => e.parent.key.kind == ChildType.SINGLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => (typeof e.parent.key.kind) == "string")
            .forEach((e) => e.generateList(depth, container, app))*/
    }

    deactivate() {
        super.deactivate();

        this.app.sidepanels.methods_panel.hide()
    }
}