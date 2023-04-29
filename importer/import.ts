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

type GieliCoordinates = {
    longtitude: {
        degrees: number,
        minutes: number,
        direction: "east" | "west"
    },
    latitude: {
        degrees: number,
        minutes: number,
        direction: "north" | "south"
    }
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
    { type: "coordinates", solution: SimpleSolution, coordinates: GieliCoordinates }
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
    id: 400,
    solution: {
        type: "coordset",
        candidates: spotsFor(50)
    },
    tier: "master",
    type: "compass"
}

imported.push(compass_main)
imported.push(compass_arc)


// Extract coordinates from wiki:
// (\d+) degrees (\d+) minutes (north|south).*\n.*(\d+) degrees (\d+) minutes (east|west).*\n.*tier = (Hard)
// List:
// { coordinate: {longitude: { degrees: "$1", minutes: "$2", direction: "$3" }, latitude: {degrees: "$4", minutes: "$5", direction: "$6"}}, tier: "$7" },\n

let coordinates = [
    {clue: "00 degrees 00 minutes north, 7 degrees 13 minutes west", tier: "Hard"},
    {clue: "00 degrees 05 minutes south, 1 degrees 13 minutes east", tier: "Medium"},
    {clue: "00 degrees 13 minutes south, 4 degrees 00 minutes east", tier: "Medium"},
    {clue: "00 degrees 18 minutes south, 9 degrees 28 minutes east", tier: "Medium"},
    {clue: "00 degrees 20 minutes south, 3 degrees 15 minutes east", tier: "Medium"},
    {clue: "00 degrees 31 minutes south, 7 degrees 43 minutes east", tier: "Medium"},
    {clue: "00 degrees 50 minutes north, 4 degrees 16 minutes east", tier: "Medium"},
    {clue: "01 degrees 18 minutes south, 4 degrees 15 minutes east", tier: "Medium"},
    {clue: "01 degrees 24 minutes north, 8 degrees 05 minutes west", tier: "Hard"},
    {clue: "01 degrees 26 minutes north, 8 degrees 01 minutes east", tier: "Medium"},
    {clue: "01 degrees 35 minutes south, 7 degrees 28 minutes east", tier: "Medium"},
    {clue: "02 degrees 33 minutes north, 8 degrees 45 minutes east", tier: "Hard"},
    {clue: "02 degrees 50 minutes north, 6 degrees 20 minutes east", tier: "Medium"},
    {clue: "02 degrees 50 minutes north, 1 degrees 46 minutes east", tier: "Medium"},
    {clue: "03 degrees 03 minutes south, 5 degrees 03 minutes east", tier: "Hard"},
    {clue: "03 degrees 35 minutes south, 3 degrees 35 minutes east", tier: "Medium"},
    {clue: "03 degrees 39 minutes south, 3 degrees 58 minutes east", tier: "Hard"},
    {clue: "03 degrees 45 minutes south, 2 degrees 45 minutes east", tier: "Hard"},
    {clue: "04 degrees 00 minutes south, 2 degrees 46 minutes east", tier: "Medium"},
    {clue: "04 degrees 03 minutes south, 3 degrees 11 minutes east", tier: "Hard"},
    {clue: "04 degrees 05 minutes south, 4 degrees 24 minutes east", tier: "Hard"},
    {clue: "04 degrees 13 minutes north, 2 degrees 45 minutes east", tier: "Medium"},
    {clue: "04 degrees 16 minutes south, 6 degrees 16 minutes east", tier: "Hard"},
    {clue: "04 degrees 41 minutes north, 3 degrees 09 minutes west", tier: "Hard"},
    {clue: "05 degrees 20 minutes south, 4 degrees 28 minutes east", tier: "Medium"},
    {clue: "05 degrees 37 minutes north, 1 degrees 15 minutes east", tier: "Hard"},
    {clue: "05 degrees 43 minutes north, 3 degrees 05 minutes east", tier: "Medium"},
    {clue: "05 degrees 50 minutes south, 0 degrees 05 minutes east", tier: "Hard"},
    {clue: "06 degrees 00 minutes south, 1 degrees 48 minutes east", tier: "Hard"},
    {clue: "06 degrees 11 minutes south, 5 degrees 07 minutes east", tier: "Hard"},
    {clue: "06 degrees 31 minutes north, 1 degrees 46 minutes west", tier: "Medium"},
    {clue: "07 degrees 05 minutes north, 0 degrees 56 minutes east", tier: "Medium"},
    {clue: "07 degrees 22 minutes north, 4 degrees 15 minutes east", tier: "Hard"},
    {clue: "07 degrees 33 minutes north, 5 degrees 00 minutes east", tier: "Medium"},
    {clue: "07 degrees 41 minutes north, 6 degrees 00 minutes east", tier: "Hard"},
    {clue: "07 degrees 43 minutes south, 2 degrees 26 minutes east", tier: "Hard"},
    {clue: "08 degrees 03 minutes north, 1 degrees 16 minutes east", tier: "Hard"},
    {clue: "08 degrees 05 minutes south, 5 degrees 56 minutes east", tier: "Hard"},
    {clue: "08 degrees 26 minutes south, 0 degrees 28 minutes east", tier: "Hard"},
    {clue: "08 degrees 33 minutes north, 1 degrees 39 minutes west", tier: "Medium"},
    {clue: "09 degrees 22 minutes north, 2 degrees 24 minutes west", tier: "Hard"},
    {clue: "09 degrees 33 minutes north, 2 degrees 15 minutes east", tier: "Medium"},
    {clue: "09 degrees 48 minutes north, 7 degrees 39 minutes east", tier: "Medium"},
    {clue: "11 degrees 03 minutes north, 1 degrees 20 minutes east", tier: "Medium"},
    {clue: "11 degrees 05 minutes north, 0 degrees 45 minutes west", tier: "Medium"},
    {clue: "11 degrees 41 minutes north, 4 degrees 58 minutes east", tier: "Medium"},
    {clue: "12 degrees 48 minutes north, 0 degrees 20 minutes east", tier: "Hard"},
    {clue: "13 degrees 46 minutes north, 1 degrees 01 minutes east", tier: "Hard"},
    {clue: "14 degrees 54 minutes north, 9 degrees 13 minutes east", tier: "Medium"},
    {clue: "15 degrees 48 minutes north, 3 degrees 52 minutes east", tier: "Hard"},
    {clue: "16 degrees 20 minutes north, 2 degrees 45 minutes east", tier: "Hard"},
    {clue: "16 degrees 30 minutes north, 6 degrees 28 minutes east", tier: "Hard"},
    {clue: "16 degrees 35 minutes north, 7 degrees 01 minutes east", tier: "Hard"},
    {clue: "17 degrees 50 minutes north, 8 degrees 30 minutes east", tier: "Hard"},
    {clue: "18 degrees 03 minutes north, 5 degrees 16 minutes east", tier: "Hard"},
    {clue: "18 degrees 22 minutes north, 6 degrees 33 minutes east", tier: "Hard"},
    {clue: "19 degrees 43 minutes north, 5 degrees 07 minutes east", tier: "Hard"},
    {clue: "20 degrees 05 minutes north, 1 degrees 52 minutes east", tier: "Hard"},
    {clue: "20 degrees 07 minutes north, 8 degrees 33 minutes east", tier: "Hard"},
    {clue: "20 degrees 33 minutes north, 5 degrees 48 minutes east", tier: "Hard"},
    {clue: "21 degrees 24 minutes north, 7 degrees 54 minutes east", tier: "Hard"},
    {clue: "22 degrees 30 minutes north, 3 degrees 01 minutes east", tier: "Medium"},
    {clue: "22 degrees 35 minutes north, 9 degrees 18 minutes east", tier: "Hard"},
    {clue: "22 degrees 45 minutes north, 6 degrees 33 minutes east", tier: "Hard"},
    {clue: "24 degrees 26 minutes north, 6 degrees 24 minutes east", tier: "Hard"},
    {clue: "24 degrees 56 minutes north, 2 degrees 28 minutes east", tier: "Hard"},
    {clue: "24 degrees 58 minutes north, 8 degrees 43 minutes east", tier: "Hard"},
    {clue: "25 degrees 03 minutes north, 7 degrees 05 minutes east", tier: "Hard"},
    {clue: "25 degrees 03 minutes north, 3 degrees 24 minutes east", tier: "Hard"},
]

let next_id = 401
for (let coord of coordinates) {

    let match = coord.clue.match("(\\d+) degrees (\\d+) minutes (north|south), (\\d+) degrees (\\d+) minutes (east|west)")

    let clue: CoordinateStep = {
        clue: coord.clue,
        coordinates: {
            latitude: {
                degrees: Number(match[1]),
                minutes: Number(match[2]),
                direction: match[3] as ("north" | "south"),
            },
            longtitude: {
                degrees: Number(match[4]),
                minutes: Number(match[5]),
                direction: match[6] as ("east" | "west"),
            }
        },
        id: next_id,
        solution: null,
        tier: coord.tier.toLowerCase() as ("hard" | "medium"),
        type: "coordinates"
    }

    imported.push(clue)

    next_id++
}


fs.writeFileSync("data.json.js", JSON.stringify(imported, null, 2))