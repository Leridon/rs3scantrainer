import {ClueStep, MapCoordinate, ScanStep} from "./clues";
import {ScanTrainer, scantrainer} from "./scantrainer";
import {MarkerLayer} from "./map";
import * as leaflet from "leaflet";
import {shapes} from "./map/shapes";

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

    abstract sendToUi(trainer: ScanTrainer): void
}

export class ScanTree extends Method {
    clue: ScanStep = null

    constructor(private dig_spot_mapping: MapCoordinate[],
                private scan_spots: { name: string, coords: MapCoordinate }[],
                public root: ScanTreeNode
    ) {
        super("scantree")

        root.setRoot(this)
    }

    sendToUi(trainer: ScanTrainer): void {
        {
            let layer = (trainer.map.getSolutionLayer() as MarkerLayer)
            for (let i = 0; i < this.dig_spot_mapping.length; i++) {
                layer.markerBySpot(this.dig_spot_mapping[i]).withLabel(
                    (i + 1).toString(),
                    "spot-number",
                    [0, 10]
                )
            }
        }

        let layer = new leaflet.FeatureGroup()

        for (let spot of this.scan_spots) {
            shapes.tilePolygon(spot.coords).setStyle({
                color: "#00FF21",
                fillColor: "#00FF21"
            })
                .bindTooltip(spot.name, {
                    interactive: false,
                    permanent: true,
                    className: "area-name",
                    offset: [0, 10],
                    direction: "center"
                })
                .addTo(layer)

            // TODO: Figure out a good spot for labels

            /*
            leaflet.marker([spot.coords.y + 2, spot.coords.x], {
                icon: leaflet.divIcon({
                    className: "area-name",
                    html: spot.name
                }),
                interactive: false,
            }).addTo(layer)*/

        }

        trainer.map.setMethodLayer(0, layer)

        this.root.sendToUI(trainer)
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

    sendToUI(app: ScanTrainer) {
        {
            let candidates = this.candidates()
            let layer = app.map.getSolutionLayer() as (MarkerLayer)

            layer.getMarkers().forEach((e) => {
                let id = this.root.spotToNumber(e.getSpot())

                let active = candidates.findIndex((c) => c == id) >= 0

                e.setActive(active)
            })
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

        scantrainer.tabcontrols.setHowToTabs(this.howTo())
    }

    generateList(depth: number, container: JQuery, app: ScanTrainer) {
        let line = $("<div>")
            .addClass("scantreeline")
            .css("margin-left", `${depth * 12}px`)
            .css("font-size", `${13 / (Math.pow(1.25, depth))}px`)

        if (depth == 0) {
            $("<span>")
                .addClass("nextchoice")
                .text(prettykey(this.parent.key))
                .on("click", () => this.sendToUI(app))
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

        this.generateChildren(depth + 1, container, app)
    }

    generateChildren(depth: number, container: JQuery, app: ScanTrainer) {
        if (depth >= 2) return

        let triples = this.children().filter((e) => e.parent.key.kind == PingType.TRIPLE)

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
                        } else {

                            let synthetic = new ScanTreeNode("Which spot?",
                                null,
                                triples.map((e) => {
                                    return [{
                                        key: e.solved.toString(),
                                        kind: PingType.TRIPLE
                                    }, e]
                                }),
                                null
                            )
                            synthetic.setParent(this, {key: "Triple", kind: PingType.TRIPLE})

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

        this.children().filter((e) => e.parent.key.kind == PingType.DOUBLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => e.parent.key.kind == PingType.SINGLE)
            .forEach((e) => e.generateList(depth, container, app))

        this.children().filter((e) => (typeof e.parent.key.kind) == "string")
            .forEach((e) => e.generateList(depth, container, app))
    }
}