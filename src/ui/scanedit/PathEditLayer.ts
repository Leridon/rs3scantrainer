import * as leaflet from "leaflet";
import {ActiveLayer} from "../map/activeLayer";
import {CustomControl} from "../map/CustomControl";
import {Path, step} from "../../model/pathing";
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

class WarningWidget extends Widget {

    constructor(text: string) {
        super($(`<div class='step-issue-warning'><img src='assets/icons/warning.png' alt="warning"> ${text}</div>`));
    }

}

class StepEditWidget extends Widget<{
    "deleted": step,
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

        this.css("display", "flex")

        {
            let panel = new Widget().css("display", "flex").addClass("col-2").appendTo(this)

            let column = new Widget().css("text-align", "center").appendTo(panel)
            let up = new Button().append($("<img src='assets/nis/arrow_up.png' title='Up'>")).appendTo(column)
                .on("click", () => this.emit("up", this.value.raw))
            new Button().append($("<img src='assets/icons/delete.png' title='Delete'>")).appendTo(column)
                .on("click", () => this.emit("deleted", this.value.raw))
                .css("margin-top", "3px")
                .css("margin-bottom", "3px")
            let down = new Button().append($("<img src='assets/nis/arrow_down.png' title='Down'>")).appendTo(column)
                .on("click", () => this.emit("down", this.value.raw))

            up.setEnabled(this.parent.value.steps.indexOf(this.value.raw) != 0)
            down.setEnabled(this.parent.value.steps.indexOf(this.value.raw) != this.parent.value.steps.length - 1)

            new Widget().append($(`<img src='${this.getIcon()}' style="">`)
                .css({
                    "width": "30px",
                    "height": "30px",
                    "object-fit": "contain",
                    "margin": "3px"
                })).appendTo($("<div style='display: flex; align-items: center'>").appendTo(panel.container))
        }

        let main = new Widget().addClass("col-11").css("text-align", "center").appendTo(this)

        this.value.issues.forEach((i) => new WarningWidget(i).appendTo(main))

        new Widget($("<div>")).text(this.value.raw.type).appendTo(main)

        $("<div>Description:</div>").appendTo(main.container)
        $("<div>Ticks:</div>").appendTo(main.container)
    }
}


class ControlWidget extends Widget {
    private augmented: Path.augmented

    _preview_layer: leaflet.FeatureGroup = null

    step_widgets: Widget
    control: CustomControl

    menu: JQuery

    constructor(private parent: PathEditLayer, public value: Path.raw) {
        super()

        this.control = new CustomControl(this.container)

        this.step_widgets = new Widget().appendTo(this)
        this.menu = $("<div style='display: flex'>").appendTo(this.container)

        new MediumImageButton('assets/icons/surge.png').appendTo(this.menu)
            .on("click", async () => {
                if (this.augmented.ends_up.tile != null && this.augmented.ends_up.direction != null) {
                    let res = await surge2(this.augmented.ends_up)

                    if(res) {
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

                if (this.augmented.ends_up.tile != null && this.augmented.ends_up.direction != null) {
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