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

export type SolutionType = "simple" | "variants" | "coordset"

type SolutionBase = { type: SolutionType }
type SolutionVariant = { id: string, name: string, solution: SimpleSolution }

export type SimpleSolution = SolutionBase & { type: "simple", coordinates: Coordinate, answer?: string }
export type SetSolution = SolutionBase & { type: "coordset", candidates: Coordinate[] }
export type VariantSolution = SolutionBase & { type: "variants", variants: SolutionVariant[] }

export type Solution = SimpleSolution | SetSolution | VariantSolution

type ClueBase = { id: number, clue: string, tier: ClueTier, type: ClueType, solution?: Solution }

export type SimpleStep = ClueBase &
    { type: "simple", solution: SimpleSolution }
export type EmoteStep = ClueBase &
    { type: "emote", solution: SimpleSolution }
export type AnagramStep = ClueBase &
    { type: "anagram", solution: SimpleSolution }
export type ImageStep = ClueBase &
    { type: "map", image: number[], solution: SimpleSolution }
export type CrypticStep = ClueBase &
    { type: "cryptic", solution: SimpleSolution }
export type CoordinateStep = ClueBase &
    { type: "coordinates", solution: SimpleSolution }
export type SkillingStep = ClueBase &
    { type: "skilling", solution: SimpleSolution }
export type CompassStep = ClueBase &
    { type: "compass", candidates: Coordinate[] }
export type ScanStep = ClueBase &
    { type: "scan", scantext: string, range: number, candidates: Coordinate[] }

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
