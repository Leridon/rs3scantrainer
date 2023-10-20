import Widget from "./Widget";
import * as tippy from "tippy.js";
import {Vector2} from "../../util/math";
import {ExportImport} from "../../util/exportString";

export type MenuEntry = {
    type: "basic",
    text: string,
    handler: () => any
} | {
    type: "submenu",
    text: string,
    children: MenuEntry[]
}

export type Menu = MenuEntry[]

export default class ContextMenu extends Widget {
    instance: tippy.Instance<tippy.Props>

    constructor(menu: Menu) {
        super();

        this.addClass("nisl-context-menu")

        c().addClass("nisl-context-menu-header").text("Choose Option").appendTo(this)

        menu.forEach(o => {
            c().addClass("nisl-context-menu-entry").text(o.text).appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    if (o.type == "basic") {
                        o.handler()
                        this.cancel()
                    }
                }))
        })

        c().text("Cancel")
            .appendTo(this)
            .tapRaw(r => r.on("click", () => this.cancel()))
    }

    show(target: HTMLElement, position: Vector2) {
        if (this.instance) {
            this.instance.destroy()
            this.instance = null
        }

        this.instance = tippy.default(target, {
            content: 'Context menu',
            placement: 'right-start',
            trigger: 'manual',
            interactive: true,
            arrow: false,
            offset: [0, 0],
            animation: false
        })

        this.instance.setProps({
            content: this.raw(),
            getReferenceClientRect: () => ({
                width: 0,
                height: 0,
                top: position.y,
                bottom: position.y,
                left: position.x,
                right: position.x,
            }) as ClientRect /* typing of tippy is terrible*/,
        });

        this.instance.show()
    }

    cancel() {
        this.instance.destroy()
        this.instance = null
    }
}