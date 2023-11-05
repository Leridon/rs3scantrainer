import {Vector2} from "./Vector2";

export type Transform = {
    matrix: Transform.Matrix,
    level_offset: number
}

export namespace Transform {
    export type Vector3 = [number, number, number]
    export type Matrix = [Vector3, Vector3, Vector3]

    export namespace Vector3 {
        export function toVector2(a: Vector3): Vector2 {
            return {x: a[0], y: a[1]}
        }

        export function position(a: Vector2): Vector3 {
            return [a.x, a.y, 1]
        }

        export function direction(a: Vector2): Vector3 {
            return [a.x, a.y, 0]
        }
    }

    function mul(a: Vector3, b: Vector3): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    }

    export function translation(offset: Vector2, level_offset: number = 0): Transform {
        return {
            matrix: [
                [0, 0, offset.x],
                [0, 0, offset.y],
                [0, 0, 1]
            ],
            level_offset: level_offset
        }
    }

    export function rotation(rot: number): Transform {
        let theta = rot * Math.PI / 2

        return {
            matrix: [
                [Math.cos(theta), -Math.sin(theta), 0],
                [Math.sin(theta), Math.cos(theta), 0],
                [0, 0, 1]
            ],
            level_offset: 0
        }
    }

    export function row(a: Transform, n: 0 | 1 | 2): Vector3 {
        return a.matrix[n]
    }

    export function col(a: Transform, n: 0 | 1 | 2): Vector3 {
        return [a.matrix[0][n], a.matrix[1][n], a.matrix[2][n]]
    }

    export function mult(a: Transform, b: Transform): Transform {
        return {
            matrix: [0, 1, 2].map((r: 0 | 1 | 2) =>
                [0, 1, 2].map((c: 0 | 1 | 2) =>
                    mul(row(a, r), col(b, c))
                )
            ) as Matrix,
            level_offset: a.level_offset + b.level_offset
        }
    }

    export function apply(a: Transform, b: Vector3): Vector3 {
        return [
            mul(row(a, 0), b),
            mul(row(a, 1), b),
            mul(row(a, 2), b),
        ]
    }
}