import {ClueStep, ClueType, ScanStep} from "lib/runescape/clues";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {Path} from "lib/runescape/pathing";
import {util} from "../../lib/util/util";
import {omit} from "lodash";

export namespace SolvingMethods {
    import ensure_subtype = util.ensure_subtype;
    export type method_kind = "scantree" | "genericpath"

    const compatible_clue_steps: Record<method_kind, ClueType[]> = {
        scantree: ["scan"],
        genericpath: []
    }

    type method_step_mapping = ensure_subtype<Record<method_kind, ClueStep>, {
        "scantree": ScanStep,
        "genericpath": ClueStep
    }>

    type ClueStepForMethod<MethodT extends Method> = method_step_mapping[MethodT["type"]]

    type method_base = {
        type: method_kind,
        clue_id: number
    }

    export type ScanTreeMethod = method_base & { type: "scantree" } & ScanTree.ScanTree
    export type GenericPathMethod = method_base & { type: "genericpath" } & { path: Path.raw }

    export type Method = ScanTreeMethod | GenericPathMethod

    export type MethodWithClue<method_t extends Method = Method> = method_t & { clue: method_step_mapping[method_t["type"]] }

    export type ScanTreeWithClue = MethodWithClue<ScanTreeMethod>

    export function withClue<MethodT extends Method, StepT extends ClueStepForMethod<MethodT> = ClueStepForMethod<MethodT>>(method: MethodT, clue: StepT): MethodWithClue<MethodT> {
        return {
            ...method,
            clue: clue
        }
    }

    export function withoutClue<MethodT extends Method = Method>(method: MethodWithClue<MethodT>): MethodT {
        return omit(method, "clue") as unknown as MethodT // Why does this not automatically typecheck?
    }

    /*
    export function resolve<U extends ClueStep, T extends method_base>(clue: T & indirected): T & resolved<U> {
        if (clue == null) return null

        let copy = lodash.clone(clue) as T & resolved<U>

        copy.clue = clues.find((c) => c.id == clue.clue) as U

        return copy as (T & resolved<U>)
    }
    */
}