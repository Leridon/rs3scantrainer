import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {Path} from "lib/runescape/pathing";
import {TileCoordinates} from "../../lib/runescape/coordinates";
import {Clues} from "../../lib/runescape/clues";
import {uuid} from "../../oldlib";

export namespace SolvingMethods {
    export type method_kind = "scantree" | "general_path"

    export type ClueAssumptions = {
        meerkats_active?: boolean,
        full_globetrotter?: boolean,
        way_of_the_footshaped_key?: boolean
    } & Path.PathAssumptions

    export namespace ClueAssumptions {
        export function init(): ClueAssumptions {
            return {
                double_escape: true,
                double_surge: true,
                full_globetrotter: true,
                meerkats_active: true,
                mobile_perk: true,
                way_of_the_footshaped_key: true
            }
        }
    }

    type method_base = {
        type: method_kind,
        id: string,
        for: { clue: number, spot?: TileCoordinates },
        name: string,
        description: string,
        assumptions: ClueAssumptions,
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

    export function init(clue: Clues.ClueSpot): Method {
        if (clue.clue.type == "scan") {
            return {
                id: uuid(),
                type: "scantree",
                name: "Enter a name",
                description: "Enter a description.",
                assumptions: ClueAssumptions.init(),
                for: {clue: clue.clue.id},
                tree: ScanTree.init(clue.clue)
            }
        } else {
            return {
                id: uuid(),
                type: "general_path",
                name: "Enter a name",
                description: "Enter a description.",
                assumptions: ClueAssumptions.init(),
                for: {clue: clue.clue.id, spot: clue.spot ?? undefined},
                path_back_to_hideyhole: [],
                path_to_key_or_hideyhole: [],
                path_to_spot: [],
            }
        }
    }
}