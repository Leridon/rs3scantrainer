import Widget from "lib/ui/Widget";
import ScanEditPanel from "./ScanEditPanel";
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
import {observe} from "lib/properties/Observable";
import LightButton from "../widgets/LightButton";
import {TileRectangle} from "lib/runescape/coordinates/TileRectangle";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {scan_tree_template_resolvers} from "../solving/scans/ScanSolving";
import {ActiveOpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {Layer} from "leaflet";
import GameMapDragAction from "lib/gamemap/interaction/GameMapDragAction";

class DrawRegionAction extends GameMapDragAction {
    constructor(options: {
        existing_preview: ActiveOpacityGroup,
        preview_rendering: (area: TileRectangle) => Layer
    }) {
        super({
            preview_render: options.preview_rendering
        });

        this.area.subscribe(({area, committed}) => {
            if (committed) {
                if (options.existing_preview) options.existing_preview
                    .setOpacity(options.existing_preview.isActive()
                        ? options.existing_preview.active_opacity
                        : options.existing_preview.inactive_opacity)
            } else if (area) {
                if (options.existing_preview) options.existing_preview.setOpacity(0)
            }
        })
    }
}

class RegionEdit extends Widget {
    constructor(public parent: TreeNodeEdit) {
        super($("<div style='display: flex'></div>"));

        this.render()
    }

    async sendChange() {
        await this.parent.parent.cleanTree()
        this.parent.parent.emit("region_changed", this.parent.node)
    }

    public render() {
        this.empty()

        let is_defined = !!this.parent.node.raw.region

        if (is_defined) {
            new TextField()
                .setValue(this.parent.node.raw.region.name)
                .on("hint", (v) => {
                    this.parent.node.raw.region.name = v
                    this.parent.region_preview.setRegion(this.parent.node.raw.region)
                })
                .css("flex-grow", "1")
                .appendTo(this)

            SmallImageButton.new("assets/icons/edit.png")
                .css("margin-left", "2px")
                .on("click", async () => {

                    this.parent.parent.parent.parent.options.map.dragAction.set(new DrawRegionAction({
                        existing_preview: this.parent.region_preview,
                        preview_rendering: area => new ScanRegionPolygon({name: this.parent.node.raw.region.name, area: area})
                    })
                        .onCommit(area => {
                            this.parent.node.raw.region.area = area
                            this.sendChange()
                        })
                    )
                })
                .appendTo(this)

            SmallImageButton.new("assets/icons/regenerate.png")
                .css("margin-left", "2px")
                .on("click", async () => {
                    this.parent.node.raw.region.area = TileRectangle.fromTile(this.parent.node.path.post_state?.position?.tile)
                    this.sendChange()
                })
                .setEnabled(this.parent.node.path.steps.length > 0 && !!this.parent.node.path.post_state?.position?.tile)
                .appendTo(this)

            SmallImageButton.new("assets/icons/delete.png")
                .css("margin-left", "2px")
                .on("click", async () => {
                    this.parent.node.raw.region = null
                    this.sendChange()
                })
                .appendTo(this)
        } else {
            new LightButton("Create")
                .on("click", async () => {
                    if (this.parent.node.path.steps.length > 0 && this.parent.node.path.post_state?.position?.tile) {
                        let area = TileRectangle.fromTile(this.parent.node.path.post_state?.position?.tile)

                        this.parent.node.raw.region = {
                            name: "",
                            area: area
                        }

                        this.sendChange()
                    } else {
                        this.parent.parent.parent.parent.options.map.dragAction.set(new DrawRegionAction({
                            existing_preview: this.parent.region_preview,
                            preview_rendering: area => new ScanRegionPolygon({name: "", area: area}),
                        })
                            .onCommit(area => {
                                this.parent.node.raw.region = {
                                    name: "",
                                    area: area
                                }
                                this.sendChange()
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
    region_edit: RegionEdit = null
    path_property: PathProperty = null

    is_collapsed: boolean = false

    region_preview: ScanRegionPolygon = null

    constructor(public parent: TreeEdit, public node: AugmentedScanTreeNode) {
        super()

        this.self_content = c().addClass("ctr-scantreeedit-node")
        this.child_content = c()

        {
            let self = this

            let decision_path_text = AugmentedScanTree.collect_parents(node).map(n => "/" + AugmentedScanTree.decision_string(n)).join("")
            let spot_text = natural_join(shorten_integer_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.parent.value, c)),
                (n) => `<span class="ctr-digspot-inline">${n}</span>`
            ), "and")

            function get_ar(): string {
                return `assets/nis/${self.is_collapsed ? "arrow_right" : "arrow_down"}.png`
            }

            let collapse_control = c(`<div style='margin-right: 5px; cursor: pointer'><img src='${get_ar()}'></div>`)
                .css("margin-left", `${node.depth * 5}px`)
                .tapRaw(r => r.on("click", () => {
                    this.is_collapsed = !this.is_collapsed

                    collapse_control.container.children("img").attr("src", get_ar)

                    this.child_content.setVisible(!this.is_collapsed)
                    this.body.setVisible(!this.is_collapsed)
                }))

            this.you_are_here_marker = c().addClass("ctr-scantreeedit-youarehere")
                .tapRaw(r => r.on("click", () => {
                    this.parent.setActiveNode(this.isActive() ? null : this)
                }))

            this.header = c(`<div style="padding-left: 5px; padding-right: 5px; display:flex; overflow: hidden; text-overflow: ellipsis; text-wrap: none; white-space: nowrap; font-weight: bold; font-size: 1.2em"></div>`)
                .append(this.you_are_here_marker)
                .append(collapse_control)
                .append(c(`<span class='nisl-textlink' style="flex-grow: 1">${decision_path_text}: </span>`).tooltip("Load decisions into map")
                    .tapRaw(r => r.on("click", () => {
                        this.parent.setActiveNode(this.isActive() ? null : this)
                    }))
                )
                .append(c(`<span>${util.plural(node.remaining_candidates.length, "spot")}</span>`)
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
            new TemplateStringEdit({
                resolver: this.parent.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(node)),
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

        this
            .append(this.self_content.append(this.header).append(this.body))
            .append(this.child_content)

        this.renderValue(node)
    }

    renderValue(node: AugmentedScanTreeNode) {
        this.node = node

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

        this.children.forEach(c => c.appendTo(this.child_content))
    }

    setActive(v: boolean) {
        this.self_content.toggleClass("active", v)
    }

    isActive(): boolean {
        return this == this.parent.active.get()
    }
}

export default class TreeEdit extends Widget<{
    preview_invalid: null,
    region_changed: AugmentedScanTreeNode
}> {
    root_widget: Promise<TreeNodeEdit> = null

    active = observe<TreeNodeEdit>(null)
    active_node = this.active.map(a => a?.node)

    constructor(public parent: ScanEditPanel, public value: decision_tree) {
        super()

        this.renderContent()
    }

    private renderContent() {
        this.root_widget = ScanTree.Augmentation.augment({
            augment_paths: true,
            analyze_completeness: true,
            analyze_correctness: true
        }, this.parent.parent.value)
            .then(augmented => {
                return new TreeNodeEdit(this, augmented.root_node).appendTo(this)
            })
    }

    public async cleanTree() {
        (await this.root_widget).renderValue((await ScanTree.Augmentation.augment({
            augment_paths: true,
            analyze_completeness: true,
            analyze_correctness: true
        }, ScanTree.normalize(this.parent.parent.value))).root_node)

        this.emit("preview_invalid", null)
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
        if (this.active.get()) this.active.get().setActive(false)
        this.active.set(node)
        if (this.active.get()) this.active.get().setActive(true)

        // TODO: Update preview
        //      - You are here marker
        //      - Errors on map?
    }
}
