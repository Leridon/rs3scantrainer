import {GieliCoordinates, MapCoordinate} from "./coordinates";
import {clues} from "../data/clues";
import {data} from "jquery";
import {Application} from "../application";
import {TileMarker} from "../ui/map/map";
import {ActiveLayer, SimpleMarkerLayer} from "../ui/map/activeLayer";
import {ScanLayer} from "../ui/map/layers/ScanLayer";

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

export function pretty(x: ClueTier | ClueType) {
    if (!x) return ""
    return x.charAt(0).toUpperCase() + x.slice(1);
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
    { type: "coordinates", solution: null, coordinates: GieliCoordinates }
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

export class ClueSteps {
    steps: ClueStep[]

    constructor() {
        this.steps = clues
    }

    all(): ClueStep[] {
        return this.steps
    }

    byId(id: number): ClueStep {
        return this.steps.find((s) => s.id == id)
    }
}



export function getSolutionLayer(clue: ClueStep, app: Application, variant: number = 0): ActiveLayer {
    // TODO: This probably does not belong here

    if (clue.type == "scan") {
        return new ScanLayer(clue, app, {show_edit_button: true})
    }

    if (clue.solution) {
        switch (clue.solution.type) {
            case "coordset":
                return new SimpleMarkerLayer((clue.solution as SetSolution).candidates.map((e) => {
                    return new TileMarker(e).withMarker().withX("#B21319")
                }))
            case "simple":
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as SimpleSolution).coordinates).withMarker().withX("#B21319")
                ])
            case "variants":
                // TODO: Properly handle variant solutions
                return new SimpleMarkerLayer([
                    new TileMarker((clue.solution as VariantSolution).variants[variant].solution.coordinates).withMarker().withX("#B21319")
                ])
        }
    }
}