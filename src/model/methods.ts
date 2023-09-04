import {ClueStep} from "./clues";
import {ScanTree} from "./scans/ScanTree";
import {clues} from "../data/clues";

export type method_base = {
    type: string,
    clue: ClueStep | number,
}

export type indirected = method_base & { clue: number }
export type resolved<T extends ClueStep> = method_base & { clue: T }

export type method = ScanTree.tree

export function resolve<U extends ClueStep, T extends method_base>(clue: T & indirected): T & resolved<U> {
    if (clue == null) return null

    let copy = lodash.clone(clue) as T & resolved<U>

    copy.clue = clues.find((c) => c.id == clue.clue) as U

    return copy as (T & resolved<U>)
}

import * as lodash from "lodash"

export function indirect<T extends method_base, U extends ClueStep>(clue: T & resolved<U>): T & indirected {
    if (clue == null) return null

    let copy: method_base = lodash.clone(clue)

    copy.clue = clue.clue.id

    return copy as (T & indirected)
}