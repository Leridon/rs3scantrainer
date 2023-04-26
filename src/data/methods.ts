import {ChildKey, HowToSection, Method, ScanTree, ScanTreeNode, Video} from "../methods";
import {cluesById} from "./clues";
import {ScanStep} from "../clues";

let videos = {
    zanaris: {
        "arrival": {ref: "./img/scanassets/zanaris/Arrival.mp4", contributor: "Leridon"},
        "AtoB": {ref: "./img/scanassets/zanaris/AtoB.mp4", contributor: "Leridon"},
        "BtoC": {ref: "./img/scanassets/zanaris/BtoC.mp4", contributor: "Leridon"},
        "CtoD": {ref: "./img/scanassets/zanaris/CtoD.mp4", contributor: "Leridon"},
        "DtoE": {ref: "./img/scanassets/zanaris/DtoE.mp4", contributor: "Leridon"},
        "AtoF": {ref: "./img/scanassets/zanaris/AtoF.mp4", contributor: "Leridon"},
    }
}

function loadScanMethods() {
    type CombinedHowTo = {
        video?: Video,
        explanation?: string
    }

    class Builder {
        constructor(public node: ScanTreeNode) {
        }

        howto(d: CombinedHowTo) {
            let howtos = []

            if (d.explanation)
                howtos.push({
                    section: HowToSection.explanation
                })
            if (d.video)
                howtos.push({
                    section: HowToSection.videoclip
                })

            this.node.howtos = howtos

            return this
        }

        triple(spot: number, howto: CombinedHowTo = null) {
            let child = new Builder(new ScanTreeNode(`Go to spot ${spot}`, spot, [], []))

            if (howto) child.howto(howto)

            this.child({
                key: `Spot ${spot}`,
                pretty: `Spot ${spot}`,
            }, child)

            return this
        }

        child(key: ChildKey | string, child: Builder | ScanTreeNode) {
            if (typeof key == "string") key = {
                key: key,
                pretty: key
            }

            if (child instanceof Builder) {
                child = child.node
            }

            this.node.children.push([key, child])

            return this
        }
    }

    function solved(spots: number[], instruction: string = "Solved!"): Builder {
        return new Builder(new ScanTreeNode(`Go to spot ${spots.join(", ")}`, spots[0]/*TODO*/, [], []))
    }

    function step(instruction: string): Builder {
        return new Builder(new ScanTreeNode(instruction, null, [], []))
    }

    function tree(map_ref: string,
                  tree: Builder): ScanTree {
        return new ScanTree(map_ref, tree.node)
    }

    function associate(v: { id: string, method: Method }) {
        let clue = cluesById[v.id]

        console.log(v.method)

        clue.methods.push(v.method)
        v.method.clue = clue
    }

    associate({
        id: "scanzanaris",
        method: tree(
            "img/scanssets/zanaris/zanarismap.png",

            step("Fairy Ring to A")
                .howto({
                    explanation: "Spot A is the tile you arrive when you teleport to the fairy ring.",
                    video: videos.zanaris.arrival,
                })
                .child("A2",
                    step("Go to B")
                        .howto({
                            explanation: "B is exactly 2 tiles northwest of the center of the fairy ring.",
                            video: videos.zanaris.AtoB
                        })
                        .child("B3", solved([10]))
                        .child("B2", step("Dive to C")
                            .howto({
                                explanation: "C is the south-eastern tile of the entrance to the wheat field and directly reachable from B with a Dive.",
                                video: videos.zanaris.BtoC
                            })
                            .child("C3", solved([5, 6, 7]))
                            .child("C2", step("Step and Surge to D")
                                .howto({
                                    explanation: "Stepping 1 tile north-west and then surging will land you directly at D",
                                    video: videos.zanaris.CtoD
                                })
                                .child("D3", solved([8, 9, 10]))
                                .child("D2", step("Step and Surge to E")
                                    .howto({
                                        explanation: "Stepping 1 tile south-west and then surging will land you directly at E.",
                                        video: videos.zanaris.DtoE
                                    })
                                    .child("E3", solved([11])
                                        .child("E2", solved([12]))
                                        .child("D1", solved([14, 15]))
                                    )))
                            .child("C1", step("Go to D")
                                .howto({
                                    explanation: "Stepping 1 tile north-west and then surging will land you directly at D",
                                    video: videos.zanaris.CtoD
                                })
                                .child("D2", solved([13]))
                                .child("D1", solved([16]))
                            )
                        ).child("B1", solved([17])))
                .triple(1)
                .triple(2)
                .triple(3)
                .triple(4)
        )
    })

}

export function loadMethods() {
    loadScanMethods()


}
