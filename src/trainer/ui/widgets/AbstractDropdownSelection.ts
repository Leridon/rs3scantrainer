import Widget from "lib/ui/Widget";
import * as popper from "@popperjs/core"
import {ewent, Observable, observe} from "../../../lib/reactive";
import {util} from "../../../lib/util/util";

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

        let instance = popper.createPopper(this.input_container.raw(), this.dropdown.raw(), {
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

    protected selectValue(v: T) {
        this.setValue(v)
        this.selection.set(v)
    }

    onSelection(f: (v: T) => any, trigger_now: boolean = false): this {
        this.selection.subscribe(f, trigger_now)
        return this
    }
}

export namespace AbstractDropdownSelection {
    import positiveMod = util.positiveMod;

    export class DropDown<T> {
        private selectable_items: Observable<T[]> = observe([])
        private highlight_index: Observable<number | null> = observe(null)

        public selected = ewent<T>()
        public closed = ewent<undefined>()

        private focus_widget: Widget
        private input_handler: (event: JQuery.KeyDownEvent) => any
        private container: Widget
        private rows: Widget[]
        private instance: popper.Instance

        constructor(private options: {
            dropdownClass?: string,
            renderItem?: (_: T) => Widget
        }) {
            if (!options.renderItem) options.renderItem = (v) => c().text(JSON.stringify(v))

            this.selectable_items.subscribe((items, old_items) => {
                /*
                if (this.highlight_index.value() != null) {
                    let new_index = items.indexOf(old_items[this.highlight_index.value()])

                    this.highlight_index.set(new_index >= 0 ? new_index : 0)
                }*/

                this.highlight_index.set(0)

                this.renderItems()
            })

            this.highlight_index.subscribe((highlight, old_highlight) => {
                if (this.rows) {
                    if (old_highlight != null) this.rows[old_highlight]?.toggleClass("selected", false)
                    if (highlight != null) this.rows[highlight]?.toggleClass("selected", true)
                        ?.raw()?.scrollIntoView(false)
                }
            })
        }

        private select(item: T) {
            this.selected.trigger(item)
            this.close()
        }

        setItems(items: T[]): this {
            this.selectable_items.set(items)
            return this
        }

        renderItems() {
            if (this.container) {
                this.container.empty()

                this.rows = this.selectable_items.value().map((item, index) => {
                    return this.options.renderItem(item)
                        .toggleClass("selected", this.highlight_index.value() == index)
                        .on("click", () => {
                            this.select(item)
                        })
                        .on("mousemove", () => {
                            this.highlight_index.set(index)
                        })
                        .appendTo(this.container)
                })
            }
        }

        open(reference: Widget, focus_widget: Widget): void {
            if (focus_widget) {
                this.focus_widget = focus_widget
                focus_widget
                    .on("keydown", this.input_handler = (e) => {
                        if (e.key == "Escape") {
                            e.stopPropagation()
                            this.focus_widget.raw().blur()
                        }

                        if (e.key == "ArrowUp") {
                            this.highlight_index.set(positiveMod(
                                (this.highlight_index.value() ?? this.selectable_items.value().length) - 1,
                                this.selectable_items.value().length
                            ))
                        }

                        if (e.key == "ArrowDown") {
                            this.highlight_index.set(positiveMod(
                                (this.highlight_index.value() ?? (this.selectable_items.value().length - 1)) + 1,
                                this.selectable_items.value().length
                            ))
                        }

                        if (e.key == "Enter") {
                            let i = this.highlight_index.value()
                            if (i != null && i >= 0 && i < this.selectable_items.value().length)
                                this.select(this.selectable_items.value()[i])
                        }
                    })
                    .on("focusout", (e) => {
                        if (!(e.originalEvent.relatedTarget instanceof HTMLElement)
                            || (!this.container.container.is(e.originalEvent.relatedTarget)
                                && this.container.container.has(e.originalEvent.relatedTarget).length == 0)
                        ) {
                            this.close()
                        }
                    })
                    .raw().focus()
            }

            this.container = c("<div style='z-index: 100000' tabindex='0'></div>")
                .addClass("nisl-abstract-dropdown")
            if (this.options.dropdownClass) {
                this.container.addClass(this.options.dropdownClass)
            }

            this.renderItems()

            this.instance = popper.createPopper(reference.raw(), this.container.appendTo(getDropdownPane()).raw(),
                {
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
                                state.styles.popper.maxWidth = `${state.rects.reference.width}px`
                            },
                        },
                    ]
                })
        }

        close() {
            if (this.instance) {
                this.instance.destroy()
                this.instance = null

                this.container.remove()

                this.closed.trigger(undefined)
            }

            if (this.focus_widget) {
                this.focus_widget.container.off("keydown", this.input_handler)
                this.focus_widget = null
                this.input_handler = null
            }
        }

        onSelected(f: (_: T) => any): this {
            this.selected.on(f)

            return this
        }

        onClosed(f: () => any): this {
            this.closed.on(f)

            return this
        }
    }


    export type selectable<T> = {
        toHTML(v: T): Widget
    }

    export type options<T> = {
        can_be_null?: boolean
        type_class?: selectable<T>
    }

    let _dropdownpane: Widget = null

    export function getDropdownPane(): Widget {
        if (!_dropdownpane) _dropdownpane = c("<div style='position: absolute; top: 0; left: 0; overflow: visible; max-width: 100%; max-height: 100%'>").appendTo($("body"))

        return _dropdownpane
    }
}