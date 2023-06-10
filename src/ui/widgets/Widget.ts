import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import * as events from "events";

export default class Widget<T extends Record<string, any> = {}> extends TypedEmitter<T> {
    protected constructor(public container: JQuery = $("<div>")) {
        super()
    }

    appendTo(widget: Widget | JQuery): this {
        if (widget instanceof Widget) widget = widget.container

        widget.append(this.container)

        return this
    }

    append(widget: Widget | JQuery): this {
        if (widget instanceof Widget) widget = widget.container

        this.container.append(widget)

        return this
    }
    css(key: string, value: string): this {
        this.container.css(key, value)

        return this
    }

    tooltip(title: string): this {
        this.container.attr("title", title)
        return this
    }

    remove(): this {
        this.container.remove()
        return this
    }

    addClass(cls: string): this {
        this.container.addClass(cls)
        return this
    }

    static wrap(jquery: JQuery): Widget {
        return new Widget(jquery)
    }
}