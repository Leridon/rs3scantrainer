import {setHowToTabs} from "./scantrainer";
import {ClueStep, ScanStep} from "./clues";

export type Video = {
    ref: string,
    contributor?: string
}

export type HowTo = {
    scanmap?: string,
    image?: string
    text?: string,
    video?: Video,
}

export abstract class Method {
    clue: ClueStep

    protected constructor(public type: string) {
    }

    abstract howto(): HowTo

    abstract sendToUi(): void
}

export class ScanTree extends Method {
    clue: ScanStep = null

    constructor(public map_ref: string,
                public root: ScanTreeNode
    ) {
        super("scantree")

        root.setRoot(this)
    }

    sendToUi(): void {
        this.root.sendToUI()
    }

    howto(): HowTo {
        return this.root.howTo();
    }

    mapDetail(): HowTo {
        return {
            scanmap: this.map_ref
        }
    }
}

export type ChildKey = {
    key: string,
    pretty: string
}

export class ScanTreeNode {
    parent?: {
        node: ScanTreeNode,
        key: ChildKey
    } = null
    root: ScanTree

    constructor(
        public instruction: string,
        public solved: number | null,
        public children: [ChildKey, ScanTreeNode][],
        public howto: HowTo
    ) {
    }

    howTo(): HowTo {
        return Object.assign(this.howto, this.root.mapDetail())
    }

    setRoot(root: ScanTree) {
        this.root = root

        for (let [key, child] of this.children) {
            child.setParent(this, key)
        }
    }

    setParent(parent: ScanTreeNode, key: ChildKey) {
        this.parent = {
            node: parent,
            key: key
        }

        this.root = parent.root

        for (let [key, child] of this.children) {
            child.setParent(this, key)
        }
    }

    path(): ScanTreeNode[] {
        if (this.parent)
            return this.parent.node.path().concat(this)
        else
            return [this]
    }

    sendToUI() {

        {
            let path = this.path()


            let list = $("#pathview").empty()
            console.log(path)
            console.log(list)

            for (let i = 0; i < path.length; i++) {
                let p = path[i]

                let li = $("<li>").addClass("breadcrumb-item")

                let text = p.parent ? p.parent.key.key : "Root"

                if (i < path.length - 1) {
                    $("<a>").attr("href", "javascript:;")
                        .on("click", () => p.sendToUI())
                        .text(text)
                        .appendTo(li)
                } else {
                    li.addClass("active")
                        .text(text)
                }

                li.append(list)
            }
        }

        $("#temporaryid").empty().append(this.toHtml(0))
        setHowToTabs(this.howto)
    }

    toHtml(depth: number = 0): JQuery {
        let outer = $("<div>")
            .css("font-size", `${13 / (Math.pow(1.2, depth - 1))}px`)

        let line = $("<div>")
            .addClass("scantreeline")
            .appendTo(outer)

        line.on("click", () => this.sendToUI())

        // Add choice ids
        if (depth == 1) {
            $("<span>")
                //.addClass("menubutton").addClass("nisbutton2")
                .addClass("nextchoice")
                .text(`${this.parent.key.pretty} -> `)
                .appendTo(line)

        } else if (depth > 1) {
            $("<span>")
                .text(`${this.parent.key.pretty} -> `)
                .appendTo(line)
        }

        // Add top level instruction
        {
            let span = $("<span>")
                .text(this.instruction)
                .appendTo(line)

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