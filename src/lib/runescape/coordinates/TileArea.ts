import {TileCoordinates} from "./TileCoordinates";
import {Rectangle, Vector2} from "../../math";
import {base64ToBytes, bytesToBase64} from "byte-base64";
import {TileRectangle} from "./TileRectangle";
import {ValueInteraction} from "../../gamemap/interaction/ValueInteraction";
import {fill} from "lodash";

export type TileArea = {
    origin: TileCoordinates,
    size?: Vector2, // Default value {x: 1, y: 1}
    data?: string   // If not provided, the entire area is considered
    _loaded?: Uint8Array
}

export namespace TileArea {
    export function load(area: TileArea): TileArea {
        if (area.data) area._loaded = base64ToBytes(area.data)
        else area._loaded = new Uint8Array(Math.ceil(area.size.x * area.size.y / 8)).fill(255)

        return area
    }

    export function save(area: TileArea): TileArea {
        if (area._loaded) {
            area.data = bytesToBase64(area._loaded)

            // TODO: Check if area is completely filled and set data to undefined if it is
            area._loaded = undefined
        }

        return area
    }

    function index(area: TileArea, tile: TileCoordinates): [number, number] {
        const off = Vector2.sub(tile, area.origin)

        // Assumes the input is valid and within bounds!

        const index = off.x + off.y * area.size.x

        return [Math.floor(index / 8), index % 8]
    }

    export function set(area: TileArea, tile: TileCoordinates, value: boolean): TileArea {
        const [element, shift] = index(area, tile)

        if (value) area._loaded[element] |= (1 << shift)
        else area._loaded[element] &= 255 - (1 << shift)

        return area
    }

    export function setRectangle(area: TileArea, rect: TileRectangle, value: boolean): TileArea {
        for (let x = rect.topleft.x; x < rect.botright.x; x++) {
            for (let y = rect.botright.y; y <= rect.topleft.y; y++) {
                set(area, {x, y, level: rect.level}, value)
            }
        }

        return area
    }

    export function add(area: TileArea, coords: TileCoordinates): TileArea {
        return set(area, coords, true)
    }

    export function remove(area: TileArea, coords: TileCoordinates): TileArea {
        return set(area, coords, false)
    }

    export function contains(area: TileArea, coords: TileCoordinates): boolean {
        const sz = size(area)

        if (coords.x < area.origin.x || coords.y < area.origin.y
            || coords.x >= (area.origin.x + sz.x)
            || coords.y >= (area.origin.y + sz.y)
        ) return false

        if (area.data) {
            if (!area._loaded) throw new TypeError("")

            const [element, shift] = index(area, coords)

            return ((area._loaded[element] >> shift) & 1) != 0
        }

        return true
    }

    export function init(origin: TileCoordinates, size: Vector2 = {x: 1, y: 1}, filled: boolean = false): TileArea {
        return load({
            origin: origin,
            size: size,
            data: filled ? undefined : bytesToBase64(new Uint8Array(Math.ceil(size.x * size.y / 8)).fill(255))
        })
    }

    export function fromRect(rect: TileRectangle, filled: boolean = true): TileArea {
        return init(TileRectangle.bl(rect), {x: Rectangle.tileWidth(rect), y: Rectangle.tileHeight(rect)}, filled)
    }

    export function toRect(area: TileArea): TileRectangle {
        return TileRectangle.from(area.origin, TileCoordinates.move(area.origin, Vector2.add(area.size ? area.size : {x: 1, y: 1}, {x: -1, y: -1})))
    }

    export function size(area: TileArea): Vector2 {
        return area.size || {x: 1, y: 1}
    }

    export function isSingleTile(area: TileArea): boolean {
        return !area.size || (area.size.x == 1 && area.size.y == 1)
    }

    export function isRectangle(area: TileArea): boolean {
        return !area.data
    }
}