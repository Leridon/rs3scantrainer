import Widget from "./Widget";

export namespace C {
    export function create(s: string): Widget {
        return c(s)
    }

    export function hbox(...content: Widget[]): Widget {
        return create("<div style='display: flex; justify-content: center'></div>").append(...content)
    }

    export function btnrow(...buttons: Widget[]): Widget {
        return create("<div style='display: flex' class='ctr-button-container'></div>").append(...buttons)
    }

    export function hboxc(...content: Widget[]): Widget {
        return create("<div style='display: flex; justify-content: center'></div>").append(...content)
    }

    export function vbox(...content: Widget[]): Widget {
        return create("<div></div>").append(...content)
    }

    export function centered(...content: Widget[]): Widget {
        return create("<div style='text-align: center'></div>").append(...content)
    }

    export function spacer(): Widget {
        return create("<div style='flex-grow: 1'></div>")
    }

    export function span(text: string): Widget {
        return create("<span></span>").setInnerHtml(text)
    }

    export function h(level: 1 | 2 | 3 | 4 | 5, text: string): Widget {
        return create(`<h${level}>${text}</h${level}>`)
    }

    export function div(
        ...content: (Widget | string)[]
    ) {
        return c().append(...content)
    }

    export function text_link(content: string, handler: () => any): Widget {
        return c("<div class='link'>")
    }

    export function npc(name: string): Widget {
        return c("<span class='nisl-npc'></span>").text(name)
    }

    export function entity(name: string): Widget {
        return c("<span class='nisl-entity'></span>").text(name)
    }
}