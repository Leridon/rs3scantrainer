import Widget from "./Widget";
import {EntityName} from "../runescape/EntityName";
import Checks from "../../skillbertssolver/typecheck";

export namespace C {

  export type Appendable = Widget | string

  export function create(s: string): Widget {
    return c(s)
  }

  export function hbox(...content: Appendable[]): Widget {
    return create("<div style='display: flex; justify-content: center'></div>").append(...content)
  }

  export function hboxl(...content: Appendable[]): Widget {
    return create("<div style='display: flex'></div>").append(...content)
  }

  export function btnrow(...buttons: Appendable[]): Widget {
    return create("<div style='display: flex' class='ctr-button-container'></div>").append(...buttons)
  }

  export function hboxc(...content: Appendable[]): Widget {
    return create("<div style='display: flex; justify-content: center'></div>").append(...content)
  }

  export function vbox(...content: Appendable[]): Widget {
    return create("<div></div>").append(...content)
  }

  export function centered(...content: Appendable[]): Widget {
    return create("<div style='text-align: center'></div>").append(...content)
  }

  export function spacer(): Widget {
    return create("<div style='flex-grow: 1'></div>")
  }

  export function span(text: string): Widget {
    return create("<span></span>").text(text)
  }

  export function bold(text: string): Widget {
    return create("<span style='font-weight: bold'></span>").setInnerHtml(text)
  }

  export function h(level: 1 | 2 | 3 | 4 | 5, text: string): Widget {
    return create(`<h${level}>${text}</h${level}>`)
  }

  export function img(src: string, alt: string = ""): Widget {
    return create(`<img>`)
      .setAttribute("src", src)
      .setAttribute("alt", alt)
  }

  export function inlineimg(src: string, alt: string = ""): Widget {
    return img(src, alt)
      .addClass("text-icon")
  }

  export function div(
    ...content: (Widget | string)[]
  ) {
    return c().append(...content)
  }

  export function text_link(content: string, handler: () => any): Widget {
    return c("<div class='link'>")
  }

  export function npc(name: string, clickable: boolean = false): Widget {
    return c("<span class='nisl-npc'></span>").toggleClass("ctr-clickable", clickable).text(name)
  }

  export function staticentity(name: string, clickable: boolean = false): Widget {
    if (!name) debugger

    return c("<span class='nisl-entity'></span>").toggleClass("ctr-clickable", clickable).text(name)
  }

  export function entity(entity: EntityName): Widget {
    switch (entity.kind) {
      case "npc":
        return npc(entity.name)
      case "static":
        return staticentity(entity.name)
      case "item":
        return create("<span class='nisl-item'></span>").text(entity.name)
    }
  }

  export function cls(c: string): Widget {
    return C.div().addClass(c)
  }
}