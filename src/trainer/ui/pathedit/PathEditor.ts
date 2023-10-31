import * as leaflet from "leaflet";
import Widget from "../../../lib/ui/Widget";
import MediumImageButton from "../widgets/MediumImageButton";
import {createStepGraphics} from "../path_graphics";
import {direction, MovementAbilities} from "lib/runescape/movement";
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {ScanTrainerCommands} from "trainer/application";
import MapCoordinateEdit from "../widgets/MapCoordinateEdit";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import Collapsible from "../widgets/modals/Collapsible";
import DirectionSelect from "./DirectionSelect";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import InteractionSelect from "./InteractionSelect";
import {Path} from "lib/runescape/pathing";
import TeleportSelect from "./TeleportSelect";
import {Teleports} from "lib/runescape/teleports";
import {teleport_data} from "data/teleport_data";
import Checkbox from "../../../lib/ui/controls/Checkbox";
import {tilePolygon} from "../polygon_helpers";
import MovementStateView from "./MovementStateView";
import SmallImageButton from "../widgets/SmallImageButton";
import {QueryLinks} from "trainer/query_functions";
import {util} from "../../../lib/util/util";
import {MapRectangle} from "lib/runescape/coordinates";
import movement_state = Path.movement_state;
import issue = Path.issue;
import surge = MovementAbilities.surge;
import escape = MovementAbilities.escape;
import SelectShortcutInteraction from "../scanedit/SelectShortcutInteraction";
import {Observable, observe} from "lib/properties/Observable";
import Behaviour from "../../../lib/ui/Behaviour";
import {Shortcuts} from "lib/runescape/shortcuts";
import {Vector2} from "lib/math/Vector";
import {MenuEntry} from "../widgets/ContextMenu";
import TemplateResolver from "../../../lib/util/TemplateResolver";
import {OpacityGroup} from "lib/gamemap/layers/OpacityLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import GameLayer from "../../../lib/gamemap/GameLayer";
import SelectTileInteraction from "../map/interactions/SelectTileInteraction";
import {DrawAbilityInteraction} from "../map/interactions/DrawAbilityInteraction";
import DrawRunInteraction from "../map/interactions/DrawRunInteraction";
import {GameMap} from "../../../lib/gamemap/GameMap";
import PathEditActionBar from "./PathEditActionBar";

export class IssueWidget extends Widget {
    constructor(issue: issue) {
        super($(`<div class='ctr-step-issue'><div class="ctr-step-issue-icon"></div> ${issue.message}</div>`).attr("level", issue.level.toString()));
    }
}

class StepEditWidget extends Widget<{
    "changed": Path.step,
}> {

    constructor(private parent: ControlWidget, private value: Path.augmented_step) {
        super()

        this.addClass("step-edit-component")

        this.on("changed", () => this.updatePreview())
        // TODO this.on("deleted", () => this.removePreview())

        {
            let control_row = new Widget().addClass("path-step-edit-widget-control-row").appendTo(this)

            let title = c("<div style='font-weight: bold;'></div>").appendTo(control_row)

            c("<span class='nisl-textlink'></span>").text(`T${value.pre_state.tick}`).appendTo(title)
                .addTippy(new MovementStateView(value.pre_state))
            c("<span>&nbsp;-&nbsp;</span>").appendTo(title)
            c("<span class='nisl-textlink'></span>").text(`T${value.post_state.tick}`).appendTo(title)
                .addTippy(new MovementStateView(value.post_state))
            c(`<span>: ${Path.title(value.raw)} </span>`).appendTo(title)

            c().css("flex-grow", "1").appendTo(control_row)

            SmallImageButton.new("assets/nis/arrow_up.png").appendTo(control_row)
                .setEnabled(this.parent.editor.value.get().indexOf(this.value.raw) != 0)
                .tooltip("Move step up")
                .on("click", () => this.parent.editor.value.moveEarlier(this.value.raw))

            SmallImageButton.new("assets/nis/arrow_down.png").appendTo(control_row)
                .setEnabled(this.parent.editor.value.get().indexOf(this.value.raw) != this.parent.editor.value.get().length - 1)
                .tooltip("Move step down")
                .on("click", () => this.parent.editor.value.moveLater(this.value.raw))

            SmallImageButton.new("assets/icons/delete.png").appendTo(control_row)
                .on("click", () => this.parent.editor.value.remove(this.value.raw))

            SmallImageButton.new("assets/icons/fullscreen.png").appendTo(control_row)
                .on("click", () => {
                    this.parent.editor.game_layer.getMap().fitBounds(util.convert_bounds(Path.step_bounds(this.value)), {maxZoom: 4})
                })
        }

        let issues = c().addClass("step-edit-issues").appendTo(this)

        this.value.issues.forEach((i) => new IssueWidget(i).appendTo(issues))

        let props = new Properties().appendTo(this)

        props.named("Detail",
            new TemplateStringEdit({
                resolver: this.parent.editor.template_resolver,
                generator: () => Path.auto_description(this.value.raw) // TODO
            })
                .setValue(value.raw.description)
                .on("changed", (v) => {
                    this.value.raw.description = v
                    this.emit("changed", this.value.raw)
                })
        )

        switch (this.value.raw.type) {
            case "ability":
                props.named("From", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.from))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_ability).from = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("To", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.to))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_ability).to = c
                        this.emit("changed", this.value.raw)
                    })

                props.row(new LightButton("Redraw")
                    .on("click", () => {
                        let s = this.value.raw as Path.step_ability

                        if (this._preview) this._preview.remove()

                        new DrawAbilityInteraction(this.parent.editor.game_layer.getMap().getActiveLayer(), s.ability)
                            .setStartPosition(s.from)
                            .tapEvents((e) => {
                                e
                                    .on("done", (new_s) => {
                                        Object.assign(s, new_s)
                                        this.updatePreview()
                                        this.emit("changed", this.value.raw)
                                    })
                                    .on("cancelled", () => {
                                        this._preview.addTo(this.parent._preview_layer)
                                    })
                            }).activate()
                    })
                )

                break;
            case "redclick":

                props.named("Where", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.where))
                    .on("changed", (c) => {
                        (this.value.raw as (Path.step_powerburst | Path.step_redclick)).where = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Action", new InteractionSelect()
                    .setValue(this.value.raw.how)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_interact).how = v
                        this.emit("changed", this.value.raw)
                    })
                )
                break
            case "powerburst":

                props.named("Where", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.where))
                    .on("changed", (c) => {
                        (this.value.raw as (Path.step_powerburst | Path.step_redclick)).where = c
                        this.emit("changed", this.value.raw)
                    })

                break

            case "run":
                props.row(new LightButton("Repath")
                    .on("click", () => {
                        let s = this.value.raw as Path.step_run

                        if (this._preview) this._preview.remove()

                        new DrawRunInteraction(this.parent.editor.game_layer.getMap().getActiveLayer())
                            .setStartPosition(s.waypoints[0])
                            .tapEvents((e) => {
                                e
                                    .on("done", (new_s) => {
                                        Object.assign(s, new_s)
                                        this.updatePreview()
                                        this.emit("changed", this.value.raw)
                                    })
                                    .on("cancelled", () => {
                                        this._preview.addTo(this.parent._preview_layer)
                                    })
                            }).activate()
                    })
                )
                break
            case "interaction":

                props.named("Ticks", c("<input type='number' class='nisinput' min='0'>")
                    .tapRaw((c) => c.val((this.value.raw as Path.step_interact).ticks).on("change", () => {
                        (this.value.raw as Path.step_interact).ticks = Number(c.val())
                        this.emit("changed", this.value.raw)
                    }))
                )

                props.named("Starts", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.starts))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_interact).starts = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Click", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.where))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_interact).where = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Ends up", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.ends_up))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_interact).ends_up = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Facing", new DirectionSelect()
                    .setValue(this.value.raw.forced_direction)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_interact).forced_direction = v
                        this.emit("changed", this.value.raw)
                    })
                )

                props.named("Action", new InteractionSelect()
                    .setValue(this.value.raw.how)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_interact).how = v
                        this.emit("changed", this.value.raw)
                    })
                )

                break
            case "orientation":
                props.named("Facing", new DirectionSelect()
                    .setValue(this.value.raw.direction)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_orientation).direction = v
                        this.emit("changed", this.value.raw)
                    })
                )

                break
            case "teleport":
                let current = Teleports.find(teleport_data.getAllFlattened(), this.value.raw.id)

                props.named("Teleport", new TeleportSelect().setValue(current)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_teleport).id = v.id
                        this.emit("changed", this.value.raw)
                    }))

                props.named("Override?", new Checkbox()
                    .setValue(this.value.raw.spot_override != null)
                    .on("changed", v => {

                        if (v) (this.value.raw as Path.step_teleport).spot_override = {x: 0, y: 0, level: 0}
                        else (this.value.raw as Path.step_teleport).spot_override = undefined

                        this.emit("changed", this.value.raw)
                    })
                )

                if (this.value.raw.spot_override) {
                    props.named("Coordinates", new MapCoordinateEdit(this.parent.editor.game_layer.getMap().getActiveLayer(), this.value.raw.spot_override)
                        .on("changed", (c) => {
                            (this.value.raw as Path.step_teleport).spot_override = c
                            this.emit("changed", this.value.raw)
                        })
                    )
                }

                break
        }

        // TODO: Fix scroll events passing through
        // TODO: Add analytics
        // TODO: Action select

        this.updatePreview()
    }

    _preview: OpacityGroup = null

    updatePreview() {
        this.removePreview()

        this._preview = createStepGraphics(this.value.raw).addTo(this.parent._preview_layer)
    }

    removePreview() {
        if (this._preview) {
            this._preview.remove()
            this._preview = null
        }
    }
}

class ControlWidget extends GameMapControl {
    _preview_layer: leaflet.FeatureGroup

    steps_collapsible: Collapsible
    step_widgets: StepEditWidget[] = []

    add_buttons_container: Widget
    issue_container: Widget

    constructor(public editor: PathEditor) {
        super({
            position: "left-top",
            type: "floating"
        })

        this.content.addClass("path-edit-control")

        this.steps_collapsible = new Collapsible().setTitle("Steps").appendTo(this.content)

        this.steps_collapsible.content_container.css2({
            "max-height": "400px",
            "overflow-y": "auto",
        })

        {
            let controls_collapsible = new Collapsible("Controls").appendTo(this.content)
            let props = new Properties().appendTo(controls_collapsible.content_container)

            this.issue_container = c()
            this.add_buttons_container = c("<div style='display: flex; flex-wrap: wrap; justify-content: center'>")

            props.row(this.issue_container)
            props.header("Continue with...")
            props.row(this.add_buttons_container)

            let control_container = c("<div class='ctr-button-container'></div>")

            props.row(control_container)

            new LightButton("Commit").on("click", () => {
                this.editor.current_options.commit_handler(this.editor.value.get())
            }).setEnabled(!!this.editor.current_options.commit_handler).appendTo(control_container)

            /*new LightButton("Save & Close").on("click", () => {
                this.emit("saved", this.value)
                this.emit("closed", null)
            }).setEnabled(this.options.save_enabled).appendTo(control_container)*/

            new LightButton("Discard").on("click", () => {
                this.editor.current_options?.discard_handler()
                this.editor.reset()
            }).appendTo(control_container)

            /*new LightButton("Show JSON")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(this.value, null, 2))
                })
                .appendTo(control_container)*/
            new LightButton("Export")
                .on("click", () => ExportStringModal.do(Path.export_path(this.editor.value.get())))
                .appendTo(control_container)
            new LightButton("Import")
                .on("click", async () => {
                    this.editor.value.setAsync(ImportStringModal.do((s) => Path.import_path(s)))
                })
                .appendTo(control_container)

            new LightButton("Share")
                .on("click", () => {
                    ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_path, {
                        steps: this.editor.value.get(),
                        start_state: this.editor.current_options.start_state,
                        target: this.editor.current_options.target,
                    }), "Use this link to directly link to this path.")
                })
                .appendTo(control_container)
        }

        this.content.container.on("click", (e) => e.stopPropagation())

        this.content.addClass("nis-map-control")

        this.resetPreviewLayer()
    }

    public render(augmented: Path.augmented) {
        this.resetPreviewLayer()

        this.issue_container.empty()

        for (let issue of augmented.issues) {
            new IssueWidget(issue).appendTo(this.issue_container)
        }

        this.step_widgets = []
        this.steps_collapsible.content_container.empty()

        if (augmented.steps.length == 0) {
            c("<div style='text-align: center'></div>").appendTo(this.steps_collapsible.content_container)
                .append(c("<span>No steps yet.</span>"))
                .append(c("<span class='nisl-textlink'>&nbsp;Hover to show state.</span>")
                    .addTippy(new MovementStateView(augmented.pre_state)))
        }

        // Render add step buttons
        {
            this.add_buttons_container.empty()

            let surge_button = new MediumImageButton('assets/icons/surge.png').appendTo(this.add_buttons_container)
                .on("click", async () => {
                    if (augmented.post_state.position?.tile != null && augmented.post_state.position?.direction != null) {
                        let res = await surge(augmented.post_state.position)

                        if (res) {
                            this.editor.value.addBack(Path.auto_describe({
                                type: "ability",
                                ability: "surge",
                                description: "Use {{surge}}",
                                from: augmented.post_state.position?.tile,
                                to: res.tile
                            }))

                            return
                        }
                    }

                    let interaction = new DrawAbilityInteraction(this.editor.game_layer.getMap().getActiveLayer(), "surge")
                    if (augmented.post_state.position?.tile) interaction.setStartPosition(augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.editor.value.addBack(Path.auto_describe(s))
                    })
                    interaction.activate()
                })

            let surge_cooldown = movement_state.surge_cooldown(augmented.post_state)

            if (surge_cooldown > 0) {
                surge_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(surge_cooldown + "t"))
            }

            let escape_button = new MediumImageButton('assets/icons/escape.png').appendTo(this.add_buttons_container)
                .on("click", async () => {

                    if (augmented.post_state.position?.tile != null && augmented.post_state.position?.direction != null) {
                        let res = await escape(augmented.post_state.position)

                        if (res) {
                            this.editor.value.addBack(Path.auto_describe({
                                type: "ability",
                                ability: "escape",
                                description: "Use {{escape}}",
                                from: augmented.post_state.position?.tile,
                                to: res.tile
                            }))

                            return
                        }
                    }


                    let interaction = new DrawAbilityInteraction(this.editor.game_layer.getMap().getActiveLayer(), "escape")
                    if (augmented.post_state.position?.tile) interaction.setStartPosition(augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.editor.value.addBack(Path.auto_describe(s))
                    })
                    interaction.activate()
                })

            let escape_cooldown = movement_state.escape_cooldown(augmented.post_state)

            if (escape_cooldown > 0) {
                escape_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(escape_cooldown + "t"))
            }

            let dive_button = new MediumImageButton('assets/icons/dive.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawAbilityInteraction(this.editor.game_layer.getMap().getActiveLayer(), "dive")

                    if (augmented.post_state.position?.tile) interaction.setStartPosition(augmented.post_state.position?.tile)

                    interaction.events.on("done", (s) => {
                        this.editor.value.addBack(Path.auto_describe(s))
                    })
                    interaction.activate()
                })

            let dive_cooldown = movement_state.dive_cooldown(augmented.post_state)

            if (dive_cooldown > 0) {
                dive_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(dive_cooldown + "t"))
            }

            let barge_button = new MediumImageButton('assets/icons/barge.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawAbilityInteraction(this.editor.game_layer.getMap().getActiveLayer(), "barge")
                    if (augmented.post_state.position?.tile) interaction.setStartPosition(augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.editor.value.addBack(Path.auto_describe(s))
                    })
                    interaction.activate()
                })

            let barge_cooldown = movement_state.barge_cooldown(augmented.post_state)

            if (barge_cooldown > 0) {
                barge_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(barge_cooldown + "t"))
            }

            new MediumImageButton('assets/icons/run.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawRunInteraction(this.editor.game_layer.getMap().getActiveLayer())
                    if (augmented.post_state.position?.tile) interaction.setStartPosition(augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.editor.value.addBack(Path.auto_describe(s))
                    })
                    interaction.activate()
                })

            new MediumImageButton('assets/icons/teleports/homeport.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                        this.editor.value.addBack(Path.auto_describe({
                            description: "Teleport",
                            type: "teleport",
                            id: {
                                group: "home",
                                sub: "lumbridge"
                            }
                        }))
                    }
                )
            new MediumImageButton('assets/icons/redclick.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    new SelectTileInteraction(this.editor.game_layer.getMap().getActiveLayer())
                        .tapEvents((e) => e.on("selected", (t) => {
                            this.editor.value.addBack(Path.auto_describe({
                                type: "redclick",
                                description: "",
                                where: t,
                                how: "generic"
                            }))
                        })).activate()
                })

            let accel_button = new MediumImageButton('assets/icons/accel.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    if (augmented.post_state.position?.tile) {
                        this.editor.value.addBack(Path.auto_describe({
                            type: "powerburst",
                            description: "Use a {{icon accel}}",
                            where: augmented.post_state.position.tile
                        }))
                    } else {
                        new SelectTileInteraction(this.editor.game_layer.getMap().getActiveLayer())
                            .tapEvents((e) => e.on("selected", (t) => {
                                this.editor.value.addBack(Path.auto_describe({
                                    type: "powerburst",
                                    description: "Use a {{icon accel}}",
                                    where: t
                                }))
                            })).activate()
                    }
                })

            let accel_cooldown = Math.max(augmented.post_state.acceleration_activation_tick + 120 - augmented.post_state.tick, 0)

            if (accel_cooldown > 0) {
                accel_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(accel_cooldown + "t"))
            }

            new MediumImageButton('assets/icons/shortcut.png').appendTo(this.add_buttons_container)
                .on("click", () => {

                    new SelectShortcutInteraction(this.editor.game_layer.getMap().getActiveLayer(), augmented.post_state.position?.tile)
                        .activate()
                        .tapEvents(e => e.on("selected", (s) => {
                            this.editor.value.addBack(s)
                        }))
                })

            new MediumImageButton('assets/icons/compass.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    this.editor.value.addBack(Path.auto_describe({
                        type: "orientation",
                        description: `Face ${direction.toString(1)}`,
                        direction: 1
                    }))
                })

            new MediumImageButton('assets/icons/regenerate.png').appendTo(this.add_buttons_container)
                .tooltip("Autocomplete - Hopefully coming soon")
                .setEnabled(false)
        }

        // Render edit widgets for indiviual steps
        for (let step of augmented.steps) {
            this.step_widgets.push(
                new StepEditWidget(this, step).appendTo(this.steps_collapsible.content_container)
            )
        }

        /*
        if (this.editor.current_options.target) boxPolygon(this.options.target)
            .setStyle({
                color: "yellow"
            })
            .addTo(this._preview_layer)

        if (this.editor.current_options.start_state?.position?.tile) tilePolygon(this.options.start_state.position.tile)
            .setStyle({
                color: "red"
            })
            .addTo(this._preview_layer)
            */

        augmented.post_state?.position?.tile

        if (augmented.post_state?.position?.tile) tilePolygon(augmented.post_state.position.tile)
            .setStyle({
                color: "orange"
            })
            .addTo(this._preview_layer)

        return this
    }

    removePreviewLayer() {
        if (this._preview_layer) {
            this._preview_layer.remove()
            this._preview_layer = null
        }
    }

    resetPreviewLayer() {
        this.removePreviewLayer()
        this._preview_layer = leaflet.featureGroup().addTo(this.editor.game_layer)
    }
}

class PathEditorGameLayer extends GameLayer {
    constructor(private editor: PathEditor) {
        super();

        Shortcuts.index.forEach(s => {
            leaflet.marker(Vector2.toLatLong(Shortcuts.click.get(s.click, null)), {
                icon: leaflet.icon({
                    iconUrl: Path.InteractionType.meta(s.how).icon_url,
                    iconSize: [28, 31],
                    iconAnchor: [14, 16],
                }),
                interactive: false
            }).addTo(this)
        })
    }

    eventContextMenu(event: GameMapContextMenuEvent) {
        console.log("Event received")

        event.onPost(() => {
            if (this.editor.isActive()) {
                event.add({type: "basic", text: "Run Here", handler: () => { }})
                event.add({type: "basic", text: "Red Click", handler: () => { }})

                let tile = this.editor.value.augmented.get().post_state.position.tile || {x: 0, y: 0, level: 0}

                event.add(...Shortcuts.index
                    .filter(s => Vector2.max_axis(Vector2.sub(Shortcuts.click.get(s.click, null), tile)) < 0.5)
                    .map(s => {
                        return {
                            type: "basic",
                            text: s.name,
                            handler: () => {
                                let starts = Shortcuts.start.get(s.start, tile)

                                this.editor.value.addBack({
                                    type: "interaction",
                                    description: s.name,
                                    ticks: s.ticks,
                                    where: Shortcuts.click.get(s.click, tile),
                                    starts: starts,
                                    ends_up: Shortcuts.movement.get(s.movement, starts),
                                    forced_direction: s.forced_orientation,
                                    how: s.how
                                })
                            },
                        } as MenuEntry
                    })
                )
                // TODO: Shortcuts
            }
        })
    }
}

class PathBuilder extends Observable<Path.raw> {
    public augmented_async: Observable<Promise<Path.augmented>> = observe(null)
    public augmented: Observable<Path.augmented> = observe(null)

    private start_state: movement_state = null
    private target: MapRectangle = null

    constructor() {
        super([]);

        this.subscribe(v => this.augmented_async.set(Path.augment(v, this.start_state, this.target)))
        this.augmented_async.subscribe(v => this.augmented.setAsync(v))
    }

    setMeta(start_state: movement_state, target: MapRectangle) {
        this.start_state = start_state
        this.target = target

        this.augmented.setAsync(Path.augment(this.get(), this.start_state, this.target))
    }

    addBack(step: Path.step): this {
        this.update(p => p.push(step))

        return this
    }

    remove(step: Path.step): this {
        this.update(p => {
            p.splice(p.indexOf(step), 1)
        })

        return this
    }

    moveEarlier(step: Path.step): this {
        let index = this.get().indexOf(step)
        let to_index = Math.max(0, index - 1)

        if (index != to_index) {
            this.update(p => {
                p.splice(to_index, 0, p.splice(index, 1)[0])
            })
        }

        return this
    }

    moveLater(step: Path.step): this {
        let index = this.get().indexOf(step)
        let to_index = Math.min(this.get().length - 1, index + 1)

        if (index != to_index) {
            this.update(p => {
                p.splice(to_index, 0, p.splice(index, 1)[0])
            })
        }

        return this
    }
}

export class PathEditor extends Behaviour {
    private control: ControlWidget = null
    current_options: PathEditor.options_t = null
    private handler_layer: PathEditorGameLayer = null

    value: PathBuilder = new PathBuilder()

    action_bar: PathEditActionBar

    constructor(public game_layer: GameLayer, public template_resolver: TemplateResolver) {
        super()

        this.value.augmented.subscribe(aug => {
            if (this.control) this.control.render(aug)
        })
    }

    public async load(path: Path.raw, options: PathEditor.options_t = {}) {
        this.reset()

        this.current_options = options

        this.handler_layer = new PathEditorGameLayer(this).addTo(this.game_layer)

        this.value.setMeta(options.start_state, options.target)

        this.value.set(path)

        this.control = new ControlWidget(this).addTo(this.handler_layer)
        this.action_bar = new PathEditActionBar().addTo(this.handler_layer)

        this.game_layer.getMap().fitBounds(util.convert_bounds(Path.path_bounds(await this.value.augmented_async.get())).pad(0.1), {maxZoom: 4})
    }

    public reset() {
        if (this.control) {
            this.control.resetPreviewLayer()
            this.control.remove()
            this.control = null
        }

        if (this.handler_layer) {
            this.handler_layer.remove()
            this.handler_layer = null
        }

        if (this.current_options) {
            //if (this.current_options.discard_handler) await this.current_options.discard_handler()
            this.current_options = null
        }
    }

    protected begin() { }

    protected end() {
        this.reset()

        this.game_layer.remove()
    }

    isActive(): boolean {
        return !!this.current_options
    }
}

namespace PathEditor {
    export type options_t = {
        commit_handler?: (p: Path.raw) => any,
        discard_handler?: () => any,
        target?: MapRectangle,
        start_state?: movement_state
    }
}