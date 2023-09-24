import Widget from "./Widget";

export default class ContextMenu<T> extends Widget<{
    "selected": T,
    "cancelled": null,
}> {
    constructor(options: {
        value: T,
        widget: Widget
    }[], cancellable: boolean = true) {
        super();

        this.addClass("nisl-context-menu")

        options.forEach(o => {
            o.widget.appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    this.emit("selected", o.value)
                }))
        })

        if(cancellable) {
            c().text("Cancel")
                .appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    this.emit("cancelled", null)
                }))
        }
    }
}