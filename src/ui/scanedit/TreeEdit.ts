import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import SmallImageButton from "../widgets/SmallImageButton";
import {ScanTree2} from "../../model/scans/ScanTree2";
import tree_node = ScanTree2.decision_tree;
import augmented_tree = ScanTree2.augmented_decision_tree;
import ScanDecision = ScanTree2.ScanDecision;
import spot_narrowing = ScanTree2.spot_narrowing;
import {MapCoordinate} from "../../model/coordinates";
import assumedRange = ScanTree2.assumedRange;
import {Pulse} from "../../model/scans/scans";
import narrow_down = ScanTree2.narrow_down;
import Collapsible from "../widgets/modals/Collapsible";
import {util} from "../../util/util";
import natural_order = util.natural_order;
import {DropdownSelection} from "../widgets/DropdownSelection";
import Properties from "../widgets/Properties";
import natural_join = util.natural_join;
import {Path} from "../../model/pathing";
import init_leaf = ScanTree2.init_leaf;
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer} from "../../application";
import PathProperty from "../pathedit/PathProperty";

type TreeDom = {
    node: augmented_tree,
    selection?: JQuery,
    candidate_count?: JQuery,
    children: TreeDom[]
}

function combined_number_list(l: number[]): string[] {
    l.sort(natural_order)

    let res: string[] = []

    let start_range = l[0]
    let last = start_range

    for (let i = 1; i < l.length; i++) {
        let n = l[i]

        if (n <= last + 1) last = n
        else {
            if (last == start_range) res.push(last.toString())
            else if (last == start_range + 1) res.push(start_range.toString(), last.toString())
            else res.push(`${start_range} - ${last}`)

            start_range = n
            last = n
        }
    }

    if (last == start_range) res.push(last.toString())
    else if (last == start_range + 1) res.push(start_range.toString(), last.toString())
    else res.push(`${start_range} - ${last}`)

    return res
}

class TreeNodeEdit extends Widget {
    constructor(parent: TreeEdit, node: augmented_tree) {
        super()

        let decision_path_text = (["Start"].concat(node.decisions.map(d => ScanDecision.toString(d)))).join("/")
        let spot_text = natural_join(combined_number_list(node.remaining_candidates.map((c) => ScanTree2.spotNumber(parent.parent.value, c))), "and")

        let header = c(`<div style="overflow: hidden; text-overflow: ellipsis; text-wrap: none; white-space: nowrap; font-weight: bold"></div>`).appendTo(this)
            .append(c(`<span class='nisl-textlink'>${decision_path_text}: </span>`).tooltip("Load decisions into map")) // TODO: Add click handler
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
                    Object.assign(node.raw, ScanTree2.init_leaf(node.remaining_candidates))
                } else if (s.area != node.raw.where_to) {
                    let area = parent.parent.value.areas.find((a) => a.name == s.area)

                    let narrowing = spot_narrowing(node.remaining_candidates, area, assumedRange(parent.parent.value))

                    for (let child of narrowing) {
                        if (child.narrowed_candidates.length == 0) continue

                        node.raw.children.push({
                            key: child.pulse,
                            value: ScanTree2.init_leaf(child.narrowed_candidates)
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

        let props = new Properties().appendTo(this)

        props.named("Move to", dropdown);

        (node.raw?.paths || []).forEach(p => {
            props.header(`Path to ${p.spot}`)

            props.named("Instruction",
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

    tree: TreeDom

    constructor(public parent: ScanEditPanel, public value: tree_node) {
        super($("<div>"))

        this.collapsible = new Collapsible(this.container, "Decision/Movement Tree")

        this.update()
    }

    async clean() {
        let self = this

        /*async function prune(node: tree_node, candidates: MapCoordinate[]): Promise<tree_node> {
            if (node == null || candidates.length == 0) return null

            let area = self.parent.value.areas.find((a) => a.name == node.where_to)

            if (!area) return null

            for (const n of node.children) {
                n.value = await prune(n.value, narrow_down(candidates, {area: area, ping: n.key}, assumedRange(self.parent.value)))
            }

            node.children = node.children.filter((c) => c.value != null)

            return node
        }

        this.value = await prune(this.value, this.parent.value.clue.solution.candidates)

        this.emit("changed", this.value)*/

        this.update()
    }

    update() {
        if (this.view) this.view.remove()

        this.view = $("<div class='treeview nisl-alternating'>").appendTo(this.collapsible.content.container)

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

            new TreeNodeEdit(self, node).appendTo(container)

            node.children.forEach(c => helper(c.value))
            return null

            let row = $("<div style='max-width: 100%; display: flex; flex-direction: row'>")//.appendTo(container)
            let col1 = $("<div class='col-9'>").css("padding-left", `${node.depth * 7}px`).appendTo(row)

            /*dom.candidate_count = $("<div class='col-2' style='text-align: center'>")
                .attr("title", node.remaining_candidates.map((c) => ScanTree2.spotNumber(self.parent.value, c)).sort(natural_order).join(", "))
                .text(node.remaining_candidates.length).appendTo(row)
            let load_button = SmallImageButton.new('assets/icons/share.png').appendTo($("<div class='col-1'>").appendTo(row))
                .on("click", () => {
                    self.emit("decisions_loaded", node.decisions)
                })
             */


            if ((node.parent && node.parent.kind.pulse == 3) || node.remaining_candidates.length == 1) {
                $(`<div>${node.parent.node.where.name}${Pulse.meta(node.parent.kind).shorted} -> Solved! (${node.remaining_candidates.map((c) => ScanTree2.spotNumber(self.parent.value, c)).sort(natural_order).join(", ")})</div>`).appendTo(col1)
            } else {
                let label = $("<label class='flex-grow-1' style='display: flex; flex-direction: row'>").text(node.parent != null ? `${node.parent.node.where.name}${Pulse.meta(node.parent.kind).shorted} ->` : "Start at").appendTo(col1)

                dom.selection = $("<select style='margin-left: 0.5em'>").appendTo(label)
                    .on("input", (event) => {
                        let selected_name = dom.selection.val() as string

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
                                where_to: selected_name,
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
                            node.raw.where_to = selected_name
                            node.raw.children = []
                        }

                        self.emit("changed", self.value)

                        self.update()
                    })

                if (node.raw == null) {
                    let text = $(`<span style="margin-left: 5px"></span>`).appendTo(label)

                    if (node.remaining_candidates.length > 5) {
                        text.text(`${node.remaining_candidates.length} spots remain`).attr("title", node.remaining_candidates.map((s) => ScanTree2.spotNumber(self.parent.value, s)).sort(natural_order).join(", "))
                    } else {
                        text.text(`(${node.remaining_candidates.map((s) => ScanTree2.spotNumber(self.parent.value, s)).sort(natural_order).join(", ")}) remain`)
                    }
                }

                $("<option>").val(null).text("-").appendTo(dom.selection)

                self.parent.value.areas.forEach((a) => {
                    $("<option>").val(a.name).text(a.name).appendTo(dom.selection)
                })
            }

            if (node.raw != null && dom.selection) {
                let area = self.parent.value.areas.find((a) => a.name == node.where.name)

                dom.selection.val(node.raw.where_to)

                let narrowing = spot_narrowing(node.remaining_candidates, area, assumedRange(self.parent.value))

                narrowing.forEach((v) => {
                    let child = node.children.find((c) => Pulse.equals(v.pulse, c.key))

                    if ((v.narrowed_candidates.length > 0 || child != null)) {
                        dom.children.push(helper(child ? child.value : null))
                    }
                })
            }

            return dom
        }

        return helper(augmented)
    }

    setValue(value: tree_node) {
        this.value = value
        this.update()
    }
}
