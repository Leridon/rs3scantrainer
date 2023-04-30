export type ClueTier = "easy" | "medium" | "hard" | "elite" | "master"

export type ClueType = "anagram"
    | "compass"
    | "coordinates"
    | "cryptic"
    | "emote"
    | "image"
    | "scan"
    | "simple"
    | "skilling"

export type Coordinate = {
    x: number,
    y: number
    level?: number
}

export type GieliCoordinates = {
    latitude: {
        degrees: number,
        minutes: number,
        direction: "north" | "south"
    },
    longitude: {
        degrees: number,
        minutes: number,
        direction: "east" | "west"
    }
}

export type SolutionType = "simple" | "variants" | "coordset"

type SolutionBase = { type: SolutionType }
type SolutionVariant = { id: string, name: string, solution: SimpleSolution }

export type SimpleSolution = SolutionBase & { type: "simple", coordinates: Coordinate, answer?: string }
export type SetSolution = SolutionBase & { type: "coordset", candidates: Coordinate[] }
export type VariantSolution = SolutionBase & { type: "variants", variants: SolutionVariant[] }

export type Solution = SimpleSolution | SetSolution | VariantSolution

type ClueBase = { id: number, clue: string, tier: ClueTier, type: ClueType, solution?: Solution }

export type SimpleStep = ClueBase &
    { type: "simple", solution: SimpleSolution | VariantSolution }
export type EmoteStep = ClueBase &
    { type: "emote", solution: SimpleSolution | VariantSolution }
export type AnagramStep = ClueBase &
    { type: "anagram", solution: SimpleSolution | VariantSolution }
export type ImageStep = ClueBase &
    { type: "image", image: number[], solution: SimpleSolution | VariantSolution }
export type CrypticStep = ClueBase &
    { type: "cryptic", solution: SimpleSolution | VariantSolution }
export type CoordinateStep = ClueBase &
    { type: "coordinates", solution: null, coordinates: GieliCoordinates }
export type SkillingStep = ClueBase &
    { type: "skilling", solution: SimpleSolution | VariantSolution }
export type CompassStep = ClueBase &
    { type: "compass", solution: SetSolution }
export type ScanStep = ClueBase &
    { type: "scan", scantext: string, range: number, solution: SetSolution }

export type ClueStep =
    SimpleStep
    | ScanStep
    | EmoteStep
    | AnagramStep
    | ImageStep
    | CrypticStep
    | CompassStep
    | CoordinateStep
    | SkillingStep
