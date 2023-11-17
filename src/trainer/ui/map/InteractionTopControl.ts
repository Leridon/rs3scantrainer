import {GameMapControl} from "lib/gamemap/GameMapControl";
import Widget from "lib/ui/Widget";
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";
import ControlWithHeader from "./ControlWithHeader";

export default class InteractionTopControl extends GameMapControl<ControlWithHeader> {
    header_row: Widget = null
    body: Widget = null

    constructor(public _config: {
        name?: String,
        cancel_handler?: () => void
    } = {}) {
        super({
            type: "gapless",
            position: "top-center"
        }, new ControlWithHeader(`Active interaction: ${_config.name || "Interaction"}`, _config.cancel_handler));

        this.content.addClass("ctr-interaction-control")

        this.header_row = c("<div class='ctr-interaction-control-header'></div>").appendTo(this.content)
    }

    public setCancelHandler(f: () => void): this {
        this.content.header.close_handler.set(f)

        return this
    }

    public setName(name: string): this {
        this.content.header.name.set(name)

        return this
    }

    setContent(widget: Widget): this {
        if (this.body) {
            this.body.remove()
            this.body = null
        }

        if (widget) {
            widget.appendTo(this.content)
            this.body = widget
        }

        return this
    }

    setText(text: string): this {
        return this.setContent(c().text(text))
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        if (this._config.cancel_handler) {
            event.onPre(() => {
                if (event.original.key == "Escape") {
                    event.stopAllPropagation()
                    this._config.cancel_handler()
                }
            })
        }
    }
}