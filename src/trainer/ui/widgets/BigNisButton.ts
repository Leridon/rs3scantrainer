import Button from "../../../lib/ui/controls/Button";

export class BigNisButton extends Button {

    constructor(text: string, style: BigNisButton.Kind) {
        super();

        c().text(text).addClass("content").appendTo(this)
        c().addClass("background").appendTo(this)

        this.addClass("nisl-big-button")

        this.addClass(`nisl-big-button-${style}`)
    }
}

export namespace BigNisButton {
    export type Kind = "confirm" | "cancel" | "neutral"
}