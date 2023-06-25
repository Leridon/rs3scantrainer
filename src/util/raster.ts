import {Box} from "../model/coordinates";

export class Raster<T> {
    public data: T[]
    size: { x: number, y: number }

    constructor(public bounds: Box,) {
        this.size = {x: bounds.botright.x - bounds.topleft.x + 1, y: bounds.topleft.y - bounds.botright.y + 1}
        this.data = new Array(this.size.x * this.size.y)
    }

    xyToI(tile: { x: number, y: number }) {
        return (tile.y - this.bounds.botright.y) * this.size.x + (tile.x - this.bounds.topleft.x)
    }

    iToXY(i: number) {
        return {
            x: i % this.size.x + this.bounds.topleft.x,
            y: Math.floor(i / this.size.x) + this.bounds.botright.y
        }
    }
}