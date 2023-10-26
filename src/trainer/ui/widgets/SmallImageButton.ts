import Widget from "./Widget";

// TODO: Migrate to button class
export default class SmallImageButton extends Widget<{
    "click": SmallImageButton
}> {
    constructor(container: JQuery) {
        super(container)

        container.on("click", () => {
            if (!this.container.hasClass("disabled")) this.emit("click", this)
        })
    }

    setEnabled(enabled: boolean): this {
        if (enabled) this.container.removeClass("disabled")
        else this.container.addClass("disabled")

        return this
    }

    setIcon(icon: string): this {
        this.container.children("img").attr("src", icon)
        return this
    }

    static new(icon: string) {
        let btn = new SmallImageButton($("<div class='nissmallimagebutton'><img></div>"))

        btn.setIcon(icon)

        return btn
    }
}