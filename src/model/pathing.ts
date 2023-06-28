import {Box, MapCoordinate, Vector2} from "./coordinates";
import {direction, HostedMapData, MovementAbilities, PlayerPosition} from "./movement";
import movement_ability = MovementAbilities.movement_ability;
import {util} from "../util/util";
import * as lodash from "lodash"

type step_base = {
    type: string,
    description?: string,
}

// TODO: Orientation step

export type step_orientation = step_base & {
    type: "orientation",
    direction: direction
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

export type step = step_orientation | step_ability | step_run | step_teleport | step_interact | step_redclick | step_powerburst

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

    export async function augment(path: Path.raw): Path.augmented {
        // TODO: Consider antispam delay of subsequent surges
        // TODO: Auto wait for cooldown (Emit warning)

        let augmented_steps: augmented_step[] = []

        let carry: {
            tick: number,
            ability_ticks: {
                escape: number[],
                surge: number[],
                barge: number[],
                dive: number[],
            },
            acceleration_activation_tick: number,
            position: PlayerPosition,
            target: MapCoordinate,
        } = {
            tick: 0,
            ability_ticks: {
                escape: [],
                surge: [],
                barge: [],
                dive: [],
            },
            acceleration_activation_tick: -120,
            position: null,
            target: null
        }

        for (let i = 0; i < path.steps.length; i++) {
            let step = path.steps[i]

            let augmented: augmented_step = {
                ends_up: lodash.clone(carry.position) || {tile: null, direction: null},
                issues: [],
                section: 0,
                ticks: 0,
                raw: step
            }

            switch (step.type) {
                case "orientation":
                    if (i > 0) augmented.issues.push("Orientation steps should only be used as the first step!")

                    augmented.ticks = 1

                    augmented.ends_up.direction = step.direction
                    break
                case "run": {
                    if (carry.position.tile && !MapCoordinate.eq(carry.position.tile, step.waypoints[0]))
                        augmented.issues.push("Running does not start where the previous step ends!")

                    augmented.ticks = Math.ceil(step.waypoints.length / 2)
                    augmented.ends_up = {
                        tile: step.waypoints[step.waypoints.length - 1],
                        direction: direction.fromVector(
                            carry.target
                                ? Vector2.sub(carry.target, index(step.waypoints, -1))
                                : Vector2.sub(index(step.waypoints, -1), index(step.waypoints, -2)))
                    }
                    carry.target = null
                }
                    break;
                case "ability":
                    // Check whether start and target matches expectations
                    if (carry.position) {
                        if (carry.position.tile && !MapCoordinate.eq(carry.position.tile, step.from))
                            augmented.issues.push("Ability does not start where the previous step ends!")

                        switch (step.ability) {
                            case "surge": {
                                let res = await MovementAbilities.surge2(carry.position)

                                if (!res || !MapCoordinate.eq(step.to, res.tile))
                                    augmented.issues.push("Surge target does not match where it would end up!")
                            }
                                break
                            case "escape": {
                                let res = await MovementAbilities.escape2(carry.position)

                                if (!res || !MapCoordinate.eq(step.to, res.tile))
                                    augmented.issues.push("Escape target does not match where it would end up!")
                            }
                                break
                            case "dive":
                            case "barge":
                        }
                    }

                    // Check cooldowns
                    // Assumes mobile as well as double surge/escape.
                    switch (step.ability) {
                        case "surge":
                        case "escape":
                        case "dive":
                        case "barge": {
                            const cd = 34

                            let cooldown_left = Math.max(0, carry.tick - index(carry.ability_ticks.barge, -1))

                            if (cooldown_left > 0)
                                augmented.issues.push(`Barge is still on cooldown for ${cooldown_left} ticks.`)

                            augmented.ticks += cooldown_left

                        }
                            break

                    }

                    // TODO: Incorporate the fact that you can run 2 tiles and use an ability in the same tick.
                    // 13:46]treborsmada: its just (surge/escape/bd/(surge + bd)/(bd + surge)/(escape + bd)/(bd+ escape)) + <= 2 tiles movement
                    augmented.ticks = 1

                    carry.position = {
                        tile: step.to,
                        direction: direction.fromVector(Vector2.sub(step.to, step.from))
                    }
                    if (step.ability == "escape") carry.position.direction = direction.invert(carry.position.direction)

                    // A movement ability overrides target (TODO: Or does it?)
                    carry.target = null

                    break;
                case "teleport":
                    break;
                case "interaction":
                    break;
                case "redclick":
                    carry.target = step.where
                    break;
                case "powerburst":
                    if (carry.tick - carry.acceleration_activation_tick < 120)
                        augmented.issues.push("Powerburst of acceleration still on cooldown!")


                    carry.acceleration_activation_tick = carry.tick
                    augmented.ticks = 1

                    break;
            }

            carry.position = augmented.ends_up
            carry.tick += augmented.ticks

            augmented_steps.push(augmented)
        }

        return {
            raw: path,
            steps: augmented_steps,
            expected_execution_time: augmented_steps.map((s) => s.ticks).reduce((a, b) => a + b, 0),
            ends_up: index(augmented_steps, -1)?.ends_up
        }
    }

    export function analyze(path: Path.augmented): Path.augmented {
        /*
         TODO: Analyze for issues
            - Start-location not matching up where previous step ends
            - Violated ability cooldown
            - Surge/Escape direction not matching up
         */
        return path
    }
}