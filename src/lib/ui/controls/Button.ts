import Widget from "../Widget";

export default class Button extends Widget<{
    "click": JQuery.ClickEvent
}> {
    constructor(container: JQuery = $("<div>")) {
        super(container);

        this.addClass("lcss-button")

        this.container.on("click", (e) => {
            e.stopPropagation()

            if (!this.container.hasClass("enabled")) return

            this.emit("click", e)
        })

        this.setEnabled(true)
    }

    setEnabled(value: boolean): this {
        this.toggleClass("enabled", value)
        return this
    }
}