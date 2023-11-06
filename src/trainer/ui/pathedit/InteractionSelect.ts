import {DropdownSelection} from "../widgets/DropdownSelection";
import {Path} from "lib/runescape/pathing";

export default class InteractionSelect extends DropdownSelection<Path.InteractionType> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: Path.InteractionType) => {
                    let meta = Path.InteractionType.meta(v)
                    return c(`<div><img style="height: 18px; object-fit: contain; margin-right: 3px" src="${meta.icon_url}" alt="${meta.description}">${meta.description}</div>`)
                }
            }
        }, Path.InteractionType.all());
    }
}