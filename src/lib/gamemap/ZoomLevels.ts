export class ZoomLevels<ExtraDataT> {

    constructor(public levels: {
        min: number,
        value: ExtraDataT
    }[]) {}

    getIndex(zoom: number): number {
        if (zoom == null) return null

        for (let i = 0; i < this.levels.length - 1; i++) {
            if (zoom < this.levels[i + 1].min) return i
        }

        return this.levels.length - 1
    }

    get(zoom: number): ExtraDataT {
        return this.levels[this.getIndex(zoom)].value
    }
}