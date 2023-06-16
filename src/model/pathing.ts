import {Box, MapCoordinate} from "./coordinates";

export type movement_ability = "surge" | "dive" | "escape" | "barge"

type step_base = {
    type: string,
    ticks?: number
}

type step_ability = step_base & {
    type: "ability",
    ability: movement_ability,
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
    },
    spot_override?: MapCoordinate
}

type step_interact = step_base & {
    type: "interaction",
    area: Box
}

type step_redclick = step_base & {
    type: "redclick",
    where: MapCoordinate,
}

type step_powerburst = step_base & {
    type: "powerburst",
    where: MapCoordinate
}

export type step = step_ability | step_run | step_teleport | step_interact | step_redclick

export type path = {
    description: string,
    clip: any
    steps: step[],
}

type augmented_path = {
    description: string,
    clip: any,
    sections: step[][],
    expected_execution_time: number
}