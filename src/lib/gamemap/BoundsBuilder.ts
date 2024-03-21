import {floor_t, TileCoordinates, TileRectangle} from "../runescape/coordinates";
import {Rectangle, Vector2} from "../math";
import {TileArea} from "../runescape/coordinates/TileArea";
import * as leaflet from "leaflet"

export default class BoundsBuilder {
    private bounds: Rectangle = null
    private level: floor_t = null

    constructor() {}

    addTile(...tiles: (TileCoordinates | Vector2)[]): void {
        for (let tile of tiles) {
            if (!tile) continue

            if (!this.bounds) {
                this.bounds = {topleft: tile, botright: tile}
            } else {
                this.bounds = Rectangle.extendTo(this.bounds, tile)
            }

            if ("level" in tile) {
                if (this.level == null) this.level = tile.level
                else this.level = Math.min(this.level, tile.level) as floor_t
            }
        }
    }

    addRectangle(rect: TileRectangle | Rectangle): void {
        if (!rect) return
        this.addTile(rect.topleft)
        this.addTile(rect.botright)

        if ("level" in rect) {
            if (this.level == null) this.level = rect.level
            else this.level = Math.min(this.level, rect.level) as floor_t
        }
    }

    addArea(area: TileArea): void {
        if (!area) return
        this.addRectangle(TileArea.toRect(area))
    }

    get(): TileRectangle {
        return {
            topleft: this.bounds.topleft,
            botright: this.bounds.botright,
            level: this.level || 0
        }
    }
}