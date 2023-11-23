import {Clues, ClueType} from "lib/runescape/clues";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {Path} from "lib/runescape/pathing";
import {util} from "lib/util/util";
import {omit} from "lodash";
import {TileCoordinates} from "../../lib/runescape/coordinates";

export namespace SolvingMethods {
    import ensure_subtype = util.ensure_subtype;
    import ScanStep = Clues.ScanStep;

    export type method_kind = "scantree" | "genericpath"

    type method_step_mapping = ensure_subtype<Record<method_kind, Clues.Step>, {
        "scantree": ScanStep,
        "genericpath": Clues.Step
    }>

    type ClueStepForMethod<MethodT extends Method> = method_step_mapping[MethodT["type"]]

    type method_base = {
        type: method_kind,
        id: string,
        for: { clue: number, spot?: TileCoordinates },
        name: string,
        description: string,
    }

    export type ScanTreeMethod = method_base & {
        type: "scantree",
        tree: ScanTree.ScanTree
    }
    export type GenericPathMethod = method_base & {
        type: "general_path",
        path_to_key_or_hideyhole?: Path.raw,
        path_to_spot: Path.raw,
        path_back_to_hideyhole?: Path.raw
    }

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
}