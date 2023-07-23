import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree2} from "../../model/scans/ScanTree2";
import edge_path = ScanTree2.edge_path;
import edgeSame = ScanTree2.edgeSame;
import spotNumber = ScanTree2.spotNumber;
import {scantrainer} from "../../application";
import template_resolvers = ScanTree2.template_resolvers;
import {MapCoordinate} from "../../model/coordinates";
import Collapsible from "../widgets/modals/Collapsible";
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import Properties from "../widgets/Properties";
import PathProperty from "../pathedit/PathProperty";
import AbstractEditWidget from "../widgets/AbstractEditWidget";

class EdgeEdit extends AbstractEditWidget<edge_path> {
    header: Widget
    instruction_input: TemplateStringEdit
    path_input: PathProperty

    constructor(private parent: PathEdit) {
        super()

        let properties = new Properties().appendTo(this)

        this.header = properties.header("")

        this.instruction_input = properties.named("Instruction",
            new TemplateStringEdit(scantrainer.template_resolver)
                .on("changed", (v) => {
                    this.value.short_instruction = v
                    this.changed(this.value)
                })
        )

        this.path_input = properties.named("Path", new PathProperty(this.parent.parent.layer.getMap())
            .on("changed", v => {
                this.value.path = v
                this.changed(this.value)
            })
        )
    }

    update() {
        this.header.text(ScanTree2.edgeTitle(this.value, this.parent.parent.value))
        this.path_input.setValue(this.value.path)
        this.instruction_input.setResolver(scantrainer.template_resolver.with(template_resolvers(this.parent.parent.value, this.value)))
            .setValue(this.value.short_instruction)
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
        this.edges.forEach((e) => e.update())

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
                        : `Go to {{target}}`,
                path: {
                    start_state: null,   // Useful for movement trees, where a path depends on a previous state
                    target: null,
                    description: "",
                    steps: [],
                }
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
            this.edges.push(new EdgeEdit(this)
                .setValue(p)
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