import {ScanLayer} from "./layers/ScanLayer";
import {Application} from "../../application";
import {GameMapControl} from "./map";
import {ScanTree2} from "../../model/scans/ScanTree2";
import resolved_scan_tree = ScanTree2.resolved_scan_tree;
import augmented_decision_tree = ScanTree2.augmented_decision_tree;
import {modal} from "../widgets/modal";
import ScanExplanationModal = ScanTree2.ScanExplanationModal;
import {eq} from "../../model/coordinates";
import augment = ScanTree2.augment;
import ScanDecision = ScanTree2.ScanDecision;

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

            let last = list.children().last()
            last.text(last.children("a").text()).addClass("active")

            buildPathNavigation(this.node)
        }


        return

/*
        for (let i = 0; i < path.length; i++) {
            let p = path[i]

            let li = $("<li>").addClass("breadcrumb-item")

            let text = p.parent ? p.parent.key.key : "Start"

            if (i < path.length - 1) {
                $("<a>").attr("href", "javascript:;")
                    .on("click", () => p.sendToUI(app))
                    .text(text)
                    .appendTo(li)
            } else {
                li.addClass("active")
                    .text(text)
            }

            li.appendTo(list)
        }


        $("#nextscanstep").text(this.instruction)

        this.generateChildren(0, $("#scantreeview").empty(), app)

        scantrainer.howtotabs.setHowToTabs(this.howTo())*/
    }

    deactivate() {
        super.deactivate();

        this.app.sidepanels.methods_panel.hide()
    }
}