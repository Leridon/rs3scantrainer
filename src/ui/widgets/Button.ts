import Widget from "./Widget";

export default class Button extends Widget<{
    "click": null
}> {
    constructor() {
        super();

        this.addClass("lcss-button")

        this.container.on("click", (e) => {
            e.stopPropagation()

            this.emit("click", null)
        })

        this.setEnabled(true)
    }

    setEnabled(value: boolean): this {
        this.toggleClass("enabled", value)
        return this
    }
}