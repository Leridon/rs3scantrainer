import * as leaflet from "leaflet";
import {Raster} from "../util/raster";
import {Browser} from "leaflet";
import win = Browser.win;


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

export type MapCoordinate = Vector2 & {
    level?: number
}
export type Box = { topleft: Vector2, botright: Vector2 }

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
        && box.topleft.y <= tile.y
        && box.botright.x >= tile.x
        && box.botright.y >= tile.y
}

export type Area = { tiles: MapCoordinate[] }
type corner = 0 | 1 | 2 | 3


export function toLeafletLatLngExpression(point: MapCoordinate): [number, number] {
    return [point.y, point.x]
}

export function areaToPolygon(area: Area) {
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

    type TileCorner = { tile: number, corner: corner }

    function toCoords(point: TileCorner): MapCoordinate {
        let xy = raster.iToXY(point.tile)

        return {
            x: xy.x - 0.5 + Math.floor(point.corner / 2),
            y: xy.y - 0.5 + (point.corner % 2)
        }
    }

    // Find a start point that is on the border of the shape. Assumes there are no holes in the shape
    let startpoint = raster.xyToI(area.tiles[0])
    while (raster.data[startpoint - 1]) startpoint -= 1
    while (raster.data[startpoint - raster.size.x]) startpoint -= raster.size.x

    let start: TileCorner = {tile: startpoint, corner: 0}
    let current: TileCorner = {tile: startpoint, corner: 0}

    function done() {
        return start.tile == current.tile && start.corner == current.corner;
    }

    let polygon: MapCoordinate[] = [toCoords(current)]

    let don = false
    do {
        switch (current.corner) {
            case 0: // Bottom left, going up
            {
                let i: number = current.tile

                while (raster.data[i + raster.size.x] && !raster.data[i + raster.size.x - 1]) i += raster.size.x

                polygon.push(toCoords({tile: i, corner: 1}))

                if (raster.data[i + raster.size.x - 1]) current = {tile: i + raster.size.x - 1, corner: 2} // Go left
                else current = {tile: i, corner: 1} // Go right
            }
                break;
            case 1: { // Top left, going right
                let i = current.tile

                while (raster.data[i + 1] && !raster.data[i + raster.size.x + 1]) i += 1

                polygon.push(toCoords({tile: i, corner: 3}))

                if (raster.data[i + raster.size.x + 1]) current = {tile: i + raster.size.x + 1, corner: 0}  // Go up
                else current = {tile: i, corner: 3} // Go down

                break;
            }

            case 2: { // Bottom right, going left
                let i = current.tile

                while (raster.data[i - 1] && !raster.data[i - raster.size.x - 1]) i -= 1

                polygon.push(toCoords({tile: i, corner: 0}))

                if (raster.data[i - raster.size.x - 1]) current = {tile: i - raster.size.x - 1, corner: 3}  // Go down
                else current = {tile: i, corner: 0} // Go up

                break;
            }
            case 3: {// Top right, going down
                let i = current.tile

                while (raster.data[i - raster.size.x] && !raster.data[i - raster.size.x + 1]) i -= raster.size.x

                polygon.push(toCoords({tile: i, corner: 2}))

                if (raster.data[i - raster.size.x + 1]) current = {tile: i - raster.size.x + 1, corner: 1}  // Go right
                else current = {tile: i, corner: 2} // Go left

                break;
            }
            default:
                don = true

        }

    } while (!done() && !don)

    return leaflet.polygon(polygon.map(toLeafletLatLngExpression))

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
    ].map(toLeafletLatLngExpression))
}

export function boxPolygon(tile: Box) {
    return leaflet.polygon([
        {x: tile.topleft.x - 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.topleft.y + 0.5},
        {x: tile.botright.x + 0.5, y: tile.botright.y - 0.5},
        {x: tile.topleft.x - 0.5, y: tile.botright.y - 0.5},
    ].map(toLeafletLatLngExpression))
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