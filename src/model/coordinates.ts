import * as leaflet from "leaflet";
import {Raster} from "../util/raster";
import {clamp} from "lodash";

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

export type Vector2 = { x: number, y: number }

export namespace Vector2 {
    export function add(a: Vector2, b: Vector2): Vector2 {
        return {
            x: a.x + b.x,
            y: a.y + b.y
        }
    }

    export function sub(a: Vector2, b: Vector2): Vector2 {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        }
    }

    export function scale(f: number, v: Vector2): Vector2 {
        return {
            x: v.x * f,
            y: v.y * f
        }
    }

    export function length(a: Vector2): number {
        return Math.sqrt(a.x * a.x + a.y * a.y)
    }

    export function normalize(a: Vector2): Vector2 {
        return scale(1 / length(a), a)
    }

    export function sign(a: Vector2): Vector2 {
        return {
            x: Math.sign(a.x),
            y: Math.sign(a.y)
        }
    }

    export function rotate(v: Vector2, angle_radians: number): Vector2 {
        let sin = Math.sin(angle_radians)
        let cos = Math.cos(angle_radians)

        return {
            x: cos * v.x - sin * v.y,
            y: sin * v.x + cos * v.y,
        }
    }

    export function eq(a: Vector2, b: Vector2): boolean {
        return a.x == b.x && a.y == b.y
    }

    export function manhatten(a: Vector2): number {
        return Math.abs(a.x) + Math.abs(a.y)
    }

    export function max_axis(a: Vector2): number {
        return Math.max(Math.abs(a.x), Math.abs(a.y))
    }
}

export type MapCoordinate = Vector2 & {
    level?: number
}

export namespace MapCoordinate {
    export function eq(a: MapCoordinate, b: MapCoordinate) {
        return a.x == b.x && a.y == b.y && a.level == b.level
    }
}

// TODO: deprecate
export function eq(a: MapCoordinate, b: MapCoordinate) {
    return a.x == b.x && a.y == b.y     // Ignores level for spot equality
}

export function toPoint(c: Vector2): leaflet.Point {
    return leaflet.point(c.x, c.y)
}

export type Box = { topleft: Vector2, botright: Vector2 }

export namespace Box {
    export function from(a: Vector2, b: Vector2): Box {
        return {
            topleft: {x: Math.min(a.x, b.x), y: Math.max(a.y, b.y)},
            botright: {x: Math.max(a.x, b.x), y: Math.min(a.y, b.y)},
        }
    }
}

export function box_center(box: Box): Vector2 {
    return {
        x: Math.round((box.topleft.x + box.botright.x) / 2),
        y: Math.round((box.topleft.y + box.botright.y) / 2)
    }
}

export function clampInto(pos: Vector2, area: Box): Vector2 {
    return {
        x: clamp(pos.x, area.topleft.x, area.botright.x),
        y: clamp(pos.y, area.botright.y, area.topleft.y),
    }
}

export function toBounds(box: Box) {
    let tl = leaflet.point(box.topleft)
    let br = leaflet.point(box.botright)

    return leaflet.bounds(tl, br)
}

export function add(tile: Vector2, offset: Vector2): MapCoordinate {
    return {x: tile.x + offset.x, y: tile.y + offset.y}
}

export function contains(box: Box, tile: Vector2) {
    return box.topleft.x <= tile.x
        && box.topleft.y >= tile.y
        && box.botright.x >= tile.x
        && box.botright.y <= tile.y
}

export type Area = { tiles: MapCoordinate[] }
type corner = 0 | 1 | 2 | 3


export function toLL(point: MapCoordinate): leaflet.LatLng {
    return leaflet.latLng(point.y, point.x)
}

export function t(area: Area) {
    let bounds = leaflet.bounds(area.tiles.map((c) => leaflet.point(c.x, c.y)))

    let raster = new Raster({
        left: bounds.getTopLeft().x - 1,
        right: bounds.getTopRight().x + 1,
        top: bounds.getBottomLeft().y + 1,    // the Y axis in leaflet.bounds is exactly opposite to what the map uses.
        bottom: bounds.getTopLeft().y - 1
    })

    raster.data.fill(false)

    area.tiles.forEach((t) => {
        raster.data[raster.xyToI(t)] = true
    })
}


export function areaToPolygon<T>(raster: Raster<T>,
                                 f: (T) => boolean,
                                 s: number) {
    type TileCorner = { tile: number, corner: corner }

    function area(i: number) {
        let a = raster.data[i]
        return a && f(a)
    }

    function toCoords(point: TileCorner): MapCoordinate {
        let xy = raster.iToXY(point.tile)

        return {
            x: xy.x - 0.5 + Math.floor(point.corner / 2),
            y: xy.y - 0.5 + (point.corner % 2)
        }
    }

    // Find a start point that is on the border of the shape. Assumes there are no holes in the shape
    let startpoint = s
    while (area(startpoint - 1)) startpoint -= 1
    while (area(startpoint - raster.size.x)) startpoint -= raster.size.x

    let start: TileCorner = {tile: startpoint, corner: 0}
    let current: TileCorner = {tile: startpoint, corner: 0}

    function done() {
        return start.tile == current.tile && start.corner == current.corner;
    }

    let polygon: MapCoordinate[] = []

    do {
        switch (current.corner) {
            case 0: // Bottom left, going up
            {
                let i: number = current.tile

                while (area(i + raster.size.x) && !area(i + raster.size.x - 1)) i += raster.size.x

                polygon.push(toCoords({tile: i, corner: 1}))

                if (area(i + raster.size.x - 1)) current = {tile: i + raster.size.x - 1, corner: 2} // Go left
                else current = {tile: i, corner: 1} // Go right
            }
                break;
            case 1: { // Top left, going right
                let i = current.tile

                while (area(i + 1) && !area(i + raster.size.x + 1)) i += 1

                polygon.push(toCoords({tile: i, corner: 3}))

                if (area(i + raster.size.x + 1)) current = {tile: i + raster.size.x + 1, corner: 0}  // Go up
                else current = {tile: i, corner: 3} // Go down

                break;
            }

            case 2: { // Bottom right, going left
                let i = current.tile

                while (area(i - 1) && !area(i - raster.size.x - 1)) i -= 1

                polygon.push(toCoords({tile: i, corner: 0}))

                if (area(i - raster.size.x - 1)) current = {tile: i - raster.size.x - 1, corner: 3}  // Go down
                else current = {tile: i, corner: 0} // Go up

                break;
            }
            case 3: {// Top right, going down
                let i = current.tile

                while (area(i - raster.size.x) && !area(i - raster.size.x + 1)) i -= raster.size.x

                polygon.push(toCoords({tile: i, corner: 2}))

                if (area(i - raster.size.x + 1)) current = {tile: i - raster.size.x + 1, corner: 1}  // Go right
                else current = {tile: i, corner: 2} // Go left

                break;
            }

        }

    } while (!done())

    return leaflet.polygon(polygon.map(toLL))

    /*
    // Find a start point that is on the border of the shape. Assumes there are no holes in the shape
    let startpoint = area.tiles[0]
    while (a({x: startpoint.x - 1, y: startpoint.y})) startpoint = {x: startpoint.x - 1, y: startpoint.y}

    let start: { tile: MapCoordinate, corner: corner } = {tile: startpoint, corner: 0}
    let current: { tile: MapCoordinate, corner: corner } = {tile: startpoint, corner: 0}

    function done() {
        return start.tile.x == current.tile.x
            && start.tile.y == current.tile.y
            && start.corner == current.corner;
    }

    let polygon: MapCoordinate[] = [toCoords(current)]

    do {
        switch (current.corner) {
            case 0: // Bottom left
                if (a({x: current.tile.x - 1, y: current.tile.y})) {
                    current = {tile: {x: current.tile.x - 1, y: current.tile.y}, corner: 2}
                } else {
                    current.corner = 1
                    polygon.push(toCoords(current))
                }
                break;
            case 1: // Top left
                if (a({x: current.tile.x, y: current.tile.y + 1})) {
                    current = {tile: {x: current.tile.x, y: current.tile.y + 1}, corner: 0}
                } else {
                    current.corner = 3
                    polygon.push(toCoords(current))
                }
                break;
            case 2: // Bottom right
                if (a({x: current.tile.x, y: current.tile.y - 1})) {
                    current = {tile: {x: current.tile.x, y: current.tile.y - 1}, corner: 3}
                } else {
                    current.corner = 0
                    polygon.push(toCoords(current))
                }
                break;
            case 3: // Top right
                if (a({x: current.tile.x + 1, y: current.tile.y})) {
                    current = {tile: {x: current.tile.x + 1, y: current.tile.y}, corner: 1}
                } else {
                    current.corner = 2
                    polygon.push(toCoords(current))
                }
                break;
        }
    } while (!done())

    return leaflet.polygon(polygon.map((c) => [c.y, c.x] as [number, number]))*/
}

export function tilePolygon(tile: MapCoordinate) {
    return leaflet.polygon([
        {x: tile.x - 0.5, y: tile.y - 0.5},
        {x: tile.x - 0.5, y: tile.y + 0.5},
        {x: tile.x + 0.5, y: tile.y + 0.5},
        {x: tile.x + 0.5, y: tile.y - 0.5},
    ].map(toLL))
}

export function boxPolygon(tile: Box): leaflet.Polygon {
    return leaflet.polygon([
        {x: tile.topleft.x - 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.botright.y - 0.5},
        {x: tile.topleft.x - 0.5, y: tile.botright.y - 0.5},
    ].map(toLL))
}

function sextantToCoord(comp: GieliCoordinates): MapCoordinate {
    const sextant = {
        offsetx: 2440,
        offsetz: 3161,
        minutespertile: 1.875
    }

    return {
        x: sextant.offsetx + Math.round((60 * comp.longitude.degrees + comp.longitude.minutes) * (comp.longitude.direction == "west" ? -1 : 1) / sextant.minutespertile),
        y: sextant.offsetz + Math.round((60 * comp.latitude.degrees + comp.latitude.minutes) * (comp.latitude.direction == "south" ? -1 : 1) / sextant.minutespertile)
    }
}