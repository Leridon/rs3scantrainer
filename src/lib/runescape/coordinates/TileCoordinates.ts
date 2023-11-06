import {Transform, Vector2} from "../../math";
import {floor_t} from "./index";
import {TileTransform} from "./TileTransform";


export type TileCoordinates = Vector2 & {
    level: floor_t
}

export namespace TileCoordinates {


    export function eq(a: TileCoordinates, b: TileCoordinates) {
        return Vector2.eq(a, b) && a.level == b.level
    }

    export function eq2(a: TileCoordinates | null, b: TileCoordinates | null) {
        return a != null && b != null && (a == b || eq(a, b))
    }

    export function lift(v: Vector2, level: floor_t): TileCoordinates {
        return {...v, level: level}
    }

    export function move(pos: TileCoordinates, off: Vector2) {
        return {
            x: pos.x + off.x,
            y: pos.y + off.y,
            level: pos.level
        }
    }

    export function toString(coordinate: TileCoordinates): string {
        return `${coordinate.x}|${coordinate.y}|${coordinate.level}`
    }

    export function snap(coordinate: TileCoordinates): TileCoordinates {
        return {
            x: Math.round(coordinate.x),
            y: Math.round(coordinate.y),
            level: coordinate.level
        }
    }

    export function transform(coordinates: TileCoordinates, trans: TileTransform | Transform): TileCoordinates {
        let norm = TileTransform.normalize(trans)

        return lift(Vector2.transform_point(coordinates, norm.matrix), floor_t.clamp(coordinates.level + norm.level_offset))
    }
}
