import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {Path} from "lib/runescape/pathing";
import {TileCoordinates} from "../../lib/runescape/coordinates";

export namespace SolvingMethods {
    export type method_kind = "scantree" | "general_path"

    type ClueAssumptions = {
        meerkats_active?: boolean,
        full_globetrotter?: boolean,
        way_of_the_footshaped_key?: boolean
    } & Path.PathAssumptions

    type method_base = {
        type: method_kind,
        id: string,
        for: { clue: number, spot?: TileCoordinates },
        name: string,
        description: string,
        assumptions?: ClueAssumptions,
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
}