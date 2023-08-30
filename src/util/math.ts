import {clamp} from "lodash";
import * as leaflet from "leaflet";

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

    export function min_axis(a: Vector2): number {
        return Math.min(Math.abs(a.x), Math.abs(a.y))
    }

    export function toLatLong(point: Vector2): leaflet.LatLng {
        return leaflet.latLng(point.y, point.x)
    }

    export function toPoint(c: Vector2): leaflet.Point {
        return leaflet.point(c.x, c.y)
    }

    export function copy(c: Vector2): Vector2 {
        return {
            x: c.x,
            y: c.y
        }
    }
}


export type Rectangle = { topleft: Vector2, botright: Vector2 }

export namespace Rectangle {
    export function from(a: Vector2, b: Vector2): Rectangle {
        return {
            topleft: {x: Math.min(a.x, b.x), y: Math.max(a.y, b.y)},
            botright: {x: Math.max(a.x, b.x), y: Math.min(a.y, b.y)},
        }
    }

    export function contains(box: Rectangle, tile: Vector2) {
        return box.topleft.x <= tile.x
            && box.topleft.y >= tile.y
            && box.botright.x >= tile.x
            && box.botright.y <= tile.y
    }

    export function extend(box: Rectangle, padding: number): Rectangle {
        return {
            topleft: Vector2.add(box.topleft, {x: -padding, y: padding}),
            botright: Vector2.add(box.botright, {x: padding, y: -padding}),
        }
    }

    export function clampInto(pos: Vector2, area: Rectangle): Vector2 {
        return {
            x: clamp(pos.x, area.topleft.x, area.botright.x),
            y: clamp(pos.y, area.botright.y, area.topleft.y),
        }
    }

    export function center(box: Rectangle): Vector2 {
        return {
            x: Math.round((box.topleft.x + box.botright.x) / 2),
            y: Math.round((box.topleft.y + box.botright.y) / 2)
        }
    }

    export function toBounds(box: Rectangle) {
        let tl = leaflet.point(box.topleft)
        let br = leaflet.point(box.botright)

        return leaflet.bounds(tl, br)
    }
}
