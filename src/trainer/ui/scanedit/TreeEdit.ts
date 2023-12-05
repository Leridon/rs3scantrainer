import Widget from "lib/ui/Widget";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import decision_tree = ScanTree.ScanTreeNode;
import {util} from "lib/util/util";
import Properties from "../widgets/Properties";
import natural_join = util.natural_join;
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import PathProperty from "../pathedit/PathProperty";
import shorten_integer_list = util.shorten_integer_list;
import {PathingGraphics} from "../path_graphics";
import TextField from "lib/ui/controls/TextField";
import {SmallImageButton} from "../widgets/SmallImageButton";
import {ScanRegionPolygon} from "../solving/scans/ScanLayer";
import LightButton from "../widgets/LightButton";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {scan_tree_template_resolvers} from "../solving/scans/ScanSolving";
import GameMapDragAction from "lib/gamemap/interaction/GameMapDragAction";
import {observe} from "../../../lib/reactive";
import {ValueInteraction} from "../../../lib/gamemap/interaction/ValueInteraction";
import ScanRegion = ScanTree.ScanRegion;
import InteractionTopControl from "../map/InteractionTopControl";
import {C} from "../../../lib/ui/constructors";
import span = C.span;
import spacer = C.spacer;
import {Scans} from "../../../lib/runescape/clues/scans";
import Pulse = Scans.Pulse;
import * as assert from "assert";
import Order = util.Order;
import ScanEditor from "./ScanEditor";

export class DrawRegionAction extends ValueInteraction<ScanRegion> {
    constructor(name: string) {
        super({
            preview_render: region => new ScanRegionPolygon(region)
        });

        new GameMapDragAction({})
            .addTo(this)
            .onPreview((area) => {
                this.preview({area: area, name: name})
            })
            .onCommit((area) => {
                this.commit({area: area, name: name})
            })

        this.attachTopControl(new InteractionTopControl({name: "Draw Scan Region"})
            .setText("Click and Drag the map to draw a scan region rectangle.")
        )
    }
}

class RegionEdit extends Widget {
    constructor(public parent: TreeNodeEdit) {
        super($("<div style='display: flex'></div>"));

        this.render()
    }

    public render() {
        this.empty()

        let is_defined = !!this.parent.node.raw.region

        if (is_defined) {
            new TextField()
                .setValue(this.parent.node.raw.region.name)
                .onPreview((v) => {
                    this.parent.node.raw.region.name = v
                    this.parent.region_preview?.setRegion(this.parent.node.raw.region)
                })
                .onCommit((v) => {
                    this.parent.parent.parent.builder.setRegion(this.parent.node.raw, {area: this.parent.node.region.area, name: v})
                })
                .css("flex-grow", "1")
                .appendTo(this)

            SmallImageButton.new("assets/icons/edit.png")
                .css("margin-left", "2px")
                .onClick(async () => {

                    this.parent.parent.parent.interaction_guard.set(
                        new DrawRegionAction(this.parent.node.raw.region.name)
                            .onStart(() => this.parent.region_preview?.setOpacity(0))
                            .onEnd(() => this.parent.region_preview?.setOpacity(this.parent.region_preview.isActive()
                                ? this.parent.region_preview.active_opacity
                                : this.parent.region_preview.inactive_opacity))
                            .onCommit(area => {
                                this.parent.parent.parent.builder.setRegion(this.parent.node.raw, area)
                            })
                    )
                })
                .appendTo(this)

            SmallImageButton.new("assets/icons/regenerate.png")
                .css("margin-left", "2px")
                .onClick(async () => {
                    this.parent.parent.parent.builder.setRegion(this.parent.node.raw, {
                        name: this.parent.node.region?.name || "",
                        area: TileRectangle.fromTile(this.parent.node.path.post_state?.position?.tile)
                    })
                })
                .setEnabled(this.parent.node.path.steps.length > 0 && !!this.parent.node.path.post_state?.position?.tile)
                .appendTo(this)

            SmallImageButton.new("assets/icons/delete.png")
                .css("margin-left", "2px")
                .onClick(async () => {
                    this.parent.parent.parent.builder.setRegion(this.parent.node.raw, null)
                })
                .appendTo(this)
        } else {
            new LightButton("Create")
                .onClick(async () => {
                    if (this.parent.node.path.steps.length > 0 && this.parent.node.path.post_state?.position?.tile) {
                        let area = TileRectangle.fromTile(this.parent.node.path.post_state?.position?.tile)

                        this.parent.parent.parent.builder.setRegion(this.parent.node.raw, {
                            name: "",
                            area: area
                        })
                    } else {
                        this.parent.parent.parent.interaction_guard.set(
                            new DrawRegionAction("")
                                .onStart(() => this.parent.region_preview?.setOpacity(0))
                                .onEnd(() => this.parent.region_preview?.setOpacity(this.parent.region_preview.isActive()
                                    ? this.parent.region_preview.active_opacity
                                    : this.parent.region_preview.inactive_opacity))
                                .onCommit(area => {
                                    this.parent.parent.parent.builder.setRegion(this.parent.node.raw, area)
                                })
                        )
                    }
                })
                .appendTo(this)
        }
    }
}


class TreeNodeEdit extends Widget {
    self_content: Widget
    header: Widget
    body: Properties

    you_are_here_marker: Widget

    children: TreeNodeEdit[] = []
    child_content: Widget
    completeness_marker: Widget
    correctness_marker: Widget
    description_input: TemplateStringEdit = null
    region_edit: RegionEdit = null
    path_property: PathProperty = null
    decision_span: Widget = null

    is_collapsed: boolean = false

    region_preview: ScanRegionPolygon = null

    constructor(public parent: TreeEdit, public node: AugmentedScanTreeNode) {
        super()

        this.self_content = c().addClass("ctr-scantreeedit-node")
        this.child_content = c()

        {
            let self = this


            let spot_text = natural_join(shorten_integer_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.builder.tree, c)),
                (n) => `<span class="ctr-digspot-inline">${n}</span>`
            ), "and")

            function get_ar(): string {
                return `assets/nis/${self.is_collapsed ? "arrow_right" : "arrow_down"}.png`
            }

            let collapse_control = c(`<div style='margin-right: 5px; cursor: pointer'><img src='${get_ar()}'></div>`)
                .css("margin-left", `${(node.depth + 1) * 5}px`)
                .tapRaw(r => r.on("click", () => {
                    this.is_collapsed = !this.is_collapsed

                    collapse_control.container.children("img").attr("src", get_ar)

                    this.child_content.setVisible(!this.is_collapsed)
                    this.body.setVisible(!this.is_collapsed)
                }))

            this.you_are_here_marker = c().addClass("ctr-scantreeedit-youarehere")
                .tapRaw(r => r.on("click", () => this.parent.setActiveNode(this.isActive() ? null : this)))

            this.header = c(`<div style="padding-left: 5px; padding-right: 5px; display:flex; overflow: hidden; text-overflow: ellipsis; text-wrap: none; white-space: nowrap; font-weight: bold;"></div>`)
                .append(this.you_are_here_marker)
                .append(collapse_control)
                .append(this.decision_span = c(`<span class='nisl-textlink'></span>`).tooltip("Load decisions into map")
                    .tapRaw(r => r.on("click", () => this.parent.setActiveNode(this.isActive() ? null : this)))
                )
                .append(spacer())
                .append(span(`${node.remaining_candidates.length}`)
                    //.addClass(ScanTree.completeness_meta(node.completeness).cls)
                    .addTippy(c(`<span>${spot_text}</span>`))
                )
        }

        this.body = new Properties()

        this.path_property = this.body.named("Path", new PathProperty({
            target: this.node.path.target,
            start_state: this.node.path.pre_state,
        })
            .setValue(this.node.raw.path))

        if (node.remaining_candidates.length > 1 && (!node.parent || node.parent.key.pulse != 3)) {
            this.region_edit = this.body.named("Region", new RegionEdit(this))
        }

        this.body.named("Direction",
            this.description_input = new TemplateStringEdit({
                resolver: this.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(node)),
                generator: () => {
                    let path_short =
                        this.node.path.steps.length > 0
                            ? this.node.raw.path.map(PathingGraphics.templateString).join(" - ")
                            : "Go"

                    let target = "{{target}}"

                    return path_short + " to " + target
                }
            })
                .onCommit((v) => {
                    this.node.raw.directions = v
                })
                .setValue(this.node.raw.directions)
        )

        this
            .append(this.self_content.append(this.header).append(this.body))
            .append(this.child_content)

        this.renderValue(node)
    }

    renderValue(node: AugmentedScanTreeNode) {
        this.node = node

        this.description_input.setResolver(this.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(node)))

        {
            let decision_path_text = ""

            let parents = AugmentedScanTree.collect_parents(node)

            const LIMIT = 20

            for (let i = parents.length - 1; i >= 0; i--) {
                let next = i > 0
                    ? AugmentedScanTree.decision_string(parents[i])
                    : ""

                if (decision_path_text.length + next.length >= LIMIT && i > 0) {
                    decision_path_text = "..." + decision_path_text
                    break
                } else decision_path_text = "/" + next + decision_path_text
            }

            this.decision_span.text(`${decision_path_text}: `)
        }

        if (this.completeness_marker) this.completeness_marker.remove()
        if (this.correctness_marker) this.correctness_marker.remove()

        function render_completeness(completeness: ScanTree.Augmentation.completeness_t | ScanTree.Augmentation.correctness_t): Widget {
            let {char, cls, desc} = ScanTree.Augmentation.completeness_meta(completeness)

            return c("<span>").addClass(cls).text(char).tooltip(desc)
        }

        this.header
            .append(this.completeness_marker = render_completeness(node.completeness).css("margin-left", "5px"))
            .append(this.correctness_marker = render_completeness(node.correctness).css("margin-left", "5px"))

        this.children.forEach(c => c.detach())

        if (this.region_edit) this.region_edit.render()

        this.path_property.options.target = this.node.path.target
        this.path_property.options.start_state = this.node.path.pre_state
        this.path_property.setValue(this.node.path.raw)

        this.children = this.node.children.map(child => {
            let existing = this.children.find(c => c.node.raw == child.value.raw)

            if (existing) {
                existing.renderValue(child.value)
                return existing
            }

            return new TreeNodeEdit(this.parent, child.value)
        })
            .sort(
                Order.chain<TreeNodeEdit>(
                    Order.reverse(Order.comap(Pulse.comp, (a => a.node.parent.key))),
                    Order.comap(Order.natural_order, (a => {
                        assert(a.node.parent.key.pulse == 3)
                        return ScanTree.spotNumber(a.node.root.raw, a.node.parent.key.spot)
                    }))
                )
            )


        this.children.forEach(c => c.appendTo(this.child_content))
    }

    setActive(v: boolean) {
        this.self_content.toggleClass("active", v)
    }

    isActive(): boolean {
        return this == this.parent.active.value()
    }
}

export default class TreeEdit extends Widget {
    root_widget: TreeNodeEdit = null

    active = observe<TreeNodeEdit>(null)
    active_node = this.active.map(a => a?.node)

    constructor(public parent: ScanEditor, public value: decision_tree) {
        super()

        this.parent.builder.augmented.subscribe(async (tree) => {
            if (tree) {
                if (this.root_widget) this.root_widget.renderValue(tree.root_node)
                else this.root_widget = new TreeNodeEdit(this, tree.root_node).appendTo(this)
            }
        }, true)
    }

    public async getNode(node: AugmentedScanTreeNode): Promise<TreeNodeEdit> {
        let path = ScanTree.Augmentation.AugmentedScanTree.collect_parents(node)

        let edit = await this.root_widget

        for (let i = 1; i < path.length; i++) {
            edit = edit.children.find(c => c.node.raw == path[i].raw)
        }

        return edit
    }

    setActiveNode(node: TreeNodeEdit) {
        if (this.active.value()) this.active.value().setActive(false)
        this.active.set(node)
        if (this.active.value()) this.active.value().setActive(true)

        // TODO: Update preview
        //      - You are here marker
        //      - Errors on map?
    }
}
