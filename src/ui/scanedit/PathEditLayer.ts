import * as leaflet from "leaflet";
import {CustomControl} from "../map/CustomControl";
import Widget from "../widgets/Widget";
import {DrawAbilityInteraction} from "../map/interactions/DrawAbilityInteraction";
import MediumImageButton from "../widgets/MediumImageButton";
import DrawRunInteraction from "../map/interactions/DrawRunInteraction";
import {createStepGraphics} from "../map/path_graphics";
import {direction, MovementAbilities} from "../../model/movement";
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer, ScanTrainerCommands} from "../../application";
import MapCoordinateEdit from "../widgets/MapCoordinateEdit";
import SelectTileInteraction from "../map/interactions/SelectTileInteraction";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import Collapsible from "../widgets/modals/Collapsible";
import DirectionSelect from "../pathedit/DirectionSelect";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import {GameMapControl} from "../map/map";
import InteractionSelect from "../pathedit/InteractionSelect";
import surge2 = MovementAbilities.surge2;
import escape2 = MovementAbilities.escape2;
import {Path} from "../../model/pathing";
import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import TeleportSelect from "../pathedit/TeleportSelect";
import {Teleports} from "../../model/teleports";
import {teleport_data} from "../../data/teleport_data";
import Checkbox from "../widgets/Checkbox";
import {boxPolygon, tilePolygon} from "../map/polygon_helpers";
import movement_state = Path.movement_state;
import issue = Path.issue;
import MovementStateView from "../pathedit/MovementStateView";
import * as lodash from "lodash"
import SmallImageButton from "../widgets/SmallImageButton";
import {QueryLinks} from "../../query_functions";
import {OpacityGroup} from "../map/layers/OpacityLayer";
import {util} from "../../util/util";

export class IssueWidget extends Widget {
    constructor(issue: issue) {
        super($(`<div class='ctr-step-issue'><div class="ctr-step-issue-icon"></div> ${issue.message}</div>`).attr("level", issue.level.toString()));
    }
}

class StepEditWidget extends Widget<{
    "deleted": Path.step,
    "changed": Path.step,
    "up": Path.step,
    "down": Path.step,
}> {

    constructor(private parent: ControlWidget, private value: Path.augmented_step) {
        super()

        this.addClass("step-edit-component")

        this.on("changed", () => this.updatePreview())
        this.on("deleted", () => this.removePreview())

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
                .setEnabled(this.parent.value.steps.indexOf(this.value.raw) != 0)
                .tooltip("Move step up")
                .on("click", () => this.emit("up", this.value.raw))
            SmallImageButton.new("assets/nis/arrow_down.png").appendTo(control_row)
                .setEnabled(this.parent.value.steps.indexOf(this.value.raw) != this.parent.value.steps.length - 1)
                .tooltip("Move step down")
                .on("click", () => this.emit("down", this.value.raw))

            SmallImageButton.new("assets/icons/delete.png").appendTo(control_row)
                .on("click", () => this.emit("deleted", this.value.raw))

            SmallImageButton.new("assets/icons/fullscreen.png").appendTo(control_row)
                .on("click", () => {
                    this.parent.parent.map.map.fitBounds(util.convert_bounds(Path.step_bounds(this.value)), {maxZoom: 4})
                })
        }

        let issues = c().addClass("step-edit-issues").appendTo(this)

        this.value.issues.forEach((i) => new IssueWidget(i).appendTo(issues))

        let props = new Properties().appendTo(this)

        props.named("Detail",
            new TemplateStringEdit({
                resolver: scantrainer.template_resolver,
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
                props.named("From", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.from))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_ability).from = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("To", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.to))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_ability).to = c
                        this.emit("changed", this.value.raw)
                    })

                props.row(new LightButton("Redraw")
                    .on("click", () => {
                        let s = this.value.raw as Path.step_ability

                        if (this._preview) this._preview.remove()

                        new DrawAbilityInteraction(this.parent.parent.map.getActiveLayer(), s.ability)
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

                props.named("Where", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.where))
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

                props.named("Where", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.where))
                    .on("changed", (c) => {
                        (this.value.raw as (Path.step_powerburst | Path.step_redclick)).where = c
                        this.emit("changed", this.value.raw)
                    })

                break

            case "run":
                props.row(new LightButton("Repath")
                    .on("click", () => {
                        let s = this.value.raw as Path.step_ability

                        if (this._preview) this._preview.remove()

                        new DrawRunInteraction(this.parent.parent.map.getActiveLayer())
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
                break
            case "interaction":

                props.named("Ticks", c("<input type='number' class='nisinput' min='0'>")
                    .tapRaw((c) => c.val((this.value.raw as Path.step_interact).ticks).on("change", () => {
                        (this.value.raw as Path.step_interact).ticks = Number(c.val())
                        this.emit("changed", this.value.raw)
                    }))
                )

                props.named("Where", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.where))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_interact).where = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Ends up", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.ends_up.tile))
                    .on("changed", (c) => {
                        (this.value.raw as Path.step_interact).ends_up.tile = c
                        this.emit("changed", this.value.raw)
                    })

                props.named("Facing", new DirectionSelect()
                    .setValue(this.value.raw.ends_up.direction)
                    .on("selection_changed", v => {
                        (this.value.raw as Path.step_interact).ends_up.direction = v
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
                    props.named("Coordinates", new MapCoordinateEdit(this.parent.parent.map.getActiveLayer(), this.value.raw.spot_override)
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

    render() {

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

class ControlWidget extends Widget<{
    saved: Path.raw,
    closed: null
}> {
    augmented: Path.augmented

    _preview_layer: leaflet.FeatureGroup

    steps_collapsible: Collapsible
    step_widgets: StepEditWidget[] = []

    add_buttons_container: Widget
    issue_container: Widget

    control: CustomControl

    constructor(public parent: PathEditor, public value: Path.raw, private options: {
        save_enabled?: boolean
    } = {}) {
        super()

        this.addClass("path-edit-control")

        this.control = new CustomControl(this.container)

        this.steps_collapsible = new Collapsible().setTitle("Steps").appendTo(this)

        this.steps_collapsible.content_container.css2({
            "max-height": "400px",
            "overflow-y": "auto",
        })

        {
            let controls_collapsible = new Collapsible("Controls").appendTo(this)
            let props = new Properties().appendTo(controls_collapsible.content_container)

            this.issue_container = c()
            this.add_buttons_container = c("<div style='display: flex; flex-wrap: wrap; justify-content: center'>")

            props.row(this.issue_container)
            props.header("Continue with...")
            props.row(this.add_buttons_container)

            let control_container = c("<div class='ctr-button-container'></div>")

            props.row(control_container)


            new LightButton("Save").on("click", () => {
                this.emit("saved", this.value)
            }).setEnabled(this.options.save_enabled).appendTo(control_container)
            new LightButton("Save & Close").on("click", () => {
                this.emit("saved", this.value)
                this.emit("closed", null)
            }).setEnabled(this.options.save_enabled).appendTo(control_container)
            new LightButton("Close").on("click", () => {
                this.emit("closed", null)

            }).appendTo(control_container)
            new LightButton("Show JSON")
                .on("click", () => {
                    ExportStringModal.do(JSON.stringify(this.value, null, 2))
                })
                .appendTo(control_container)
            new LightButton("Export")
                .on("click", () => ExportStringModal.do(Path.export_path(this.value)))
                .appendTo(control_container)
            new LightButton("Import")
                .on("click", async () => {
                    let imported = await ImportStringModal.do((s) => Path.import_path(s))

                    console.log("Imported:")
                    console.log(imported)

                    // Only import target and start_state if it does not exist yet
                    if (!this.value.target) this.value.target = imported.target
                    if (!this.value.start_state) this.value.start_state = imported.start_state
                    this.value.steps = imported.steps

                    await this.render()
                })
                .appendTo(control_container)

            new LightButton("Share")
                .on("click", () => {
                    ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_path, this.value), "Use this link to directly link to this path.")
                })
                .appendTo(control_container)
        }

        this.container.on("click", (e) => e.stopPropagation())

        this.addClass("nis-map-control")

        this.resetPreviewLayer()
    }

    public async render(): Promise<this> {
        this.augmented = await Path.augment(this.value)

        this.resetPreviewLayer()

        this.issue_container.empty()

        for (let issue of this.augmented.issues) {
            new IssueWidget(issue).appendTo(this.issue_container)
        }

        this.step_widgets = []
        this.steps_collapsible.content_container.empty()

        if (this.augmented.steps.length == 0) {
            c("<div style='text-align: center'></div>").appendTo(this.steps_collapsible.content_container)
                .append(c("<span>No steps yet.</span>"))
                .append(c("<span class='nisl-textlink'>&nbsp;Hover to show state.</span>")
                    .addTippy(new MovementStateView(this.augmented.pre_state)))
        }

        // Render add step buttons
        {
            this.add_buttons_container.empty()

            let surge_button = new MediumImageButton('assets/icons/surge.png').appendTo(this.add_buttons_container)
                .on("click", async () => {
                    if (this.augmented.post_state.position?.tile != null && this.augmented.post_state.position?.direction != null) {
                        let res = await surge2(this.augmented.post_state.position)

                        if (res) {
                            this.value.steps.push(Path.auto_describe({
                                type: "ability",
                                ability: "surge",
                                description: "Use {{surge}}",
                                from: this.augmented.post_state.position?.tile,
                                to: res.tile
                            }))

                            await this.render()

                            return
                        }
                    }

                    let interaction = new DrawAbilityInteraction(this.parent.map.getActiveLayer(), "surge")
                    if (this.augmented.post_state.position?.tile) interaction.setStartPosition(this.augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.value.steps.push(Path.auto_describe(s))
                        this.render()
                    })
                    interaction.activate()
                })

            let surge_cooldown = movement_state.surge_cooldown(this.augmented.post_state)

            if (surge_cooldown > 0) {
                surge_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(surge_cooldown + "t"))
            }

            let escape_button = new MediumImageButton('assets/icons/escape.png').appendTo(this.add_buttons_container)
                .on("click", async () => {

                    if (this.augmented.post_state.position?.tile != null && this.augmented.post_state.position?.direction != null) {
                        let res = await escape2(this.augmented.post_state.position)

                        if (res) {
                            this.value.steps.push(Path.auto_describe({
                                type: "ability",
                                ability: "escape",
                                description: "Use {{escape}}",
                                from: this.augmented.post_state.position?.tile,
                                to: res.tile
                            }))

                            await this.render()

                            return
                        }
                    }


                    let interaction = new DrawAbilityInteraction(this.parent.map.getActiveLayer(), "escape")
                    if (this.augmented.post_state.position?.tile) interaction.setStartPosition(this.augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.value.steps.push(Path.auto_describe(s))
                        this.render()
                    })
                    interaction.activate()
                })

            let escape_cooldown = movement_state.escape_cooldown(this.augmented.post_state)

            if (escape_cooldown > 0) {
                escape_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(escape_cooldown + "t"))
            }

            let dive_button = new MediumImageButton('assets/icons/dive.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawAbilityInteraction(this.parent.map.getActiveLayer(), "dive")

                    if (this.augmented.post_state.position?.tile) interaction.setStartPosition(this.augmented.post_state.position?.tile)

                    interaction.events.on("done", (s) => {
                        this.value.steps.push(Path.auto_describe(s))
                        this.render()
                    })
                    interaction.activate()
                })

            let dive_cooldown = movement_state.dive_cooldown(this.augmented.post_state)

            if (dive_cooldown > 0) {
                dive_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(dive_cooldown + "t"))
            }

            let barge_button = new MediumImageButton('assets/icons/barge.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawAbilityInteraction(this.parent.map.getActiveLayer(), "barge")
                    if (this.augmented.post_state.position?.tile) interaction.setStartPosition(this.augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.value.steps.push(Path.auto_describe(s))
                        this.render()
                    })
                    interaction.activate()
                })

            let barge_cooldown = movement_state.barge_cooldown(this.augmented.post_state)

            if (barge_cooldown > 0) {
                barge_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(barge_cooldown + "t"))
            }

            new MediumImageButton('assets/icons/run.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    let interaction = new DrawRunInteraction(this.parent.map.getActiveLayer())
                    if (this.augmented.post_state.position?.tile) interaction.setStartPosition(this.augmented.post_state.position?.tile)
                    interaction.events.on("done", (s) => {
                        this.value.steps.push(Path.auto_describe(s))
                        this.render()
                    })
                    interaction.activate()
                })

            new MediumImageButton('assets/icons/teleports/homeport.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                        this.value.steps.push(Path.auto_describe({
                            description: "Teleport",
                            type: "teleport",
                            id: {
                                group: "home",
                                sub: "lumbridge"
                            }
                        }))

                        this.render()
                    }
                )
            new MediumImageButton('assets/icons/redclick.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    new SelectTileInteraction(this.parent.map.getActiveLayer())
                        .tapEvents((e) => e.on("selected", (t) => {
                            this.value.steps.push(Path.auto_describe({
                                type: "redclick",
                                description: "",
                                where: t,
                                how: "generic"
                            }))

                            this.render()
                        })).activate()
                })

            let accel_button = new MediumImageButton('assets/icons/accel.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    if (this.augmented.post_state.position?.tile) {
                        this.value.steps.push(Path.auto_describe({
                            type: "powerburst",
                            description: "Use a {{icon accel}}",
                            where: this.augmented.post_state.position.tile
                        }))

                        this.render()
                    } else {
                        new SelectTileInteraction(this.parent.map.getActiveLayer())
                            .tapEvents((e) => e.on("selected", (t) => {
                                this.value.steps.push(Path.auto_describe({
                                    type: "powerburst",
                                    description: "Use a {{icon accel}}",
                                    where: t
                                }))

                                this.render()
                            })).activate()
                    }
                })

            let accel_cooldown = Math.max(this.augmented.post_state.acceleration_activation_tick + 120 - this.augmented.post_state.tick, 0)

            if (accel_cooldown > 0) {
                accel_button.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(accel_cooldown + "t"))
            }

            new MediumImageButton('assets/icons/shortcut.png').appendTo(this.add_buttons_container)
                .on("click", () => {

                    new SelectTileInteraction(this.parent.map.getActiveLayer())
                        .tapEvents((e) => e.on("selected", (t) => {
                            this.value.steps.push(Path.auto_describe({
                                type: "interaction",
                                ticks: 1,
                                description: "",
                                where: t,
                                ends_up: {
                                    direction: null,
                                    tile: {x: 0, y: 0, level: 0}
                                },
                                how: "generic"
                            }))

                            this.render()
                        })).activate()
                })

            new MediumImageButton('assets/icons/compass.png').appendTo(this.add_buttons_container)
                .on("click", () => {
                    this.value.steps.push(Path.auto_describe({
                        type: "orientation",
                        description: `Face ${direction.toString(1)}`,
                        direction: 1
                    }))

                    this.render()
                })

            new MediumImageButton('assets/icons/regenerate.png').appendTo(this.add_buttons_container)
                .tooltip("Autocomplete - Hopefully coming soon")
                .setEnabled(false)
        }

        // Render edit widgets for indiviual steps
        for (let step of this.augmented.steps) {
            this.step_widgets.push(
                new StepEditWidget(this, step).appendTo(this.steps_collapsible.content_container)
                    .on("deleted", (step) => {
                        this.value.steps.splice(this.value.steps.indexOf(step), 1)
                        this.render()
                    })
                    .on("up", (step) => {
                        let index = this.value.steps.indexOf(step)
                        let to_index = Math.max(0, index - 1)

                        if (index != to_index) {
                            this.value.steps.splice(to_index, 0, this.value.steps.splice(index, 1)[0])
                            this.render()
                        }
                    })
                    .on("down", (step) => {
                        let index = this.value.steps.indexOf(step)
                        let to_index = Math.min(this.value.steps.length - 1, index + 1)

                        if (index != to_index) {
                            this.value.steps.splice(to_index, 0, this.value.steps.splice(index, 1)[0])
                            this.render()
                        }
                    })
                    .on("changed", () => this.render())
            )
        }

        if (this.value.target) boxPolygon(this.value.target)
            .setStyle({
                color: "yellow"
            })
            .addTo(this._preview_layer)

        if (this.value?.start_state?.position?.tile) tilePolygon(this.value.start_state.position.tile)
            .setStyle({
                color: "red"
            })
            .addTo(this._preview_layer)

        this.augmented.post_state?.position?.tile

        if (this.augmented.post_state?.position?.tile) tilePolygon(this.augmented.post_state.position.tile)
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
        this._preview_layer = leaflet.featureGroup().addTo(this.parent.map.map)
    }
}

export class PathEditor extends TypedEmitter<{
    "active_changed": boolean
}> {
    control: ControlWidget
    current_options: PathEditor.options_t = null

    constructor(public map: GameMapControl) {
        super()
        this.control = null
    }

    public async load(path: Path.raw, options: PathEditor.options_t = {}) {
        let before = this.current_options != null

        await this.reset()

        this.current_options = options

        if (!before) await this.emitAsync("active_changed", true)

        // TODO: Is the save/load feature really necessary? Or can it auto save each change?
        //       Possibly toggleable depending on what kind of method is edited
        this.control = await new ControlWidget(this, lodash.cloneDeep(path), {
            save_enabled: options.save_handler != null
        })
            .on("saved", async (v) => await options.save_handler(v))
            .on("closed", async () => {
                await this.reset()
                await this.emitAsync("active_changed", false)
            }).render()

        this.map.map.addControl(this.control.control.setPosition("topleft"))

        this.map.map.fitBounds(util.convert_bounds(Path.path_bounds(this.control.augmented)).pad(0.1), {maxZoom: 4})
    }

    public async reset() {
        if (this.control) {
            this.control.resetPreviewLayer()
            this.control.remove()
            this.control = null
        }

        if (this.current_options) {
            if (this.current_options.close_handler) await this.current_options.close_handler()
            this.current_options = null
        }
    }
}

namespace PathEditor {
    export type options_t = {
        save_handler?: (p: Path.raw) => any,
        close_handler?: () => any
    }
}

/*

export default class PathEditLayer extends leaflet.FeatureGroup {
    control: ControlWidget

    constructor(public parent: ActiveLayer, value: Path.raw) {
        super()

        this.control = new ControlWidget(this, value)

        this.parent.addControl(this.control.control.setPosition("topleft"))
    }
}*/