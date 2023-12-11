import {AbstractDropdownSelection} from "./AbstractDropdownSelection";
import Widget from "lib/ui/Widget";
import * as fuzzysort from "fuzzysort";

export class SearchSelection<T extends object | string | number> extends AbstractDropdownSelection<T> {

    private prepared_items: { item: T, term: Fuzzysort.Prepared }[]

    constructor(protected options: SearchSelection.options<T>, items: T[]) {
        super(options, options.can_be_null ? (options.null_value || null) : items[0]);

        this.prepared_items = items.map(i => {
            return {item: i, term: fuzzysort.prepare(this.options.search_term(i))}
        })

        this.setDropdownItems([])
    }

    protected override onOpen(): Widget {
        let search_box = c("<input type='text' class='nisl-selectdropdown-input' tabindex='-1'>")
            .appendTo(this.input_container.empty())
            .tapRaw(r => r
                .val("")
                .on("input", () => {
                    let term = search_box.container.val() as string

                    let results = fuzzysort.go(term, this.prepared_items, {
                        key: "term",
                        all: true,
                        threshold: -10000
                    })

                    this.setDropdownItems(Array.from(results).map(r => r.obj.item))
                }))

        this.setDropdownItems([this.selection.value()])

        return search_box
    }
}

export namespace SearchSelection {
    export type options<T> = AbstractDropdownSelection.options<T> & {
        search_term: (_: T) => string
    }
}