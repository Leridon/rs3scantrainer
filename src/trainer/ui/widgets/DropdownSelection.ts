import {AbstractDropdownSelection} from "./AbstractDropdownSelection";

/* TODO:
    - Styling pass over dropdown
    - Add arrow indicating that it's a dropdown
 */
export class DropdownSelection<T extends object | string | number> extends AbstractDropdownSelection<T> {
    constructor(options: AbstractDropdownSelection.options<T>, private items: T[]) {
        super(options, options.can_be_null ?  null : items[0]);

        this.setDropdownItems(items)
    }

    override setDropdownItems(items: T[]) {
        super.setDropdownItems(items)

        if (this.options.can_be_null && !items.some(p => p == this.selection.value())) this.selectValue(null)
    }
}