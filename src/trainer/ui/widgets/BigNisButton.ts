import Button from "../../../lib/ui/controls/Button";

export default class BigNisButton extends Button {

    constructor(text: string, style: "confirm" | "cancel" | "neutral") {
        super();

        c().text(text).addClass("content").appendTo(this)
        c().addClass("background").appendTo(this)

        this.addClass("nisl-big-button")

        this.addClass(`nisl-big-button-${style}`)
    }
}