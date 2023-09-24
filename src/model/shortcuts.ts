import {MapCoordinate} from "./coordinates";
import {direction} from "./movement";
import {Path} from "./pathing";

export namespace Shortcuts {

    export type shortcut = {
        name: string,
        ticks: number,
        where: MapCoordinate,
        starts: MapCoordinate,
        ends_up: MapCoordinate,
        forced_orientation: direction | null
        how: Path.InteractionType
    }

    export const index: shortcut[] = [
        {
            name: "Cross South",
            ticks: 5,
            starts: {x: 2355, y: 3848, level: 0},
            where: {x: 2355, y: 3844, level: 0},
            ends_up: {x: 2355, y: 3839, level: 0},
            forced_orientation: direction.south,
            how: "generic"
        }
    ]
}