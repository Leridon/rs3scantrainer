import {TileCoordinates} from "./coordinates";
import {TileRectangle} from "./coordinates";
import {GieliCoordinates} from "./coordinates";
import {ExportImport} from "../util/exportString";
import exp = ExportImport.exp;

export namespace Clues {
    export function digSpotArea(spot: TileCoordinates): TileRectangle {
        return {
            topleft: {x: spot.x - 1, y: spot.y + 1},
            botright: {x: spot.x + 1, y: spot.y - 1},
            level: spot.level
        }
    }
}

export type ClueTier = "easy" | "medium" | "hard" | "elite" | "master"

export namespace ClueTier {

    export const all: ClueTier[] = ["easy", "medium", "hard", "elite", "master"]
}

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
    export function meta(x: ClueTier | ClueType) {
        let lut: Record<ClueType | ClueTier, {
            icon_url: string
        }> = {
            easy: {icon_url: "assets/icons/sealedeasy.png"},
            medium: {icon_url: "assets/icons/sealedmedium.png"},
            hard: {icon_url: "assets/icons/sealedhard.png"},
            elite: {icon_url: "assets/icons/sealedelite.png"},
            master: {icon_url: "assets/icons/sealedmaster.png"},
            anagram: {icon_url: "assets/icons/activeclue.png"},
            compass: {icon_url: "assets/icons/arrow.png"},
            coordinates: {icon_url: "assets/icons/sextant.png"},
            cryptic: {icon_url: "assets/icons/activeclue.png"},
            emote: {icon_url: "assets/icons/emotes.png"},
            image: {icon_url: "assets/icons/map.png"},
            scan: {icon_url: "assets/icons/scan.png"},
            simple: {icon_url: "assets/icons/activeclue.png"},
            skilling: {icon_url: "assets/icons/activeclue.png"}
        }

        return lut[x]
    }

    export function pretty(x: ClueTier | ClueType) {
        if (!x) return ""
        return x.charAt(0).toUpperCase() + x.slice(1);
    }

    export const all: ClueType[] = ["anagram", "compass", "coordinates", "cryptic", "emote", "image", "scan", "simple", "skilling"]
}

export type SolutionType = "simple" | "variants" | "coordset"

type SolutionBase = { type: SolutionType }
type SolutionVariant = { id: string, name: string, solution: SimpleSolution }

export type SimpleSolution = SolutionBase & { type: "simple", coordinates: TileCoordinates, answer?: string }
export type SetSolution = SolutionBase & { type: "coordset", candidates: TileCoordinates[] }
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