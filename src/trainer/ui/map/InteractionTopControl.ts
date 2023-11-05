import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import Widget from "../../../lib/ui/Widget";

export default class InteractionTopControl extends GameMapControl {
    header_row: Widget = null
    body: Widget = null

    constructor(public _config: {
        name?: String,
        cancel_handler?: () => void
    } = {}) {
        super({
            type: "gapless",
            position: "top-center"
        });

        this.content.addClass("ctr-interaction-control")

        this.header_row = c("<div class='ctr-interaction-control-header'></div>").appendTo(this.content)

        this.renderHeader()
    }

    public setCancelHandler(f: () => void): this{
        this._config.cancel_handler = f
        this.renderHeader()

        return this
    }

    public setName(name: string): this {
        this._config.name = name
        this.renderHeader()

        return this
    }

    private renderHeader() {
        this.header_row.empty()

        this.header_row.append(c().text(`Active interaction: ${this._config.name || "Interaction"}`))
        this.header_row.append(c("<div style='flex-grow: 1; min-width: 20px'>"))

        if (this._config.cancel_handler) {
            this.header_row.append(c("<div class='ctr-interaction-control-header-close'>&times;</div>").tapRaw(r => r.on("click", () => {
                this._config.cancel_handler()
            })))
        }
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
}