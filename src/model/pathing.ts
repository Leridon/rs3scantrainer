import {Box, MapCoordinate} from "./coordinates";

type step_base = {
    type: string,
    ticks?: number
}

type step_ability = step_base & {
    type: "ability",
    ability: "surge" | "dive" | "escape" | "barge",
    from: MapCoordinate,
    to: MapCoordinate
}

type step_run = step_base & {
    type: "run",
    waypoints: MapCoordinate[]
}

type step_teleport = step_base & {
    type: "teleport",
    id: {
        main: string,
        sub: string,
        variant?: string
    }
}

type step_interact = step_base & {
    type: "interaction",
    area: Box
}

type step_redclick = step_base & {
    type: "redclick",
    where: MapCoordinate,
}

export type step = step_ability | step_run | step_teleport | step_interact | step_redclick

export type path = {
    description: string,
    clip: any
    sections: step[][],
}