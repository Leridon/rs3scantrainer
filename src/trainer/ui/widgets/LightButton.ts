import Button from "lib/ui/controls/Button";

export default class LightButton extends Button {
    constructor(text: string = "Button") {
        super()

        this.addClass("lightbutton").text(text)
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