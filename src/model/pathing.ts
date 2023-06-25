import {Box, MapCoordinate, Vector2} from "./coordinates";
import {direction, MovementAbilities, PlayerPosition} from "./movement";
import movement_ability = MovementAbilities.movement_ability;
import {util} from "../util/util";

type step_base = {
    type: string,
    description?: string,
}

export type step_ability = step_base & {
    type: "ability",
    ability: movement_ability,
    from: MapCoordinate,
    to: MapCoordinate,
} & (
    { ability: "barge", barge_target?: string }
    | { ability: "surge" | "dive" | "escape" }
    )

export type step_run = step_base & {
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
    area: Box,
    ends_up: PlayerPosition
}

type step_redclick = step_base & {
    type: "redclick",
    where: MapCoordinate,
    how?: "spell" | "talkto"
}

type step_powerburst = step_base & {
    type: "powerburst"
}

export type step = step_ability | step_run | step_teleport | step_interact | step_redclick | step_powerburst


export namespace Path {
    import index = util.index;
    export type raw = {
        description: string,
        clip: any
        steps: step[],
    }

    export type augmented = {
        raw: raw,
        steps: augmented_step[],
        expected_execution_time: number,
        ends_up: PlayerPosition
        issues?: string[]
    }

    export type augmented_step = {
        raw: step,
        section: number,
        ticks: number,
        ends_up: PlayerPosition
        issues?: string[]
    }

    export function augment(path: Path.raw): Path.augmented {

        let augmented_steps: augmented_step[] = []
        let orientation_click: MapCoordinate = null

        for (let step of path.steps) {

            let pre_position: PlayerPosition = index(augmented_steps, -1)?.ends_up
            let ticks = 0
            let ends_up: PlayerPosition = null

            switch (step.type) {
                case "run": {
                    ticks = Math.ceil(step.waypoints.length / 2)
                    ends_up = {
                        tile: step.waypoints[step.waypoints.length - 1],
                        direction: direction.fromVector(
                            orientation_click
                                ? Vector2.sub(orientation_click, index(step.waypoints, -1))
                                : Vector2.sub(index(step.waypoints, -1), index(step.waypoints, -2)))
                    }
                    orientation_click = null
                }
                    break;
                case "ability":

                    // TODO: Incorporate the fact that you can run 2 tiles and use an ability in the same tick.
                    ticks = 1

                    let dir = direction.fromVector(Vector2.sub(step.to, step.from))
                    if (step.ability == "escape") dir = direction.invert(dir)

                    ends_up = {
                        tile: step.to,
                        direction: dir
                    }
                    orientation_click = null

                    break;
                case "teleport":
                    break;
                case "interaction":
                    break;
                case "redclick":
                    orientation_click = step.where
                    ticks = 0
                    ends_up = pre_position
                    break;
                case "powerburst":
                    orientation_click = null
                    ticks = 1
                    ends_up = pre_position
                    break;

            }

            augmented_steps.push({
                raw: step,
                section: 0,
                ticks: 0,
                ends_up: ends_up
            })
        }


        return {
            raw: path,
            steps: augmented_steps,
            expected_execution_time: augmented_steps.map((s) => s.ticks).reduce((a, b) => a + b, 0),
            ends_up: index(augmented_steps, -1)?.ends_up
        }
    }

    export function analyze(path: Path.augmented): Path.augmented {
        // TODO:
        return path
    }
}