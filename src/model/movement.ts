import {Box, clampInto, contains, MapCoordinate, Vector2} from "./coordinates";
import min_axis = Vector2.max_axis;

type TileMovementData = boolean[]

type PlayerPosition = {
    tile: MapCoordinate,
    direction: direction
}

interface MapData {
    getTile(coordinate: MapCoordinate): Promise<TileMovementData>
}

type file = TileMovementData[]
const t = [
    1, 2, 4, 8, 16, 32, 64, 128, 256
]

export class HostedMapData implements MapData {
    chunks: (file | Promise<file>)[][]

    private async fetch(x: number, z: number, floor: number): Promise<Uint8Array> {
        let a = await fetch(`map/collision-${x}-${z}-${floor}.bin`)

        return new Uint8Array(await (await a.blob()).arrayBuffer())
    }

    private constructor() {
        // For every floor (0 to 3), create 200 slots in the data cache.
        this.chunks = [null, null, null, null].map(() => Array(200))
    }

    private static _instance: HostedMapData = new HostedMapData()

    static get() {
        return HostedMapData._instance
    }


    async getTile(coordinate: MapCoordinate): Promise<TileMovementData> {
        let floor = coordinate.level || 0

        let file_x = Math.floor(coordinate.x / (64 * 10))
        let file_y = Math.floor(coordinate.y / (64 * 10))
        let file_i = file_y * 10 + file_x

        if (!this.chunks[floor][file_i]) {

            let promise = this.fetch(file_x, file_y, floor)
                .then((a: Uint8Array) =>
                    Array.from(a).map((v) => t.map((i) => (Math.floor(v / i) % 2) != 0))
                )

            this.chunks[floor][file_i] = promise

            promise.then((a) => {
                this.chunks[floor][file_i] = a
            })
        }

        let tile_x = coordinate.x % (64 * 10)
        let tile_y = coordinate.y % (64 * 10)
        let tile_i = tile_y * 640 + tile_x

        return (await this.chunks[floor][file_i])[tile_i]
    }
}

export type direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export namespace direction {
    const vectors: Vector2[] = [
        {x: 0, y: 0},   // 0 center
        {x: -1, y: 0},  // 1 left
        {x: 0, y: 1},   // 2 top
        {x: 1, y: 0},   // 3 right
        {x: 0, y: -1},  // 4 bottom
        {x: -1, y: 1},  // 5 topleft
        {x: 1, y: 1},   // 6 topright
        {x: 1, y: -1},  // 7 botright
        {x: -1, y: -1}, // 8 botleft
    ]

    export function invert(d: direction): direction {
        // Could do something smart here, but a lookup table is easier and faster
        return [0, 3, 4, 1, 2, 7, 8, 5, 6][d] as direction
    }

    export function toVector(d: direction): Vector2 {
        return vectors[d]
    }

    export function fromDelta(v: Vector2): direction {
        return vectors.findIndex((c) => Vector2.eq(c, v)) as direction
    }

    export function fromVector(v: Vector2): direction {
        const E = -1

        // There is most likely a better solution, but this is enough for now
        // It's an 23 by 23 box where real click are clamped into.
        const lookup_table = [
            [5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            [5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            [1, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 3],
            [1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3],
            [1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 2, 2, 2, 6, 6, 6, 6, 6, 6, 3, 3, 3, 3],
            [1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 2, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 2, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 4, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 4, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3],
            [1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 4, 4, 4, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3],
            [1, 1, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7, 3, 3],
            [1, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7, 3],
            [8, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7, 7],
            [8, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7, 7],
            [8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7],
            [8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7, 7],
            [8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7, 7],
            [8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 7, 7, 7, 7, 7, 7],
        ]

        // Clamp vector into bounds
        let v2 = clampInto(v, {
            topleft: {x: -11, y: 11},
            botright: {x: 11, y: -11},
        })

        return lookup_table[11 - v2.y][v2.x + 11] as direction
    }
}

function move(pos: MapCoordinate, off: Vector2) {
    return {
        x: pos.x + off.x,
        y: pos.y + off.y,
        level: pos.level
    }
}

export async function canMove(data: MapData, pos: MapCoordinate, d: direction): Promise<boolean> {
    // Data is preprocessed so for every tile there are 8 bit signalling in which directions the player can move.
    return (await data.getTile(pos))[d - 1]
}

async function dive_internal(data: MapData, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {
    // This function does not respect any max distances and expects the caller to handle that.

    if (position.level != target.level) return null

    let dia = Vector2.sign(Vector2.sub(target, position))

    let bound = Box.from(position, target)

    let choices: { delta: Vector2, dir: direction }[] = []

    if (dia.x != 0 && dia.y != 0) choices.push({delta: dia, dir: direction.fromDelta(dia)})
    if (dia.x != 0) choices.push({delta: {x: dia.x, y: 0}, dir: direction.fromDelta({x: dia.x, y: 0})})
    if (dia.y != 0) choices.push({delta: {x: 0, y: dia.y}, dir: direction.fromDelta({x: 0, y: dia.y})})

    let dir_if_success = direction.fromVector(Vector2.sub(target, position))

    while (true) {
        if (Vector2.eq(position, target)) return {
            tile: position,
            direction: dir_if_success
        }

        let next: MapCoordinate = null

        for (let choice of choices) {
            let candidate = move(position, choice.delta)

            if (contains(bound, candidate) && (await canMove(data, position, choice.dir))) {
                next = candidate
                break
            }
        }

        if (!next) return null

        position = next
    }
}

async function dive_far_internal(data: MapData, start: MapCoordinate, dir: direction, max_distance: number): Promise<PlayerPosition | null> {
    let d = direction.toVector(dir)

    for (let i = max_distance; i > 0; i--) {
        let t = await dive_internal(data, start, move(start, Vector2.scale(i, d)))

        if (t) return t
    }

    return null
}

export async function dive(data: MapData, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {

    let delta = Vector2.sub(target, position)

    if (min_axis(delta) > 10) {
        let dir = direction.fromVector(delta)

        let res = await dive_far_internal(data, position, dir, 10)

        if (res) return res
        else return {
            tile: target,
            direction: dir
        }
    } else return dive_internal(data, position, target);

    //


    /*  For a specific tile
        Repeat until tile found or out of bounds, only consider if not out of bounds:
            1. Move towards the target tile diagonally. Only if diagonal walk is permitted.
            (E.g. in an attempt to move 1 tile north-east, you actually move 1 tile east, then north due to a wall = doesn't count.)
            2. Move towards the target tile on X-axis.
            3. Move towards the target tile on Y-axis.
     */

    /*
        If clicked more than max distance:
        Check each tile, take the maximum
     */
}

export async function surge(data: MapData, position: PlayerPosition): Promise<PlayerPosition | null> {
    return dive_far_internal(data, position.tile, position.direction, 10)
}

export async function escape(data: MapData, position: PlayerPosition): Promise<PlayerPosition | null> {
    let res = await dive_far_internal(data, position.tile, direction.invert(position.direction), 7)

    if (!res) return null
    else return {
        tile: res.tile,
        direction: position.direction
    }
}