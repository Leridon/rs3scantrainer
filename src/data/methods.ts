import {ChildKey, HowTo, Method, ScanTree, ScanTreeNode, Video} from "../methods";
import {cluesById} from "./clues";
import {ScanStep} from "../clues";


function associate(v: { id: string, method: Method }) {
    let clue = cluesById[v.id]

    console.log(v.method)

    clue.methods.push(v.method)
    v.method.clue = clue
}


function loadScanMethods() {
    class Builder {
        constructor(public node: ScanTreeNode,
                    public spotName?: string) {
        }

        howto(d: HowTo) {
            this.node.howto = d

            return this
        }

        single(child: Builder | ScanTreeNode) {
            return this.child({
                    key: `${this.spotName}1`,
                    pretty: "Single"
                },
                child)
        }

        double(child: Builder | ScanTreeNode) {
            return this.child({
                    key: `${this.spotName}2`,
                    pretty: "Double"
                },
                child)
        }

        triple(spot: number, howto: HowTo = {}) {
            let child = new Builder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))

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

    /*function solved(spots: number[], instruction: string = "Solved!"): Builder {
        return new Builder(new ScanTreeNode(`Go to spot ${spots.join(", ")}`, spots[0], [], {}))
    }*/

    function step(instruction: string, next_spot?: string): Builder {
        let ins = next_spot ? instruction + " " + next_spot : instruction

        return new Builder(new ScanTreeNode(ins, null, [], {}), next_spot)
    }

    function tree(map_ref: string,
                  tree: Builder): ScanTree {
        return new ScanTree(map_ref, tree.node)
    }

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


    associate({
        id: "scanzanaris",
        method: tree(
            "img/scanassets/zanaris/zanarismap.png",

            step("Fairy Ring to", "A")
                .howto({
                    text: "Spot A is the tile you arrive in when teleporting to the fairy ring.",
                    video: videos.zanaris.arrival,
                })
                .double(step("Go to", "B")
                    .howto({
                        text: "B is exactly 2 tiles northwest of the center of the fairy ring.",
                        video: videos.zanaris.AtoB
                    })
                    .triple(10)
                    .double(step("Dive to", "C")
                        .howto({
                            text: "C is the south-eastern tile of the entrance to the wheat field and directly reachable from B with a Dive.",
                            video: videos.zanaris.BtoC
                        })
                        .single(step("Go to", "D")
                            .howto({
                                text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                video: videos.zanaris.CtoD
                            })
                            //.double()
                            .triple(16)
                        )
                        .double(step("Step and Surge to", "D")
                            .howto({
                                text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                video: videos.zanaris.CtoD
                            })
                            //.single(, solved([14, 15]))
                            .double(step("Step and Surge to", "E")
                                .howto({
                                    text: "Stepping 1 tile south-west and then surging will land you directly at E.",
                                    video: videos.zanaris.DtoE
                                })
                                .triple(11)
                                .triple(12))
                            .triple(8)
                            .triple(9)
                            .triple(10)
                        )
                        .triple(5)
                        .triple(6)
                        .triple(7)
                    ).triple(17))
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
