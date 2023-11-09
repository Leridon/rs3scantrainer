import Button from "lib/ui/controls/Button";

export class SmallImageButton extends Button {
    constructor(container: JQuery = null) {
        super(container)

        if (!container) {
            this.container.addClass("nissmallimagebutton")
            this.append(c("<img>"))
        }
    }

    setEnabled(enabled: boolean): this {
        super.setEnabled(enabled)

        if (enabled) this.container.removeClass("disabled")
        else this.container.addClass("disabled")

        return this
    }

    setIcon(icon: string): this {
        this.container.children("img").attr("src", icon)
        return this
    }

    static new(icon: string) {
        return new SmallImageButton().setIcon(icon)
    }
}

export namespace SmallImageButton {
    export function sibut(icon: string, handler: (e: JQuery.ClickEvent) => any): SmallImageButton {
        let but = SmallImageButton.new(icon)

        if (handler) but.on("click", handler)

        return but
    }
}