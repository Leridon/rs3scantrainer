import {Raster} from "../../lib/util/raster";
import {Rectangle, Vector2} from "../../lib/math";
import * as leaflet from "leaflet";
import {LatLngExpression} from "leaflet";

export function areaToPolygon<T>(raster: Raster<T>,
                                 f: (T) => boolean,
                                 s: number) {
    type corner = 0 | 1 | 2 | 3
    type TileCorner = { tile: number, corner: corner }

    function area(i: number) {
        let a = raster.data[i]
        return a && f(a)
    }

    function toCoords(point: TileCorner): Vector2 {
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

    let polygon: Vector2[] = []

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

    return leaflet.polygon(polygon.map(Vector2.toLatLong))

    /*
    // Find a start point that is on the border of the shape. Assumes there are no holes in the shape
    let startpoint = area.tiles[0]
    while (a({x: startpoint.x - 1, y: startpoint.y})) startpoint = {x: startpoint.x - 1, y: startpoint.y}

    let start: { tile: TileCoordinates, corner: corner } = {tile: startpoint, corner: 0}
    let current: { tile: TileCoordinates, corner: corner } = {tile: startpoint, corner: 0}

    function done() {
        return start.tile.x == current.tile.x
            && start.tile.y == current.tile.y
            && start.corner == current.corner;
    }

    let polygon: TileCoordinates[] = [toCoords(current)]

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

export function tilePolygon(tile: Vector2) {
    return leaflet.polygon([
        {x: tile.x - 0.5, y: tile.y - 0.5},
        {x: tile.x - 0.5, y: tile.y + 0.5},
        {x: tile.x + 0.5, y: tile.y + 0.5},
        {x: tile.x + 0.5, y: tile.y - 0.5},
    ].map(Vector2.toLatLong))
}

export function boxPolygon(tile: Rectangle): leaflet.Polygon {
    return leaflet.polygon([
        {x: tile.topleft.x - 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.botright.y - 0.5},
        {x: tile.topleft.x - 0.5, y: tile.botright.y - 0.5},
    ].map(Vector2.toLatLong))
}

/**
 * This function creates a polygon from a rectangle, interpreting the coordinates
 * as real coordinates instead of tile indices. This means, that a rectangle
 * where topleft equals botright has a width of zero instead of one.
 * @param rect
 */
export function boxPolygon2(rect: Rectangle): LatLngExpression[] {
    return [
        rect.topleft,
        {x: rect.botright.x, y: rect.topleft.y},
        rect.botright,
        {x: rect.topleft.x, y: rect.botright.y},
    ].map(Vector2.toLatLong)
}
