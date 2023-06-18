import {Box, contains, MapCoordinate, Vector2} from "./coordinates";
import {Bounds} from "leaflet";
import {rangeRight} from "lodash";

type Tile = {
    center_blocked: boolean,
    neighbour_blocked: boolean[]
}

type PlayerPosition = {
    tile: MapCoordinate,
    direction: direction
}

interface MapData {
    getTile(coordinate: MapCoordinate): Tile
}

type direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

namespace direction {
    const vectors: Vector2[] = [
        {x: -1, y: 0},  // left
        {x: 0, y: -1},  // bottom
        {x: 1, y: 0},   // right
        {x: 0, y: 1},   // top
        {x: -1, y: 1},  // topleft
        {x: -1, y: -1}, // botleft
        {x: 1, y: -1},  // botright
        {x: 1, y: 1},   // topright
    ]

    export function invert(d: direction): direction {
        // Could do something smart here, but a lookup table is easier and faster
        return [2, 3, 0, 1, 6, 7, 4, 5][d] as direction
    }

    export function toVector(d: direction): Vector2 {
        return vectors[d]
    }

    export function fromVector(v: Vector2): direction {
        return vectors.findIndex((c) => Vector2.eq(c, v)) as direction
    }
}

function move(pos: MapCoordinate, off: Vector2) {
    return {
        x: pos.x + off.x,
        y: pos.y + off.y,
        level: pos.level
    }
}

export function canMove(data: MapData, pos: MapCoordinate, d: direction): boolean {
    // To be honest, this function in its entirety is mostly a guess. Maybe it is completely broken

    let origin = data.getTile(pos)

    if (origin.center_blocked || origin.neighbour_blocked[d]) return false

    let target = data.getTile(move(pos, direction.toVector(d)))

    return !(target.center_blocked || target.neighbour_blocked[direction.invert(d)])
}

function dive_internal(data: MapData, position: MapCoordinate, target: MapCoordinate): PlayerPosition | null {
    // This function does not respect any max distances and expects the caller to handle that.

    if (position.level != target.level) return null

    let dia = Vector2.cardinality(Vector2.sub(target, position))

    let bound = Box.from(position, target)

    let choices: { delta: Vector2, dir: direction }[] = []

    if (dia.x != 0 && dia.y != 0) choices.push({delta: dia, dir: direction.fromVector(dia)})
    if (dia.x != 0) choices.push({delta: {x: dia.x, y: 0}, dir: direction.fromVector({x: dia.x, y: 0})})
    if (dia.y != 0) choices.push({delta: {x: 0, y: dia.y}, dir: direction.fromVector({x: 0, y: dia.y})})

    while (true) {
        if (Vector2.eq(position, target)) return {
            tile: position,
            direction: 0 // TODO: Calculate proper direction based on the info image
        }

        let next: MapCoordinate = null

        for (let choice of choices) {
            let candidate = move(position, choice.delta)

            if (contains(bound, candidate) && canMove(data, position, choice.dir)) {
                next = candidate
                break
            }
        }

        if (!next) return null

        position = next
    }
}

function dive_far_internal(data: MapData, start: MapCoordinate, dir: direction, max_distance: number): PlayerPosition | null {

    let d = direction.toVector(dir)


    rangeRight(0, )
}

export function dive(data: MapData, position: MapCoordinate, target: MapCoordinate): PlayerPosition | null {


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

export function surge(data: MapData, position: PlayerPosition): PlayerPosition | null {
    // Same as max distance dive in the given direction
}

export function escape(data: MapData, position: PlayerPosition): PlayerPosition | null {
    // Same as surge in the inverted direction and lower distance
}