import {AbstractDropdownSelection} from "./AbstractDropdownSelection";

/* TODO:
    - Styling pass over dropdown
    - Add arrow indicating that it's a dropdown
 */
export class DropdownSelection<T extends object | string | number> extends AbstractDropdownSelection<T> {
    constructor(options: AbstractDropdownSelection.options<T>, private items: T[]) {
        super(options, options.can_be_null ? (options.null_value || null) : items[0]);

        this.setDropdownItems(items)
    }
}