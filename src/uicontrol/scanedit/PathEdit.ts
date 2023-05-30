import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree2} from "../../model/scans/ScanTree2";
import {Video} from "../../model/methods";
import edge_path = ScanTree2.edge_path;


class ClipEdit extends Widget {
    constructor(private value: Video) {
        super();

        this.append($("<div class='head'>Clip</div>"))
    }
}

class EdgeEdit extends Widget<{
    "changed": edge_path
}> {
    instruction_input: JQuery
    clip_edit: ClipEdit

    constructor(private value: edge_path) {
        super();

        this.append(
            $(`<div>${value.from} to ${JSON.stringify(value.to)}</div>`)
        )

        $("<div>Instruction</div>").appendTo(this.container)
        this.instruction_input = $("<input type='text' class='nisinput' style='width: 100%'>")
            .on("input", () => {
                this.value.short_instruction = this.instruction_input.val() as string
                this.emit("changed", this.value)
            })

        $("<div class='row'>")
            .append($("<div class='col-2'>Instruction</div>"))
            .append($("<div class='col-10'>").append(this.instruction_input))
            .appendTo(this.container)

        this.clip_edit = new ClipEdit(null).appendTo(this)
    }
}

export default class PathEdit extends Widget<{
    "changed": ScanTree2.edge_path[]
}> {
    cont: JQuery

    edges: EdgeEdit[]

    constructor(private parent: ScanEditPanel, value: ScanTree2.edge_path[]) {
        super()

        $("<h4>Pathing</h4>").appendTo(this.container)

        this.cont = $("<div>").appendTo(this.container)

        this.edges = []

        this.update()
    }

    update() {

        let paths = ScanTree2.gatherPaths(ScanTree2.augment(this.parent.value))

        this.cont.empty()

        this.edges.forEach((e) => e.remove())


        // TODO: Show edit panel for all needed paths AND paths that do exist

        paths.forEach((p) => {

            this.edges.push(new EdgeEdit({
                from: p.from,
                to: p.to,
                short_instruction: ""
            }).appendTo(this))
        })
    }
}