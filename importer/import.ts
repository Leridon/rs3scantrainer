import * as fs from "fs";

type ClueTier = "easy" | "medium" | "hard" | "elite" | "master"

type ClueType = "anagram"
    | "compass"
    | "coordinates"
    | "cryptic"
    | "emote"
    | "image"
    | "scan"
    | "simple"
    | "skilling"

type Coordinate = {
    x: number,
    y: number
    level?: number
}

type SolutionType = "simple" | "variants" | "coordset"

type SolutionBase = { type: SolutionType }
type SolutionVariant = { id: string, name: string, solution: SimpleSolution }

type SimpleSolution = SolutionBase & { type: "simple", coordinates: Coordinate, answer?: string }
type SetSolution = SolutionBase & { type: "coordset", candidates: Coordinate[] }
type VariantSolution = SolutionBase & { type: "variants", variants: SolutionVariant[] }

type Solution = SimpleSolution | SetSolution | VariantSolution

type ClueBase = { id: number, clue: string, tier: ClueTier, type: ClueType, solution?: Solution }

type SimpleStep = ClueBase &
    { type: "simple", solution: SimpleSolution | VariantSolution }
type EmoteStep = ClueBase &
    { type: "emote", solution: SimpleSolution | VariantSolution }
type AnagramStep = ClueBase &
    { type: "anagram", solution: SimpleSolution | VariantSolution }
type ImageStep = ClueBase &
    { type: "image", image: number[], solution: SimpleSolution | VariantSolution }
type CrypticStep = ClueBase &
    { type: "cryptic", solution: SimpleSolution | VariantSolution }
type CoordinateStep = ClueBase &
    { type: "coordinates", solution: SimpleSolution | VariantSolution }
type SkillingStep = ClueBase &
    { type: "skilling", solution: SimpleSolution | VariantSolution }
type CompassStep = ClueBase &
    { type: "compass", solution: SetSolution }
type ScanStep = ClueBase &
    { type: "scan", scantext: string, range: number, solution: SetSolution }

type ClueStep =
    SimpleStep
    | ScanStep
    | EmoteStep
    | AnagramStep
    | ImageStep
    | CrypticStep
    | CompassStep
    | CoordinateStep
    | SkillingStep


type OriginalClue = {
    clueid: number,
    type: string,
    clue: string | number[],
    x: number | null
    z: number | null
    answer: string,
    scantext?: string,
    subid?: string,
    subidtext?: string,
    scan?: number
}

let original_data: OriginalClue[] = require("./clues.js")
let coordsets: {
    x: number,
    z: number,
    level: number
    clueid: number
}[] = require("./coords.js")

let imported: ClueStep[] = []

let seen = new Set<number>()

function parseSimpleSolution(obj: OriginalClue): SimpleSolution {
    return {
        type: "simple",
        coordinates: {
            x: obj.x,
            y: obj.z
        },
        answer: obj.answer
    }

}

function parseVariant(obj: OriginalClue): SolutionVariant {
    return {
        id: obj.subid,
        name: obj.subidtext,
        solution: parseSimpleSolution(obj)
    }
}

function parseSolution(obj: OriginalClue): SimpleSolution | VariantSolution {
    if (obj.subid) return {type: "variants", variants: [parseVariant(obj)]}
    else return parseSimpleSolution(obj)
}

function spotsFor(id: number): Coordinate[] {
    return coordsets.filter((e) => e.clueid == id).map((e) => {
            return {
                x: e.x,
                y: e.z,
                level: e.level
            }
        }
    )
}

let n = 0
for (let obj of original_data) {
    if (seen.has(obj.clueid)) {
        (imported.find((e) => e.id == obj.clueid).solution as VariantSolution)
            .variants.push(parseVariant(obj))

        continue
    }


    switch (obj.type) {
        case "simple": {
            let imp: SimpleStep = {
                type: "simple",
                id: obj.clueid,
                tier: null,
                clue: obj.clue as string,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }
        case "anagram": {
            let imp: AnagramStep = {
                type: "anagram",
                clue: obj.clue as string,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }
        case "cryptic": {
            let imp: CrypticStep = {
                type: "cryptic",
                clue: obj.clue as string,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }
        case "img": {
            let imp: ImageStep = {
                type: "image",
                clue: "The map shows where to go.",
                image: obj.clue as number[],
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }
        case "emote": {
            let imp: EmoteStep = {
                type: "emote",
                clue: obj.clue as string,
                tier: null,
                id: obj.clueid,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }
        case "scan": {
            let imp: ScanStep = {
                type: "scan",
                clue: obj.clue as string,
                tier: null,
                id: obj.clueid,
                solution: {
                    type: "coordset",
                    candidates: spotsFor(obj.scan)
                },
                range: parseInt((obj.clue as string).match("Orb scan range: (\\d+) paces")[1]),
                scantext: obj.scantext,
            }
            imported.push(imp)
            break
        }
        case "action": {
            let imp: SkillingStep = {
                type: "skilling",
                clue: obj.clue as string,
                tier: "master",
                id: obj.clueid,
                solution: parseSolution(obj)
            }
            imported.push(imp)
            break
        }

        default: {
            if (n < 10) {
                console.log(obj.clueid + obj.type)
            }
            n++;
        }
    }
}

let compass_main: CompassStep = {
    clue: "The compass shows where you need to go.",
    id: 399,
    solution: {
        type: "coordset",
        candidates: spotsFor(0)
    },
    tier: "elite",
    type: "compass"
}

let compass_arc: CompassStep = {
    clue: "The compass shows where you need to go on the arc.",
    id: 399,
    solution: {
        type: "coordset",
        candidates: spotsFor(50)
    },
    tier: "master",
    type: "compass"
}

imported.push(compass_main)
imported.push(compass_arc)

fs.writeFileSync("data.json.js", JSON.stringify(imported, null, 2))