import {DropdownSelection} from "../widgets/DropdownSelection";
import {Path} from "lib/runescape/pathing";
import {CursorType} from "../../../lib/runescape/CursorType";

export default class InteractionSelect extends DropdownSelection<CursorType> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: CursorType) => {
                    let meta = CursorType.meta(v)
                    return c(`<div><img style="height: 18px; object-fit: contain; margin-right: 3px" src="${meta.icon_url}" alt="${meta.description}">${meta.description}</div>`)
                }
            }
        }, CursorType.all().map(i => i.type));
    }
}