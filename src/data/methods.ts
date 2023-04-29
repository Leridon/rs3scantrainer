import {ChildKey, HowTo, Method, PingType, ScanTree, ScanTreeNode} from "../methods";
import {clues} from "./clues";
import {ClueStep} from "../clues";

let methods: Method[][] = []

let n = Math.max(...clues.map((e) => e.id))

for (let i = 0; i < n; i++) {
    methods.push([])
}

console.log(methods)

function associate(v: { id: number, method: Method }) {
    console.log(v.id)
    console.log(methods[v.id])
    methods[v.id].push(v.method)
}

export function forClue(clue: ClueStep): Method[] {
    return methods[clue.id]
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
                    kind: PingType.SINGLE
                },
                child)
        }

        double(child: Builder | ScanTreeNode) {
            return this.child({
                    key: `${this.spotName}2`,
                    kind: PingType.DOUBLE
                },
                child)
        }

        triple(spot: number, howto: HowTo = {}) {
            let child = new Builder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))

            if (howto) child.howto(howto)

            this.child({
                key: `${this.spotName}3/Spot ${spot}`,
                kind: PingType.TRIPLE
            }, child)

            return this
        }

        solution(spot: number, howto: HowTo = {}) {
            let child = new Builder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))

            if (howto) child.howto(howto)

            this.child({
                key: `Spot ${spot}`,
                kind: `Spot ${spot}`
            }, child)

            return this
        }

        child(key: ChildKey | string, child: Builder | ScanTreeNode) {
            if (typeof key == "string") key = {
                key: key,
                kind: key
            }

            if (child instanceof Builder) {
                child = child.node
            }

            this.node._children.push([key, child])

            return this
        }
    }

    function solved(spot: number): Builder {
        return new Builder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))
    }

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
            arrival: {ref: "./img/scanassets/zanaris/Arrival.webm", contributor: "Leridon"},
            AtoB: {ref: "./img/scanassets/zanaris/AtoB.webm", contributor: "Leridon"},
            BtoC: {ref: "./img/scanassets/zanaris/BtoC.webm", contributor: "Leridon"},
            CtoD: {ref: "./img/scanassets/zanaris/CtoD.webm", contributor: "Leridon"},
            DtoE: {ref: "./img/scanassets/zanaris/DtoE.webm", contributor: "Leridon"},
            AtoF: {ref: "./img/scanassets/zanaris/AtoF.webm", contributor: "Leridon"},
        },
        ardounge: {
            toA: {ref: "./img/scanassets/ardounge/toA.webm", contributor: "Leridon"},
            AtoC: {ref: "./img/scanassets/ardounge/AtoC.webm", contributor: "Leridon"},
            CtoD: {ref: "./img/scanassets/ardounge/CtoD.webm", contributor: "Leridon"},
        }
    }
    let howtos = {
        piscatoris: {
            AtoC: {
                text: "Go to the tile 3 tiles south and 2 tiles west of the fairy ring, then surge."
            },
            CtoD: {
                text: "Surge again and then walk to D. D is in the row of the southern row of the pine tree to the west and on the western column of the yew tree to the south."
            },
            DtoE: {
                text: "E is exactly 3 tiles east of D"
            }
        },
        dorgeshkaan: {
            AtoB: {
                text: "B is in the gateway to the east."
            },
            BtoC: {
                text: "C is on top of the western stair pair."
            },
            CtoD: {
                text: "D is directly at the bottom of the northern stairs."
            },
            DtoE: {
                text: "E is at the bottom of the stairs north of the pond."
            },
            FtoG: {
                text: "G is at the top of the stairs."
            },
            GtoH: {
                text: "H is two surges north of G."
            },
            HtoI: {},
            FtoH: {},
            Ito18: {
                text: "The spot is on the eastern side, use Sphere 3"
            },
            Hto19: {
                text: "The spot is on the eastern side, use Sphere 3"
            },
            Ito20: {
                text: "The spot is on the south east, return south with Sphere 2"
            },
        }
    }

    associate({
        id: 361, //zanaris
        method: tree(
            "img/scanassets/zanaris/zanarismap.png",
            step("Fairy Ring to", "A")
                .howto({
                    text: "Spot A is the tile you arrive in when teleporting to the fairy ring.",
                    video: videos.zanaris.arrival,
                })
                .triple(1)
                .triple(2)
                .triple(3)
                .triple(4)
                .single(step("Slayer Cape (Chaeldar) to", "F")
                    .howto({
                        text: "Using the slayer cape teleport to Chaeldar (option 7) you will land in spot F.",
                        video: videos.zanaris.AtoF
                    })
                    .double(solved(19))
                    .triple(18)
                    .triple(19)
                    .single(step("Wicked hood cosmic altar tele to ", "G")
                        .triple(20)
                        .triple(21)
                        .triple(22)
                    )
                )
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
                        .single(step("Surge to", "D")
                            .howto({
                                text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                video: videos.zanaris.CtoD
                            })
                            .double(solved(13))
                            .single(solved(16))
                        )
                        .double(step("Surge to", "D")
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
                    ).single(solved(17)
                        .howto({
                            text: "The spot has been narrowed down to the chicken altar. Use the slayer cape to Chaeldae to get there fastest."
                        })))
        )
    })

    associate({
        id: 352, // ardounge
        method: tree("img/scanassets/ardounge/ardoungemap.png",
            step("Ardounge teleport to", "A")
                .howto({
                    video: videos.ardounge.toA,
                    text: "Teleport to ardounge (Spot A)."
                })
                .triple(1)
                .triple(2)
                .double(step("Dive to", "B")
                    .triple(2)
                    .triple(3)
                    .triple(4)
                    .double(step("Teleport to ardounge lodestone")
                        .howto({
                            text: "The spot is to the north, use the lodestone."
                        })
                        .double(solved(5))
                        .triple(6)
                        .triple(7)
                    )
                )
                .single(step("Dave's spellbook to", "C")
                    .howto({
                        video: videos.ardounge.AtoC,
                        text: "Ruled out most of east ardounge, teleport to C with Dave's spellbook (4)."
                    })
                    .triple(8)
                    .triple(9)
                    .triple(10)
                    .triple(11)
                    .single(step("The spot is at the western end")
                        .howto({
                            text: "Dive/Surge to the west. Hug the north wall of the long buildings so you don't miss 26."
                        })
                        .solution(23)
                        .solution(24)
                        .solution(25)
                        .solution(26)
                        .solution(27)
                        .solution(28)
                    )
                    .double(step("Step/Dive to", "D")
                        .howto({
                            video: videos.ardounge.CtoD,
                            text: "Walk 1 square west then dive to D, to have E accessible via surge. D is the tile directly east of the manhole cover."
                        })
                        .triple(12)
                        .single(step("Go through the manhole")
                            .triple(21)
                            .triple(22)
                        )
                        .double(step("Surge to", "E")
                            .triple(13)
                            .triple(14)
                            .triple(15)
                            .triple(16)
                            .double(step("Go through the manhole")
                                .triple(17)
                                .triple(18)
                            )
                            .single(step("Teleport back to C and use the gate")
                                .triple(19)
                                .double(solved(20))
                            )
                        )
                    )
                )
        )
    })

    associate({
        id: 355, // piscatoris
        method: tree("img/scanassets/piscatoris/piscatoris.png",
            step("Fairy ring (AKQ) to", "A")
                .triple(1)
                .triple(2)
                .triple(3)
                .double(step("Dive to", "C")
                    .howto(howtos.piscatoris.AtoC)
                    .triple(5)
                    .triple(6)
                    .double(solved(4))
                    .single(solved(7))
                )
                .single(step("Dive to", "C")
                    .howto(howtos.piscatoris.AtoC)
                    .double(step("Surge/Walk to", "D")
                        .howto(howtos.piscatoris.CtoD)
                        .triple(9)
                        .triple(10)
                        .triple(11)
                        .triple(12)
                        .double(solved(8).howto({
                            text: "The spot is to the west."
                        }))
                    )
                    .single(step("Surge/Walk to", "D")
                        .howto(howtos.piscatoris.CtoD)
                        .double(step("Go to", "E")
                            .single(solved(19)
                                .howto({
                                    text: "It's the south eastern spot at Guthix' memorial."
                                }))
                            .double(step("Go to", "F")
                                .triple(13)
                                .triple(14)
                                .single(step("The spot is south")
                                    .solution(18)
                                    .solution(20)
                                )
                            )
                        )
                        .single(step("Go to", "G")
                            .howto({
                                text: "G is two tiles south-east of D"
                            })
                            .double(solved(21))
                            .single(step("Go to", "H")
                                .double(step("Go to", "I")
                                    .single(solved(17))
                                    .double(step("Go to", "J")
                                        .single(solved(15).howto({text: "The spot is inside the falcon fence :("}))
                                        .double(step("Go to", "K")
                                            .triple(22)
                                            .triple(23)
                                            .double(solved(16))
                                        )
                                    )
                                )
                                .single(step("Go to", "K")
                                    .double(step("The spot is south")
                                        .solution(24)
                                        .solution(25)
                                    )
                                    .single(solved(26).howto({
                                        text: "It's the very south-western spot"
                                    }))
                                )
                            )
                        )
                    )
                )
        )
    })

    associate({
        id: 362, // dorgeshkaan
        method:
            tree("img/scanassets/dorgeshkaan/dorgeshkaan.png",
                step("Different level?")
                    .child({
                            key: "Upper",
                            kind: "Yes"
                        }, step("Sphere 4 to", "F")
                            .triple(13)
                            .triple(14)
                            .double(step("Go to", "G")
                                .howto(howtos.dorgeshkaan.FtoG)
                                .triple(14)
                                .double(step("Surge to", "H")
                                    .howto(howtos.dorgeshkaan.GtoH)
                                    .triple(15)
                                    .double(solved(19).howto(howtos.dorgeshkaan.Hto19))
                                )
                            )
                            .single(step("Go to", "H")
                                .howto(howtos.dorgeshkaan.FtoH)
                                .double(step("The spot is north")
                                    .solution(16)
                                    .solution(17))
                                .single(step("Go to", "I").howto(howtos.dorgeshkaan.HtoI)
                                    .double(solved(18).howto(howtos.dorgeshkaan.Ito18))
                                    .single(solved(20).howto(howtos.dorgeshkaan.Ito20))
                                )
                            )
                    )
                    .child({
                            key: "Lower",
                            kind: "No"
                        }, step("Sphere 2 to", "A")
                            .triple(1)
                            .triple(2)
                            .triple(3)
                            .triple(4)
                            .triple(5)
                            .double(step("Go to", "B")
                                .howto(howtos.dorgeshkaan.AtoB)
                                .triple(6)
                                .double(solved(7))
                            )
                            .single(step("Go to", "C")
                                .howto(howtos.dorgeshkaan.BtoC)
                                .double(step("Stairs down to", "D")
                                    .howto(howtos.dorgeshkaan.CtoD)
                                    .double(step("Go to", "E").howto(howtos.dorgeshkaan.DtoE)
                                        .triple(8)
                                        .triple(9)
                                        .double(solved(10))
                                    )
                                )
                                .single(step("Stairs down to", "D")
                                    .howto(howtos.dorgeshkaan.CtoD)
                                    .double(solved(11))
                                    .single(solved(12))
                                )
                            )
                    )
            )
    })
}

export function loadMethods() {
    loadScanMethods()
}
