import {ScanLayer} from "./layers/ScanLayer";
import {Application, scantrainer} from "../../application";
import {GameMapControl} from "./map";
import {ScanTree2} from "../../model/scans/ScanTree2";
import resolved_scan_tree = ScanTree2.resolved_scan_tree;
import augmented_decision_tree = ScanTree2.augmented_decision_tree;
import {modal} from "../widgets/modal";
import ScanExplanationModal = ScanTree2.ScanExplanationModal;
import {eq} from "../../model/coordinates";
import augment = ScanTree2.augment;
import ScanDecision = ScanTree2.ScanDecision;
import {util} from "../../util/util";
import {Constants} from "../../constants";
import spotNumber = ScanTree2.spotNumber;
import template_resolvers = ScanTree2.template_resolvers;
import {ChildType} from "../../model/scans/scans";

export class ScanTreeMethodLayer extends ScanLayer {
    private root: augmented_decision_tree
    private node: augmented_decision_tree

    private fit() {
        /*
        let bounds = leaflet.latLngBounds([])

        // Include old location in bounds
        if (this.node.parent && this.node.parent.node.where) {
            let a = this.getArea(this.node.parent.node.where)

            if (!a.spot().is_far_away) bounds.extend(this.getArea(this.node.parent.node.where).getBounds())
        }

        // Include next location in bounds
        if (this.node.where) bounds.extend(this.getArea(this.node.where).getBounds())
        if (this.node.solved) bounds.extend(this.getMarker(this.node.solved).getBounds())

        // Include all triple children
        this.node.children().filter((c) => c.parent.key.kind == ChildType.TRIPLE).forEach((c) => {
            bounds.extend(this.getMarker(c.solved).getBounds())
        })

        // If there are no valid bounds (because the above all don't apply), default to the scan area as a bound
        if (!bounds.isValid()) this.markers.forEach((e) => bounds.extend(e.getBounds()))

        this._map.fitBounds(bounds.pad(0.1), {
            maxZoom: 4
        })*/
    }


    getTree(): resolved_scan_tree {
        return this.scantree;
    }

    public setNode(node: augmented_decision_tree) {
        this.node = node
        this.fit()

        let candidates = this.node.remaining_candidates
        let relevant_areas = [this.node.where]
        if (this.node.parent) relevant_areas.push(this.node.parent.node.where);

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

        this.setAreas(this.scantree.areas)

        // Create labels
        /*this.markers.forEach((m, i) => {
            m.withLabel((i + 1).toString(), "spot-number", [0, 10])
        })*/
    }

    public activate(map: GameMapControl) {
        super.activate(map);

        this.app.sidepanels.methods_panel.setModal(modal("modal-scantree-method-explanation", ScanExplanationModal))

        this.app.sidepanels.methods_panel.showSection("scantree")

        this.node = this.root

        this.update()
    }

    private update() {

        {
            let list = $("#pathview").empty()

            let buildPathNavigation = (node: augmented_decision_tree) => {
                $("<a>").attr("href", "javascript:;")
                    .on("click", () => this.setNode(node))
                    .text(node.parent ? ScanDecision.toString(node.decisions[node.decisions.length - 1]) : "Start")
                    .appendTo($("<li>").addClass("breadcrumb-item").prependTo(list))

                if (node.parent) buildPathNavigation(node.parent.node)
            }

            buildPathNavigation(this.node)

            let last = list.children().last()

            last.text(last.children().first().text()).addClass("active")
        }

        $("#nextscanstep").html(scantrainer.template_resolver
            .with(template_resolvers(this.node.root, this.node.path))
            .resolve(this.node.path.short_instruction))

        this.generateChildren(this.node, 0, $("#scantreeview").empty())

        return
    }

    generateList(node: augmented_decision_tree, depth: number, container: JQuery) {
        let line = $("<div>")
            .addClass("scantreeline")
            .css("margin-left", `${depth * 12}px`)
            .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

        if (depth == 0) {
            $("<span>")
                .addClass("nextchoice")
                .text(ChildType.meta(node.parent.kind).pretty)      // Parent can't be null when being here... I think
                .on("click", () => this.setNode(node))
                .appendTo(line)

            //line.css("line-height", `30px`)
        } else if (depth > 0) {
            $("<span>")
                .text(ChildType.meta(node.parent.kind).pretty + ": ")
                .appendTo(line)
        }

        $("<span>")
            .html(
                node.path ?
                scantrainer.template_resolver
                .with(template_resolvers(node.root, node.path))
                .resolve(node.path.short_instruction) : "IDK dude")
            .appendTo(line)

        line.appendTo(container)

        this.generateChildren(node, depth + 1, container)
    }


    generateChildren(node: augmented_decision_tree, depth: number, container: JQuery) {
        if (depth >= 2) return

        /*
        if (this.is_synthetic_triple_node) {
            this.children().filter((e) => e.parent.key.kind == ChildType.TRIPLE)
                .forEach((e) => e.generateList(depth, container, app, e.solved.toString()))

            return;
        }*/

        /*let triples = this.children().filter((e) => e.parent.key.kind == ChildType.TRIPLE)

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
        node.children.forEach((e) => this.generateList(e.value, depth, container))

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