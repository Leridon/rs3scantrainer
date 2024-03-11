import Button from "lib/ui/controls/Button";

export default class LightButton extends Button {
    constructor(text: string = "Button", type: "round" | "rectangle" = "round") {
        super()

        if (type == "round") this.addClass("ctr-lightbutton-round")

        this.addClass("ctr-lightbutton").setHTML(text)
    }

    setText(text: string): this {
        this.text(text)
        return this
    }

    setHTML(html: string): this {
        this.container.html(html)
        return this
    }
}