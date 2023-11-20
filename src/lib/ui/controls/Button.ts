import Widget from "../Widget";
import {ewent, Ewent} from "../../reactive";
import {EwentHandlerPool} from "../../reactive/EwentHandlerPool";

export default class Button extends Widget<{
    "click": JQuery.ClickEvent
}> {
    clicked = ewent<JQuery.ClickEvent>()

    constructor(container: JQuery = $("<div>")) {
        super(container);

        this.addClass("lcss-button")

        this.container.on("click", (e) => {
            e.stopPropagation()

            if (!this.container.hasClass("enabled")) return

            this.clicked.trigger(e)
            this.emit("click", e)
        })

        this.setEnabled(true)
    }

    setEnabled(value: boolean): this {
        this.toggleClass("enabled", value)
        return this
    }

    onClick(handler: (_: JQuery.ClickEvent) => any, pool: EwentHandlerPool = null): this {
        let h = this.clicked.on(handler)
        pool?.bind(h)

        return this
    }
}