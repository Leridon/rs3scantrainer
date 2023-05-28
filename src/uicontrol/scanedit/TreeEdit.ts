import Widget from "../widgets/Widget";
import {ScanSpot} from "../../model/methods";
import {ChildType, narrow_down_area} from "../../model/scans/scans";
import {MapCoordinate} from "../../model/coordinates";
import {tree_node} from "../map/layers/ScanLayer";
import ScanEditPanel from "./ScanMethodEdit";


type ScanDecision = {
    area: ScanSpot,
    ping: ChildType
}

type TreeDom = {
    decisions: ScanDecision[],
    selection?: JQuery,
    candidate_count: JQuery,
    children: TreeDom[]
}

export default class TreeEdit extends Widget<{
    changed: tree_node,
    decisions_loaded: [ScanSpot, ChildType][]
}> {

    view: JQuery = null

    tree: TreeDom

    constructor(private parent: ScanEditPanel, private value: tree_node) {
        super($("<div>"))

        this.append($("<h4>Decision tree</h4>"))

        $("<div style='display: flex; text-align: center'>")
            .append($("<div class='col-9'>Instructions</div>"))
            .append($("<div class='col-3'>Candidates</div>"))
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
                   child_kind: ChildType | null,
                   depth: number,
                   remaining_candidates: MapCoordinate[],
                   decisions: ScanDecision[],
    ): TreeDom {
        let row = $("<div style='max-width: 100%; display: flex; flex-direction: row'>").appendTo(container)
        let col1 = $("<div class='col-9'>").css("padding-left", `${depth * 5}px`).appendTo(row)

        let label = $("<label class='flex-grow-1' style='display: flex; flex-direction: row'>").text(child_kind != null ? `If '${ChildType.meta(child_kind).pretty}', go to` : "Start at").appendTo(col1)

        let candidates = $("<div class='col-2' style='text-align: center'>").text(remaining_candidates.length).appendTo(row)
        let load_button = $("<div class='col-1'>")
            .append($("<div class='nissmallimagebutton'><img src='assets/icons/share.png'></div>"))
            .appendTo(row)

        let select = $("<select style='margin-left: 0.5em'>").appendTo(label)

        let selection = $("<option value='null'>").text("-").appendTo(select)
            .on("input", (event) => {

            })

        this.parent.value.areas.forEach((a) => {
            $("<option>").val(a.name).text(a.name).appendTo(select)
        })

        let dom: TreeDom = {
            decisions: decisions,
            selection: selection,
            candidate_count: candidates,
            children: []
        }

        if (node != null) {
            let area = this.parent.value.areas.find((a) => a.name == node.where)

            select.val(node.where)

            let narrowing = narrow_down_area(remaining_candidates, area, this.parent.clue.range + 5)

            narrowing.forEach((v, k) => {
                let child = node.decisions.find((c) => c.key == k)

                if ((v.length > 0 || child != null) && k != ChildType.TRIPLE) {
                    dom.children.push(this.create(container, child ? child.value : null, k, depth + 1,
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
