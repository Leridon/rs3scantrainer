export class Raster<T> {
    public data: T[]
    size: { x: number, y: number }

    constructor(public bounds: {
                    left: number,
                    right: number,
                    top: number,
                    bottom: number,
                },
    ) {
        this.size = {x: bounds.right - bounds.left, y: bounds.top - bounds.bottom}
        this.data = new Array(this.size.x * this.size.y)
    }

    xyToI(tile: { x: number, y: number }) {
        return (tile.y - this.bounds.bottom) * this.size.x + (tile.x - this.bounds.left)
    }

    iToXY(i: number) {
        return {
            x: i % this.size.x + this.bounds.left,
            y: Math.floor(i / this.size.x) + this.bounds.bottom
        }
    }
}