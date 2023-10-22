import {Rectangle, Vector2} from "../util/math";

export type floor_t = 0 | 1 | 2 | 3

export type GieliCoordinates = {
    latitude: {
        degrees: number,
        minutes: number,
        direction: "north" | "south"
    },
    longitude: {
        degrees: number,
        minutes: number,
        direction: "east" | "west"
    }
}

export namespace GieliCoordinates {
    function toCoords(comp: GieliCoordinates): MapCoordinate {
        const sextant = {
            offsetx: 2440,
            offsetz: 3161,
            minutespertile: 1.875
        }

        return {
            x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.minutespertile),
            y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.minutespertile),
            level: 0
        }
    }
}

export type MapCoordinate = Vector2 & {
    level: floor_t
}

export type MapRectangle = Rectangle & {
    level: floor_t
}

export namespace MapCoordinate {
    export function eq(a: MapCoordinate, b: MapCoordinate) {
        return Vector2.eq(a, b) && a.level == b.level
    }

    export function eq2(a: MapCoordinate | null, b: MapCoordinate | null) {
        return a != null && b != null && ( a == b || eq(a, b))
    }

    export function lift(v: Vector2, level: floor_t): MapCoordinate {
        return {...v, level: level}
    }

    export function move(pos: MapCoordinate, off: Vector2) {
        return {
            x: pos.x + off.x,
            y: pos.y + off.y,
            level: pos.level
        }
    }

    export function toString(coordinate: MapCoordinate): string {
        return `${coordinate.x}|${coordinate.y}|${coordinate.level}`
    }

    export function snap(coordinate: MapCoordinate): MapCoordinate {
        return {
            x: Math.round(coordinate.x),
            y: Math.round(coordinate.y),
            level: coordinate.level
        }
    }
}

export namespace MapRectangle {
    import lift_tile = MapCoordinate.lift

    export function contains(box: MapRectangle, tile: MapCoordinate) {
        return tile.level == box.level && Rectangle.contains(box, tile)
    }

    export function clampInto(pos: MapCoordinate, area: MapRectangle): MapCoordinate {
        return lift_tile(Rectangle.clampInto(pos, area), pos.level)
    }

    export function tl(rect: MapRectangle): MapCoordinate {
        return lift_tile(rect.topleft, rect.level)
    }

    export function br(rect: MapRectangle): MapCoordinate {
        return lift_tile(rect.botright, rect.level)
    }

    export function center(rect: MapRectangle): MapCoordinate {
        return lift_tile(Rectangle.center(rect), rect.level)
    }

    export function fromTile(tile: MapCoordinate): MapRectangle {
        if (!tile) return null

        return {
            level: tile.level,
            topleft: {x: tile.x, y: tile.y},
            botright: {x: tile.x, y: tile.y},
        }
    }

    export function isTile(rect: MapRectangle): boolean {
        return Vector2.eq(rect.topleft, rect.botright)
    }

    export function lift(v: Rectangle, level: floor_t): MapRectangle {
        return {...v, level: level}
    }


    export function left(rect: MapRectangle): MapRectangle {
        return lift(Rectangle.left(rect), rect.level)
    }

    export function right(rect: MapRectangle): MapRectangle {
        return lift(Rectangle.right(rect), rect.level)
    }

    export function top(rect: MapRectangle): MapRectangle {
        return lift(Rectangle.top(rect), rect.level)
    }

    export function bottom(rect: MapRectangle): MapRectangle {
        return lift(Rectangle.bottom(rect), rect.level)
    }
}

export type Area = { tiles: MapCoordinate[] }
