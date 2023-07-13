import {DropdownSelection} from "../widgets/DropdownSelection";
import {interaction_type, InteractionType} from "../../model/pathing";

export default class InteractionSelect extends DropdownSelection<InteractionType> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: InteractionType) => {
                    let meta = interaction_type.meta(v)
                    return c(`<div><img style="height: 18px; object-fit: contain; margin-right: 3px" src="${meta.icon_url}" alt="${meta.description}">${meta.description}</div>`)
                }
            }
        }, Object.values(InteractionType) as InteractionType[]);
    }
}