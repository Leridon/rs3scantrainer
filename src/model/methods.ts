import {ClueStep, ScanStep} from "./clues";
import {ScanTree2} from "./scans/ScanTree2";
import {clues} from "../data/clues";

export type method_base = {
    type: string,
    clue: ScanStep | number,
}

export type indirected = method_base & { clue: number }
export type resolved<T extends ClueStep> = method_base & { clue: T }

export type method = ScanTree2.tree

export function resolve<U extends ClueStep, T extends method_base>(clue: T & indirected): T & resolved<U> {
    if (clue == null) return null

    let copy: method_base = lodash.clone(clue)

    copy.clue = clues.find((c) => c.id == clue.clue)

    return copy as (T & resolved<U>)
}

import * as lodash from "lodash"

export function indirect<T extends method_base, U extends ClueStep>(clue: T & resolved<U>): T & indirected {
    if (clue == null) return null

    let copy: method_base = lodash.clone(clue)

    copy.clue = clue.clue.id

    return copy as (T & indirected)
}

// TODO: Remove
export type HowTo = {
    video?: any,
    text?: string,
    image?: string
}