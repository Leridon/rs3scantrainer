import Widget from "lib/ui/Widget";
import {C} from "../../../lib/ui/constructors";
import Appendable = C.Appendable;

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

    named<T extends Appendable>(name: Appendable, content: T): T {
        c(`<div class='nisl-property-name'>`).append(name).appendTo(this)
        c(`<div class='nisl-property-content'></div>`).append(content).appendTo(this)

        return content
    }
}