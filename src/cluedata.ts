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
        "zanaris":,
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

export let scanclues: ScanClue[] = (() => {
    function solved(spots: number[], instruction: string = "Solved!"): ScanTree {
        return new ScanTree(`${instruction} (${spots.join(", ")})`, spots, {})
    }

    function step(instruction: string,
                  candidates: Dict<ScanTree>) {
        return new ScanTree(instruction, [], candidates)
    }

    let res: ScanClue[] = []

    res.push(new ScanClue("scanzanaris", "Zanaris", 22, "img/zanaris.data.png",
        step("Teleport to fairy ring (A)", {
            "A3": solved([1, 2, 3, 4]),
            "A2": step("Go to B (2 tiles northwest)", {
                "B3": solved([10]),
                "B2": step("Dive to C (western entrance to the wheat field)", {
                    "C3": solved([5, 6, 7]),
                    "C2": step("Go to D", {
                        "D3": solved([8, 9, 10]),
                        "D2": step("Go to E (11 squares southwest)", {
                            "E3": solved([11]),
                            "E2": solved([12])
                        }),
                        "D1": solved([14, 15])
                    }),
                    "C1":
                        step("Go to D", {
                            "D2": solved([13]),
                            "D1": solved([16])
                        })
                }),
                "B1":
                    solved([17])
            }),
            "A1":
                step("Slayer Cape to Chaeldar (F)", {
                    "F3": solved([18]),
                    "F2": solved([19]),
                    "F1": solved([20, 21, 22], "Spot is at the cosmic altar (G)."),
                })
        })))

    return res
})()

function byId(id: string): ScanClue {
    return scanclues.find((e) => e.id == id)
}