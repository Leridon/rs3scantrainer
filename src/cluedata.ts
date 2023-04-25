import {ScanClue, ScanTree} from "./scanclues";
import Dict = NodeJS.Dict;

/*
let solutions = (function () {


    return {
        "falador": tr("Teleport to Falador (A)",
            {
                "A3": solved([1, 2, 3, 4]),
                "A2": tr("Go to B", {
                    "B3": solved([5, 6]),
                    "B2": tr("Go to C", {
                        "C2": tr("Go to D", {
                            "D2": tr("Go to E", {
                                "E2": solved([10]),
                                "E1": solved([9]),
                            }),
                            "D1": solved([8])
                        }),
                        "C1": solved([7])
                    })
                }),
                "A1": tr("Go to B", {
                    "B2": solved([10, 11, 12]),
                    "B1": solved([13, 14, 15, 16, 17, 18])
                })
            }),
        "dorgeshkaan": tr("Upper or lower floor?", {
                "Lower Floor": tr("Sphere 2 (South, Spot A)", {
                    "A3": solved([1, 2, 3, 4, 5]),
                    "A2": tr("Go to B (gate to the , 3 tiles)", {
                        "B3": solved([6]),
                        "B2": solved([7])
                    }),
                    "A1": tr("Go to C (on top of the western stairs)", {
                        "C2": tr("Go to E (around the pond)", {
                            "E3": solved([8, 9]),
                            "E2": solved([10])
                        }),
                        "C1": tr("Go down the northern stairs (D)", {
                            "D2": solved([11], "Solved, run north."),
                            "D1": solved([12], "Solved, run north.")
                        })
                    })
                }),
                "Upper Floor": tr("Sphere 4 (West, Spot F)", {
                    "F3": solved([13]),
                    "F2": tr("Go to G (top of the stairs)", {
                        "G3": solved([14]),
                        "G2": tr("Surge to H", {
                            "H3": solved([15]),
                            "H2": solved([19], "It's east, use sphere 3"),
                        })
                    }),
                    "F1": tr("Surge to H", {
                        "H2": solved([16, 17], "Either of the two, check in order."),
                        "H1": tr("Dive to I", {
                            "I2": solved([18], "It's east, use sphere 3"),
                            "I1": solved([20], "It's south east, use sphere 2"),
                        })
                    })
                })
            },
        ),
        "varrock": tr("Teleport to Varrock (A)", {
            "A3": solved([1, 2, 3]),
            "A2": tr("Go to B (10 tiles south east)", {
                "B3": solved([4, 5, 6]),
                "B2": tr("Go to C (east of the cages)", {
                    "C3": solved([9], "South east!"),
                    "C2": solved([8], "Museum (Dave 6)"),
                    "C1": solved([7], "Courtyard, Varrock Tele"),
                }),
                "B1": solved([10, 11, 12], "Collector (9-8) or Grand Exchange"),
            }),
            "A1": tr("Go to B (10 tiles south east)", {
                "B2": solved([13, 14, 15, 16], "Along the southern wall."),
                "B1": tr("Go to D (slightly east)", {
                    "D2": solved([17, 18], "South eastern area."),
                    "D1": tr("Daves' Spellbook 6 (E)", {
                        "E2": solved([23, 24], "Estate Agent or castle center"),
                        "E1": solved([19, 20, 21, 22], "Teleport to GE"),
                    }),
                }),
            })
        })
    }
})()*/

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

export let scanclues: ScanClue[] = (() => {
    function solved(spots: number[], instruction: string = "Solved!"): ScanTree {
        return new ScanTree(`Go to spot ${spots.join(", ")}`, spots, {}, {})
    }

    function step(instruction: string,
                  candidates: Dict<ScanTree> = {}) {
        return new ScanTree(instruction, [], candidates, {})
    }

    let res: ScanClue[] = []

    res.push(new ScanClue("scanzanaris", "Zanaris", 22, "img/zanaris.data.png",
            step("Fairy Ring to A")
                .method({
                    video: videos.zanaris.arrival,
                    text: "Spot A is the tile you arrive when you teleport to the fairy ring."
                })
                .child("A3", solved([1, 2, 3, 4]))
                .child("A2",
                    step("Go to B")
                        .method({
                            text: "B is exactly 2 tiles northwest of the center of the fairy ring.",
                            video: videos.zanaris.AtoB
                        })
                        .child("B3", solved([10]))
                        .child("B2", step("Dive to C")
                            .method({
                                text: "C is the south-eastern tile of the entrance to the wheat field and directly reachable from B with a Dive.",
                                video: videos.zanaris.BtoC
                            })
                            .child("C3", solved([5, 6, 7]))
                            .child("C2", step("Step and Surge to D")
                                .method({
                                    text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                    video: videos.zanaris.CtoD
                                })
                                .child("D3", solved([8, 9, 10]))
                                .child("D2", step("Step and Surge to E")
                                    .method({
                                        text: "Stepping 1 tile south-west and then surging will land you directly at E.",
                                        video: videos.zanaris.DtoE
                                    })
                                    .child("E3", solved([11])
                                        .child("E2", solved([12]))
                                        .child("D1", solved([14, 15]))
                                    )))
                            .child("C1", step("Go to D")
                                .method({
                                    text: "Stepping 1 tile north-west and then surging will land you directly at D",
                                    video: videos.zanaris.CtoD
                                })
                                .child("D2", solved([13]))
                                .child("D1", solved([16]))
                            )
                        ).child("B1", solved([17])))
                .child("A1", step("Slayer Cape (Chaeldar) to F",)
                    .method({
                        text: "Using the slayer cape teleport to Chaeldar (option 7) you will land in spot F.",
                        video: videos.zanaris.AtoF
                    })
                    .child("F3", solved([18]))
                    .child("F2", solved([19]))
                    .child("F1", solved([20, 21, 22], "Spot is at the cosmic altar (G)."))
                )
        )
    )

    res.push(new ScanClue("scanfalador", "Falador", 18, "img/falador.data.png",
        step("Teleport to Falador (A)")
            .child("A3", solved([1, 2, 3, 4]))
            .child("A2", step("Go to B")
                .child("B3", solved([5, 6]))
                .child("B2", step("Go to C")
                    .child("C2", step("Go to D")
                        .child("D2", step("Go to E")
                            .child("E2", solved([10]))
                            .child("E1", solved([9]))
                        )
                        .child("D1", solved([8]))
                    )
                    .child("C1", solved([7]))
                )
            )
            .child("A1", step("Go to B")
                .child("B2", solved([10, 11, 12]))
                .child("B1", solved([13, 14, 15, 16, 17, 18]))
            )))

    return res
})()

function byId(id: string): ScanClue {
    return scanclues.find((e) => e.id == id)
}