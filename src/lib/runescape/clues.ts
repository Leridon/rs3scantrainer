import {GieliCoordinates, MapCoordinate} from "./coordinates";

export type ClueTier = "easy" | "medium" | "hard" | "elite" | "master"

export type ClueType =
    "anagram"
    | "compass"
    | "coordinates"
    | "cryptic"
    | "emote"
    | "image"
    | "scan"
    | "simple"
    | "skilling"

export namespace ClueType {
    export function pretty(x: ClueTier | ClueType) {
        if (!x) return ""
        return x.charAt(0).toUpperCase() + x.slice(1);
    }
}

export type SolutionType = "simple" | "variants" | "coordset"

type SolutionBase = { type: SolutionType }
type SolutionVariant = { id: string, name: string, solution: SimpleSolution }

export type SimpleSolution = SolutionBase & { type: "simple", coordinates: MapCoordinate, answer?: string }
export type SetSolution = SolutionBase & { type: "coordset", candidates: MapCoordinate[] }
export type VariantSolution = SolutionBase & { type: "variants", variants: SolutionVariant[] }

export type Solution = SimpleSolution | SetSolution | VariantSolution

type StepBase = { id: number, clue: string, tier: ClueTier, type: ClueType, solution?: Solution }

export type SimpleStep = StepBase &
    { type: "simple", solution: SimpleSolution | VariantSolution }
export type EmoteStep = StepBase &
    { type: "emote", solution: SimpleSolution | VariantSolution }
export type AnagramStep = StepBase &
    { type: "anagram", solution: SimpleSolution | VariantSolution }
export type ImageStep = StepBase &
    { type: "image", image: number[], solution: SimpleSolution | VariantSolution }
export type CrypticStep = StepBase &
    { type: "cryptic", solution: SimpleSolution | VariantSolution }
export type CoordinateStep = StepBase &
    { type: "coordinates", solution: SimpleSolution, coordinates: GieliCoordinates }    // TODO: Remove solution since it's redundant
export type SkillingStep = StepBase &
    { type: "skilling", solution: SimpleSolution | VariantSolution }
export type CompassStep = StepBase &
    { type: "compass", solution: SetSolution }
export type ScanStep = StepBase &
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

export class ClueIndex {
    constructor(private data: ClueStep[]) { }

    all(): ClueStep[] {
        return this.data
    }

    byId(id: number): ClueStep {
        return this.data.find((s) => s.id == id)
    }
}