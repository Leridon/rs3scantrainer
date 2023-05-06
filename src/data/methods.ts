import {ChildKey, HowTo, Method, PingType, ScanSpot, ScanTree, ScanTreeNode} from "../model/methods";
import {clues} from "./clues";
import {ClueStep, ScanStep} from "../model/clues";
import {Box, MapCoordinate} from "../model/coordinates";
import Dict = NodeJS.Dict;
import {go} from "fuzzysort";

let methods: Method[][] = []

let n = Math.max(...clues.map((e) => e.id))

for (let i = 0; i < n; i++) {
    methods.push([])
}

function associate(v: { id: number, method: (step: ClueStep) => Method }) {
    try {
        let c = clues.find((c) => c.id == v.id)

        let m = v.method(c)

        methods[v.id].push(m)

        m.clue = c
    } catch (e) {
        console.log(`ERROR: Skipped loading a method for ${v.id} due to an error: ${e}`)
    }
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

        _why = ""

        why(why: string) {
            this._why = why
            return this
        }

        propagateMethods(methods: Dict<HowTo>, parent: ScanBuilder = null) {
            if (this.spotName && !this.node.solved) this.node.where = this.spotName

            let m_key = parent ? `${parent.spotName}-${this.spotName}` : `-${this.spotName}`

            let ht = methods[m_key]

            if (!ht) {
                console.log(`Method for ${this.node.root.clue.scantext} misses howto for: ${m_key}`)
                ht = {}
            }

            if (this._why) {
                if (ht.text) ht.text += "\n\n<b>Why:</b> " + this._why
                else ht.text = "\n\n<b>Why:</b> " + this._why
            }

            this.node.howto = ht

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
                let child = new ScanBuilder(new ScanTreeNode(`Dig at spot ${s}`, s, null, [], {}), s.toString())

                this.child({
                    key: `${this.spotName}3/Spot ${s}`,
                    kind: PingType.TRIPLE
                }, child)
            })

            return this
        }
    }

    function tree(
        clue: ScanStep,
        coordinates: MapCoordinate[],
        spots: ScanSpot[],
        methods: Dict<HowTo>,
        tree: ScanBuilder): ScanTree {

        // create the full tree before propagating the method, so it has access to root and the clue step
        let t = new ScanTree(clue, coordinates, spots, tree.node)

        tree.propagateMethods(methods)
        return t
    }

    function goTo(where: string, how: string = "Go to {}.") {
        let instruction = how.replace("{}", where)

        return new ScanBuilder(new ScanTreeNode(instruction, null, where, [], {}), where)
    }

    function digAt(spot: number): ScanBuilder {
        return new ScanBuilder(new ScanTreeNode(`Dig at spot ${spot}`, spot, null, [], {}), spot.toString())
    }

    function decide(text: string) {
        return new ScanBuilder(new ScanTreeNode(text, null, null, [], {}), null)
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
            method: (clue) => tree(clue as ScanStep,
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
        method: (clue) => tree(clue as ScanStep,
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
        method: (clue) => tree(clue as ScanStep,
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
                {name: "A", area: {topleft: {x: 2908, y: 3423}, botright: {x: 2912, y: 3419}}, is_far_away: true},
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

    //Varrock
    associate({
        id: 351,
        method: (clue) => tree(clue as ScanStep,
            [
                {"x": 3231, "y": 3439, "level": 0},
                {"x": 3197, "y": 3423, "level": 0},
                {"x": 3196, "y": 3415, "level": 0},
                {"x": 3204, "y": 3409, "level": 0},
                {"x": 3220, "y": 3407, "level": 0},
                {"x": 3228, "y": 3409, "level": 0},
                {"x": 3213, "y": 3462, "level": 0},
                {"x": 3248, "y": 3454, "level": 0},
                {"x": 3253, "y": 3393, "level": 0},
                {"x": 3175, "y": 3415, "level": 0},
                {"x": 3175, "y": 3404, "level": 0},
                {"x": 3185, "y": 3472, "level": 0},
                {"x": 3197, "y": 3383, "level": 0},
                {"x": 3211, "y": 3385, "level": 0},
                {"x": 3228, "y": 3383, "level": 0},
                {"x": 3240, "y": 3383, "level": 0},
                {"x": 3273, "y": 3398, "level": 0},
                {"x": 3284, "y": 3378, "level": 0},
                {"x": 3141, "y": 3488, "level": 0},
                {"x": 3188, "y": 3488, "level": 0},
                {"x": 3180, "y": 3510, "level": 0},
                {"x": 3230, "y": 3494, "level": 0},
                {"x": 3213, "y": 3484, "level": 0},
                {"x": 3241, "y": 3480, "level": 0}
            ],
            [
                {name: "A", area: {topleft: {x: 3213, y: 3434}, botright: {x: 3214, y: 3432}}},
                {name: "B", area: {topleft: {x: 3223, y: 3424}, botright: {x: 3224, y: 3422}}},
                {name: "C", area: {topleft: {x: 3233, y: 3414}, botright: {x: 3234, y: 3412}}},
                {name: "D", area: {topleft: {x: 3242, y: 3418}, botright: {x: 3244, y: 3417}}},
                {name: "E", spot: {x: 3254, y: 3449}},
                {name: "F", spot: {x: 3244, y: 3459}},
                {name: "G", area: {topleft: {x: 3179, y: 3420}, botright: {x: 3183, y: 3416}}},
                {name: "H", area: {topleft: {x: 3162, y: 3466}, botright: {x: 3163, y: 3462}}},
            ],
            {
                "-A": {
                    text: "Varrock teleport (regular) will land you directly at A. You have some leeway on where to stand exactly, the shown tiles are all equivalent."
                },
                "A-B": {
                    text: "B can be reached from A by surging or divin once."
                },
                "B-C": {
                    text: "If you went to B by surging or diving south-east, another surge will land you in C."
                },
                "B-D": {},
                "B-G": {
                    text: "Use an archaeology teleport (9-8) to get to F."
                },
                "A-1": {},
                "A-2": {},
                "A-3": {},
                "B-4": {},
                "B-5": {},
                "B-6": {},
                "C-7": {},
                "C-8": {},
                "C-9": {},
                "G-10": {},
                "G-11": {},
                "G-12": {
                    text: "Teleport to the grand exchange (i.e with a LotD) to get to 12 the fastest."
                },
                "B-13": {
                    text: "By lining up correctly you can surge south-west through the shop and then go south."
                },
                "B-14": {
                    text: "By lining up correctly you can surge south-west through the shop and then go south."
                },
                "B-15": {
                    text: "By lining up correctly you can surge south-west through the shop and then go south."
                },
                "B-16": {
                    text: "By lining up correctly you can surge south-west through the shop and then go south."
                },
                "D-17": {},
                "D-18": {},
                "E-23": {},
                "E-24": {},
            },
            goTo("A", "Varrock teleport to {}.")
                .triple(1, 2, 3)
                .double(goTo("B", "Dive to {}.")
                    .triple(4, 5, 6)
                    .double(goTo("C")
                        .why("Spot C perfectly distinguishes the remaining candidates 7, 8 and 9")
                        .triple(9)
                        .single(digAt(7))
                        .double(digAt(8))
                    )
                    .single(goTo("G", "Archaeology Teleport to {}.")
                        .why("The spot has been narrowed down to just 3 candidates, two of which are at Soran.")
                        .triple(10, 11)
                        .double(digAt(12))
                    )
                )
                .single(goTo("B", "Dive to {}.")
                    .double(decide("The spot is along the southern wall")
                        .answer("13", digAt(13))
                        .answer("14", digAt(14))
                        .answer("15", digAt(15))
                        .answer("16", digAt(16))
                    )
                    .single(
                        goTo("D")
                            .double(decide("The spot is in the south-eastern area.")
                                .answer("17", digAt(17))
                                .answer("18", digAt(18))
                            )
                            .single(
                                goTo("E")
                                    .double(
                                        goTo("F", "Dive to {}.")
                                            .why("F is exactly one dive distance north-west and can distinguish the remaining 2 spots")
                                            .triple(24)
                                            .double(digAt(23))
                                    )
                                    .single(
                                        goTo("H", "Grand Exchange teleport to {}.")
                                            .double(decide("It's either 19 or 20.")
                                                .answer("19", digAt(19))
                                                .answer("20", digAt(20))
                                            )
                                            .single(
                                                decide("It's either 21 or 22.")
                                                    .answer("21", digAt(21))
                                                    .answer("22", digAt(22))
                                            )
                                    )
                            )
                    )
                )
        )
    })

    associate({
        id: 353,
        method: (clue) => tree(clue as ScanStep,
            [
                {"x": 2937, "y": 10191, "level": 0},
                {"x": 2936, "y": 10206, "level": 0},
                {"x": 2924, "y": 10191, "level": 0},
                {"x": 2906, "y": 10202, "level": 0},
                {"x": 2904, "y": 10193, "level": 0},
                {"x": 2922, "y": 10179, "level": 0},
                {"x": 2938, "y": 10179, "level": 0},
                {"x": 2905, "y": 10162, "level": 0},
                {"x": 2924, "y": 10162, "level": 0},
                {"x": 2938, "y": 10162, "level": 0},
                {"x": 2856, "y": 10192, "level": 0},
                {"x": 2860, "y": 10215, "level": 0},
                {"x": 2837, "y": 10209, "level": 0},
                {"x": 2873, "y": 10194, "level": 0},
                {"x": 2841, "y": 10189, "level": 0},
                {"x": 2872, "y": 10181, "level": 0},
                {"x": 2822, "y": 10193, "level": 0},
                {"x": 2846, "y": 10233, "level": 0}],
            [
                {name: "A", spot: {x: 2939, y: 10198}},
                {name: "B", spot: {x: 2924, y: 10191}},
                {name: "C", spot: {x: 2910, y: 10178}},
                {name: "D", area: {topleft: {x: 2856, y: 10201}, botright: {x: 2860, y: 10197}}},
                {name: "E", spot: {x: 2853, y: 10199}},
                {name: "F", spot: {x: 2858, y: 10199}},
                //{name: "B", area: {topleft: {x: 2923, y: 10195}, botright: {x: 2926, y: 10189}}}
            ],
            {
                "-A": {
                    text: "A is the spot you land in after exiting lava flow cave. Go there using the max guild portal with the grace of the elves.",
                    video: {ref: "assets/scanassets/keldagrim/toA.webm", contributor: "Leridon"},
                },
                "A-B": {
                    text: "B is also a potential clue spot and can be reached by diving diagonally south west from a spot along the northern wall of the building.",
                    video: {ref: "assets/scanassets/keldagrim/AtoB.webm", contributor: "Leridon"},
                },
                "B-C": {
                    text: "C can be reached by lining up a surge south-west.",
                    video: {ref: "assets/scanassets/keldagrim/BtoC.webm", contributor: "Leridon"},
                },
                "B-D": {
                    text: "D is the area you land in when using the Luck of the Dwarves to teleport to Keldagrim.",
                    video: {ref: "assets/scanassets/keldagrim/BtoD.webm", contributor: "Leridon"},
                },
                "D-E": {},
                "E-F": {},
                "A-1": {},
                "A-2": {},
                "A-3": {},
                "B-4": {},
                "B-6": {},
                "B-7": {},
                "C-5": {},
                "C-8": {},
                "C-9": {},
                "C-10": {},
                "D-11": {},
                "D-12": {},
                "D-14": {
                    text: "You can dive onto spot 14 immediately after entering the door.",
                    video: {ref: "assets/scanassets/keldagrim/Dto14.webm", contributor: "Leridon"},
                },
                "D-16": {},
                "E-12": {},
                "E-13": {},
                "E-15": {},
                "F-14": {},
                "F-16": {},
                "E-17": {},
                "E-18": {},
            },
            goTo("A", "GotE Lava Flow Mine to {}.")
                .triple(1, 2, 3)
                .double(
                    goTo("B", "Run/Dive to {}.")
                        .triple(6, 7)
                        .double(digAt(4))
                )
                .single(
                    goTo("B", "Run/Dive to {}.")
                        .double(
                            goTo("C", "Run/Dive to {}")
                                .triple(5, 8, 9)
                                .double(digAt(10))
                        )
                        .single(
                            goTo("D", "LotD teleport to {}.")
                                .why("The spot can no longer be on the eastern part of the city, so we continue west.")
                                .triple(11, 12, 14, 16)
                                .double(
                                    goTo("E")
                                        .triple(12, 13, 15)
                                        .double(goTo("F")
                                            .triple(14)
                                            .double(digAt(16))
                                        )
                                )
                                .single(
                                    goTo("E")
                                        .double(digAt(17))
                                        .single(digAt(18))
                                )
                        ))
        )
    })

    // Falador
    associate({
        id: 364,
        method: (clue) => tree(clue as ScanStep,
            [
                {"x": 2958, "y": 3379, "level": 0},
                {"x": 2948, "y": 3390, "level": 0},
                {"x": 2942, "y": 3388, "level": 0},
                {"x": 2939, "y": 3355, "level": 0},
                {"x": 2945, "y": 3339, "level": 0},
                {"x": 2972, "y": 3342, "level": 0},
                {"x": 3015, "y": 3339, "level": 0},
                {"x": 3011, "y": 3382, "level": 0},
                {"x": 3005, "y": 3326, "level": 0},
                {"x": 2938, "y": 3322, "level": 0},
                {"x": 2947, "y": 3316, "level": 0},
                {"x": 2976, "y": 3316, "level": 0},
                {"x": 3039, "y": 3331, "level": 0},
                {"x": 3050, "y": 3348, "level": 0},
                {"x": 3027, "y": 3365, "level": 0},
                {"x": 3031, "y": 3379, "level": 0},
                {"x": 3025, "y": 3379, "level": 0},
                {"x": 3059, "y": 3384, "level": 0}
            ],
            [
                {name: "A", area: {topleft: {x: 2963, y: 3380}, botright: {x: 2967, y: 3376}}},
                {name: "B", area: {topleft: {x: 2964, y: 3366}, botright: {x: 2965, y: 3365}}},
                {name: "C", area: {topleft: {x: 2958, y: 3365}, botright: {x: 2960, y: 3363}}},
                {name: "D", area: {topleft: {x: 2955, y: 3365}, botright: {x: 2956, y: 3363}}},
                {name: "E", area: {topleft: {x: 2950, y: 3365}, botright: {x: 2950, y: 3363}}},
                {name: "F", area: {topleft: {x: 3029, y: 3341}, botright: {x: 3033, y: 3338}}},
                {name: "G", area: {topleft: {x: 3032, y: 3359}, botright: {x: 3034, y: 3357}}},
            ]
            ,
            {},
            goTo("A", "Falador teleport to {}.")
                .triple(1, 2, 3, 4)
                .double(
                    goTo("B", "Surge to {}.")
                        .triple(5, 6)
                        .double(
                            goTo("C")
                                .single(digAt(7).why("Going from B to C, you are now more than 2x range away from spot 7. If the ping changes to single, it therefore must be spot 7."))
                                .double(
                                    goTo("D")
                                        .single(digAt(8).why("Going from C to D, you are now more than 2x range away from spot 8. If the ping changes to single, it therefore must be spot 8."))
                                        .double(
                                            goTo("E")
                                                .double(digAt(10).why("You spawned on the southernmost possible square it was possible to spawn on teleport and it's 10."))
                                                .single(digAt(9).why("Going from D to E, you are now more than 2x range away from spot 9. If the ping changes to single, it therefore must be spot 9."))
                                        )
                                )
                        )
                )
                .single(
                    goTo("B", "Surge to {}.")
                        .double(decide("It's 10, 11, or 12.")
                            .answer("10", digAt(10))
                            .answer("11", digAt(11))
                            .answer("12", digAt(12))
                        )
                        .single(
                            goTo("F")
                                .triple(13, 14, 15)
                                .double(goTo("G")
                                    .triple(16, 17, 18)
                                )
                        )
                )
        )
    })


    associate({
        id: 365, // dorgeshkaan
        method: (clue) => tree(clue as ScanStep,
            [{"x": 2711, "y": 5271, "level": 0},
                {"x": 2723, "y": 5279, "level": 0},
                {"x": 2731, "y": 5266, "level": 0},
                {"x": 2740, "y": 5273, "level": 0},
                {"x": 2711, "y": 5284, "level": 0},
                {"x": 2747, "y": 5263, "level": 0},
                {"x": 2729, "y": 5295, "level": 0},
                {"x": 2717, "y": 5311, "level": 0},
                {"x": 2730, "y": 5315, "level": 0},
                {"x": 2704, "y": 5321, "level": 0},
                {"x": 2732, "y": 5327, "level": 0},
                {"x": 2704, "y": 5349, "level": 0},
                {"x": 2698, "y": 5316, "level": 1},
                {"x": 2700, "y": 5284, "level": 1},
                {"x": 2701, "y": 5343, "level": 1},
                {"x": 2704, "y": 5357, "level": 1},
                {"x": 2734, "y": 5370, "level": 1},
                {"x": 2747, "y": 5327, "level": 1},
                {"x": 2738, "y": 5301, "level": 1},
                {"x": 2739, "y": 5253, "level": 1}],
            [
                {name: "A", area: {topleft: {x: 2721, y: 5266}, botright: {x: 2724, y: 5263}}},
                {name: "B", spot: {x: 2726, y: 5266}},
                {name: "C", area: {topleft: {x: 2713, y: 5281}, botright: {x: 2714, y: 5281}}},
                {name: "D", area: {topleft: {x: 2713, y: 5285}, botright: {x: 2714, y: 5285}}},
                {name: "E", spot: {x: 2713, y: 5294}},
                {name: "F", area: {topleft: {x: 2695, y: 5311}, botright: {x: 2701, y: 5307}}},
                {name: "G", spot: {x: 2701, y: 5305}},
                {name: "H", area: {topleft: {x: 2701, y: 5336}, botright: {x: 2701, y: 5328}}},
                {name: "I", area: {topleft: {x: 2707, y: 5353}, botright: {x: 2707, y: 5343}}},
            ],
            {
                "-A": {},
                "-F": {
                    text: "F is the area you land in when using the teleport sphere to the west."
                },
                "F-G": {
                    text: "G is the southern one of the two tiles on top of the stairs."
                },
                "F-H": {},
                "G-H": {},
                "H-I": {},
                "A-B": {},
                "A-C": {},
                "C-D": {},
                "C-E": {},
                "A-1": {},
                "A-2": {},
                "A-3": {},
                "A-4": {},
                "A-5": {},
                "B-6": {},
                "B-7": {},
                "F-13": {},
                "F-14": {},
                "H-15": {},
                "H-16": {},
                "H-17": {},
                "I-18": {
                    text: "Spot 18 is on the eastern part, use teleport sphere (3) to get there."
                },
                "H-19": {
                    text: "Spot 19 is on the eastern part, use teleport sphere (3) to get there."
                },
                "I-20": {
                    text: "Spot 18 is on south-east, use teleport sphere (2) to get there."
                },
            },
            decide("Does the scroll say to \"scan a different level\"?")
                .why("")
                .answer({kind: "Yes", key: "Upper"},
                    goTo("F", "Sphere 4 to {}.")
                        .triple(13, 14)
                        .double(
                            goTo("G")
                                .triple(14)
                                .double(
                                    goTo("H")
                                        .triple(15)
                                        .double(digAt(19))
                                )
                        )
                        .single(
                            goTo("H")
                                .double(
                                    decide("It's either 16 or 17 to the north")
                                        .answer("16", digAt(16))
                                        .answer("17", digAt(17))
                                )
                                .single(
                                    goTo("I")
                                        .double(digAt(18))
                                        .single(digAt(20))
                                )
                        )
                )
                .answer({kind: "No", key: "Lower"},
                    goTo("A")
                        .triple(1, 2, 3, 4, 5)
                        .double(
                            goTo("B")
                                .triple(6)
                                .double(digAt(7))
                        )
                        .single(
                            goTo("C")
                                .double(
                                    goTo("E")
                                        .why("Even though we will pass D, we already know that it will double ping.")
                                        .triple(8, 9)
                                        .double(digAt(10))
                                )
                                .single(
                                    goTo("D", "Down the stairs to {}.")
                                        .double(digAt(11))
                                        .single(digAt(12))
                                )
                        )
                )
        )
    })
    /*.child({
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
    )*/

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

    })*/
}

export function loadMethods() {
    loadScanMethods()
}
