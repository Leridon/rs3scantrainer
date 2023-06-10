import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree2} from "../../model/scans/ScanTree2";
import edge_path = ScanTree2.edge_path;
import edgeSame = ScanTree2.edgeSame;
import spotNumber = ScanTree2.spotNumber;
import {Constants} from "../../constants";
import {util} from "../../util/util";
import {scantrainer} from "../../application";
import template_resolvers = ScanTree2.template_resolvers;
import {MapCoordinate} from "../../model/coordinates";
import Collapsible from "../widgets/modals/Collapsible";


class ClipEdit extends Widget {
    constructor() {
        super();

        this.append($("<div class='head'>Clip</div>"))
    }
}

class EdgeEdit extends Widget<{
    "changed": edge_path
}> {
    instruction_input: JQuery
    render_span: JQuery
    clip_edit: ClipEdit

    constructor(private parent: PathEdit, private value: edge_path) {
        super();

        this.append(
            $(`<div style="text-align: center; font-weight: bold">${ScanTree2.edgeTitle(this.value, this.parent.parent.value)}</div>`)
        )
        this.instruction_input = $("<input type='text' class='nisinput' style='width: 100%'>")
            .val(value.short_instruction)
            .on("input", () => {
                this.value.short_instruction = this.instruction_input.val() as string

                this.renderInstruction()

                this.emit("changed", this.value)
            })

        this.render_span = $("<div>")

        $("<div class='row'>")
            .append($("<div class='col-3'>Instruction</div>"))
            .append($("<div class='col-9'>").append(this.instruction_input))
            .appendTo(this.container)

        $("<div class='row'>")
            .append($("<div class='col-3'>Rendered</div>"))
            .append($("<div class='col-9'>").append(this.render_span))
            .appendTo(this.container)

        //this.clip_edit = new ClipEdit(null).appendTo(this)

        this.renderInstruction()
    }

    private renderInstruction() {

        this.render_span.html(
            scantrainer.template_resolver
                .with(template_resolvers(this.parent.parent.value, this.value))
                .resolve(this.value.short_instruction)
        )
    }
}

export default class PathEdit extends Widget<{
    "changed": ScanTree2.edge_path[]
}> {
    collapsible: Collapsible

    edges: EdgeEdit[]

    constructor(public parent: ScanEditPanel, private value: ScanTree2.edge_path[]) {
        super()

        this.collapsible = new Collapsible(this.container, "Pathing")

        this.edges = []

        this.clean()
    }

    clean() {
        let needed = ScanTree2.gatherPaths(ScanTree2.augment(this.parent.value))

        this.edges.forEach((e) => e.remove())

        // Remove paths that aren't needed anymore and create paths for new edges
        this.value = needed.map((p) => {
            return this.parent.value.methods.find((m) => edgeSame(p, m)) || {
                from: p.from,
                to: p.to,
                short_instruction:
                    Array.isArray(p.to) ?
                        (p.to.length > 1) ? `Check {{target}}`
                            : "Dig at {{target}}"
                        : `Go to {{target}}`
            }
        })

        this.value = this.value.sort((a, b) => {
            if (!a.from) return -1
            if (!b.from) return 1
            if (typeof a.to == "string" && !(typeof b.to == "string")) return -1
            if (typeof b.to == "string" && !(typeof a.to == "string")) return 1

            let res: number

            if (typeof a.to == "string") res = a.to.localeCompare(b.to as string)
            else res = Math.min(...a.to.map((c) => spotNumber(this.parent.value, c))) - Math.min(...(b.to as MapCoordinate[]).map((c) => spotNumber(this.parent.value, c)))
            if (res != 0) return res

            res = (a.from.localeCompare(b.from))
            return res
        })

        this.update()

        this.emit("changed", this.value)
    }

    update() {
        this.edges.forEach((e) => e.remove())

        this.value.forEach((p) => {
            this.edges.push(new EdgeEdit(this, p)
                .on("changed", () => {
                    this.emit("changed", this.value)
                })
                .appendTo(this.collapsible.content))
        })
    }

    setValue(value: ScanTree2.edge_path[]) {
        this.value = value
        this.update()
    }
}