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

class StepEditWidget extends Widget {

    /*TODO:
     * - Style Icon properly
     * - Make buttons functional.
     * - Add editing for properties
     * - Display warnings
     */

    private getIcon(): string {
        switch (this.value.type) {
            case "run":
                return 'assets/icons/run.png'
            case "ability":
                switch (this.value.ability) {
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

    constructor(private parent: ControlWidget, private value: step) {
        super()

        this.css("display", "flex")

        {
            let panel = new Widget().css("display", "flex").addClass("col-2").appendTo(this)

            let column = new Widget().css("text-align", "center").appendTo(panel)
            new Button().append($("<img src='assets/nis/arrow_up.png'>")).appendTo(column)
            new Button().append($("<img src='assets/icons/delete.png'>")).appendTo(column)
            new Button().append($("<img src='assets/nis/arrow_down.png'>")).appendTo(column)

            new Widget().append($(`<img src='${this.getIcon()}' style="">`)
                .css({
                    "width": "30px",
                    "height": "30px",
                    "object-fit": "contain",
                })).appendTo(panel)
        }

        let main = new Widget().addClass("col-11").css("text-align", "center").appendTo(this)

        new Widget($("<div>")).text(this.value.type).appendTo(main)

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
            .on("click", () => {
                let interaction = new DrawAbilityInteraction(this.parent.parent, "surge")
                if (this.augmented.ends_up) interaction.setStartPosition(this.augmented.ends_up.tile)
                interaction.events.on("done", (s) => {
                    this.value.steps.push(s)
                    this.update()
                })
                interaction.activate()
            })
        new MediumImageButton('assets/icons/escape.png').appendTo(this.menu)
            .on("click", () => {
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

    update() {
        this.augmented = Path.augment(this.value)

        if (this._preview_layer) {
            this._preview_layer.remove()
            this._preview_layer = null
        }

        this.step_widgets.empty()

        this._preview_layer = leaflet.featureGroup()

        for (let step of this.value.steps) {
            createStepGraphics(step)?.addTo(this._preview_layer)

            new StepEditWidget(this, step).appendTo(this.step_widgets)
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