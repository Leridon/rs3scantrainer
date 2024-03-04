import {TileCoordinates} from "./TileCoordinates";
import {Rectangle, Vector2} from "../../math";
import {base64ToBytes, bytesToBase64} from "byte-base64";
import {TileRectangle} from "./TileRectangle";
import {ValueInteraction} from "../../gamemap/interaction/ValueInteraction";
import {fill} from "lodash";
import * as lodash from "lodash";
import {util} from "../../util/util";

export type TileArea = {
    origin: TileCoordinates,
    size?: Vector2, // Default value {x: 1, y: 1}
    data?: string   // If not provided, the entire area is considered
    _active?: TileArea.ActiveTileArea
}

export namespace TileArea {
    import todo = util.todo;

    export class ActiveTileArea {
        data: Uint8Array
        size: Vector2
        origin: TileCoordinates

        constructor(public parent: TileArea) {
            this.size = lodash.cloneDeep(parent.size) ?? {x: 1, y: 1}

            if (parent.data) {
                this.data = new Uint8Array(Math.ceil(this.size.x * this.size.y / 8)).fill(255)
            } else {
                this.data = base64ToBytes(parent.data)
            }

            this.origin = lodash.cloneDeep(parent.origin)
        }

        resize(rect: TileRectangle): this {

            todo() // TODO: Implement
        }

        save(): this {
            this.parent.data = bytesToBase64(this.data)

            // TODO: Check if area is completely filled and set data to undefined if it is

            return this
        }

        disconnect(): void {
            if (this.parent) {
                this.parent._active = null
                this.parent = null
            }
        }

        private index(tile: TileCoordinates): [number, number] {
            const off = Vector2.sub(tile, this.origin)

            // Assumes the input is valid and within bounds!

            const index = off.x + off.y * this.size.x

            return [Math.floor(index / 8), index % 8]
        }

        query(coords: TileCoordinates): boolean {
            const sz = this.size

            if (coords.x < this.origin.x || coords.y < this.origin.y
                || coords.x >= (this.origin.x + sz.x)
                || coords.y >= (this.origin.y + sz.y)
            ) return false

            const [element, shift] = this.index(coords)

            return ((this.data[element] >> shift) & 1) != 0
        }

        set(tile: TileCoordinates, value: boolean): this {
            const [element, shift] = this.index(tile)

            if (value) this.data[element] |= (1 << shift)
            else this.data[element] &= 255 - (1 << shift)

            return this
        }

        add(tile: TileCoordinates): this {
            this.set(tile, true)
            return this
        }

        remove(tile: TileCoordinates): this {
            this.set(tile, false)
            return this
        }

        setRectangle(rect: TileRectangle, value: boolean = true): this {
            for (let x = rect.topleft.x; x < rect.botright.x; x++) {
                for (let y = rect.botright.y; y <= rect.topleft.y; y++) {
                    this.set({x, y, level: rect.level}, value)
                }
            }

            return this
        }
    }

    export function activate(area: TileArea): ActiveTileArea {
        return (area._active) ?? (area._active = new ActiveTileArea(area))
    }

    export function init(origin: TileCoordinates, size: Vector2 = {x: 1, y: 1}, filled: boolean = false): TileArea {
        return {
            origin: origin,
            size: size,
            data: filled ? undefined : bytesToBase64(new Uint8Array(Math.ceil(size.x * size.y / 8)).fill(255))
        }
    }

    export function fromTiles(tiles: TileCoordinates[]): TileArea {
        const area = activate(fromRect(TileRectangle.from(...tiles), false))

        for (let tile of tiles) {
            area.add(tile)
        }

        area.save()

        return area.parent
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