import Widget from "../../../lib/ui/Widget";
import {Observable} from "../../../lib/reactive";
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
import {PathFinder} from "../../../lib/runescape/movement";
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

export class IssueWidget extends Widget {
    constructor(issue: Path.issue) {
        super($(`<div class='ctr-step-issue'><div class="ctr-step-issue-icon"></div> ${issue.message}</div>`).attr("level", issue.level.toString()));
    }
}

class StepEditWidget extends Widget {

    private shortcut_custom_open: boolean = false

    constructor(private parent: EditedPathOverview, public value: PathEditor.OValue) {
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

export class EditedPathOverview extends Widget {
    steps_container: Widget
    step_widgets: StepEditWidget[] = []

    issue_container: Widget

    constructor(public editor: PathEditor) {
        super();

        this
            .addClass("path-edit-control")

        this.issue_container = vbox().appendTo(this)

        this.steps_container = vbox().appendTo(this).css2({
            "max-height": "800px",
            "overflow-y": "auto",
        })
            .addClass("ctr-path-edit-overview")

        editor.value.committed_value.subscribe(value => this.render(value))
    }

    private render(value: PathBuilder2.Value) {
        if (!value) return

        {
            this.issue_container.empty()

            for (let issue of value.path.issues) {
                new IssueWidget(issue).appendTo(this.issue_container)
            }
        }

        /*
        let existing: { widget: StepEditWidget, keep: boolean }[] = this.step_widgets.map(w => ({widget: w, keep: false}))

        // Render edit widgets for individual steps
        this.step_widgets = value.steps.map(step => {
            const e = existing.find(e => e.widget.value == step)

            if (e) {
                e.keep = true
                return e.widget
            } else {
                return new StepEditWidget(this, step)
            }
        })

        existing.forEach(e => { if (e.keep) e.widget.detach() })

        this.steps_container.empty()//.append(...this.step_widgets)*/

        this.steps_container.empty()

        for (let i = 0; i <= value.steps.length; ++i) {
            new EditedPathOverview.InbetweenSteps(this, value, i).appendTo(this.steps_container)

            if (i < value.steps.length) new EditedPathOverview.Step(this, value.steps[i]).appendTo(this.steps_container)
        }

        return this
    }
}

export namespace EditedPathOverview {
    import span = C.span;

    export class InbetweenSteps extends Widget {
        constructor(private parent: EditedPathOverview, private va: PathBuilder2.Value, private index: number) {
            super();

            const value = (index == 0) ? va.path.pre_state : va.path.steps[index - 1].post_state

            this.addClass("ctr-path-edit-overview-inbetween")

            span(`T${value.tick}`).addClass('nisl-textlink')
                .css("font-weight", "bold")
                .appendTo(this)

            this.addTippy(new MovementStateView(value))

            this.on("click", () => {

            })
        }
    }

    export class Step extends Widget {
        constructor(private parent: EditedPathOverview, public value: PathBuilder2.Step) {
            super();

            const {icon, content} = PathSectionControl.StepRow.renderStep(value.step.raw)

            this.addClass("ctr-path-edit-overview-step").append(
                icon, content
            )

            this.on("dblclick", () => {

            })

            this.on("click contextmenu", () => {

            })
        }
    }
}