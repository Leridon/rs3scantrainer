import * as leaflet from "leaflet";
import {ActiveLayer} from "../map/activeLayer";
import {CustomControl} from "../map/CustomControl";
import {Path, step, step_ability} from "../../model/pathing";
import Widget from "../widgets/Widget";
import {DrawAbilityInteraction} from "../map/interactions/DrawAbilityInteraction";
import MediumImageButton from "../widgets/MediumImageButton";
import DrawRunInteraction from "../map/interactions/DrawRunInteraction";
import {createStepGraphics} from "../map/path_graphics";
import Button from "../widgets/Button";
import augmented_step = Path.augmented_step;
import {MovementAbilities} from "../../model/movement";
import surge2 = MovementAbilities.surge2;
import escape2 = MovementAbilities.escape2;
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {scantrainer} from "../../application";
import MapCoordinateEdit from "../widgets/MapCoordinateEdit";

class WarningWidget extends Widget {
    constructor(text: string) {
        super($(`<div class='step-issue-warning'><img src='assets/icons/warning.png' alt="warning"> ${text}</div>`));
    }
}

class StepEditWidget extends Widget<{
    "deleted": step,
    "changed": step,
    "up": step,
    "down": step,
}> {

    /*TODO:
     * - Style Icon properly
     * - Make buttons functional.
     * - Add editing for properties
     * - Display warnings
     */

    private getIcon(): string {
        switch (this.value.raw.type) {
            case "run":
                return 'assets/icons/run.png'
            case "ability":
                switch (this.value.raw.ability) {
                    case "surge":
                        return 'assets/icons/surge.png'
                    case "escape":
                        return 'assets/icons/escape.png'
                    case "barge":
                        return 'assets/icons/barge.png'
                    case "dive":
                        return 'assets/icons/dive.png'
                }
                break;
            case "teleport":
                return 'assets/icons/teleports/homeport.png'
            case "interaction":
                return 'assets/icons/shortcut.png'
            case "redclick":
                return 'assets/icons/redclick.png'
            case "powerburst":
                return 'assets/icons/accel.png'
        }
    }

    constructor(private parent: ControlWidget, private value: augmented_step) {
        super()

        this.addClass("step-edit-component")
            .addClass("nisl-properties")

        let title = new Widget($("<div style='text-align: center'></div>"))
            .appendTo(this)
        title.text(`T${value.tick}: ${Path.title(value.raw)}`)

        {
            let control_row = new Widget().addClass("path-step-edit-widget-control-row").appendTo(this)

            let up = new Button().append($("<div><img src='assets/nis/arrow_up.png' title='Up'> Move up</div>")).appendTo(control_row)
                .on("click", () => this.emit("up", this.value.raw))
            let down = new Button().append($("<div><img src='assets/nis/arrow_down.png' title='Down'> Move down</div>")).appendTo(control_row)
                .on("click", () => this.emit("down", this.value.raw))

            new Button().append($("<div><img src='assets/icons/delete.png' title='Delete'> Remove</div>")).appendTo(control_row)
                .on("click", () => this.emit("deleted", this.value.raw))
            up.setEnabled(this.parent.value.steps.indexOf(this.value.raw) != 0)
            down.setEnabled(this.parent.value.steps.indexOf(this.value.raw) != this.parent.value.steps.length - 1)
        }

        this.value.issues.forEach((i) => new WarningWidget(i).appendTo(this))

        $("<div>Description:</div>").appendTo(this.container)
        new TemplateStringEdit(scantrainer.template_resolver, value.raw.description)
            .on("changed", (v) => {
                this.value.raw.description = v
                this.emit("changed", this.value.raw)
            })
            .appendTo(this)


        if (this.value.raw.type == "ability") {
            let from = $("<div class='nisl-property-row'><div class='nisl-property-name'>From: </div></div>").appendTo(this.container)
            new MapCoordinateEdit(this.parent.parent.parent, this.value.raw.from).addClass("nisl-property-content").appendTo(from)
                .on("changed", (c) => {
                    (this.value.raw as step_ability).from = c
                    this.emit("changed", this.value.raw)
                })

            let to = $("<div class='nisl-property-row'><div class='nisl-property-name'>To: </div></div>").appendTo(this.container)
            new MapCoordinateEdit(this.parent.parent.parent, this.value.raw.to).addClass("nisl-property-content").appendTo(to)
                .on("changed", (c) => {
                    (this.value.raw as step_ability).to = c
                    this.emit("changed", this.value.raw)
                })
        }
    }
}


class ControlWidget extends Widget {
    private augmented: Path.augmented

    _preview_layer: leaflet.FeatureGroup = null

    step_widgets: Widget
    control: CustomControl

    menu: JQuery

    constructor(public parent: PathEditLayer, public value: Path.raw) {
        super()

        this.addClass("path-edit-control")

        this.control = new CustomControl(this.container)

        this.step_widgets = new Widget().appendTo(this)
        this.menu = $("<div style='display: flex'>").appendTo(this.container)


        new MediumImageButton('assets/icons/surge.png').appendTo(this.menu)
            .on("click", async () => {
                if (this.augmented.ends_up?.tile != null && this.augmented.ends_up?.direction != null) {
                    let res = await surge2(this.augmented.ends_up)

                    if (res) {
                        this.value.steps.push({
                            type: "ability",
                            ability: "surge",
                            from: this.augmented.ends_up.tile,
                            to: res.tile
                        })

                        await this.update()

                        return
                    }
                }

                let interaction = new DrawAbilityInteraction(this.parent.parent, "surge")
                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)
                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })
        new MediumImageButton('assets/icons/escape.png').appendTo(this.menu)
            .on("click", async () => {

                if (this.augmented.ends_up?.tile != null && this.augmented.ends_up?.direction != null) {
                    let res = await escape2(this.augmented.ends_up)

                    if (res) {
                        this.value.steps.push({
                            type: "ability",
                            ability: "escape",
                            from: this.augmented.ends_up.tile,
                            to: res.tile
                        })

                        await this.update()

                        return
                    }
                }


                let interaction = new DrawAbilityInteraction(this.parent.parent, "escape")
                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)
                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })
        new MediumImageButton('assets/icons/dive.png').appendTo(this.menu)
            .on("click", () => {
                let interaction = new DrawAbilityInteraction(this.parent.parent, "dive")

                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)

                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })
        new MediumImageButton('assets/icons/barge.png').appendTo(this.menu)
            .on("click", () => {
                let interaction = new DrawAbilityInteraction(this.parent.parent, "barge")
                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)
                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })
        new MediumImageButton('assets/icons/run.png').appendTo(this.menu)
            .on("click", () => {
                let interaction = new DrawRunInteraction(this.parent.parent)
                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)
                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })

        new MediumImageButton('assets/icons/teleports/homeport.png').appendTo(this.menu)
        new MediumImageButton('assets/icons/redclick.png').appendTo(this.menu)
        new MediumImageButton('assets/icons/accel.png').appendTo(this.menu)
        new MediumImageButton('assets/icons/shortcut.png').appendTo(this.menu)

        this.container.on("click", (e) => e.stopPropagation())

        this.addClass("nis-map-control")

        this.update()
    }

    async update() {
        this.augmented = await Path.augment(this.value)

        if (this._preview_layer) {
            this._preview_layer.remove()
            this._preview_layer = null
        }

        this.step_widgets.empty()

        this._preview_layer = leaflet.featureGroup()

        for (let step of this.augmented.steps) {
            createStepGraphics(step.raw)?.addTo(this._preview_layer)

            new StepEditWidget(this, step).appendTo(this.step_widgets)
                .on("deleted", (step) => {
                    this.value.steps.splice(this.value.steps.indexOf(step), 1)
                    this.update()
                })
                .on("up", (step) => {
                    let index = this.value.steps.indexOf(step)
                    let to_index = Math.max(0, index - 1)

                    if (index != to_index) {
                        this.value.steps.splice(to_index, 0, this.value.steps.splice(index, 1)[0])
                        this.update()
                    }
                })
                .on("down", (step) => {
                    let index = this.value.steps.indexOf(step)
                    let to_index = Math.min(this.value.steps.length - 1, index + 1)

                    if (index != to_index) {
                        this.value.steps.splice(to_index, 0, this.value.steps.splice(index, 1)[0])
                        this.update()
                    }
                })
        }

        this._preview_layer.addTo(this.parent)
    }
}

export default class PathEditLayer extends leaflet.FeatureGroup {
    control: ControlWidget

    constructor(public parent: ActiveLayer, value: Path.raw) {
        super()

        this.control = new ControlWidget(this, value)

        this.parent.addControl(this.control.control.setPosition("topleft"))
    }
}