import {ClueStep, ScanStep} from "./clues";
import {Application, scantrainer} from "../application";
import {Box, MapCoordinate} from "./coordinates";
import {ScanTreeMethodLayer} from "../uicontrol/map/methodlayer";
import {modal, Modal} from "../uicontrol/widgets/modal";
import {ActiveLayer} from "../uicontrol/map/activeLayer";
import {ChildType} from "./scans/scans";

export type Video = {
    ref: string,
    contributor?: string
}

export type HowTo = {
    video?: Video,
    text?: string,
    image?: string
}

export abstract class Method {
    clue: ClueStep

    protected constructor(public type: string) {
    }

    abstract howto(): HowTo

    abstract explanationModal(): Modal

    abstract methodLayer(trainer: Application): ActiveLayer
}

export type ScanSpot = {
    name: string,
    is_virtual?: boolean,
    area?: Box,
    is_far_away?: boolean,
    overrides?: {
        single?: MapCoordinate[]
        double?: MapCoordinate[]
        triple?: MapCoordinate[]
        toofar?: MapCoordinate[]
        differentlevel?: MapCoordinate[]
    }
}

export namespace ScanSpot {
    export function override(s: ScanSpot, type: ChildType): MapCoordinate[] | null {
        switch (type) {
            case ChildType.SINGLE:
                return s.overrides ? s.overrides.single : null;
            case ChildType.DOUBLE:
                return s.overrides ? s.overrides.double : null;
            case ChildType.TRIPLE:
                return s.overrides ? s.overrides.triple : null;
            case ChildType.DIFFERENTLEVEL:
                return s.overrides ? s.overrides.differentlevel : null;
            case ChildType.TOOFAR:
                return s.overrides ? s.overrides.toofar : null;

        }
    }

    export function setOverride(s: ScanSpot, type: ChildType, override: MapCoordinate[]): void {
        if (!s.overrides) s.overrides = {}

        switch (type) {
            case ChildType.SINGLE:
                s.overrides.single = override;
                break;
            case ChildType.DOUBLE:
                s.overrides.double = override;
                break;
            case ChildType.TRIPLE:
                s.overrides.triple = override;
                break;
            case ChildType.DIFFERENTLEVEL:
                s.overrides.differentlevel = override;
                break;
            case ChildType.TOOFAR:
                s.overrides.toofar = override;
                break;

        }
    }
}

class ScanExplanationModal extends Modal {

    protected hidden() {
        ($("#pingexplanationvideo").get(0) as HTMLVideoElement).pause();
    }
}

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
            /*
            let rel = [this.where]
            if (this.parent) rel.push(this.parent.node.where);

            let ca = this.solved != null ? [this.solved] : []


            layer.setRelevant(
                ca,
                rel,
                true
            )*/

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
}