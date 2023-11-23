import {Clues} from "../lib/runescape/clues";

export class ClueIndex<T extends object = {}> {
    private constructor(private data: ({ clue: Clues.Step } & T)[]) {
    }

    get(id: number): ({ clue: Clues.Step } & T) {
        return this.data[id]
    }

    filtered(): ({ clue: Clues.Step } & T)[] {
        return this.data.filter(c => !!c)
    }

    static simple(base_data: Clues.Step[]): ClueIndex {
        let data: ({ clue: Clues.Step })[] = Array(Math.max(...base_data.map(c => c.id)))

        base_data.forEach(c => {
            data[c.id] = {clue: c}
        })
        return new ClueIndex(data)
    }

    with<U extends object>(init: () => U): ClueIndex<T & U> {
        return new ClueIndex<T & U>(this.data.map(v => {
            return v ? {...v, ...init()} : null
        }))
    }
}