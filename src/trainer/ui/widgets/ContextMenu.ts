import Widget from "lib/ui/Widget";
import * as tippy from "tippy.js";
import {Vector2} from "lib/math";
import {Ewent, ewent} from "../../../lib/reactive";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import span = C.span;
import spacer = C.spacer;

export type MenuEntry =
    {
        text: string | Widget,
        icon?: string
    } &
    ({
        type: "basic",
        handler: () => any
    } | {
        type: "submenu",
        children: MenuEntry[]
    })

export type Menu = MenuEntry[]

type context_menu = {
    cancelled: Ewent.Real<context_menu>
    closed: Ewent.Real<context_menu>
    option_selected?: boolean

    menu: Menu

    root_page: context_menu_page
}

type context_menu_page = {
    root: context_menu
    parent: context_menu_page | null
    underlying: Menu

    root_widget: Widget
    rows: Widget[]
    tippy_instance: tippy.Instance<tippy.Props>

    highlight: number | null

    open_child: context_menu_page | null
}

namespace open_menu {
    export function init(menu: Menu): context_menu {
        let r: context_menu = {
            cancelled: ewent(),
            closed: ewent(),
            menu: menu,
            root_page: null
        }

        menu.push({
            type: "basic",
            text: "Cancel",
            handler: () => cancel(r)
        })

        r.root_page = render(menu, null, r)

        r.root_page.root_widget.container.on("keydown", (e) => {
            if (e.key == "Escape") {
                e.stopPropagation()
                cancel(r)
            }

            let current = deepest(r)

            if (e.key == "ArrowRight") {
                if (current.highlight != null && current.underlying[current.highlight].type == "submenu") {
                    confirm(current)
                }
            }

            if (e.key == "ArrowLeft") {
                if (current.parent) close(current)

                // TODO: If any sub menu is open, close it
            }

            if (e.key == "ArrowUp") {
                open_menu.highlight(current, current.highlight != null ? (current.highlight - 1 + current.underlying.length) % current.underlying.length : current.underlying.length - 1)
            }

            if (e.key == "ArrowDown") {
                open_menu.highlight(current, current.highlight != null ? (current.highlight + 1) % current.underlying.length : 0)
            }

            if (e.key == "Enter") {
                confirm(current)
            }
        })


        return r
    }

    export function close(menu: context_menu_page): void {
        if (!menu) return

        if (menu.open_child) close(menu.open_child)

        if (menu.tippy_instance) {
            menu.tippy_instance.destroy()
            menu.tippy_instance = null
            menu.root_widget.remove()

            if (menu.parent) menu.parent.open_child = null
            else menu.root.root_page = null
        }
    }

    export function cancel(menu: context_menu): void {
        if (!menu.option_selected) menu.cancelled.trigger(menu)
        menu.closed.trigger(menu)

        close(menu.root_page)
    }

    export function confirm(menu: context_menu_page, i: number = null): void {
        if (i != null && i != menu.highlight) highlight(menu, i)

        if (menu.highlight != null) {
            let e = menu.underlying[menu.highlight]

            if (e.type == "basic") {
                menu.root.option_selected = true
                e.handler()
                cancel(menu.root)
            } else {
                openSubmenu(menu)
                highlight(menu.open_child, 0)
            }
        }
    }

    export function render(menu: Menu, parent: context_menu_page, root: context_menu): context_menu_page {
        let m: context_menu_page = {
            root: root,
            parent: parent,
            underlying: menu,

            root_widget: c().addClass("nisl-context-menu")
                .tapRaw(j => j
                    //.on("click", (e) => e.stopPropagation())
                    .attr("tabindex", "0")),
            rows: null,
            tippy_instance: null,

            highlight: null,
            open_child: null
        }

        if (!parent) c().addClass("nisl-context-menu-header").text("Choose Option").appendTo(m.root_widget)

        let with_icon = menu.some(e => !!e.icon)

        m.rows = menu.map((entry, i) => {
            return hbox(
                with_icon
                    ? c("<div class='nisl-context-menu-entry-icon-container'></div>")
                        .append(entry.icon ? c(`<img src="${entry.icon}">`) : null)
                    : null,
                entry.text,
                spacer().css("min-width", "10px"),
                entry.type == "submenu" ? span("&#x276F;") : null
            ).addClass("nisl-context-menu-entry")
                .tapRaw(r => r
                    .on("click", (e) => {
                        e.stopPropagation()
                        confirm(m, i)
                    })
                    .on("mouseover", () => {
                        highlight(m, i)
                        openSubmenu(m)
                    })
                )
        })

        m.root_widget.append(...m.rows)

        return m
    }

    export function highlight(men: context_menu_page, i: number | null) {
        if (i == men.highlight) return

        if (men.open_child) close(men.open_child)

        if (men.highlight != null) {
            men.rows[men.highlight].toggleClass("nisl-context-menu-entry-selected", false)
            men.highlight = null
        }

        if (i != null) {
            men.rows[i].toggleClass("nisl-context-menu-entry-selected", true)
            men.highlight = i
        }
    }

    export function deepest(menu_root: context_menu): context_menu_page {
        let men = menu_root.root_page

        while (men?.open_child) men = men.open_child
        return men
    }

    export function openSubmenu(men: context_menu_page): void {
        if (men.highlight == null) return
        let e = men.underlying[men.highlight]
        if (e.type != "submenu") return

        close(men.open_child)

        men.open_child = render(e.children, men, men.root)

        show(men.open_child, men.rows[men.highlight].raw(), null)
    }

    export function show(men: context_menu_page, dom_parent: HTMLElement, position: Vector2): void {
        men.tippy_instance =
            tippy.default(dom_parent, {
                placement: 'right-start',
                trigger: 'manual',
                interactive: true,
                arrow: false,
                offset: [0, 0],
                animation: false,
                content: men.root_widget.raw(),
                maxWidth: "none",
                zIndex: 10001
            })

        if (!men.parent) {
            men.tippy_instance.setProps({
                onHidden: () => cancel(men.root),
                onMount: () => men.root.root_page.root_widget.raw().focus(),
            })
        }

        if (position) men.tippy_instance.setProps({
            getReferenceClientRect: () => ({
                width: 0,
                height: 0,
                top: position.y,
                bottom: position.y,
                left: position.x,
                right: position.x,
            }) as ClientRect /* typing of tippy is terrible*/
        })

        men.tippy_instance.show()
    }
}

export default class ContextMenu {
    private openMenuTree: context_menu = null

    constructor(private menu: Menu) {
        if (this.openMenuTree) {
            open_menu.cancel(this.openMenuTree)
            this.openMenuTree = null
        }

        this.openMenuTree = open_menu.init(this.menu)
    }

    showFromEvent(e: JQuery.MouseEventBase): this {
        return this.showFromEvent2(e.originalEvent)
    }

    showFromEvent2(e: MouseEvent): this {
        return this.show(e.target as HTMLElement, {x: e.clientX, y: e.clientY})
    }

    show(target: HTMLElement, position: Vector2): this {
        open_menu.show(this.openMenuTree.root_page, target, position)

        return this
    }

    onCancel(f: () => any): this {
        this.openMenuTree.cancelled.on(f)
        return this
    }

    onClosed(f: () => any): this {
        this.openMenuTree.closed.on(f)
        return this
    }
}