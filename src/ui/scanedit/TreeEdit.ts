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
import {util} from "../../util/util";
import {DropdownSelection} from "../widgets/DropdownSelection";
import Properties from "../widgets/Properties";
import natural_join = util.natural_join;
import {Path} from "../../model/pathing";
import init_leaf = ScanTree.init_leaf;
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer} from "../../application";
import PathProperty from "../pathedit/PathProperty";
import shorten_integer_list = util.shorten_integer_list;
import Checkbox from "../widgets/Checkbox";
import Order = util.Order;

class TreeNodeEdit extends Widget<{
    "changed": ScanTree.decision_tree
}> {
    constructor(parent: TreeEdit, node: augmented_tree, include_paths: boolean) {
        super()

        let decision_path_text = (["Start"].concat(node.decisions.map(d => ScanDecision.toString(d)))).join("/")
        let spot_text = natural_join(shorten_integer_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.value, c)),
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
                            directions: "Move to {{target}}",
                            path: {
                                start_state: Path.movement_state.start(),
                                steps: [],
                                target: area.area
                            }
                        }]
                    }

                    // TODO: Make a proper change-interface
                    parent.emit("changed", parent.value)
                    parent.update()
                })

            dropdown.setValue({area: node.raw?.where_to})

            props.named("Move to", dropdown);
        }

        if (include_paths) {
            (node.raw?.paths || [])
                .sort(Order.comap(Order.natural_order, (p: {
                    spot?: MapCoordinate,
                    directions: string,
                    path: Path.raw
                }) => p.spot ? ScanTree.spotNumber(node.raw_root, p.spot) : -1))
                .forEach(p => {
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
                        new TemplateStringEdit(scantrainer.template_resolver.with(ScanTree.template_resolvers(node, p.spot)))
                            .on("changed", (v) => {
                                p.directions = v
                                //this.changed(this.value) // TODO:
                            })
                            .setValue(p.directions)
                    )

                    props.named("Path", new PathProperty(parent.parent.layer.getMap())
                        .on("changed", v => {
                            p.path = v
                            this.emit("changed", node.raw)
                        })
                        .setValue(p.path)
                    )
                })
        }
    }
}

export default class TreeEdit extends Widget<{
    changed: tree_node,
    decisions_loaded: ScanDecision[]
}> {
    private hide_paths = false

    constructor(public parent: ScanEditPanel, public value: tree_node) {
        super($("<div class='nisl-alternating'>"))

        this.update()
    }

    async update() {
        this.empty()

        await this.renderContent()
    }

    private async renderContent() {
        let augmented = await ScanTree.augment(this.parent.value)

        let self = this

        new Properties().appendTo(this)
            .named("Hide Paths?", new Checkbox().setValue(self.hide_paths).on("changed", (v) => {
                self.hide_paths = v
                self.update()
            }))

        function helper(node: augmented_tree) {
            // Only create edits for real nodes
            if (node.raw) new TreeNodeEdit(self, node, !self.hide_paths)
                .on("changed", async () => {
                    await ScanTree.prune_clean_and_propagate(self.parent.value)
                    await self.update()
                })
                .appendTo(self)

            node.children
                .filter(n => n.key)
                .sort(Order.comap(Order.reverse(Pulse.compare), a => a.key))
                .forEach(c => helper(c.value))
            return null
        }

        return helper(augmented)
    }

    setValue(value: tree_node) {
        this.value = value
        this.update()
    }
}
