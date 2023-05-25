import {TypedEmitter} from "../../skillbertssolver/eventemitter";
import * as events from "events";

export default class Widget<T extends Record<string, any> = {}> extends TypedEmitter<events>{
    protected constructor(protected container: JQuery) {
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
}