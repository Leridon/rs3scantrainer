import Widget from "./Widget";

export default abstract class Button extends Widget<{
    "click": null
}> {
    protected constructor() {
        super();

        this.container.on("click", (e) => {
            e.stopPropagation()

            this.emit("click", null)
        })
    }
}