import {AbstractDropdownSelection} from "./AbstractDropdownSelection";
import Widget from "./Widget";

export class SearchSelection<T extends object | string | number> extends AbstractDropdownSelection<T> {
    constructor(options: AbstractDropdownSelection.options<T>, private items: T[]) {
        super(options, options.can_be_null ? (options.null_value || null) : items[0]);

        this.setDropdownItems(items)
    }

    protected constructInput(): Widget {
        // TODO:
        return c("<div class='nisl-selectdropdown-input' tabindex='-1'>")
    }
}