import * as leaflet from "leaflet";
import {Transform} from "./Transform";
import {LatLng} from "leaflet";

export type Vector2 = { x: number, y: number }

export namespace Vector2 {
    export function add(...a: Vector2[]): Vector2 {
        return {
            x: a.map(v => v.x).reduce((c, d) => c + d, 0),
            y: a.map(v => v.y).reduce((c, d) => c + d, 0),
        }
    }

    export function sub(a: Vector2, b: Vector2): Vector2 {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        }
    }

    export function ul(a: Vector2, b: Vector2): Vector2 {
        return {
            x: a.x * b.x,
            y: a.y * b.y
        }
    }

    export function neg(a: Vector2): Vector2 {
        return {
            x: -a.x,
            y: -a.y
        }
    }

    export function scale(f: number, v: Vector2): Vector2 {
        return {
            x: v.x * f,
            y: v.y * f
        }
    }

    export function length(a: Vector2): number {
        return Math.sqrt(lengthSquared(a))
    }

    export function lengthSquared(a: Vector2): number {
        return a.x * a.x + a.y * a.y
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

    export function fromLatLong(point: LatLng): Vector2 {
        return {x: point.lng, y: point.lat}
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

    export function snap(c: Vector2, grid: number = 1): Vector2 {
        return {x: Math.round(c.x / grid) * grid, y: Math.round(c.y / grid) * grid}
    }

    /**
     * Transforms a Vector2 by the given transform, interpreting the Vector as a direction.
     */
    export function transform(a: Vector2, trans: Transform): Vector2 {
        let r = Transform.apply(trans, [a.x, a.y, 0])

        return {x: r[0], y: r[1]}
    }

    /**
     * Transforms a Vector2 by the given transform, interpreting the Vector as a point in space.
     */
    export function transform_point(a: Vector2, trans: Transform): Vector2 {
        let r = Transform.apply(trans, [a.x, a.y, 1])

        return snap({x: r[0], y: r[1]}, 0.5)
    }

    export function abs(a: Vector2): Vector2 {
        return {x: Math.abs(a.x), y: Math.abs(a.y)}
    }

    export function toString(a: Vector2): string {
        return `${a.x}|${a.y}`
    }
}
