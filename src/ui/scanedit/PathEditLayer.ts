import * as leaflet from "leaflet";
import {ActiveLayer} from "../map/activeLayer";
import {CustomControl} from "../map/CustomControl";
import {Path} from "../../model/pathing";
import Widget from "../widgets/Widget";
import {DrawDiveInteraction} from "../map/interactions/DrawDiveInteraction";


function btn(icon: string) {
    return $(`<div><img src='${icon}'></div>`)
        .addClass("medium-image-button")
        .on("click", () => {
            console.log("Dive")
        })
}

class ControlWidget extends Widget {
    private augmented: Path.augmented

    control: CustomControl

    menu: JQuery

    constructor(private parent: PathEditLayer, public value: Path.raw) {
        super()

        this.control = new CustomControl(this.container)

        this.menu = $("<div style='display: flex'>").appendTo(this.container)

        btn('assets/icons/surge.png').appendTo(this.menu)
        btn('assets/icons/escape.png').appendTo(this.menu)
        btn('assets/icons/dive.png').appendTo(this.menu)
            .on("click", () => {
                new DrawDiveInteraction(this.parent.parent, null).activate()
            })
        btn('assets/icons/barge.png').appendTo(this.menu)
        btn('assets/icons/run.png').appendTo(this.menu)
        btn('assets/icons/teleports/homeport.png').appendTo(this.menu)
        btn('assets/icons/redclick.png').appendTo(this.menu)
        btn('assets/icons/accel.png').appendTo(this.menu)
        btn('assets/icons/shortcut.png').appendTo(this.menu)

        this.container.on("click", (e) => e.stopPropagation())

        this.addClass("nis-map-control")
    }

    update() {
        this.value.steps.forEach((s) => {
            switch (s.type) {
                case "ability":


            }
        })
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