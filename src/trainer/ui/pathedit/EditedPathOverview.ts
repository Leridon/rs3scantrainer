import Widget from "../../../lib/ui/Widget";
import {Observable, observe} from "../../../lib/reactive";
import {Path} from "../../../lib/runescape/pathing";
import MovementStateView from "./MovementStateView";
import {PathSectionControl} from "../neosolving/PathControl";
import {PathEditor} from "./PathEditor";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import Properties from "../widgets/Properties";
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import LightButton from "../widgets/LightButton";
import {EntityNameEdit} from "../widgets/EntityNameEdit";
import TextField from "../../../lib/ui/controls/TextField";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import {arrow} from "../path_graphics";
import {Rectangle, Vector2} from "../../../lib/math";
import InteractionSelect from "./InteractionSelect";
import {direction, PathFinder} from "../../../lib/runescape/movement";
import {ShortcutEdit} from "../shortcut_editing/ShortcutEdit";
import {util} from "../../../lib/util/util";
import {Transportation} from "../../../lib/runescape/transportation";
import {ShortcutViewLayer} from "../shortcut_editing/ShortcutView";
import DirectionSelect from "./DirectionSelect";
import {C} from "../../../lib/ui/constructors";
import vbox = C.vbox;
import hbox = C.hbox;
import span = C.span;
import spacer = C.spacer;
import {SmallImageButton} from "../widgets/SmallImageButton";
import sibut = SmallImageButton.sibut;
import * as assert from "assert";
import index = util.index;
import {PathBuilder2} from "./PathBuilder";
import ContextMenu, {Menu} from "../widgets/ContextMenu";

export class IssueWidget extends Widget {
    constructor(issue: Path.issue) {
        super($(`<div class='ctr-step-issue'><div class="ctr-step-issue-icon"></div> ${issue.message}</div>`).attr("level", issue.level.toString()));
    }
}


/*
class StepEditWidget extends Widget {

    private shortcut_custom_open: boolean = false

    constructor(private parent: EditedPathOverview, public value: PathBuilder2.Step) {
        super()

        this.addClass("step-edit-component")

        value.value().augmented.subscribe(v => {
            if (!v) debugger
            this.render(v)
        }, true)
    }

    private render(value: Path.augmented_step) {
        this.empty()

        if (!value) return

        // Render header
        {
            let bounds = Path.augmented.step_bounds(value)

            hbox(
                hbox(
                    span(`T${value.pre_state.tick}`).addClass('nisl-textlink')
                        .addTippy(new MovementStateView(value.pre_state)),
                    c("<span>&nbsp;-&nbsp;</span>"),
                    c("<span class='nisl-textlink'></span>").text(`T${value.post_state.tick}`)
                        .addTippy(new MovementStateView(value.post_state)),
                    c(`<span>: ${Path.title(value.raw)}</span>`)
                ).css("font-weight", "bold"),
                spacer(),
                sibut("assets/nis/arrow_up.png", () => this.value.move(-1))
                    .tooltip("Move step up").setEnabled(this.value.index.value() != 0),
                sibut("assets/nis/arrow_down.png", () => this.value.move(1))
                    .tooltip("Move step down").setEnabled(this.value.index.value() != this.parent.editor.value.get().length - 1),
                sibut("assets/icons/delete.png", () => this.value.remove()),
                sibut("assets/icons/fullscreen.png", () => {
                    this.parent.editor.game_layer.getMap().fitView(bounds, {maxZoom: 5}
                    )
                }).setEnabled(!!bounds)
            ).addClass("path-step-edit-widget-control-row").appendTo(this)
        }

        let issues = c().addClass("step-edit-issues").appendTo(this)

        value.issues.forEach(i => new IssueWidget(i).appendTo(issues))

        let props = new Properties().css2({
            "padding": "3px"
        }).appendTo(this)

        props.named("Detail",
            new TemplateStringEdit({
                resolver: this.parent.editor.template_resolver,
                generator: null
            })
                .setValue(value.raw.description)
                .onCommit(v => this.value.update(o => o.raw.description = v))
        )

        switch (value.raw.type) {
            case "ability":
                props.named("Action",
                    hbox(
                        span(`${TileCoordinates.toString(value.raw.from)} to ${TileCoordinates.toString(value.raw.to)}`),
                        spacer(),
                        new LightButton("Redraw")
                            .onClick(() => this.parent.editor.redrawAbility(this.value))
                    )
                )

                if (value.raw.ability == "dive" || value.raw.ability == "barge") {
                    props.named(span("Target").css("cursor", "help").tooltip("The entity to target with this ability."), new EntityNameEdit(false)
                        .setValue(value.raw.target)
                        .onCommit(name => {
                            this.value.update(v => {
                                assert(v.raw.type == "ability")

                                v.raw.target = name
                            })
                        })
                    )

                }
                if (value.raw.ability == "dive") {

                    props.named(span("Text").css("cursor", "help").tooltip("(Optional) Strings like 'on top of the flower'."),
                        new TextField()
                            .setValue(value.raw.target_text || "")
                            .onCommit(text => this.value.update(v => {
                                assert(v.raw.type == "ability")

                                v.raw.target_text = text || undefined
                            }))
                    )
                }
                break;
            case "cheat":
                props.named("Target",
                    hbox(
                        span(`${TileCoordinates.toString(value.raw.target)}`),
                        spacer(),
                        new LightButton("Move")
                            .onClick(() => {
                                assert(value.raw.type == "cheat")

                                this.parent.editor.interaction_guard.set(
                                    new SelectTileInteraction({
                                        preview_render: (target) => {
                                            assert(value.raw.type == "cheat")

                                            return arrow(value.raw.assumed_start, value.raw.target)
                                                .setStyle({
                                                    color: "#069334",
                                                    weight: 4,
                                                    dashArray: '10, 10',
                                                })
                                        }
                                    })
                                        .onCommit(new_s => this.value.update(v => {
                                            assert(v.raw.type == "cheat")
                                            v.raw.target = new_s
                                        }))
                                        .onStart(() => this.value.value().associated_preview?.setOpacity(0))
                                        .onEnd(() => this.value.value().associated_preview?.setOpacity(1))
                                    ,
                                )
                            })
                    )
                )

                break
            case "redclick":

                props.named("Where",
                    hbox(
                        span(`${Vector2.toString(value.raw.where)}`),
                        spacer(),
                        new LightButton("Move").onClick(() => this.parent.editor.moveStep(this.value))
                    )
                )

                props.named("Action", new InteractionSelect()
                    .setValue(value.raw.how)
                    .onSelection(how => {
                        this.value.update(v => {
                            assert(v.raw.type == "redclick")
                            v.raw.how = how
                        })
                    })
                )

                props.named(span("Target").css("cursor", "help").tooltip("The name of the entity to target."), new EntityNameEdit(false)
                    .setValue(value.raw.target)
                    .onCommit(name => {
                        this.value.update(v => {
                            assert(v.raw.type == "ability")

                            v.raw.target = name
                        })
                    })
                )

                break
            case "powerburst":
                props.named("Where",
                    hbox(
                        span(`${Vector2.toString(value.raw.where)}`),
                        spacer(),
                        new LightButton("Move").onClick(() => this.parent.editor.moveStep(this.value))
                    )
                )

                break

            case "run":
                props.named("Path",
                    hbox(
                        span(`${PathFinder.pathLength(value.raw.waypoints)} tile path to ${Vector2.toString(index(value.raw.waypoints, -1))}`),
                        spacer(),
                        new LightButton("Edit")
                            .onClick(() => this.parent.editor.redrawAbility(this.value))
                    )
                )

                props.named(span("Text").tooltip("(Optional) Strings like 'on top of the flower'."),
                    new TextField()
                        .setValue(value.raw.to_text || "")
                        .onCommit(text => this.value.update(v => {
                            assert(v.raw.type == "run")

                            v.raw.to_text = text || undefined
                        }))
                )

                break

            case "transport": {
                let body: ShortcutEdit = ShortcutEdit.forSimple(value.raw.internal, this.parent.editor.interaction_guard,
                    v => {
                        this.parent.editor.game_layer.getMap().fitBounds(util.convert_bounds(Rectangle.toBounds(Transportation.bounds(v))), {maxZoom: 5})
                    })

                if (!this.shortcut_custom_open) body.css("display", "none")
                else body.config.associated_preview = new ShortcutViewLayer.ShortcutPolygon(body.config.value).addTo(this.value.value().associated_preview)

                this.append(body)
            }
                break;
            case "orientation":
                props.named("Facing", new DirectionSelect()
                    .setValue(value.raw.direction)
                    .onSelection(dir => {
                        this.value.update(v => {
                            assert(v.raw.type == "orientation")
                            v.raw.direction = dir
                        })
                    })
                )

                break;
            case "teleport":
                props.named(span("Spot").css("cursor", "help").tooltip("The specific target tile."),
                    hbox(
                        span(`${TileCoordinates.toString(value.raw.spot)}`),
                        spacer(),
                        new LightButton("Move").onClick(() => this.parent.editor.moveStep(this.value))
                    )
                )

                break
        }

        // TODO: Fix scroll events passing through
    }
}
*/
export class EditedPathOverview extends Widget {
    steps_container: Widget

    step_rows: EditedPathOverview.Step[] = []
    inbetween_rows: EditedPathOverview.InbetweenSteps[] = []

    constructor(public editor: PathEditor) {
        super();

        this.addClass("path-edit-control")

        this.steps_container = vbox().appendTo(this).css2({
            "max-height": "800px",
            "overflow-y": "auto",
        })
            .addClass("ctr-path-edit-overview")

        editor.value.committed_value.subscribe(value => this.render(value))

        editor.value.cursor_state.subscribe(() => {
            this.inbetween_rows.forEach(r => r.render())
        })
    }

    setDragTarget(index: number) {
        this.inbetween_rows.forEach((row, i) => {
            row.is_dragged_over.set(i == index)
        })
    }

    dropOnTarget() {

    }

    private render(value: PathBuilder2.Value) {
        if (!value) return

        this.step_rows = []
        this.inbetween_rows = []

        this.steps_container.empty()

        for (let i = 0; i <= value.steps.length; ++i) {
            this.inbetween_rows.push(
                new EditedPathOverview.InbetweenSteps(this, value, i).appendTo(this.steps_container)
            )

            if (i < value.steps.length) {
                this.step_rows.push(
                    new EditedPathOverview.Step(this, value.steps[i]).appendTo(this.steps_container)
                )
            }
        }

        if (value.path.issues.length > 0) {
            vbox(
                ...value.path.issues.map(i => new IssueWidget(i))
            ).appendTo(this.steps_container)
        }

        return this
    }
}

export namespace EditedPathOverview {
    import span = C.span;
    import hboxl = C.hboxl;
    import movement_state = Path.movement_state;

    export class InbetweenSteps extends Widget {
        value: movement_state

        is_dragged_over: Observable<boolean> = observe(false)

        constructor(private parent: EditedPathOverview, private va: PathBuilder2.Value, private index: number) {
            super();

            this.value = (this.index == 0) ? this.va.path.pre_state : this.va.path.steps[this.index - 1].post_state

            this.addTippy(new MovementStateView(this.value), {delay: [300, 0]})

            this.addClass("ctr-path-edit-overview-inbetween")

            this.on("click", () => {
                this.va.builder.setCursor(this.index)
            })

            this.on("drop", (event) => {
                event.preventDefault()

                const from = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"))

                this.is_dragged_over.set(false)

                this.va.builder.move(from.step_index, this.index)
            })

            this.on("dragover", (event) => {
                event.preventDefault()

                this.parent.setDragTarget(this.index)

                event.originalEvent.dataTransfer.dropEffect = "move"
            })

            this.on("dragleave", () => {
                this.is_dragged_over.set(false)
            })

            this.is_dragged_over.subscribe(() => this.render())

            this.render()
        }

        render() {
            const state = this.va.builder.cursor_state.value()

            if (!state) return

            this.empty()

            const main_row = hboxl().appendTo(this)

            span(`T${this.value.tick}`)
                .addClass("ctr-path-edit-overview-row-first")
                .addClass('nisl-textlink')
                .appendTo(main_row)

            this.toggleClass("ctr-path-edit-overview-inbetween-dragged-over", this.is_dragged_over.value())

            if (this.is_dragged_over.value()) {
                main_row.append("Drop to move step here")
            } else if (this.index == state.cursor) {
                main_row.append(
                    C.inlineimg("assets/icons/youarehere.png")
                        .css2({
                            "margin-right": "3px",
                        }),
                    "You are here",
                )
            }

            if (this.index == 0 && !state.state.position.direction) {
                main_row.append(new LightButton("Assume starting orientation")
                    .css("margin-left", "5px")
                    .onClick((event) => {
                        const menu: Menu = direction.all.map(d => {
                            return {
                                type: "basic",
                                text: direction.toString(d),
                                handler: () => {
                                    this.va.builder.add(({
                                        type: "orientation",
                                        direction: d
                                    }))
                                }
                            }
                        })

                        new ContextMenu(menu).showFromEvent(event)
                    }))
            }
        }
    }

    export class Step extends Widget {
        constructor(private parent: EditedPathOverview, public value: PathBuilder2.Step) {
            super();

            this.setAttribute("draggable", "true")

            const {icon, content} = PathSectionControl.StepRow.renderStep(value.step.raw)

            this.addClass("ctr-path-edit-overview-step").append(
                hboxl(c("<div>&#x2630;</div>")
                        .addClass("ctr-path-edit-overview-step-grab-indicator")
                        .addClass("ctr-path-edit-overview-row-first")
                    ,
                    icon
                        .css("margin-left", "0")
                    , content,
                    spacer(),
                    c().setInnerHtml("&#x22EE;")
                        .addClass("ctr-clickable")
                        .addClass("ctr-path-edit-overview-step-options")
                        .on("click", (event) => {
                            this.contextMenu(event.originalEvent)
                        })
                ),
                vbox(
                    ...value.step.issues.map(i => new IssueWidget(i))
                ),
            )

            this.on("dblclick", (event) => {
                event.preventDefault()

                this.parent.editor.editStepDetails(value)
            })

            this.on("contextmenu", (event) => {
                event.preventDefault()

                this.contextMenu(event.originalEvent)
            })

            this.on("dragstart", (event) => {
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    step_index: this.value.index
                }))
            })

            this.on("dragover", (event) => {
                event.preventDefault()

                const upper = (event.pageY - this.raw().getBoundingClientRect().top) < this.raw().offsetHeight / 2

                this.parent.setDragTarget(upper ? this.value.index : this.value.index + 1)

                event.originalEvent.dataTransfer.dropEffect = "move"
            })

            this.on("drop", (event) => {
                event.preventDefault()

                const from = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"))

                const upper = (event.pageY - this.raw().getBoundingClientRect().top) < this.raw().offsetHeight / 2

                this.parent.inbetween_rows[this.value.index].is_dragged_over.set(false)
                this.parent.inbetween_rows[this.value.index + 1].is_dragged_over.set(false)

                this.value.parent.move(from.step_index, upper ? this.value.index : this.value.index + 1)
            })
        }

        private contextMenu(event: MouseEvent) {
            new ContextMenu(this.parent.editor.contextMenu(this.value)).showFromEvent2(event)
        }
    }
}