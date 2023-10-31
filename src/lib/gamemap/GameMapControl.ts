import * as leaflet from "leaflet"
import Widget from "../ui/Widget";
import GameLayer from "./GameLayer";
import {GameMap} from "./GameMap";

export namespace GameMapControl {
    export type position_t =
        "top-center" | "top-left" | "top-right" |
        "bottom-center" | "bottom-left" | "bottom-right" |
        "left-center" | "left-top" | "left-bottom" |
        "right-center" | "right-top" | "right-bottom"

    export type config_t = {
        position: position_t,
        type: "attached" | "floating",
        no_default_styling?: boolean
    }
}

export class GameMapControl extends Widget {
    parent: GameLayer | null = null

    constructor(public options: GameMapControl.config_t, container: JQuery = $("<div>")) {
        super(container)

        if (!options.no_default_styling)
            this.addClass("gamemap-ui-control-default-styling")

        switch (this.options.type) {
            case "attached":
                this.addClass("gamemap-ui-control-gapless")
                break;
            case "floating":
                this.addClass("gamemap-ui-control-floating")
                break;
        }

        // Disable events propagating to the map // TODO: Do I really need this?
        this.container.on("blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize select submit mousewheel", (e) => e.stopPropagation())
    }

    override remove(): this {
        if (this.parent) this.parent.removeControl(this)
        else super.remove()

        return this
    }

    onAdd(map: GameMap) { }

    addTo(layer: GameLayer | GameMap): this {
        layer.addControl(this)

        return this
    }
}

