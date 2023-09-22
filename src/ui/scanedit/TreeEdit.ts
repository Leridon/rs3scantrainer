import Widget from "../widgets/Widget";
import ScanEditPanel from "./ScanEditPanel";
import {ScanTree} from "../../model/scans/ScanTree";
import tree_node = ScanTree.decision_tree;
import augmented_tree = ScanTree.augmented_decision_tree;
import ScanDecision = ScanTree.ScanInformation;
import spot_narrowing = ScanTree.spot_narrowing;
import {MapCoordinate, MapRectangle} from "../../model/coordinates";
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
import ScanSpot = ScanTree.ScanRegion;

class TreeNodeEdit extends Widget<{
    "changed": ScanTree.decision_tree
}> {
    constructor(private parent: TreeEdit, private node: augmented_tree, include_paths: boolean) {
        super()

        let decision_path_text = ([""].concat(node.information.map(d => ScanDecision.toString(d)))).join("/")
        let spot_text = natural_join(shorten_integer_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.value, c)),
            (n) => `<span class="ctr-digspot-inline">${n}</span>`
        ), "and")

        let header = c(`<div style="overflow: hidden; text-overflow: ellipsis; text-wrap: none; white-space: nowrap; font-weight: bold"></div>`).appendTo(this)
            .append(c(`<span class='nisl-textlink'>${decision_path_text}: </span>`).tooltip("Load decisions into map")
                .tapRaw(r => r.on("click", () => parent.emit("decisions_loaded", node.information)))
            )
            .append(c(`<span>${node.remaining_candidates.length} Spots, ${spot_text}</span>`))

        type T = {
            remove?: boolean,
            create_new?: boolean,
            create_new_from_path?: boolean,
            area?: ScanSpot
        }

        let options: T[] = parent.parent.value.areas
            .filter(a => a.name.length > 0)
            .map(a => {
                return {area: a}
            })

        options.push({create_new: true})

        options.push({create_new_from_path: true})

        if (node.raw?.scan_spot_id != null) options.push({remove: true})
        else options.push({area: null})

        let props = new Properties().appendTo(this)

        let path_row = c("<div style='display: flex'></div>")

        new PathProperty(parent.parent.layer.getMap(), {
            target: this.node.path.target,
            start_state: this.node.path.pre_state
        })
            .appendTo(path_row)
            .on("changed", v => {
                this.node.raw.path = v
                this.emit("changed", node.raw)
            })
            .on("loaded_to_editor", () => {
                this.parent.addToPathEditCounter(1)
            })
            .on("editor_closed", () => {
                this.parent.addToPathEditCounter(-1)
            })
            .setValue(this.node.raw.path)


        if (node.remaining_candidates.length > 1 && (!node.parent || node.parent.key.pulse != 3)) {
            c("<div style='display: flex; flex-grow: 1'></div>")
                .appendTo(path_row)
                .append(c("<span>Region: </span>"))
                .append(
                    new DropdownSelection<T>({
                        can_be_null: false,
                        null_value: null,
                        type_class: {
                            toHTML(v: T): Widget {
                                if (v.remove) return c("<div>- Remove</div>")
                                if (v.create_new) return c("<div>+ New</div>")
                                if (v.create_new_from_path) return c("<div>+ from Path</div>")
                                if (!v.area) return c("<div> - </div>")
                                else return c("<div class='ctr-scanspot-inline'></div>").text(v.area.name)
                            }
                        }
                    }, options)
                        .css("flex-grow", "1")
                        .setValue({area: node.region})
                        .on("selection_changed", async (s) => {
                            if (s.remove) {
                                Object.assign(node.raw, ScanTree.init_leaf())
                            } else if (s.create_new) {
                                let area = await this.parent.parent.areas.create_new_area()

                                this.setTarget(area)
                            } else if (s.create_new_from_path) {
                                this.setTarget(ScanTree.createNewSpot(
                                    this.node.raw_root,
                                    MapRectangle.fromTile(this.node.path.post_state.position.tile)))

                            } else if (s.area.id != node.raw.scan_spot_id) {
                                this.setTarget(s.area)
                            }

                            // TODO: Make a proper change-interface
                            parent.emit("changed", parent.value)
                            parent.update()
                        })
                )
        }

        props.named("Path", path_row);

        props.named("Direction",
            new TemplateStringEdit({
                resolver: scantrainer.template_resolver.with(ScanTree.template_resolvers(node)),
                generator: () => {
                    let path_short =
                        this.node.path.steps.length > 0
                            ? this.node.raw.path.map(PathingGraphics.templateString).join(" - ")
                            : "Go"

                    let target = "{{target}}"

                    return path_short + " to " + target
                }
            })
                .on("changed", (v) => {
                    this.node.raw.directions = v
                    //this.changed(this.value) // TODO:
                })
                .setValue(this.node.raw.directions)
        )
    }

    private setTarget(target: ScanSpot) {
        this.node.raw.scan_spot_id = target.id
    }

    preview_polyons: Layer[] = null

    updatePreview(layer: OpacityGroup) {
        return PathingGraphics.renderPath(this.node.raw.path).addTo(layer)
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
                    await ScanTree.normalize(self.parent.value)
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
