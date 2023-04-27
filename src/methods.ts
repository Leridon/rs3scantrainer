import {setHowToTabs} from "./scantrainer";
import {ClueStep, ScanStep} from "./clues";

export type Video = {
    ref: string,
    contributor?: string
}

export type HowTo = {
    scanmap?: string,
    video?: Video,
    text?: string,
    image?: string
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

export enum PingType {
    SINGLE,
    DOUBLE,
    TRIPLE
}

export type ChildKey = {
    key: string,
    kind: PingType | string
}

function prettykey(key: ChildKey) {
    if ((typeof key.kind) == "string") {
        return key.kind
    } else {
        switch (key.kind) {
            case PingType.SINGLE:
                return "Single"
            case PingType.DOUBLE:
                return "Double"
            case PingType.TRIPLE:
                return "Triple"
        }
    }
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
        public _children: [ChildKey, ScanTreeNode][],
        public howto: HowTo
    ) {
    }

    howTo(): HowTo {
        return Object.assign(this.howto, this.root.mapDetail())
    }

    setRoot(root: ScanTree) {
        this.root = root

        for (let [key, child] of this._children) {
            child.setParent(this, key)
        }
    }

    setParent(parent: ScanTreeNode, key: ChildKey) {
        this.parent = {
            node: parent,
            key: key
        }

        this.root = parent.root

        for (let [key, child] of this._children) {
            child.setParent(this, key)
        }
    }

    path(): ScanTreeNode[] {
        if (this.parent)
            return this.parent.node.path().concat(this)
        else
            return [this]
    }

    children() {
        return this._children.map((e) => e[1])
    }

    sendToUI() {

        {
            let path = this.path()

            let list = $("#pathview").empty()

            for (let i = 0; i < path.length; i++) {
                let p = path[i]

                let li = $("<li>").addClass("breadcrumb-item")

                let text = p.parent ? p.parent.key.key : "Start"

                if (i < path.length - 1) {
                    $("<a>").attr("href", "javascript:;")
                        .on("click", () => p.sendToUI())
                        .text(text)
                        .appendTo(li)
                } else {
                    li.addClass("active")
                        .text(text)
                }

                li.appendTo(list)
            }
        }

        $("#nextscanstep").text(this.instruction)

        this.generateChildren(0, $("#scantreeview").empty())

        setHowToTabs(this.howTo())
    }

    generateList(depth: number, container: JQuery) {
        let line = $("<div>")
            .addClass("scantreeline")
            .css("margin-left", `${depth * 12}px`)
            .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

        if (depth == 0) {
            $("<span>")
                .addClass("nextchoice")
                .text(prettykey(this.parent.key))
                .on("click", () => this.sendToUI())
                .appendTo(line)

            //line.css("line-height", `30px`)
        } else if (depth > 0) {
            $("<span>")
                .text(prettykey(this.parent.key) + ": ")
                .appendTo(line)
        }

        $("<span>")
            .text(this.instruction)
            .appendTo(line)

        line.appendTo(container)

        this.generateChildren(depth + 1, container)
    }

    generateChildren(depth: number, container: JQuery) {
        if(depth >= 2) return

        let triples = this.children().filter((e) => e.parent.key.kind == PingType.TRIPLE)

        if (triples.length == 1) {
            triples.forEach((e) => e.generateList(depth, container))
        } else if (triples.length > 1) {
            let line = $("<div>")
                .addClass("scantreeline")
                .css("margin-left", `${depth * 12}px`)
                .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)


            if (depth == 0) {
                line.append($("<span>").text("Triple ping at "))

                for (let child of triples) {
                    $("<span>")
                        .text(`${child.solved}`)
                        .addClass("nextchoice")
                        .addClass("tripleping")
                        .on("click", () => child.sendToUI())
                        .appendTo(line)
                }
            } else {
                $("<span>")
                    .text(`Triple ping at ${triples.map((e) => e.solved).join(", ")}`)
                    .appendTo(line)
            }

            container.append(line)
        }

        this.children().filter((e) => e.parent.key.kind == PingType.DOUBLE)
            .forEach((e) => e.generateList(depth, container))

        this.children().filter((e) => e.parent.key.kind == PingType.SINGLE)
            .forEach((e) => e.generateList(depth, container))

        this.children().filter((e) => (typeof e.parent.key.kind) == "string")
            .forEach((e) => e.generateList(depth, container))
    }
}