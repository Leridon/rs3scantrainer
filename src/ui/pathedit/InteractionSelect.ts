import {DropdownSelection} from "../widgets/DropdownSelection";
import {Path} from "../../model/pathing";

export default class InteractionSelect extends DropdownSelection<Path.InteractionType.Enum> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: Path.InteractionType.Enum) => {
                    let meta = Path.InteractionType.meta(v)
                    return c(`<div><img style="height: 18px; object-fit: contain; margin-right: 3px" src="${meta.icon_url}" alt="${meta.description}">${meta.description}</div>`)
                }
            }
        }, Object.values(Path.InteractionType.Enum) as Path.InteractionType.Enum[]);
    }
}