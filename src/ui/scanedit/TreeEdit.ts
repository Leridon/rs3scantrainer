import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
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
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer} from "../../application";
import PathProperty from "../pathedit/PathProperty";
import shorten_integer_list = util.shorten_integer_list;
import Checkbox from "../widgets/Checkbox";
import Order = util.Order;
import {PathingGraphics} from "../map/path_graphics";
import {OpacityGroup} from "../map/layers/OpacityLayer";
import {Layer} from "leaflet";
import ScanSpot = ScanTree.ScanSpot;

class TreeNodeEdit extends Widget<{
    "changed": ScanTree.decision_tree
}> {
    constructor(private parent: TreeEdit, private node: augmented_tree, include_paths: boolean) {
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
            create_new_from_path?: boolean,
            area?: string
        }

        let options: T[] = parent.parent.value.areas.map(a => {
            return {
                area: a.name
            }
        })

        options.push({create_new: true})
        options.push({create_new_from_path: true})

        if (node.raw?.where_to) options.push({remove: true})
        else options.push({area: null})

        let props = new Properties().appendTo(this)

        if (node.remaining_candidates.length > 1 && (!node.parent || node.parent.kind.pulse != 3)) {
            let dropdown = new DropdownSelection<T>({
                can_be_null: false,
                null_value: null,
                type_class: {
                    toHTML(v: T): Widget {
                        if (v.remove) return c("<div>- Remove</div>")
                        if (v.create_new) return c("<div>+ Create New</div>")
                        if (v.create_new_from_path) return c("<div>+ Create New from Path</div>")
                        else return c("<div></div>").text(v.area || " - ")
                    }
                }
            }, options)
                .on("selection_changed", async (s) => {
                    if (s.remove) {
                        Object.assign(node.raw, ScanTree.init_leaf(node.remaining_candidates))
                    } else if (s.create_new) {
                        let area = await this.parent.parent.areas.create_new_area()

                        this.setTarget(area)
                    } else if (s.create_new_from_path) {

                        // Jfc this is bad and needs a cleaner implementation/interface
                        let start_state = this.node?.parent?.node?.path
                            ? (await Path.augment(this.node?.parent?.node?.path)).post_state
                            : Path.movement_state.start()

                        this.parent.parent.layer.getMap().path_editor.load({
                            start_state: start_state, steps: []
                        }, {
                            save_handler: async v => {

                                let aug = await Path.augment(v)

                                if (!aug.post_state?.position?.tile) return

                                let area: ScanSpot = {
                                    name: "New", area: {
                                        level: aug.post_state.position.tile.level,
                                        topleft: {x: aug.post_state.position.tile.x, y: aug.post_state.position.tile.y},
                                        botright: {x: aug.post_state.position.tile.x, y: aug.post_state.position.tile.y},
                                    }
                                }

                                this.parent.parent.value.areas.push(area)

                                this.parent.parent.areas.update()
                                this.parent.parent.areas.areas.find(a => a.value == area)?.toggleEdit()

                                this.parent.parent.areas.emit("changed", this.parent.parent.value.areas)

                                this.setTarget(area)

                                let p = this.node.raw.paths.find(p => p.spot == null)
                                if(p) p.path = v
                                else this.node.raw.paths.push({spot: null, path: v, directions: "Go to {{target}}"})

                                this.parent.parent.layer.getMap().path_editor.reset()
                            },
                        })
                    } else if (s.area != node.raw.where_to) {
                        let area = parent.parent.value.areas.find((a) => a.name == s.area)

                        this.setTarget(area)
                    }

                    // TODO: Handle "Create New" and "Create New from Path"

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
                        new TemplateStringEdit({
                            resolver: scantrainer.template_resolver.with(ScanTree.template_resolvers(node, p.spot)),
                            generator: () => {
                                let path_short =
                                    p.path.steps.length > 0
                                        ? p.path.steps.map(PathingGraphics.templateString).join(" - ")
                                        : "Go"

                                let target = "{{target}}"

                                return path_short + " to " + target
                            }
                        })
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
                        .on("loaded_to_editor", () => {
                            this.parent.addToPathEditCounter(1)
                        })
                        .on("editor_closed", () => {
                            this.parent.addToPathEditCounter(-1)
                        })
                        .setValue(p.path)
                    )
                })
        }
    }

    private setTarget(target: ScanSpot) {
        let narrowing = spot_narrowing(this.node.remaining_candidates, target, assumedRange(this.parent.parent.value))

        for (let child of narrowing) {
            if (child.narrowed_candidates.length == 0) continue

            this.node.raw.children.push({
                key: child.pulse,
                value: ScanTree.init_leaf(child.narrowed_candidates)
            })
        }

        this.node.raw.where_to = target.name

        this.node.raw.paths = [{
            directions: "Move to {{target}}",
            path: {
                start_state: Path.movement_state.start(),
                steps: [],
                target: target.area
            }
        }]
    }

    preview_polyons: Layer[] = null

    updatePreview(layer: OpacityGroup) {
        this.preview_polyons = this.node.raw.paths.map(p => {
            return PathingGraphics.renderPath(p.path).addTo(layer)
        })
    }
}

export default class TreeEdit extends Widget<{
    changed: tree_node,
    decisions_loaded: ScanDecision[],
    preview_invalidated: null,
    path_editor_state_changed: boolean,
}> {
    private hide_paths = false

    render_promise: Promise<void> = null

    constructor(public parent: ScanEditPanel, public value: tree_node) {
        super($("<div class='nisl-alternating'>"))

        this.update()
    }

    async update() {
        this.empty()

        this.render_promise = this.renderContent()

        return this.render_promise
    }

    children: TreeNodeEdit[] = []

    private async renderContent() {
        let augmented = await ScanTree.augment(this.parent.value)

        let self = this

        new Properties().appendTo(this)
            .named("Hide Paths?", new Checkbox().setValue(self.hide_paths).on("changed", (v) => {
                self.hide_paths = v
                self.update()
                this.emit("preview_invalidated", null)
            }))

        this.children = []

        function helper(node: augmented_tree) {
            // Only create edits for real nodes
            if (node.raw) self.children.push(new TreeNodeEdit(self, node, !self.hide_paths)
                .on("changed", async () => {
                    await ScanTree.prune_clean_and_propagate(self.parent.value)
                    await self.update()
                    await self.emit("preview_invalidated", null)
                })
                .appendTo(self))

            node.children
                .filter(n => n.key)
                .sort(Order.comap(Order.reverse(Pulse.compare), a => a.key))
                .forEach(c => helper(c.value))
            return null
        }

        helper(augmented)
    }

    setValue(value: tree_node) {
        this.value = value
        this.update()
    }

    _pathEditCounter = 0

    addToPathEditCounter(n: number) {
        let before = this._pathEditCounter > 0

        this._pathEditCounter += n

        let now = this._pathEditCounter > 0

        if (before != now) this.emit("path_editor_state_changed", now)
    }

    async updatePreview(layer: OpacityGroup) {
        console.log(this.children.length)

        await this.render_promise

        if (!this.hide_paths) this.children.forEach(c => c.updatePreview(layer))
    }
}
