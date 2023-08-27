import Widget from "./Widget";
import {createPopper} from '@popperjs/core';

export abstract class AbstractDropdownSelection<T extends object | string | number> extends Widget<{
    "selection_changed": T
}> {
    private input: Widget

    protected dropdown: Widget = null
    private dropdown_rows: Widget[] = null
    private highlighted_value: T = null

    private value: T = null

    protected constructor(private options: AbstractDropdownSelection.options<T>, inital_item: T) {
        super($("<div class='nisl-selectdropdown'>"));

        this.value = inital_item

        this.input = this.constructInput().appendTo(this)

        this.setDropdownItems([inital_item])
    }

    protected abstract constructInput(): Widget

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

    _selectableItems: T[] = []

    setDropdownItems(items: T[]) {
        this._selectableItems = items

        if(this.dropdown) {
            this.fillDropdown()

            if (this._selectableItems.find(i => i == this.highlighted_value) != null) {
                this.setHighlight(this._selectableItems[0])
            }
        }
    }

    private fillDropdown() {

        if (this._selectableItems.length == 0 && !this.options.can_be_null) {
            c(`<div class="nisl-selectdropdown-options-none">No options available</div>`).appendTo(this.dropdown)
        }

        this.dropdown_rows = this._selectableItems.map((i) =>
            c(`<div></div>`).appendTo(this.dropdown)
                .append(this.construct(i))
                .tapRaw((r) => r.data("value", i)
                    .on("mouseover", () => this.setHighlight(i))
                    .on("click", () => this.selectValue(i))
                )
        )

        if (this.options.can_be_null) {
            c(`<div></div>`).appendTo(this.dropdown)
                .append(this.construct(null))
                .tapRaw((r) => r.data("value", null)
                    .on("mouseover", () => this.setHighlight(null))
                    .on("click", () => this.selectValue(null))
                )
        }
    }

    openDropdown() {
        if (this.dropdown) return

        this.dropdown = c("<div class='nisl-selectdropdown-options' style='z-index: 9999999999' tabindex='0'>").appendTo(AbstractDropdownSelection.getDropdownPane())
            .tapRaw(r => r
                .on("keydown", (e) => {
                    if (e.key == "Enter") this.selectValue(this.highlighted_value)

                    if (e.key == "ArrowDown") {
                        this.setHighlight(this._selectableItems[Math.min(this._selectableItems.length - 1, this._selectableItems.indexOf(this.highlighted_value) + 1)])
                    }

                    if (e.key == "ArrowUp") {
                        this.setHighlight(this._selectableItems[Math.max(0, this._selectableItems.indexOf(this.highlighted_value) - 1)])
                    }
                })
                .on("focusout blur", (e) => {
                    this.hideDropdown()
                })
            )

        this.fillDropdown()

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

export namespace AbstractDropdownSelection {

    export type selectable<T> = {
        toHTML(v: T): Widget
    }

    export type options<T> = {
        can_be_null?: boolean
        null_value?: T
        type_class?: selectable<T>
    }
}