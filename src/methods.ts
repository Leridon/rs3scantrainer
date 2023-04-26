import {setMethod2} from "./scantrainer";
import {ClueStep, ScanStep} from "./clues";

export type Video = {
    ref: string,
    contributor?: string
}

export enum HowToSection {
    scanmap,
    videoclip,
    explanation,
}

export type HowTo = {
    section: HowToSection,
    image?: string
    text?: string,
    video?: Video,
}

export abstract class Method {
    clue: ClueStep

    abstract interactivePanel(): JQuery<HTMLElement>

    abstract details(): HowTo[]
}

export class ScanTree implements Method {
    clue: ScanStep = null

    constructor(public map_ref: string,
                public root: ScanTreeNode
    ) {
        root.setPath([], this)
    }

    interactivePanel(): JQuery<HTMLElement> {
        return this.root.toHtml(0);
    }

    details(): HowTo[] {
        return [];
    }

    mapDetail(): HowTo {
        return {
            section: HowToSection.scanmap,
            image: this.map_ref
        }
    }
}

export type ChildKey = {
    key: string,
    pretty: string
}

export class ScanTreeNode {
    path: ChildKey[]
    root: ScanTree

    constructor(
        public instruction: string,
        public solved: number | null,
        public children: [ChildKey, ScanTreeNode][],
        public howtos: HowTo[]
    ) {
    }

    setPath(path: ChildKey[], root: ScanTree) {
        this.path = path
        this.root = root

        for (let [key, child] of this.children) {
            child.setPath(path.concat(key), root)
        }
    }

    choiceID(): ChildKey {
        return this.path[this.path.length - 1]
    }

    sendToUI() {
        setMethod2(this.toHtml(0), this.howtos.concat(this.root.mapDetail()))
    }

    toHtml(depth: number = 0): JQuery {
        let outer = $("<div>")
            .css("font-size", `${13 / (Math.pow(1.2, depth - 1))}px`)

        // Add choice ids
        if (depth == 1) {
            $("<div>")
                .addClass("menubutton").addClass("nisbutton2")
                .css("display", "inline-block")
                .text(this.choiceID().pretty).on("click", this.sendToUI)
                .appendTo(outer)

        } else if (depth > 1) {
            $("<span>").text(`${this.choiceID().pretty} -> `).appendTo(outer)
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

            for (let [_, child] of this.children) {
                child
                    .toHtml(depth + 1)
                    .appendTo(box)
            }

            box.appendTo(outer)
        }

        return outer
    }
}