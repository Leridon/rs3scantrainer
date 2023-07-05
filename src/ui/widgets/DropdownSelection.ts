import Widget from "./Widget";
import {createPopper} from '@popperjs/core';

/* TODO:
    - Styling pass over dropdown
    - Add arrow indicating that it's a dropdown
 */
export class DropdownSelection<T extends object | string | number> extends Widget<{
    "selection_changed": T
}> {
    private input: Widget

    private dropdown: Widget = null
    private dropdown_rows: Widget[] = null
    private highlighted_value: T = null

    private value: T = null

    constructor(private options: DropdownSelection.options<T>, private items: T[]) {
        super($("<div class='nisl-selectdropdown'>"));

        this.value = options.can_be_null ? (options.null_value || null) : items[0]

        this.input = c("<div class='nisl-selectdropdown-input' tabindex='-1'>").appendTo(this)
            .tapRaw((r) => r
                .on("click", (e) => {
                    if (this.dropdown) this.hideDropdown()
                    else this.openDropdown()
                })
            )

        this.addClass("nisl-selectdropdown")
    }

    private construct(v: T): Widget {
        return this.options.type_class?.toHTML
            ? this.options.type_class.toHTML(v)
            : c(`<div>${v}</div>`)
    }

    private setHighlight(v: T) {
        if (!this.dropdown) return

        this.highlighted_value = v

        this.dropdown_rows.forEach(r => {
            r.toggleClass("selected", r.container.data("value") == v)
        })
    }

    hideDropdown() {
        if (this.dropdown) {
            this.dropdown_rows = null
            this.dropdown.remove()
            this.dropdown = null
        }
    }

    openDropdown() {
        if (this.dropdown) return

        this.dropdown = c("<div class='nisl-selectdropdown-options' style='z-index: 9999999999' tabindex='0'>").appendTo(DropdownSelection.getDropdownPane())
            .tapRaw(r => r
                .on("keydown", (e) => {
                    if (e.key == "Enter") this.selectValue(this.highlighted_value)

                    if (e.key == "ArrowDown") {
                        this.setHighlight(this.items[Math.min(this.items.length - 1, this.items.indexOf(this.highlighted_value) + 1)])
                    }

                    if (e.key == "ArrowUp") {
                        this.setHighlight(this.items[Math.max(0, this.items.indexOf(this.highlighted_value) - 1)])
                    }
                })
                .on("focusout blur", (e) => {
                    this.hideDropdown()
                })
            )


        this.dropdown_rows = this.items.map((i) =>
            c(`<div></div>`).appendTo(this.dropdown)
                .append(this.construct(i))
                .tapRaw((r) => r.data("value", i)
                    .on("mouseover", () => this.setHighlight(i))
                    .on("click", () => this.selectValue(i))
                )
        )

        this.setHighlight(this.value)

        let instance = createPopper(this.input.container.get()[0], this.dropdown.container.get()[0], {
            placement: "bottom-start",
            modifiers: [
                {
                    name: 'flip',
                    enabled: false,
                },
                {
                    name: "preventOverflow",
                    enabled: false,
                    options: {
                        boundary: "body",
                        rootBoundary: 'document',
                    }
                },
                {
                    name: 'widthSync', // Custom modifier name
                    enabled: true,
                    phase: 'beforeWrite',
                    fn: ({state}) => {
                        state.styles.popper.width = `${state.rects.reference.width}px`; // Set tooltip width based on reference width
                    },
                },
            ]
        })

        this.dropdown.container.focus() // The deprecation warning here is for a different overload
    }

    setValue(v: T): this {
        this.value = v

        this.setHighlight(v)

        this.hideDropdown()

        this.input.empty().append(this.construct(v))

        return this
    }

    private selectValue(v: T) {
        this.setValue(v)
        this.emit("selection_changed", v)
    }

    private static _dropdownpane: Widget = null

    static getDropdownPane(): Widget {
        if (!this._dropdownpane) this._dropdownpane = c("<div style='position: absolute; top: 0; left: 0; overflow: visible'>").appendTo($("body"))

        return this._dropdownpane
    }

    getSelection(): T {
        return this.value
    }
}

export namespace DropdownSelection {

    export type selectable<T> = {
        toHTML(v: T): Widget
    }

    export type options<T> = {
        can_be_null?: boolean
        null_value?: T
        type_class?: selectable<T>
    }
}