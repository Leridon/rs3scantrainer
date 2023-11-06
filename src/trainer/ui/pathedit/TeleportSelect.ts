import {SearchSelection} from "../widgets/SearchSelection";
import {teleport_data} from "data/teleport_data";
import {Teleports} from "../../../lib/runescape/teleports";

export default class TeleportSelect extends SearchSelection<Teleports.flat_teleport> {
    constructor() {
        super({
            type_class: {
                toHTML: (v: Teleports.flat_teleport) => {
                    return c(`<div>${v.hover}</div>`)
                }
            },
            search_term: (t: Teleports.flat_teleport) => t.hover
        }, teleport_data.getAllFlattened());
    }
}