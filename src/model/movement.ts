import {MapCoordinate} from "./coordinates";
import {ChunkedData} from "../util/ChunkedData";
import * as lodash from "lodash"
import {Rectangle, Vector2} from "../util/math";
import * as pako from "pako"

type TileMovementData = number

namespace TileMovementData {
    export function free(tile: TileMovementData, d: direction): boolean {
        const t = [1, 2, 4, 8, 16, 32, 64, 128]

        return (Math.floor(tile / t[d - 1]) % 2) != 0
    }
}

export type PlayerPosition = {
    tile: MapCoordinate,
    direction: direction
}

export namespace PlayerPosition {
    export function eq(a: PlayerPosition, b: PlayerPosition) {
        return MapCoordinate.eq(a.tile, b.tile) && a.direction == b.direction
    }
}

interface MapData {
    getTile(coordinate: MapCoordinate): Promise<TileMovementData>
}

type file = Uint8Array

export class HostedMapData implements MapData {

    meta = {
        chunks_per_file: 20,
        chunks_x: 100,
        chunks_z: 200,
        chunk_size: 64
    }

    chunks: (file | Promise<file>)[][]

    private async fetch(file_x: number, file_z: number, floor: number): Promise<Uint8Array> {
        let a = await fetch(`map/collision-${file_x}-${file_z}-${floor}.bin`)

        return new Uint8Array(await a.arrayBuffer()) // TODO: Inflate
    }

    private constructor() {
        // For every floor (0 to 3), create enough slots in the data cache.
        this.chunks = [null, null, null, null].map(() => Array(this.meta.chunks_x * this.meta.chunks_z / (this.meta.chunks_per_file * this.meta.chunks_per_file)))
    }

    private static _instance: HostedMapData = new HostedMapData()

    static get() {
        return HostedMapData._instance
    }

    async getTile(coordinate: MapCoordinate): Promise<TileMovementData> {
        let floor = coordinate.level || 0

        let file_x = Math.floor(coordinate.x / (this.meta.chunk_size * this.meta.chunks_per_file))
        let file_y = Math.floor(coordinate.y / (this.meta.chunk_size * this.meta.chunks_per_file))
        let file_i = file_y * this.meta.chunks_per_file + file_x

        if (!this.chunks[floor][file_i]) {

            let promise = this.fetch(file_x, file_y, floor)

            this.chunks[floor][file_i] = promise

            promise.then((a) => {
                this.chunks[floor][file_i] = a
            })
        }

        let tile_x = coordinate.x % (this.meta.chunk_size * this.meta.chunks_per_file)
        let tile_y = coordinate.y % (this.meta.chunk_size * this.meta.chunks_per_file)
        let tile_i = tile_y * (this.meta.chunk_size * this.meta.chunks_per_file) + tile_x

        return (await this.chunks[floor][file_i])[tile_i]
    }
}

export type direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export namespace direction {
    export const cardinal: direction[] = [1, 2, 3, 4]
    export const diagonal: direction[] = [5, 6, 7, 8]
    export const all: direction[] = [1, 2, 3, 4, 5, 6, 7, 8]

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

        // TODO: Clamping probably isnt correct and also weird.

        // Clamp vector into bounds
        let v2 = Rectangle.clampInto(v, {
            topleft: {x: -11, y: 11},
            botright: {x: 11, y: -11},
        })

        return lookup_table[11 - v2.y][v2.x + 11] as direction
    }

    export function toString(dir: direction): string {
        return [
            "center",
            "west",
            "north",
            "east",
            "south",
            "northwest",
            "northeast",
            "southeast",
            "southwest"
        ][dir]
    }

    export const west = 1
    export const north = 2
    export const east = 3
    export const south = 4
}

export function move(pos: MapCoordinate, off: Vector2) {
    return {
        x: pos.x + off.x,
        y: pos.y + off.y,
        level: pos.level
    }
}

export async function canMove(data: MapData, pos: MapCoordinate, d: direction): Promise<boolean> {
    // Data is preprocessed so for every tile there are 8 bit signalling in which directions the player can move.
    return TileMovementData.free(await data.getTile(pos), d)
}

export namespace PathFinder {

    export type state = {
        data: MapData,
        start: MapCoordinate,
        tiles: ChunkedData<{ parent: ChunkedData.coordinates, unreachable?: boolean }>,
        queue: ChunkedData.coordinates[],
        next: number,
        blocked?: boolean
    }

    export function init_djikstra(start: MapCoordinate, data: MapData = HostedMapData.get()): state {
        let state: state = {
            data: data,
            start: start,
            tiles: new ChunkedData(),
            queue: [ChunkedData.split(start)],
            next: 0
        }

        state.tiles.set(state.queue[0], {parent: null})

        return state
    }

    async function djikstra2(state: state, target: MapCoordinate, step_limit: number): Promise<void> {
        // This is a typical djikstra algorithm
        // To improve it to A*, it still needs to prefer ortogonal pathing before diagonal pathing like ingame, but I'm not sure how to do that yet.
        // Possibly with a stable priority queue and tile distance as an estimator

        while (state.blocked) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        state.blocked = true

        // Abstraction to push elements into the queue. Filters out of bounds tiles and tiles that already have a path
        function push(tile: MapCoordinate, parent: ChunkedData.coordinates) {
            let i = ChunkedData.split(tile)

            if (state.tiles.get(i) == null) {
                state.tiles.set(i, {parent: parent})
                state.queue.push(i)
            }
        }

        while (state.queue.length < step_limit && state.next < state.queue.length) {
            let e = state.queue[state.next++]

            const directions: direction[] = [1, 2, 3, 4, 5, 6, 7, 8]

            for (let i of directions) {
                if (await canMove(state.data, e.coords, i)) push(move(e.coords, direction.toVector(i)), e)
            }

            if (Vector2.eq(e.coords, target)) break
        }

        state.blocked = false
    }

    function get(state: state, tile: ChunkedData.coordinates): MapCoordinate[] {
        function helper(i: ChunkedData.coordinates): ChunkedData.coordinates[] {
            let parent = state.tiles.get(i)?.parent

            if (state.tiles.get(i)?.parent == null) return [i]

            let p = helper(parent)
            p.push(i)
            return p
        }

        let p = helper(tile).map((c) => lodash.clone(c.coords as MapCoordinate))

        // TODO: Reduce path to necessary waypoints
        p.forEach(l => l.level = state.start.level)

        return p
    }

    export async function find(state: state, target: MapCoordinate): Promise<MapCoordinate[] | null> {
        if (target.level != state.start.level) return null

        let target_i = ChunkedData.split(target)

        // Check the cache for existing result
        let existing = state.tiles.get(target_i)
        if (existing != null) {
            if (existing.unreachable) return null
            else return get(state, target_i)
        }

        // Check if the target tile can be reached from any of its direct neighbours
        // If not, do not even search for a path.
        let reachable_at_all = ([1, 2, 3, 4] as direction[]).some((d) => canMove(state.data, move(target, direction.toVector(d)), direction.invert(d)))

        if (!reachable_at_all) {
            state.tiles.set(target_i, {parent: null, unreachable: true})
            return null
        }

        await djikstra2(state, target, 5000)

        if (state.tiles.get(target_i) == null) {
            // Cache whether the tile is unreachable to prevent endless search
            state.tiles.set(target_i, {parent: null, unreachable: true})
            return null
        }

        return get(state, target_i)
    }
}


export namespace MovementAbilities {
    export type movement_ability = "surge" | "dive" | "escape" | "barge"

    async function dive_internal(data: MapData, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {
        // This function does not respect any max distances and expects the caller to handle that.

        if (position.level != target.level) return null

        let dia = Vector2.sign(Vector2.sub(target, position))

        let bound = Rectangle.from(position, target)

        let choices: { delta: Vector2, dir: direction }[] = []

        /* Repeat until tile found or out of bounds, only consider if not out of bounds:
            1. Move towards the target tile diagonally. Only if diagonal walk is permitted.
            (E.g. in an attempt to move 1 tile north-east, you actually move 1 tile east, then north due to a wall = doesn't count.)
            2. Move towards the target tile on X-axis.
            3. Move towards the target tile on Y-axis.
         */
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

                if (Rectangle.contains(bound, candidate) && (await canMove(data, position, choice.dir))) {
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

        /*
            If clicked more than max distance:
            Check each tile, take the maximum
         */
        // Is there a way to optimize this so not every tile has to be checked?
        for (let i = max_distance; i > 0; i--) {
            let t = await dive_internal(data, start, move(start, Vector2.scale(i, d)))

            if (t) return t
        }

        return null
    }

    export async function dive(data: MapData, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {

        let delta = Vector2.sub(target, position)

        if (Vector2.max_axis(delta) > 10) {
            let dir = direction.fromVector(delta)

            // This ignores the fact that dive is always consumed, even if diving a distance of 0 tiles.
            return await dive_far_internal(data, position, dir, 10)
        } else return dive_internal(data, position, target);
    }

    export async function dive2(position: MapCoordinate, target: MapCoordinate, data: MapData = HostedMapData.get()): Promise<PlayerPosition | null> {

        let delta = Vector2.sub(target, position)

        if (Vector2.max_axis(delta) > 10) {
            let dir = direction.fromVector(delta)

            // This ignores the fact that dive is always consumed, even if diving a distance of 0 tiles.
            return await dive_far_internal(data, position, dir, 10)
        } else return dive_internal(data, position, target);
    }

    export async function barge(data: MapData, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {
        return dive(data, position, target) // Barge is the same logic as dive
    }

    export async function barge2(position: MapCoordinate, target: MapCoordinate, data: MapData = HostedMapData.get()): Promise<PlayerPosition | null> {
        return dive(data, position, target) // Barge is the same logic as dive
    }


    export async function surge(data: MapData, position: PlayerPosition): Promise<PlayerPosition | null> {
        return dive_far_internal(data, position.tile, position.direction, 10)
    }

    export async function surge2(position: PlayerPosition, data: MapData = HostedMapData.get()): Promise<PlayerPosition | null> {
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


    export async function escape2(position: PlayerPosition, data: MapData = HostedMapData.get()): Promise<PlayerPosition | null> {
        let res = await dive_far_internal(data, position.tile, direction.invert(position.direction), 7)

        if (res) res.direction = direction.invert(res.direction)

        return res
    }

    export async function generic(data: MapData, ability: movement_ability, position: MapCoordinate, target: MapCoordinate): Promise<PlayerPosition | null> {
        switch (ability) {
            case "surge":
                return surge(data, {tile: position, direction: direction.fromVector(Vector2.sub(target, position))});
            case "dive":
                return dive(data, position, target);
            case "escape":
                return escape(data, {tile: position, direction: direction.fromVector(Vector2.sub(position, target))});
            case "barge":
                return barge(data, position, target);

        }
    }

    export function cooldown(ability: MovementAbilities.movement_ability, powerburst: boolean, mobile: boolean = true): number {
        switch (ability) {
            case "surge":
                return (powerburst ? 2 : (mobile ? 17 : 34))
            case "dive":
                return (powerburst ? 2 : (mobile ? 17 : 34))
            case "escape":
                return mobile ? 17 : 34 // Powerburst does not affect escape
            case "barge":
                return 34;
        }
    }
}