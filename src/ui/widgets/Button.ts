import Widget from "./Widget";

export default class Button extends Widget<{
    "click": null
}> {
    constructor() {
        super();

        this.css("cursor", "pointer")

        this.container.on("click", (e) => {
            e.stopPropagation()

            this.emit("click", null)
        })
    }
}