import {DropdownSelection} from "../widgets/DropdownSelection";
import {direction} from "../../model/movement";
import {capitalize} from "lodash";

export default class DirectionSelect extends DropdownSelection<direction> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: direction) => c(`<div>${capitalize(direction.toString(v))}</div>`)
            }
        }, direction.all);
    }
}