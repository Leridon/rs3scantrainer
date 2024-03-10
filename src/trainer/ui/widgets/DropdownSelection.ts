import {AbstractDropdownSelection} from "./AbstractDropdownSelection";

/* TODO:
    - Styling pass over dropdown
    - Add arrow indicating that it's a dropdown
 */
export class DropdownSelection<T extends object | string | number> extends AbstractDropdownSelection<T> {
    constructor(options: AbstractDropdownSelection.options<T>, private items: T[]) {
        super(options, options.can_be_null ?  null : items[0]);

        this.setItems(items)
    }

    override setItems(items: T[]): this {
        super.setItems(items)

        if (this.options.can_be_null && !items.some(p => p == this.selection.value())) this.selectValue(null)

        return this
    }
}