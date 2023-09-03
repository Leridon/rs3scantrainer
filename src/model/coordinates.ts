import {Rectangle, Vector2} from "../util/math";

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
    level: number
}

export type MapRectangle = Rectangle & {
    level: number
}

export namespace MapCoordinate {
    export function eq(a: MapCoordinate, b: MapCoordinate) {
        return Vector2.eq(a, b) && a.level == b.level
    }

    export function eq2(a: MapCoordinate, b: MapCoordinate) {
        return a == b || (a != null && b != null && eq(a, b))
    }

    export function lift(v: Vector2, level: number): MapCoordinate {
        return {...v, level: level}
    }

    export function toString(coordinate: MapCoordinate): string {
        return `${coordinate.x}|${coordinate.y}|${coordinate.level}`
    }
}

export namespace MapRectangle {
    import lift = MapCoordinate.lift

    export function contains(box: MapRectangle, tile: MapCoordinate) {
        return tile.level == box.level && Rectangle.contains(box, tile)
    }

    export function clampInto(pos: MapCoordinate, area: MapRectangle): MapCoordinate {
        return lift(Rectangle.clampInto(pos, area), pos.level)
    }

    export function tl(rect: MapRectangle): MapCoordinate {
        return lift(rect.topleft, rect.level)
    }

    export function br(rect: MapRectangle): MapCoordinate {
        return lift(rect.botright, rect.level)
    }

    export function center(rect: MapRectangle): MapCoordinate {
        return lift(Rectangle.center(rect), rect.level)
    }
}

export type Area = { tiles: MapCoordinate[] }
