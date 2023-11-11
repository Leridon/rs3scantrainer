import Widget from "lib/ui/Widget";
import * as tippy from "tippy.js";
import {Vector2} from "lib/math";
import {ewent} from "../../../lib/reactive";

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

    private option_selected: boolean = false

    cancelled = ewent()

    constructor(menu: Menu) {
        super();

        this.addClass("nisl-context-menu")

        this.container.on("click", (e) => e.stopPropagation())

        c().addClass("nisl-context-menu-header").text("Choose Option").appendTo(this)

        // TODO: Disable wrapping inside of sensible limits
        // TODO: Allow submenus
        // TODO: Section dividers

        menu.forEach(o => {
            c().addClass("nisl-context-menu-entry").text(o.text).appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    if (o.type == "basic") {
                        this.option_selected = true
                        o.handler()
                        this.cancel()
                    }
                }))
        })

        c().text("Cancel").addClass("nisl-context-menu-entry")
            .appendTo(this)
            .tapRaw(r => r.on("click", () => this.cancel()))
    }

    showFromEvent(e: JQuery.MouseEventBase): this {
        return this.show(e.target, {x: e.originalEvent.clientX, y: e.originalEvent.clientY})
    }

    show(target: HTMLElement, position: Vector2): this {
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
            animation: false,
            onHidden: () => {
                if (!this.option_selected) this.cancelled.trigger(this)
            }
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

        return this
    }

    cancel() {
        this.instance.destroy()
        this.instance = null
    }

    onCancel(f: () => any): this {
        this.cancelled.on(f)
        return this
    }
}