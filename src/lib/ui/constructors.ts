import Widget from "./Widget";

export namespace C {


    export function create(s: string): Widget {
        return c(s)
    }

    export function hbox(...content: Widget[]): Widget {
        return create("<div style='display: flex'></div>").append(...content)
    }

    export function vbox(...content: Widget[]): Widget {
        return create("<div></div>").append(...content)
    }

    export function span(text: string): Widget {
        return create("<span></span>").text(text)
    }

}