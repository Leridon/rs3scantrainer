import {ChildKey, HowTo, Method, PingType, ScanTree, ScanTreeNode} from "../model/methods";
import {clues} from "./clues";
import {ClueStep} from "../model/clues";
import {Box, MapCoordinate} from "../model/coordinates";
import Dict = NodeJS.Dict;
import {go} from "fuzzysort";

let methods: Method[][] = []

let n = Math.max(...clues.map((e) => e.id))

for (let i = 0; i < n; i++) {
    methods.push([])
}

function associate(v: { id: number, method: Method }) {
    methods[v.id].push(v.method)

    v.method.clue = clues.find((c) => c.id == v.id)
}

export function forClue(clue: ClueStep): Method[] {
    return methods[clue.id]
}

function loadScanMethods() {

    class ScanBuilder {
        constructor(public node: ScanTreeNode,
                    private spotName: string | null) {
        }

        children: ScanBuilder[] = []

        propagateMethods(methods: Dict<HowTo>, parent: ScanBuilder = null) {
            if (!parent) {
                this.node.howto = methods[`-${this.spotName}`] || null
            } else if (parent.spotName != this.spotName) {
                this.node.howto = methods[`${parent.spotName}-${this.spotName}`] || null
            }

            this.children.forEach((c) => {
                if (!c.spotName) c.spotName = this.spotName
                c.propagateMethods(methods, this)
            })
        }

        protected child(key: ChildKey | string, child: ScanBuilder) {
            if (typeof key == "string") key = {
                key: key,
                kind: key
            }

            this.children.push(child)

            this.node._children.push([key, child.node])

            return this
        }

        answer(key: ChildKey | string, child: ScanBuilder) {
            return this.child(key, child)
        }

        single(child: ScanBuilder) {
            return this.child({
                    key: `${this.spotName}1`,
                    kind: PingType.SINGLE
                },
                child)
        }

        double(child: ScanBuilder) {
            return this.child({
                    key: `${this.spotName}2`,
                    kind: PingType.DOUBLE
                },
                child)
        }

        triple(...spot: number[]) {
            spot.forEach((s) => {
                let child = new ScanBuilder(new ScanTreeNode(`Dig at spot ${s}`, s, [], {}), s.toString())

                this.child({
                    key: `${this.spotName}3/Spot ${s}`,
                    kind: PingType.TRIPLE
                }, child)
            })

            return this
        }
    }

    function tree(coordinates: MapCoordinate[],
                  spots: { name: string, area?: Box, spot?: MapCoordinate }[],
                  methods: Dict<HowTo>,
                  tree: ScanBuilder): ScanTree {

        tree.propagateMethods(methods)
        return new ScanTree(coordinates, spots, tree.node)
    }

    function goTo(where: string, how: string = "Go to {}.") {
        let instruction = how.replace("{}", where)

        return new ScanBuilder(new ScanTreeNode(instruction, null, [], {}), where)
    }

    function digAt(spot: number): ScanBuilder {
        return new ScanBuilder(new ScanTreeNode(`Dig at spot ${spot}`, spot, [], {}), spot.toString())
    }

    function decide(text: string) {
        return new ScanBuilder(new ScanTreeNode(text, null, [], {}), null)
    }

    let videos = {
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
    //zanaris
    associate({
            id: 361,
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
                {
                    "-A": {
                        text: "Spot A is the tile you arrive in when teleporting to the fairy ring.",
                        video: {ref: "./assets/scanassets/zanaris/Arrival.webm", contributor: "Leridon"},
                    },
                    "A-F": {
                        text: "Using the slayer cape teleport to Chaeldar (option 7) you will land in spot F.",
                        video: {ref: "./assets/scanassets/zanaris/AtoF.webm", contributor: "Leridon"}
                    },
                    "A-B": {
                        text: "B is exactly 2 tiles northwest of the center of the fairy ring.",
                        video: {ref: "./assets/scanassets/zanaris/AtoB.webm", contributor: "Leridon"}
                    },
                    "B-C": {
                        text: "C is the south-eastern tile of the entrance to the wheat field and directly reachable from B with a Dive.",
                        video: {ref: "./assets/scanassets/zanaris/BtoC.webm", contributor: "Leridon"}
                    },
                    "C-D": {
                        text: "Stepping 1 tile north-west and then surging will land you directly at D",
                        video: {ref: "./assets/scanassets/zanaris/CtoD.webm", contributor: "Leridon"}
                    },
                    "D-E": {
                        text: "Stepping 1 tile south-west and then surging will land you directly at E.",
                        video: {ref: "./assets/scanassets/zanaris/DtoE.webm", contributor: "Leridon"}
                    },
                    "B-17": {
                        text: "The spot has been narrowed down to the chicken altar. Use the slayer cape to Chaeldaer to get there fastest."
                    }
                },
                goTo("A", "Fairy Ring to {}.")
                    .triple(1, 2, 3, 4)
                    .single(goTo("F", "Slayer Cape 7 to {}.")
                        .double(digAt(19))
                        .triple(18, 19)
                        .single(goTo("G", "Wicked hood cosmic altar tele")
                            .triple(20, 21, 22)
                        )
                    )
                    .double(goTo("B")
                        .triple(10)
                        .double(goTo("C", "Dive to {}.")
                            .triple(5, 6, 7)
                            .single(goTo("D", "Surge to {}.")
                                .double(digAt(13))
                                .single(digAt(16))
                            )
                            .double(goTo("D", "Surge to {}.")
                                .triple(8, 9)
                                .double(goTo("E", "Step and Surge to {}.")
                                    .triple(11)
                                    .double(digAt(12))
                                )
                                .single(decide("The spot is in the tunnels to the cosmic altar.")
                                    .answer("14", digAt(14))
                                    .answer("15", digAt(15))
                                )
                            )
                        )
                        .single(digAt(17)))
            )
        }
    )

    //lumbridge
    associate({
        id: 362,
        method: tree(
            [
                {"x": 3233, "y": 9547, "level": 0},
                {"x": 3210, "y": 9557, "level": 0},
                {"x": 3210, "y": 9571, "level": 0},
                {"x": 3227, "y": 9575, "level": 0},
                {"x": 3246, "y": 9566, "level": 0},
                {"x": 3252, "y": 9577, "level": 0},
                {"x": 3209, "y": 9587, "level": 0},
                {"x": 3191, "y": 9555, "level": 0},
                {"x": 3179, "y": 9559, "level": 0},
                {"x": 3170, "y": 9557, "level": 0},
                {"x": 3167, "y": 9546, "level": 0},
                {"x": 3172, "y": 9570, "level": 0}
            ],
            [
                {name: "A", spot: {x: 3226, y: 9542}},
                {name: "B", spot: {x: 3226, y: 9547}},
                {name: "C", spot: {x: 3221, y: 9552}},
                {name: "D", spot: {x: 3221, y: 9556}},
                {name: "E", spot: {x: 3206, y: 9553}},
                {name: "F", spot: {x: 3204, y: 9553}},
            ],
            {
                "-A": {
                    text: "Teleport to Tears of Guthix with the quest cape/Games necklace and run through the tunnel. A is the spot you are in after crawling through.",
                    video: {ref: "assets/scanassets/lumbridge/toA.webm", contributor: "Leridon"}
                },
                "A-B": {
                    text: "B is 6 tiles north of A.",
                    video: {ref: "assets/scanassets/lumbridge/AtoB.webm", contributor: "Leridon"}
                },
                "A-D": {
                    text: "D is the spot you land in after crossing the stepping stone.",
                    video: {ref: "assets/scanassets/lumbridge/AtoD.webm", contributor: "Leridon"}
                },
                "B-C": {
                    text: "C is the tile directly south of the stepping stone, where you start the jump.",
                    video: {ref: "assets/scanassets/lumbridge/BtoC.webm", contributor: "Leridon"}
                },
                "C-D": {
                    text: "D is just across the stepping stone.",
                    video: {ref: "assets/scanassets/lumbridge/CtoD.webm", contributor: "Leridon"}
                },
                "D-E": {
                    text: "Walk to the tile directly east of the wall beast. From there you can dive directly to E. Use the scorch mark on the floor for orientation.",
                    video: {ref: "assets/scanassets/lumbridge/DtoE.webm", contributor: "Leridon"}
                },
                "E-F": {
                    text: "F is exactly two tiles west of E and can be used to distinguish 12 from 10 and 11. This step also lines up surges.",
                    video: {ref: "assets/scanassets/lumbridge/EtoF.webm", contributor: "Leridon"}
                }
            },
            goTo("A")
                .triple(1, 2)
                .double(
                    goTo("D", "Dive and jump to {}.")
                        .triple(3)
                        .double(digAt(5))
                )
                .single(
                    goTo("B")
                        .double(decide("It can only be spot 4 or 6")
                            .answer("4", digAt(4))
                            .answer("6", digAt(6))
                        )
                        .single(goTo("C")
                            .double(digAt(8))
                            .single(goTo("D", "Jump to {}.")
                                .double(digAt(7))
                                .single(goTo("E", "Run/Dive to {}.")
                                    .double(digAt(9))
                                    .single(goTo("F")
                                        .double(digAt(12))
                                        .single(decide("The spot is either 10 or 11")
                                            .answer("10", digAt(10))
                                            .answer("11", digAt(11))
                                        )
                                    )
                                )
                            )
                        )
                )
        )
    })

    //taverley
    associate({
        id: 357,
        method: tree(
            [
                {"x": 2884, "y": 9799, "level": 0},
                {"x": 2904, "y": 9809, "level": 0},
                {"x": 2875, "y": 9805, "level": 0},
                {"x": 2892, "y": 9783, "level": 0},
                {"x": 2895, "y": 9831, "level": 0},
                {"x": 2907, "y": 9842, "level": 0},
                {"x": 2888, "y": 9846, "level": 0},
                {"x": 2933, "y": 9848, "level": 0},
                {"x": 2938, "y": 9812, "level": 0},
                {"x": 2945, "y": 9796, "level": 0},
                {"x": 2952, "y": 9786, "level": 0},
                {"x": 2926, "y": 9692, "level": 0},
                {"x": 2907, "y": 9705, "level": 0},
                {"x": 2907, "y": 9718, "level": 0},
                {"x": 2905, "y": 9734, "level": 0},
                {"x": 2914, "y": 9757, "level": 0},
                {"x": 2936, "y": 9764, "level": 0},
                {"x": 2895, "y": 9769, "level": 0},
                {"x": 2949, "y": 9773, "level": 0},
                {"x": 2968, "y": 9786, "level": 0},
                {"x": 2858, "y": 9788, "level": 0},
                {"x": 2870, "y": 9791, "level": 0},
                {"x": 2835, "y": 9819, "level": 0},
                {"x": 2832, "y": 9813, "level": 0},
                {"x": 2822, "y": 9826, "level": 0}
            ],
            [
                //{name: "A", spot: {x: 2910, y: 3421}}, Hidden because it destroys the view for now
                {name: "B", area: {topleft: {x: 2918, y: 9702}, botright: {x: 2924, y: 9700}}},
                {name: "C", area: {topleft: {x: 2906, y: 9722}, botright: {x: 2909, y: 9719}}},
                {name: "D", area: {topleft: {x: 2908, y: 9742}, botright: {x: 2912, y: 9742}}},
                {name: "E", spot: {x: 2914, y: 9742}},
                {name: "F", spot: {x: 2886, y: 9795}},
                {name: "G", area: {topleft: {x: 2881, y: 9833}, botright: {x: 2887, y: 9828}}},
            ],
            {
                "-A": {
                    text: "A is directly where the taverley teleport lands. It can be used to gain information about which spots are possible by checking if the scroll tells you to scan a different level."
                },
                "A-B": {
                    text: "If the scroll said \"Too far\" at A, we continue at B, which is where the Archaeology Teleport to Isaura (9-4) lands."
                },
                "B-C": {
                    text: "C is beyond the arch at the entrance to the black knights base. There is some leeway on exact positioning."
                },
                "C-D": {
                    text: "D is a narrow strip directly at the northern wall of the room. Ideally go directly to the easters tile of this area to be close to E."
                },
                "D-E": {
                    text: "E is the tile directly south of a rock in the passage north-east."
                },
                "A-F": {
                    text: "The scroll said to scan a different level when at A, which narrows down the candidates to spots 1 to 11 (rarely 22). Use the surface entrance to the dungeon."
                },
                "F-G": {
                    text: "The area G is at the gates leading east and helps to distinguish the final spots."
                },
                "F-1": {},
                "F-2": {},
                "F-3": {},
                "F-4": {},
                "F-22": {},
                "F-10": {},
                "F-11": {},
                "G-5": {},
                "G-6": {},
                "G-7": {},
                "G-8": {},
                "G-9": {},
                "B-12": {},
                "B-13": {},
                "B-14": {},
                "B-15": {},
                "D-16": {},
                "D-17": {},
                "D-18": {},
                "D-19": {},
                "E-20": {},
                "D-21": {},
                "D-22": {},
                "E-23": {},
                "E-24": {},
                "E-25": {},
            },
            goTo("A", "Taverley teleport to {}.")
                .answer("\"Different level\"",
                    goTo("F", "Use the dungeon entrance to {}.")
                        .triple(1, 2, 3, 4, 22)
                        .double(goTo("G", "Surge/Dive north to {}.")
                            .triple(5, 6, 7)
                            .double(decide("The spot is either 8 or 9.")
                                .answer("8", digAt(8))
                                .answer("9", digAt(9))
                            )
                        )
                        .single(decide("The spot is to the very east, Go there.")
                            .answer("10", digAt(10))
                            .answer("11", digAt(11))
                        )
                )
                .answer("\"Too far\"",
                    goTo("B", "Archaeology teleport 9,4 to {}.")
                        .triple(12, 13, 14)
                        .double(digAt(15))
                        .single(goTo("C")
                            .double(goTo("D", "Surge/Run to {}.")
                                .triple(16, 17, 18)
                                .double(digAt(19))
                            )
                            .single(goTo("D", "Surge/Run to {}.")
                                .double(decide("The spot is either 21 or 22")
                                    .answer("21", digAt(21))
                                    .answer("22", digAt(22))
                                )
                                .single(goTo("E", "Step to {}.")
                                    .double(digAt(20))
                                    .single(decide("The spot is in the north-western part of the dungeon")
                                        .answer("23", digAt(23))
                                        .answer("24", digAt(24))
                                        .answer("25", digAt(25))
                                    )
                                )
                            )
                        )
                )
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
