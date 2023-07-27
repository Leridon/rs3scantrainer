import Widget from "./Widget";

export default class Properties extends Widget {
    constructor() {
        super()

        this.addClass("nisl-properties")
    }

    header(text: string): Widget {
        return c(`<div class='nisl-property-header'>${text}:</div>`).appendTo(this)
    }

    row(content: Widget): this {
        c("<div class='nisl-property-row nisl-property-standalone-row'></div>").append(content).appendTo(this)

        return this
    }

    named<T extends Widget>(name: string, content: T): T {
        let row = $(`<div class='nisl-property-row'><div class='nisl-property-name'>${name}:</div></div>`).appendTo(this.container)

        content.appendTo(c("<div class='nisl-property-content'>").appendTo(row))

        return content
    }
}