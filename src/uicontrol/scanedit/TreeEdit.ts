import Widget from "../widgets/Widget";
import {ScanSpot} from "../../model/methods";
import {ChildType, spot_narrowing} from "../../model/scans/scans";
import ScanEditPanel from "./ScanEditPanel";
import SmallImageButton from "../widgets/SmallImageButton";
import {ScanTree2} from "../../model/scans/ScanTree2";
import tree_node = ScanTree2.decision_tree;
import augmented_tree = ScanTree2.augmented_decision_tree;


export type ScanDecision = {
    area: ScanSpot,
    ping: ChildType
}

export namespace ScanDecision {
    export function toString(decision: ScanDecision) {
        function postfix(kind: ChildType) {
            switch (kind) {
                case ChildType.SINGLE:
                    return "1"
                case ChildType.DOUBLE:
                    return "2"
                case ChildType.TRIPLE:
                    return "3"
                case ChildType.DIFFERENTLEVEL:
                    return "\"DL\""
                case ChildType.TOOFAR:
                    return "\"TF\""
            }
        }

        return `${decision.area.name}${postfix(decision.ping)}`
    }
}

type TreeDom = {
    node: augmented_tree,
    selection?: JQuery,
    candidate_count?: JQuery,
    children: TreeDom[]
}

export default class TreeEdit extends Widget<{
    changed: tree_node,
    decisions_loaded: ScanDecision[]
}> {

    view: JQuery = null

    tree: TreeDom

    constructor(private parent: ScanEditPanel, private value: tree_node) {
        super($("<div>"))

        this.append($("<h4>Decision tree</h4>"))

        $("<div style='display: flex; text-align: center'>")
            .append($("<div class='col-9' style='font-weight: bold'>Instructions</div>"))
            .append($("<div class='col-3' style='font-weight: bold'>Candidates</div>"))
            .appendTo(this.container)

        this.update()
    }

    clean() {
        // TODO: Delete instructions for areas that don't exist anymore and prune branches without candidates
    }

    update() {
        if (this.view) this.view.remove()

        this.view = $("<div>").appendTo(this.container)

        this.create(this.view)
    }


    private create(container: JQuery): TreeDom {
        let augmented = ScanTree2.augment(this.parent.value)

        let self = this

        function helper(node: augmented_tree): TreeDom {
            let dom: TreeDom = {
                node: node,
                children: []
            }

            let row = $("<div style='max-width: 100%; display: flex; flex-direction: row'>").appendTo(container)
            let col1 = $("<div class='col-9'>").css("padding-left", `${node.depth * 7}px`).appendTo(row)

            dom.candidate_count = $("<div class='col-2' style='text-align: center'>")
                .attr("title", node.remaining_candidates.map((c) => ScanTree2.spotNumber(self.parent.value, c)).sort().join(", "))
                .text(node.remaining_candidates.length).appendTo(row)
            let load_button = SmallImageButton.new('assets/icons/share.png').appendTo($("<div class='col-1'>").appendTo(row))
                .on("click", () => {
                    self.emit("decisions_loaded", node.decisions)
                })

            if ((node.parent && node.parent.kind == ChildType.TRIPLE) || node.remaining_candidates.length == 1) {
                $(`<div>${node.parent.node.where.name}${ChildType.meta(node.parent.kind).shorted} -> Solved! (${node.remaining_candidates.map((c) => ScanTree2.spotNumber(self.parent.value, c)).sort().join(", ")})</div>`).appendTo(col1)
            } else {
                let label = $("<label class='flex-grow-1' style='display: flex; flex-direction: row'>").text(node.parent != null ? `${node.parent.node.where.name}${ChildType.meta(node.parent.kind).shorted} ->` : "Start at").appendTo(col1)

                dom.selection = $("<select style='margin-left: 0.5em'>").appendTo(label)
                    .on("input", (event) => {

                        let selected_name = dom.selection.val() as string

                        console.log(selected_name)

                        if (!selected_name) {
                            if (!node.parent) {// Is root node
                                self.value = null
                            } else {
                                // Delete the node from parent
                                let i = node.parent.node.raw.children.findIndex((c) => c.key == node.parent.kind)

                                node.parent.node.raw.children.splice(i, 1)
                            }

                        } else if (!node.raw) {
                            // Is a null node, need to create in parent

                            let new_node: tree_node = {
                                where: selected_name,
                                children: []
                            }

                            if (!node.parent) {// Is root node
                                self.value = new_node
                            } else {
                                node.parent.node.raw.children.push({
                                    key: node.parent.kind,
                                    value: new_node
                                })
                            }
                        } else {
                            // Node exists, delete children to refresh
                            node.raw.where = selected_name
                            node.raw.children = []
                        }

                        self.emit("changed", self.value)

                        self.update()
                    })

                if (node.raw == null) {
                    let text = $(`<span style="margin-left: 5px"></span>`).appendTo(label)

                    if (node.remaining_candidates.length > 5){
                        text.text(`${node.remaining_candidates.length} spots remain`).attr("title", node.remaining_candidates.map((s) => ScanTree2.spotNumber(self.parent.value, s)).sort().join(", "))
                    } else {
                        text.text(`(${node.remaining_candidates.map((s) => ScanTree2.spotNumber(self.parent.value, s)).sort().join(", ")}) remain`)
                    }
                }

                $("<option>").val(null).text("-").appendTo(dom.selection)

                self.parent.value.areas.forEach((a) => {
                    $("<option>").val(a.name).text(a.name).appendTo(dom.selection)
                })
            }

            if (node.raw != null) {
                let area = self.parent.value.areas.find((a) => a.name == node.where.name)

                dom.selection.val(node.raw.where)

                let narrowing = spot_narrowing(node.remaining_candidates, area, self.parent.clue.range + 5)

                narrowing.forEach((v, k) => {
                    let child = node.children.find((c) => c.key == k)

                    if ((v.length > 0 || child != null)) {
                        dom.children.push(helper(child ? child.value : null))
                    }
                })
            }

            return dom
        }

        return helper(augmented)
    }
}
