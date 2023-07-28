import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import SmallImageButton from "../widgets/SmallImageButton";
import {ScanTree} from "../../model/scans/ScanTree";
import tree_node = ScanTree.decision_tree;
import augmented_tree = ScanTree.augmented_decision_tree;
import ScanDecision = ScanTree.ScanDecision;
import spot_narrowing = ScanTree.spot_narrowing;
import {MapCoordinate} from "../../model/coordinates";
import assumedRange = ScanTree.assumedRange;
import {Pulse} from "../../model/scans/scans";
import narrow_down = ScanTree.narrow_down;
import Collapsible from "../widgets/modals/Collapsible";
import {util} from "../../util/util";
import natural_order = util.natural_order;
import {DropdownSelection} from "../widgets/DropdownSelection";
import Properties from "../widgets/Properties";
import natural_join = util.natural_join;
import {Path} from "../../model/pathing";
import init_leaf = ScanTree.init_leaf;
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer} from "../../application";
import PathProperty from "../pathedit/PathProperty";

function combined_number_list(l: number[], f: ((_: number) => string) = (n => n.toString())): string[] {
    l.sort(natural_order)

    let res: string[] = []

    let start_range = l[0]
    let last = start_range

    for (let i = 1; i < l.length; i++) {
        let n = l[i]

        if (n <= last + 1) last = n
        else {
            if (last == start_range) res.push(f(last))
            else if (last == start_range + 1) res.push(f(start_range), f(last))
            else res.push(`${f(start_range)} - ${f(last)}`)

            start_range = n
            last = n
        }
    }

    if (last == start_range) res.push(f(last))
    else if (last == start_range + 1) res.push(f(start_range), f(last))
    else res.push(`${f(start_range)} - ${f(last)}`)

    return res
}

class TreeNodeEdit extends Widget {
    constructor(parent: TreeEdit, node: augmented_tree) {
        super()

        let decision_path_text = (["Start"].concat(node.decisions.map(d => ScanDecision.toString(d)))).join("/")
        let spot_text = natural_join(combined_number_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.value, c)),
            (n) => `<span class="ctr-digspot-inline">${n}</span>`
        ), "and")

        let header = c(`<div style="overflow: hidden; text-overflow: ellipsis; text-wrap: none; white-space: nowrap; font-weight: bold"></div>`).appendTo(this)
            .append(c(`<span class='nisl-textlink'>${decision_path_text}: </span>`).tooltip("Load decisions into map")
                .tapRaw(r => r.on("click", () => parent.emit("decisions_loaded", node.decisions)))
            )
            .append(c(`<span>${node.remaining_candidates.length} Spots, ${spot_text}</span>`))

        type T = {
            remove?: boolean,
            create_new?: boolean,
            area?: string
        }

        let options: T[] = parent.parent.value.areas.map(a => {
            return {
                area: a.name
            }
        })

        if (node.raw?.where_to) options.push({remove: true})
        else {
            options.push({create_new: true})
            options.push({area: null})
        }


        let props = new Properties().appendTo(this)

        if (node.remaining_candidates.length > 1 && (!node.parent || node.parent.kind.pulse != 3)) {
            let dropdown = new DropdownSelection<T>({
                can_be_null: false,
                null_value: null,
                type_class: {
                    toHTML(v: T): Widget {
                        if (v.remove) return c("<div>Remove</div>")
                        if (v.create_new) return c("<div>Create New</div>")
                        else return c("<div></div>").text(v.area || " - ")
                    }
                }
            }, options)
                .on("selection_changed", (s) => {
                    if (s.remove) {
                        Object.assign(node.raw, ScanTree.init_leaf(node.remaining_candidates))
                    } else if (s.area != node.raw.where_to) {
                        let area = parent.parent.value.areas.find((a) => a.name == s.area)

                        let narrowing = spot_narrowing(node.remaining_candidates, area, assumedRange(parent.parent.value))

                        for (let child of narrowing) {
                            if (child.narrowed_candidates.length == 0) continue

                            node.raw.children.push({
                                key: child.pulse,
                                value: ScanTree.init_leaf(child.narrowed_candidates)
                            })
                        }

                        node.raw.where_to = s.area

                        node.raw.paths = [{
                            short_instruction: "Move to {{target}}",
                            path: null
                        }]
                    }

                    // TODO: Make a proper change-interface
                    parent.emit("changed", parent.value)
                    parent.update()
                })

            dropdown.setValue({area: node.raw?.where_to})

            props.named("Move to", dropdown);
        }


        (node.raw?.paths || []).forEach(p => {
            {
                // Create header line for this path segment
                let origin = node.parent?.node?.scan_spot

                let header = "Path"
                if (origin) header += ` from&nbsp;<span class="ctr-scanspot-inline">${origin.name}</span>`
                header += ` to`

                if (p.spot) header += `&nbsp;<span class="ctr-digspot-inline">${ScanTree.spotNumber(parent.parent.value, p.spot)}`
                else header += `&nbsp;<span class="ctr-scanspot-inline">${node.scan_spot.name}</span>`

                props.header(header)
            }

            props.named("Direction",
                new TemplateStringEdit(scantrainer.template_resolver)
                    .on("changed", (v) => {
                        p.short_instruction = v
                        //this.changed(this.value) // TODO:
                    })
                    .setValue(p.short_instruction)
            )

            props.named("Path", new PathProperty(parent.parent.layer.getMap())
                .on("changed", v => {
                    p.path = v
                    //this.changed(this.value) // TODO
                })
                .setValue(p.path)
            )
        })
    }
}

export default class TreeEdit extends Widget<{
    changed: tree_node,
    decisions_loaded: ScanDecision[]
}> {

    collapsible: Collapsible

    view: JQuery = null

    constructor(public parent: ScanEditPanel, public value: tree_node) {
        super($("<div>"))

        this.collapsible = new Collapsible(this.container, "Decision/Movement Tree")

        this.update()
    }

    async update() {
        if (this.view) this.view.remove()

        this.view = $("<div class='treeview nisl-alternating'>").appendTo(this.collapsible.content.container)

        await this.create(this.view)
    }

    private async create(container: JQuery) {
        let augmented = await ScanTree.augment(this.parent.value)

        let self = this

        function helper(node: augmented_tree) {
            // Only create edits for real nodes
            if (node.raw) new TreeNodeEdit(self, node).appendTo(container)

            node.children.forEach(c => helper(c.value))
            return null
        }

        return helper(augmented)
    }

    setValue(value: tree_node) {
        this.value = value
        this.update()
    }
}
