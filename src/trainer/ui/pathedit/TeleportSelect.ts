import {SearchSelection} from "../widgets/SearchSelection";
import {flat_teleport} from "lib/runescape/teleports";
import {teleport_data} from "data/teleport_data";

export default class TeleportSelect extends SearchSelection<flat_teleport> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: flat_teleport) => {
                    return c(`<div>${v.hover}</div>`)
                }
            },
            search_term: (t: flat_teleport) => t.hover
        }, teleport_data.getAllFlattened());
    }
}