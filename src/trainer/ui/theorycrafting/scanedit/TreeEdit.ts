import Widget from "../../../../lib/ui/Widget";
import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import decision_tree = ScanTree.ScanTreeNode;
import {util} from "../../../../lib/util/util";
import Properties from "../../widgets/Properties";
import natural_join = util.natural_join;
import TemplateStringEdit from "../../widgets/TemplateStringEdit";
import PathProperty from "../../pathedit/PathProperty";
import shorten_integer_list = util.shorten_integer_list;
import {PathingGraphics} from "../../path_graphics";
import TextField from "../../../../lib/ui/controls/TextField";
import {SmallImageButton} from "../../widgets/SmallImageButton";
import {ScanRegionPolygon} from "../../neosolving/ScanLayer";
import LightButton from "../../widgets/LightButton";
import {TileRectangle} from "../../../../lib/runescape/coordinates/TileRectangle";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import {scan_tree_template_resolvers} from "../../solving/scans/ScanSolving";
import GameMapDragAction from "../../../../lib/gamemap/interaction/GameMapDragAction";
import {observe} from "../../../../lib/reactive";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import ScanRegion = ScanTree.ScanRegion;
import InteractionTopControl from "../../map/InteractionTopControl";
import {C} from "../../../../lib/ui/constructors";
import span = C.span;
import spacer = C.spacer;
import {Scans} from "../../../../lib/runescape/clues/scans";
import Pulse = Scans.Pulse;
import * as assert from "assert";
import Order = util.Order;
import ScanEditor from "./ScanEditor";
import {timeSync} from "../../../../lib/gamemap/GameLayer";
import hbox = C.hbox;
import vbox = C.vbox;
import ContextMenu, {MenuEntry} from "../../widgets/ContextMenu";
import {FormModal} from "../../../../lib/ui/controls/FormModal";
import {BigNisButton} from "../../widgets/BigNisButton";
import TextArea from "../../../../lib/ui/controls/TextArea";
import AbstractEditWidget from "../../widgets/AbstractEditWidget";
import TemplateResolver from "../../../../lib/util/TemplateResolver";
import hboxl = C.hboxl;
import {ConfirmationModal} from "../../widgets/modals/ConfirmationModal";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {identity} from "lodash";
import {Path} from "../../../../lib/runescape/pathing";
import {IssueWidget} from "../../pathedit/EditedPathOverview";

export class DrawRegionAction extends ValueInteraction<ScanRegion> {
    constructor(name: string) {
        super({
            preview_render: region => new ScanRegionPolygon(region)
        });

        new GameMapDragAction({})
            .addTo(this)
            .onPreview((area) => {
                this.preview({area: TileArea.fromRect(area), name: name})
            })
            .onCommit((area) => {
                this.commit({area: TileArea.fromRect(area), name: name})
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
                    /*this.parent.parent.parent.builder.setRegion(this.parent.node.raw, {
                        name: this.parent.node.region?.name || "",
                        area: TileRectangle.fromTile(this.parent.node.path.post_state?.position?.tile)
                    })*/
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

                        /*this.parent.parent.parent.builder.setRegion(this.parent.node.raw, {
                            name: "",
                            area: area
                        })*/
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

    instruction_preview: Widget
    timing_box: Widget

    you_are_here_marker: Widget

    children: TreeNodeEdit[] = []
    child_content: Widget
    completeness_container: Widget
    description_input: TemplateStringEdit = null
    region_edit: RegionEdit = null
    path_property: PathProperty = null
    decision_span: Widget = null

    is_collapsed: boolean = false

    region_preview: ScanRegionPolygon = null

    constructor(public parent: TreeEdit, public node: AugmentedScanTreeNode) {
        super()

        this.self_content = hbox().addClass("ctr-scantreeedit-node")


        this.child_content = c()

        const collapse_bar =
            hbox(
                c().css("background-color", ["blue", "purple", "green"][node.depth % 3])
                    .css("width", "3px")
            ).css2({
                "padding-left": `${node.depth * 7}px`,
                "padding-right": "4px",
            })
                .tooltip("Click to collapse/expand")
                .on("click", (e) => {
                    e.stopPropagation()
                    e.preventDefault()

                    this.toggleCollapse()
                })

        let spot_text = natural_join(shorten_integer_list(node.remaining_candidates.map((c) => ScanTree.spotNumber(parent.parent.builder.tree, c)),
            (n) => `<span class="ctr-digspot-inline">${n}</span>`
        ), "and")

        this.header = c()
            .addClass("ctr-scantreeedit-node-header")
            .append(
                this.decision_span = c().addClass("ctr-scantreeedit-node-path")
                    .on("click", () => this.parent.requestActivation(this.isActive() ? null : this)),
                this.you_are_here_marker = c().addClass("ctr-scantreeedit-youarehere"),
                spacer(),
                span(`${node.remaining_candidates.length}`)
                    .addTippy(c(`<span>${spot_text}</span>`)),
                this.completeness_container = hbox(),
                c().setInnerHtml("&#x22EE;")
                    .addClass("ctr-path-edit-overview-step-options")
                    .on("click", (event) => {
                        this.contextMenu(event.originalEvent)
                    })
            )

        this.body = new Properties()

        this.body.row(this.instruction_preview = c(),)
        this.body.named("Timing", this.timing_box = hboxl())

        if (node.remaining_candidates.length > 1 && (!node.parent || node.parent.key.pulse != 3)) {
            // this.region_edit = this.body.named("Region", new RegionEdit(this))
        }

        this.append(
            this.self_content = hbox().addClass("ctr-scantreeedit-node").append(
                collapse_bar,
                vbox(this.header, this.body).css("flex-grow", "1")
                    .on("click", (e) => {
                        e.stopPropagation()
                        e.preventDefault()

                        this.parent.requestActivation(this.isActive() ? null : this)
                    })
            ),
            this.child_content
        )

        this.self_content.on("contextmenu", e => this.contextMenu(e.originalEvent))

        this.renderValue(node)
    }

    private toggleCollapse() {
        this.is_collapsed = !this.is_collapsed

        this.child_content.setVisible(!this.is_collapsed)
        this.body.setVisible(!this.is_collapsed)
    }

    contextMenu(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        const entries: MenuEntry[] = [
            {
                type: "basic",
                text: this.is_collapsed ? "Expand" : "Collapse",
                handler: () => this.toggleCollapse()
            }, {
                type: "basic",
                text: this.isActive() ? "Deactivate" : "Activate",
                handler: () => {
                    this.parent.requestActivation(this.isActive() ? null : this)
                }
            }, this.node.raw.directions != ""
                ? {
                    type: "submenu",
                    text: "Custom Instructions",
                    children:
                        [{
                            type: "basic",
                            text: "Reset",
                            handler: () => {
                                this.node.raw.directions = ""
                                this.updateInstructionPreview()
                            }
                        }, {
                            type: "basic",
                            text: "Edit",
                            handler: () => {
                                this.editInstructions()
                            }
                        }]
                }
                : {
                    type: "basic",
                    text: "Add custom instructions",
                    handler: () => {
                        this.editInstructions()
                    }
                },
            this.node.remaining_candidates.length <= 1 ? undefined
                : {
                    type: "submenu",
                    text: "Target region",
                    children: [{
                        type: "basic",
                        text: "Edit Name",
                        handler: async () => {
                            const self = this

                            const value = await (new class extends FormModal<string> {
                                constructor() {
                                    super({size: "small"});

                                    this.title.set("Edit region name")

                                    this.shown.on(() => {
                                        this.edit.raw().focus()
                                    })
                                }

                                private edit: AbstractEditWidget<string>

                                getButtons(): BigNisButton[] {
                                    return [
                                        new BigNisButton("Cancel", "cancel").onClick(() => this.cancel()),
                                        new BigNisButton("Save", "confirm").onClick(() => this.confirm(this.edit.get())),
                                    ]
                                }

                                render() {
                                    super.render();

                                    new Properties().appendTo(this.body)
                                        .named("New Name", this.edit = new TextField()
                                            .setValue(self.node.raw.region?.name ?? "")
                                            .appendTo(this.body)
                                        )
                                }

                                protected getValueForCancel(): string {
                                    return undefined
                                }
                            }).do()

                            if (value !== undefined) {
                                this.parent.parent.builder.updateNode(this.node.raw,
                                    n => {
                                        if (!n.region) n.region = {area: null, name: ""}

                                        n.region.name = value
                                    }
                                )
                            }
                        }
                    },
                        !this.node.raw.region?.area ? undefined :
                            {
                                type: "basic",
                                text: "Reset",
                                handler: () => {
                                    this.parent.parent.builder.updateNode(this.node.raw,
                                        n => n.region.area = null
                                    )
                                }
                            },
                        this.node.raw.path.length < 1 ? undefined : {
                            type: "basic",
                            text: "Save Implicit",
                            handler: () => {
                                const implicit = Path.endsUpArea(this.node.raw.path)

                                this.parent.parent.builder.updateNode(this.node.raw,
                                    n => {
                                        if (!n.region) n.region = {area: null, name: ""}
                                        n.region.area = implicit
                                    }
                                )
                            }
                        },
                        {
                            type: "basic",
                            text: "Draw on Map",
                            handler: () => {

                                this.parent.parent.interaction_guard.set(
                                    new DrawRegionAction(this.node.raw.region?.name ?? "")
                                        .onStart(() => this.region_preview?.setOpacity(0))
                                        .onEnd(() => this.region_preview?.setOpacity(this.region_preview.isActive()
                                            ? this.region_preview.active_opacity
                                            : this.region_preview.inactive_opacity))
                                        .onCommit(area => {
                                            this.parent.parent.builder.setRegion(this.node.raw, area)
                                        })
                                )
                            }
                        }
                    ].filter(identity) as MenuEntry[]
                },
            {
                type: "basic",
                text: "Reset node",
                handler: async () => {

                    const really = await (new ConfirmationModal({
                        title: "Reset node",
                        body: "Resetting a node will delete its path, instruction, and all of its children and can not be undone.",
                        options: [
                            {kind: "neutral", text: "Cancel", value: false, is_cancel: true,},
                            {kind: "cancel", text: "Reset Node", value: true}
                        ]
                    })).do()

                    if (really) {
                        if (this.isActive()) this.parent.requestActivation(null)

                        this.parent.parent.builder.updateNode(this.node.raw, n => {
                            n.path = []
                            n.directions = ""
                            n.children = []
                            n.region = undefined
                        })
                    }
                }
            }
        ]


        new ContextMenu({
                type: "submenu",
                text: "",
                children: entries.filter(e => !!e)
            },
        )
            .showFromEvent2(event)
    }

    renderValue(node: AugmentedScanTreeNode) {
        this.node = node

        // this.description_input.setResolver(this.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(node)))

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

        function render_completeness(completeness: ScanTree.Augmentation.completeness_t | ScanTree.Augmentation.correctness_t): Widget {
            let {char, cls, desc} = ScanTree.Augmentation.completeness_meta(completeness)

            return c("<span>").addClass(cls).text(char).tooltip(desc)
        }

        const complete = render_completeness(node.completeness).css("margin-left", "5px")
        const correct = render_completeness(node.correctness).css("margin-left", "5px")

        this.completeness_container.empty()
            .append(complete, correct)

        if (node.path.issues.length > 0) {
            correct.addTippy(vbox(...node.path.issues.map(i => new IssueWidget(i))))
        }

        this.children.forEach(c => c.detach())

        if (this.region_edit) this.region_edit.render()

        this.updateInstructionPreview()

        this.timing_box.empty().append(
            span(`T${this.node.path.pre_state.tick}`).addClass('nisl-textlink'),
            span("&nbsp;to&nbsp;"),
            span(`T${this.node.path.post_state.tick}`).addClass('nisl-textlink'),
        )

        // TODO: Display path issues

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

    private updateInstructionPreview() {
        const resolver = this.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(this.node))

        this.instruction_preview.setInnerHtml(resolver.resolve(ScanTree.getInstruction(this.node)))

    }

    setActive(v: boolean) {
        this.self_content.toggleClass("active", v)
    }

    isActive(): boolean {
        return this == this.parent.active.value()
    }

    private async editInstructions() {
        const self = this

        const value = await (new class extends FormModal<string> {
            constructor() {
                super();

                this.title.set(
                    self.node.raw.directions
                        ? "Add custom directions"
                        : "Edit custom directions"
                )

                this.shown.on(() => {
                    this.edit.raw().focus()
                })
            }

            private edit: AbstractEditWidget<string>

            getButtons(): BigNisButton[] {
                return [
                    new BigNisButton("Cancel", "cancel").onClick(() => this.cancel()),
                    new BigNisButton("Delete", "cancel").onClick(() => this.confirm("")),
                    new BigNisButton("Save", "confirm").onClick(() => this.confirm(this.edit.get())),
                ]
            }

            render() {
                super.render();

                this.edit = (new class extends AbstractEditWidget<string> {
                    resolver: TemplateResolver

                    constructor() {
                        super();

                        this.resolver = self.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(self.node))

                        this.onChange(() => this.renderPreview())
                    }

                    preview_container: Widget

                    instruction_input: Widget = null

                    protected render() {
                        this.empty()

                        this.instruction_input = new TextArea({placeholder: "Enter text"})
                            .setValue(this.get())
                            .onPreview(s => {
                                this.preview(s)
                            })
                            .onCommit(s => {
                                this.commit(s)
                            })
                            .css("height", "40px")

                        this.append(
                            vbox(
                                this.instruction_input,
                                this.preview_container = c(),
                                new LightButton("Load default").onClick(() => this.setValue(ScanTree.defaultScanTreeInstructions(self.node)))
                            ).css2({
                                "display": "flex",
                                "flex-direction": "column"
                            })
                        )

                        this.renderPreview()
                    }

                    private renderPreview() {
                        if (this.preview_container) this.preview_container.container.html(`${this.resolver.resolve(this.get() || "")}`)
                    }
                })
                    .setValue(self.node.raw.directions ?? "")
                    .appendTo(this.body)

                /*
                this.edit = new TemplateStringEdit({
                    fullsize: true,
                    resolver: self.parent.parent.app.template_resolver.with(scan_tree_template_resolvers(self.node)),
                    generator: null
                })
                    .setValue(self.node.raw.directions ?? "")
                    .appendTo(this.body)*/
            }

            protected getValueForCancel(): string {
                return undefined
            }
        }).do()

        if (value !== undefined) {
            this.node.raw.directions = value

            this.updateInstructionPreview()
        }
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
                timeSync("Render tree", () => {
                    if (this.root_widget) {
                        this.root_widget.renderValue(tree.root_node)
                    } else this.root_widget = new TreeNodeEdit(this, tree.root_node).appendTo(this)
                })
            }
        }, true)
    }

    public getNode(node: AugmentedScanTreeNode): TreeNodeEdit {
        let path = ScanTree.Augmentation.AugmentedScanTree.collect_parents(node)

        let edit = this.root_widget

        for (let i = 1; i < path.length; i++) {
            edit = edit.children.find(c => c.node.raw == path[i].raw)
        }

        return edit
    }

    requestActivation(node: TreeNodeEdit) {

        // TODO: Confirm with Path editor ?

        if (this.active.value()) this.active.value().setActive(false)

        this.active.set(node)

        if (this.active.value()) this.active.value().setActive(true)
    }
}
