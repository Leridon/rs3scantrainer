import {Transform} from "../../math";
import {isArray} from "lodash";

export type TileTransform = {
    matrix: Transform,
    level_offset: number
}

export namespace TileTransform {
    export function normalize(t: Transform | TileTransform): TileTransform {
        return isArray(t) ? {
            matrix: t,
            level_offset: 0
        } : t
    }

    export function lift(t: Transform, level_offset: number = 0): TileTransform {
        return {
            matrix: t,
            level_offset: level_offset
        }
    }
}