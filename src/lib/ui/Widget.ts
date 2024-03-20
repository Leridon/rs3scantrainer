import * as tippy from 'tippy.js';


export default class Widget<T extends HTMLElement = HTMLElement> {
    public container: JQuery

    constructor(init: JQuery | Widget = $("<div>")) {
        this.init(init)
    }

    protected init(init: JQuery | Widget = $("<div>")): this {
        if (init instanceof Widget) this.container = init.container
        else if (!init) this.container = $("<div>")
        else this.container = init

        return this
    }

    raw(): T {
        return this.container.get()[0] as T
    }

    empty(): this {
        this.container.empty()
        return this
    }

    appendTo(widget: Widget | JQuery): this {
        if (widget instanceof Widget) widget = widget.container

        widget.append(this.container)

        return this
    }

    prependTo(widget: Widget | JQuery): this {
        if (widget instanceof Widget) widget = widget.container

        widget.prepend(this.container)

        return this
    }

    append(...widget: (Widget | JQuery | string)[]): this {
        widget.forEach(w => {
            if (!w) return
            if (w instanceof Widget) w = w.container

            this.container.append(w)
        })

        return this
    }

    prepend(widget: Widget | JQuery): this {
        if (widget instanceof Widget) widget = widget.container

        this.container.prepend(widget)

        return this
    }

    css(key: string, value: string | number): this {
        this.container.css(key, value)

        return this
    }

    css2(properties: JQuery.PlainObject<string | number>): this {
        this.container.css(properties)

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

    detach(): this {
        this.container.detach()
        return this
    }

    addClass(cls: string): this {
        if (cls) this.container.addClass(cls)
        return this
    }

    static wrap(jquery: JQuery | string): Widget {
        if (typeof jquery == "string") jquery = $(jquery)

        return new Widget(jquery)
    }

    text(text: string | number): this {
        this.container.text(text.toString())
        return this
    }

    setVisible(visible: boolean): this {
        if (visible) this.container.show()
        else this.container.hide()

        return this
    }

    toggleClass(cls: string, value: boolean = null): this {
        if (value == null) value = !this.container.hasClass(cls)

        if (value) this.container.addClass(cls)
        else this.container.removeClass(cls)

        return this
    }

    tapRaw(f: (j: JQuery) => any): this {
        f(this.container)

        return this
    }

    addTippy(tooltip: Widget, options: Partial<tippy.Props> = {}): this {
        tippy.default(this.container.get()[0], {
            content: c("<div style='background: rgb(10, 31, 41); border: 2px solid white'></div>").append(tooltip).container.get()[0],
            arrow: true,
            animation: false,
            delay: 0,
            zIndex: 10001,
            ...options,
        })

        return this
    }

    html(): string {
        return this.raw().outerHTML
    }

    setInnerHtml(html: string): this {
        this.container.html(html)
        return this
    }

    on<TType extends string>(
        events: TType,
        handler:
            JQuery.TypeEventHandler<HTMLElement, undefined, HTMLElement, HTMLElement, TType>
            | false,
    ): this {
        this.container.on(events, handler)
        return this
    }

    setAttribute(name: string, value: string = ""): this {
        this.raw().setAttribute(name, value)

        return this
    }
}

declare global {
    function c(s?: string): Widget
}

globalThis.c = (s: string = "<div>") => Widget.wrap(s)
