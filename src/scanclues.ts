import Dict = NodeJS.Dict;
import {goto} from "./scantrainer";
import {METHODS} from "http";

export class ScanClue {
    constructor(public id: string,
                public name: string,
                public spotCount: number,
                public mapImgPath: string,
                public path: ScanTree,
    ) {
        this.path.setPath([], this)
    }
}

type Video = {
    ref: string,
    contributor?: string
}

type Methods = {
    video?: Video,
    text?: string
}

export class ScanTree {
    path: string[] = []
    clue: ScanClue = null

    constructor(public instruction: string,
                public solutionSpots: number[],
                public children: Dict<ScanTree>,
                public methods: Methods
    ) {
    }

    method(methods: Methods): ScanTree {
        this.methods = methods
        return this
    }

    solved(spot: number) {
        this.children = {}
        this.solutionSpots = [spot]
        return this
    }

    child(id: string, child: ScanTree) {
        this.children[id] = child
        return this
    }

    choiceID(): string {
        return this.path[this.path.length - 1]
    }

    get(path: string[]): ScanTree {
        if (path.length == 0) return this

        return this.children[path[0]].get(path.slice(1))
    }

    isSolution(): boolean {
        return this.solutionSpots.length > 0
    }

    setPath(path: string[], clue: ScanClue) {
        this.path = path
        this.clue = clue

        for (let childKey in this.children) {
            this.children[childKey].setPath(path.concat(childKey), clue)
        }
    }

    allCandidates(): number[] {
        if (this.children instanceof Array<number>) return this.children

        let res: number[] = []

        for (let candidatesKey in this.children) res = res.concat(this.children[candidatesKey].allCandidates())

        return res
    }

    toHtml(depth: number = 0) {
        let outer = $("<div>")
            .css("font-size", `${20 / (Math.pow(1.2, depth))}px`)

        // Add choice ids
        if (depth == 1) {
            $("<div>")
                .addClass("menubutton").addClass("nisbutton2")
                .css("display", "inline")
                .text(this.choiceID()).on("click", (e) => goto(this))
                .appendTo(outer)

        } else if (depth > 1) {
            $("<span>").text(`${this.choiceID()} -> `).appendTo(outer)
        }

        // Add top level instruction
        {
            let span = $("<span>")
                .text(this.instruction)
                .appendTo(outer)

            if (depth == 0) span.addClass("instruction-top")
        }

        // Recursively add children
        {
            let box = $("<div>").addClass("indented")

            for (let candidate in this.children) {
                this.children[candidate]
                    .toHtml(depth + 1)
                    .appendTo(box)
            }

            box.appendTo(outer)
        }

        return outer
    }
}