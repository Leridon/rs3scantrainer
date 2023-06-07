import {ClueStep, ScanStep} from "./clues";
import {ScanTree2} from "./scans/ScanTree2";
import {clues} from "../data/clues";

export type method_base = {
    type: string,
    clue: ScanStep | number,
}

export type indirected = method_base & { clue: number }
export type resolved<T extends ClueStep> = method_base & { clue: T }

export type method = ScanTree2.tree

export function resolve<U extends ClueStep, T extends method_base>(clue: T & indirected): T & resolved<U> {
    if (clue == null) return null

    let copy: method_base = lodash.clone(clue)

    copy.clue = clues.find((c) => c.id == clue.clue)

    return copy as (T & resolved<U>)
}

import * as lodash from "lodash"

export function indirect<T extends method_base, U extends ClueStep>(clue: T & resolved<U>): T & indirected {
    if (clue == null) return null

    let copy: method_base = lodash.clone(clue)

    copy.clue = clue.clue.id

    return copy as (T & indirected)
}

// TODO: Remove
export type HowTo = {
    video?: any,
    text?: string,
    image?: string
}


/*

/
export class ScanTree extends Method {
    constructor(public clue: ScanStep,
                public dig_spot_mapping: MapCoordinate[],
                public scan_spots: ScanSpot[],
                public root: ScanTreeNode
    ) {
        super("scantree")

        root.setRoot(this)
    }

    explanationModal(): Modal {
        return modal("modal-scantree-method-explanation", ScanExplanationModal);
    }

    methodLayer(app: Application): ActiveLayer {
        return new ScanTreeMethodLayer(this, app)
    }

    howto(): HowTo {
        return this.root.howTo();
    }

    spotToNumber(spot: MapCoordinate) {
        return this.dig_spot_mapping.findIndex((e) => e.x == spot.x && e.y == spot.y) + 1
    }

    spot(number: number) {
        return this.dig_spot_mapping[number - 1]
    }

    area(name: string): ScanSpot {
        return this.scan_spots.find((s) => s.name == name)
    }
}


export type ChildKey = {
    key: string,
    kind: ChildType | string
}

function prettykey(key: ChildKey) {
    if ((typeof key.kind) == "string") {
        return key.kind
    } else {
        switch (key.kind) {
            case ChildType.SINGLE:
                return "Single"
            case ChildType.DOUBLE:
                return "Double"
            case ChildType.TRIPLE:
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
        public where: string | null,
        public _children: [ChildKey, ScanTreeNode][],
        public howto: HowTo,
        private is_synthetic_triple_node: boolean = false
    ) {
    }

    candidates(): number[] {
        if (this.solved) return [this.solved]
        return this.children().map((e) => e.candidates()).reduce((a, b) => a.concat(b), [])
    }

    howTo(): HowTo {
        return this.howto
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

    sendToUI(app: Application) {
        {
            let layer = app.howtotabs.map.getActiveLayer() as ScanTreeMethodLayer

            layer.setNode(this)
        }

        {
            let path = this.path()

            let list = $("#pathview").empty()

            for (let i = 0; i < path.length; i++) {
                let p = path[i]

                let li = $("<li>").addClass("breadcrumb-item")

                let text = p.parent ? p.parent.key.key : "Start"

                if (i < path.length - 1) {
                    $("<a>").attr("href", "javascript:;")
                        .on("click", () => p.sendToUI(app))
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

        this.generateChildren(0, $("#scantreeview").empty(), app)

        scantrainer.howtotabs.setHowToTabs(this.howTo())
    }

    generateList(depth: number, container: JQuery, app: Application, key_override: string = null) {
        let line = $("<div>")
            .addClass("scantreeline")
            .css("margin-left", `${depth * 12}px`)
            .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

        if (depth == 0) {
            $("<span>")
                .addClass("nextchoice")
                .text(key_override || prettykey(this.parent.key))
                .on("click", () => this.sendToUI(app))
                .appendTo(line)

            //line.css("line-height", `30px`)
        } else if (depth > 0) {
            $("<span>")
                .text((key_override || prettykey(this.parent.key)) + ": ")
                .appendTo(line)
        }

        $("<span>")
            .text(this.instruction)
            .appendTo(line)

        line.appendTo(container)

        this.generateChildren(depth + 1, container, app)
    }

    generateChildren(depth: number, container: JQuery, app: Application) {
        if (depth >= 2) return

        if (this.is_synthetic_triple_node) {
            this.children().filter((e) => e.parent.key.kind == ChildType.TRIPLE)
                .forEach((e) => e.generateList(depth, container, app, e.solved.toString()))

            return;
        }

        let triples = this.children().filter((e) => e.parent.key.kind == ChildType.TRIPLE)

        if (triples.length >= 1) {
            let line = $("<div>")
                .addClass("scantreeline")
                .css("margin-left", `${depth * 12}px`)
                .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

            if (depth == 0) {

                let triple_span = $("<span>")
                    .addClass("nextchoice")
                    .text("Triple")
                    .on("click", () => {
                        if (triples.length == 1) {
                            triples[0].sendToUI(app)
                        } else if (this.is_synthetic_triple_node) {
                            this.sendToUI(app) // This does nothing
                        } else {
                            let synthetic = new ScanTreeNode("Which spot?",
                                null,
                                this.where,
                                triples.map((e) => {
                                    return [{
                                        key: e.solved.toString(),
                                        kind: ChildType.TRIPLE
                                    }, e]
                                }),
                                null,
                                true
                            )
                            synthetic.parent = {node: this, key: {key: "Triple", kind: ChildType.TRIPLE}}
                            synthetic.root = this.root

                            synthetic.sendToUI(app)
                        }
                    })
                    .appendTo(line)

                line.append($("<span>").text("at"))

                for (let child of triples) {
                    $("<span>")
                        .text(`${child.solved}`)
                        .addClass("nextchoice")
                        .addClass("tripleping")
                        .on("click", () => child.sendToUI(app))
                        .appendTo(line)
                }
            } else {
                $("<span>")
                    .text(`Triple ping at ${triples.map((e) => e.solved).join(", ")}`)
                    .appendTo(line)
            }

            container.append(line)
        }

        this.children().filter((e) => e.parent.key.kind == ChildType.DOUBLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => e.parent.key.kind == ChildType.SINGLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => (typeof e.parent.key.kind) == "string")
            .forEach((e) => e.generateList(depth, container, app))
    }
}*/