import Dict = NodeJS.Dict;
import {activateTree, activePath} from "./index";
import {goto} from "./scantrainer";

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

export class ScanTree {
    path: string[] = []
    clue: ScanClue = null

    constructor(public instruction: string,
                public solutionSpots: number[],
                public children: Dict<ScanTree>
    ) {
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

    toHtml(isActive: boolean, prefix: JQuery | null, depth: number) {
        let outer = $("<div>")

        if (prefix) outer.append(prefix)

        if (this.children instanceof Array<number>) {
            $("<span>")
                .text(this.instruction)
                .appendTo(outer)
        } else {

            $("<span>")
                .text(this.instruction)
                .appendTo(outer)

            if (!this.isSolution() && depth <= 0) {
                $("<div>").addClass("indented")
                    .text("...")
                    .appendTo(outer)
            } else {
                for (let candidate in this.children) {
                    let box = $("<div>").addClass("indented")

                    this.children[candidate]
                        .toHtml(false,
                            isActive
                                ? $("<input type='button'>").attr("value", candidate).on("click", (e) => {
                                    goto(this.children[candidate])
                                })
                                : $("<span>").text(`${candidate} -> `),
                            depth - 1
                        )
                        .appendTo(box)


                    box.appendTo(outer)
                }
            }

        }

        return outer
    }
}