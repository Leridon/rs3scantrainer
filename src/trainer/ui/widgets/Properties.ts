import Widget from "lib/ui/Widget";
import {C} from "../../../lib/ui/constructors";

export default class Properties extends Widget {
    constructor() {
        super()

        this.addClass("nisl-properties")
    }

    header(text: string | Widget): Widget {
        return c(`<div class='nisl-property-header nisl-property-row'></div>`).append(text).appendTo(this)
    }

    row(content: Widget | string): this {
        c("<div class='nisl-property-row'></div>").append(content).appendTo(this)

        return this
    }

    named<T extends Widget | string>(name: string, content: T): T {
        c(`<div class='nisl-property-name'>${name}</div>`).appendTo(this)
        c(`<div class='nisl-property-content'></div>`).append(content).appendTo(this)

        return content
    }
}