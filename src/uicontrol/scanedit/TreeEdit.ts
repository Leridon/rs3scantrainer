import Widget from "../widgets/Widget";
import {ScanSpot} from "../../model/methods";
import {ChildType, spot_narrowing} from "../../model/scans/scans";
import {eq, MapCoordinate} from "../../model/coordinates";
import {ScanMethod, tree_node} from "../map/layers/ScanLayer";
import ScanEditPanel from "./ScanEditPanel";
import SmallImageButton from "../widgets/SmallImageButton";


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
    decisions: ScanDecision[],
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

    update() {
        if (this.view) this.view.remove()

        this.view = $("<div>").appendTo(this.container)

        this.create(this.view, this.value, null, 0, this.parent.clue.solution.candidates, [])
    }


    private create(container: JQuery,
                   node: tree_node,
                   parent: { node: tree_node, kind: ChildType } | null,
                   depth: number,
                   remaining_candidates: MapCoordinate[],
                   decisions: ScanDecision[],
    ): TreeDom {

        let dom: TreeDom = {
            decisions: decisions,
            children: []
        }

        let row = $("<div style='max-width: 100%; display: flex; flex-direction: row'>").appendTo(container)
        let col1 = $("<div class='col-9'>").css("padding-left", `${depth * 7}px`).appendTo(row)

        dom.candidate_count = $("<div class='col-2' style='text-align: center'>")
            .attr("title", remaining_candidates.map((c) => ScanMethod.spotNumber(this.parent.value, c)).sort().join(", "))
            .text(remaining_candidates.length).appendTo(row)
        let load_button = SmallImageButton.new('assets/icons/share.png').appendTo($("<div class='col-1'>").appendTo(row))
            .on("click", () => {
                this.emit("decisions_loaded", decisions)
            })

        if ((parent && parent.kind == ChildType.TRIPLE) || remaining_candidates.length == 1) {
            $(`<div>${parent.node.where}${ChildType.meta(parent.kind).shorted} -> Solved! (${remaining_candidates.map((c) => ScanMethod.spotNumber(this.parent.value, c)).sort().join(", ")})</div>`).appendTo(col1)
        } else {
            let label = $("<label class='flex-grow-1' style='display: flex; flex-direction: row'>").text(parent != null ? `${parent.node.where}${ChildType.meta(parent.kind).shorted} ->` : "Start at").appendTo(col1)

            dom.selection = $("<select style='margin-left: 0.5em'>").appendTo(label)
                .on("input", (event) => {

                    let selected_name = dom.selection.val() as string

                    if (!selected_name) {
                        // Delete the node from parent
                        let i = parent.node.decisions.findIndex((c) => c.key == parent.kind)

                        parent.node.decisions.splice(i, 1)
                    } else if (!node) {
                        // Is a null node, need to create in parent

                        let new_node = {
                            where: selected_name,
                            decisions: []
                        }

                        if (!parent) {// Is root node
                            this.value = new_node
                        } else {
                            parent.node.decisions.push({
                                key: parent.kind,
                                value: new_node
                            })
                        }
                    } else {
                        // Node exists, delete children to refresh
                        node.where = selected_name
                        node.decisions = []
                    }

                    this.emit("changed", this.value)

                    this.update()
                })

            if (node == null) {
                $(`<span style="margin-left: 5px">(${remaining_candidates.map((s) => ScanMethod.spotNumber(this.parent.value, s)).sort().join(", ")}) remain</span>`).appendTo(label)
            }

            $("<option>").val(null).text("-").appendTo(dom.selection)

            console.log("?")
            console.log(this.parent.value.areas)

            this.parent.value.areas.forEach((a) => {
                $("<option>").val(a.name).text(a.name).appendTo(dom.selection)
            })
        }

        if (node != null) {
            let area = this.parent.value.areas.find((a) => a.name == node.where)

            dom.selection.val(node.where)

            let narrowing = spot_narrowing(remaining_candidates, area, this.parent.clue.range + 5)

            narrowing.forEach((v, k) => {
                let child = node.decisions.find((c) => c.key == k)

                if ((v.length > 0 || child != null)) {
                    dom.children.push(this.create(container, child ? child.value : null, {node: node, kind: k}, depth + 1,
                        narrowing.get(k),
                        decisions.concat([{
                            area: area,
                            ping: k
                        }])))
                }
            })
        }

        return dom
    }
}
