import {ChildKey, HowTo, Method, PingType, ScanTree, ScanTreeNode} from "../model/methods";
import {clues} from "./clues";
import {ClueStep} from "../model/clues";
import {Box, MapCoordinate} from "../model/coordinates";

let methods: Method[][] = []

let n = Math.max(...clues.map((e) => e.id))

for (let i = 0; i < n; i++) {
    methods.push([])
}
function associate(v: { id: number, method: Method }) {
    methods[v.id].push(v.method)
}

export function forClue(clue: ClueStep): Method[] {
    return methods[clue.id]
}

function loadScanMethods() {
    class ScanBuilder {
        constructor(public node: ScanTreeNode) {
        }

        howto(d: HowTo) {
            this.node.howto = d

            return this
        }

        protected child(key: ChildKey | string, child: ScanBuilder | ScanTreeNode) {
            if (typeof key == "string") key = {
                key: key,
                kind: key
            }

            if (child instanceof ScanBuilder) {
                child = child.node
            }

            this.node._children.push([key, child])

            return this
        }

        answer(key: ChildKey | string, child: ScanBuilder | ScanTreeNode) {
            return this.child(key, child)
        }
    }

    class SpotBuilder extends ScanBuilder {
        constructor(node: ScanTreeNode,
                    private spotName: string) {
            super(node)
        }

        single(child: ScanBuilder | ScanTreeNode) {
            return this.child({
                    key: `${this.spotName}1`,
                    kind: PingType.SINGLE
                },
                child)
        }

        double(child: ScanBuilder | ScanTreeNode) {
            return this.child({
                    key: `${this.spotName}2`,
                    kind: PingType.DOUBLE
                },
                child)
        }

        triple(spot: number, howto?: HowTo) {
            let child = new ScanBuilder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))

            if (howto) child.howto(howto)

            this.child({
                key: `${this.spotName}3/Spot ${spot}`,
                kind: PingType.TRIPLE
            }, child)

            return this
        }
    }

    function tree(coordinates: MapCoordinate[],
                  spots: { name: string, area: Box }[],
                  tree: ScanBuilder): ScanTree {
        return new ScanTree(
            coordinates, spots, tree.node)
    }

    function ask(question: string) {
        return new ScanBuilder(new ScanTreeNode(question, null, [], {}))
    }

    function goTo(where: string, how: string = "Go", question: string = "") {
        let instruction = `${how} to ${where}.`

        if (question) instruction += ` ${question}`

        return new SpotBuilder(new ScanTreeNode(instruction, null, [], {}), where)
    }

    function digAt(spot: number): ScanBuilder {
        return new ScanBuilder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}))
    }

    let videos = {
        zanaris: {
            arrival: {ref: "./assets/scanassets/zanaris/Arrival.webm", contributor: "Leridon"},
            AtoB: {ref: "./assets/scanassets/zanaris/AtoB.webm", contributor: "Leridon"},
            BtoC: {ref: "./assets/scanassets/zanaris/BtoC.webm", contributor: "Leridon"},
            CtoD: {ref: "./assets/scanassets/zanaris/CtoD.webm", contributor: "Leridon"},
            DtoE: {ref: "./assets/scanassets/zanaris/DtoE.webm", contributor: "Leridon"},
            AtoF: {ref: "./assets/scanassets/zanaris/AtoF.webm", contributor: "Leridon"},
        },
        ardounge: {
            toA: {ref: "./assets/scanassets/ardounge/toA.webm", contributor: "Leridon"},
            AtoC: {ref: "./assets/scanassets/ardounge/AtoC.webm", contributor: "Leridon"},
            CtoD: {ref: "./assets/scanassets/ardounge/CtoD.webm", contributor: "Leridon"},
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
            [
                {x: 2406, y: 4428}, // 1
                {x: 2429, y: 4431}, // 2
                {x: 2417, y: 4444}, // 3
                {x: 2400, y: 4441}, // 4
                {x: 2410, y: 4460}, // 5
                {x: 2439, y: 4460}, // 6
                {x: 2441, y: 4428}, // 7
                {x: 2417, y: 4470}, // 8
                {x: 2402, y: 4466}, // 9
                {x: 2396, y: 4457}, // 10
                {x: 2385, y: 4447}, // 11
                {x: 2380, y: 4421}, // 12
                {x: 2372, y: 4467}, // 13
                {x: 2404, y: 4406}, // 14
                {x: 2389, y: 4405}, // 15
                {x: 2377, y: 4410}, // 16
                {x: 2453, y: 4471}, // 17
                {x: 2457, y: 4443}, // 18
                {x: 2468, y: 4439}, // 19
                {x: 2414, y: 4378}, // 20
                {x: 2420, y: 4381}, // 21
                {x: 2423, y: 4372}, // 22
            ], [
                {name: "A", area: {topleft: {x: 2412, y: 4434}, botright: {x: 2412, y: 4434}}},
                {name: "B", area: {topleft: {x: 2410, y: 4436}, botright: {x: 2410, y: 4436}}},
                {name: "C", area: {topleft: {x: 2420, y: 4444}, botright: {x: 2420, y: 4444}}},
                {name: "D", area: {topleft: {x: 2409, y: 4455}, botright: {x: 2409, y: 4455}}},
                {name: "E", area: {topleft: {x: 2398, y: 4444}, botright: {x: 2398, y: 4444}}},
                {name: "F", area: {topleft: {x: 2447, y: 4430}, botright: {x: 2447, y: 4430}}},
                {name: "G", area: {topleft: {x: 2405, y: 4381}, botright: {x: 2405, y: 4381}}},
            ],
            goTo("A", "Fairy Ring")
                .howto({
                    text: "Spot A is the tile you arrive in when teleporting to the fairy ring.",
                    video: videos.zanaris.arrival,
                })
                .triple(1)
                .triple(2)
                .triple(3)
                .triple(4)
                .single(goTo("F", "Slayer Cape (Chaeldar)")
                    .howto({
                        text: "Using the slayer cape teleport to Chaeldar (option 7) you will land in spot F.",
                        video: videos.zanaris.AtoF
                    })
                    .double(digAt(19))
                    .triple(18)
                    .triple(19)
                    .single(goTo("G", "Wicked hood cosmic altar tele")
                        .triple(20)
                        .triple(21)
                        .triple(22)
                    )
                )
                .double(goTo("B")
                    .howto({
                        text: "B is exactly 2 tiles northwest of the center of the fairy ring.",
                        video: videos.zanaris.AtoB
                    })
                    .triple(10)
                    .double(goTo("C", "Dive")
                        .howto({
                            text: "C is the south-eastern tile of the entrance to the wheat field and directly reachable from B with a Dive.",
                            video: videos.zanaris.BtoC
                        })
                        .single(goTo("D", "Surge")
                            .howto({
                                text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                video: videos.zanaris.CtoD
                            })
                            .double(digAt(13))
                            .single(digAt(16))
                        )
                        .double(goTo("D", "Surge")
                            .howto({
                                text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                video: videos.zanaris.CtoD
                            })
                            //.single(, solved([14, 15]))
                            .double(goTo("E", "Step and Surge")
                                .howto({
                                    text: "Stepping 1 tile south-west and then surging will land you directly at E.",
                                    video: videos.zanaris.DtoE
                                })
                                .triple(11)
                                .triple(12))
                            .triple(8)
                            .triple(9)
                            .single(ask("The spot is in the tunnels to the cosmic altar.")
                                .answer("14", digAt(14))
                                .answer("15", digAt(15))
                            )
                        )
                        .triple(5)
                        .triple(6)
                        .triple(7)
                    ).single(digAt(17)
                        .howto({
                            text: "The spot has been narrowed down to the chicken altar. Use the slayer cape to Chaeldaer to get there fastest."
                        })))
        )
    })

    /*
    associate({
        id: 352, // ardounge
        method: tree("assets/scanassets/ardounge/ardoungemap.png",
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
        method: tree("assets/scanassets/piscatoris/piscatoris.png",
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
            tree("assets/scanassets/dorgeshkaan/dorgeshkaan.png",
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
    })*/
}

export function loadMethods() {
    loadScanMethods()
}
