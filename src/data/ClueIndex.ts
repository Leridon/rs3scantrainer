import {Clues} from "../lib/runescape/clues";
import {clues} from "./clues";
import {Lazy} from "../lib/properties/Lazy";

export class ClueIndex<T extends object = {}> {
    private data: ({ clue: Clues.Step } & T)[]

    constructor(init: () => T) {
        this.data = Array(ClueIndex.max_id.get())

        clues.forEach(c => {
            this.data[c.id] = {clue: c, ...init()}
        })
    }

    get(id: number): ({ clue: Clues.Step } & T) {
        return this.data[id]
    }

    filtered(): ({ clue: Clues.Step } & T)[] {
        return this.data.filter(c => !!c)
    }

    static simple(): ClueIndex {
        return new ClueIndex(() => ({}))
    }
}

export namespace ClueIndex {
    export const max_id = new Lazy<number>(() => Math.max(...clues.map(c => c.id)))

}