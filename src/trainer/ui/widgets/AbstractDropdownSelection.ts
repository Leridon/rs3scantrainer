import Widget from "lib/ui/Widget";
import {createPopper} from '@popperjs/core';
import {Observable, observe} from "../../../lib/reactive";

export abstract class AbstractDropdownSelection<T extends object | string | number> extends Widget {
    protected input_container: Widget
    private input: Widget

    protected dropdown: Widget = null
    private dropdown_rows: Widget[] = null
    private highlighted_value: T = null

    public selection: Observable.Simple<T>

    protected constructor(protected options: AbstractDropdownSelection.options<T>, inital_item: T) {
        super($("<div class='nisl-selectdropdown'>"));

        this.selection = observe(inital_item)

        this.input_container = c("<div></div>").appendTo(this)

        this.input = this.constructInput()

        this.setDropdownItems([inital_item])
    }

    protected constructInput(): Widget {
        return c("<div class='nisl-selectdropdown-input' tabindex='-1'>")
            .tapRaw((r) => r
                .on("click", (e) => {
                    this.openDropdown()
                })
            )
            .append(this.construct(this.selection.value()))
            .appendTo(this.input_container.empty());
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

        this.constructInput()
    }

    _selectableItems: T[] = []

    setDropdownItems(items: T[]) {
        this._selectableItems = items

        if (this.dropdown) {
            this.fillDropdown()

            if (this._selectableItems.find(i => i == this.highlighted_value) != null) {
                this.setHighlight(this._selectableItems[0])
            }
        }
    }

    private fillDropdown() {

        this.dropdown.empty()

        if (this._selectableItems.length == 0 && !this.options.can_be_null) {
            c(`<div class="nisl-selectdropdown-options-none">No selection available</div>`).appendTo(this.dropdown)
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
            this.dropdown_rows.push(
                c(`<div></div>`).appendTo(this.dropdown)
                    .append(this.construct(null))
                    .tapRaw((r) => r.data("value", null)
                        .on("mouseover", () => this.setHighlight(null))
                        .on("click", () => this.selectValue(null))
                    )
            )
        }
    }

    openDropdown() {
        if (this.dropdown) return

        this.dropdown = c("<div class='nisl-selectdropdown-options' style='z-index: 9999999999' tabindex='0'>").appendTo(AbstractDropdownSelection.getDropdownPane())

        this.fillDropdown()

        this.setHighlight(this.selection.value())

        let instance = createPopper(this.input_container.container.get()[0], this.dropdown.container.get()[0], {
            placement: "bottom-start",
            modifiers: [
                {
                    name: 'flip',
                    enabled: true,
                },
                {
                    name: "preventOverflow",
                    enabled: true,
                    options: {
                        boundary: "viewport",
                        rootBoundary: 'viewport',
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

        this.onOpen().tapRaw(r => r
            .attr("tabindex", 0)
            .on("keydown", (e) => {
                if (e.key == "Enter") this.selectValue(this.highlighted_value)

                if (e.key == "ArrowDown") {
                    this.setHighlight(this._selectableItems[Math.min(this._selectableItems.length - 1, this._selectableItems.indexOf(this.highlighted_value) + 1)])
                }

                if (e.key == "ArrowUp") {
                    this.setHighlight(this._selectableItems[Math.max(0, this._selectableItems.indexOf(this.highlighted_value) - 1)])
                }
            })
            .on("focusout", (e) => {
                if (!(e.originalEvent.relatedTarget instanceof HTMLElement)
                    || (!this.dropdown.container.is(e.originalEvent.relatedTarget) && this.dropdown.container.has(e.originalEvent.relatedTarget).length == 0)
                ) {
                    this.hideDropdown()
                }
            })
            .focus() // The deprecation warning here is for a different overload
        )
    }

    /**
     * Is called whenever the dropdown is opened. Subclasses can use this to replace the original input by a text input for example.
     *
     * @return Must return the focus handler, i.e. the element that receives key events. The dropdown by default.
     */
    protected onOpen(): Widget {
        return this.dropdown
    }

    setValue(v: T): this {
        this.selection.set(v)

        this.setHighlight(v)

        this.hideDropdown()

        this.constructInput()

        this.input.empty().append(this.construct(v))

        return this
    }

    private selectValue(v: T) {
        this.setValue(v)
        this.selection.set(v)
    }

    private static _dropdownpane: Widget = null

    static getDropdownPane(): Widget {
        if (!this._dropdownpane) this._dropdownpane = c("<div style='position: absolute; top: 0; left: 0; overflow: visible'>").appendTo($("body"))

        return this._dropdownpane
    }

    onSelection(f: (v: T) => any): this {
        this.selection.subscribe(f)
        return this
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