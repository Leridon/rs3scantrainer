import {Box, MapCoordinate, Vector2} from "./coordinates";
import {direction, MovementAbilities, PlayerPosition} from "./movement";
import movement_ability = MovementAbilities.movement_ability;
import {util} from "../util/util";
import * as lodash from "lodash"
import {teleport_data} from "../data/teleport_data";
import {full_teleport_id} from "./teleports";

type step_base = {
    type: string,
    description: string
}

export type interaction_type =
    "generic" | "chop" | "talk"

export namespace interaction_type {

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
}

export type step_run = step_base & {
    type: "run",
    waypoints: MapCoordinate[]
}

export type step_teleport = step_base & {
    type: "teleport",
    id: full_teleport_id,
    spot_override?: MapCoordinate
}

export type step_interact = step_base & {
    type: "interaction",
    ticks: number,
    where: MapCoordinate,
    ends_up: PlayerPosition,
    how: interaction_type
}

export type step_redclick = step_base & {
    type: "redclick",
    where: MapCoordinate,
    how: interaction_type
}

export type step_powerburst = step_base & {
    type: "powerburst",
    where: MapCoordinate
}

export type step = step_orientation | step_ability | step_run | step_teleport | step_interact | step_redclick | step_powerburst

export namespace Path {
    import index = util.index;
    import minIndex = util.minIndex;
    import cooldown = MovementAbilities.cooldown;
    import capitalize = util.capitalize;

    export type raw = {
        description: string,
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
        tick: number,
        section: number,
        ticks: number,
        ends_up: PlayerPosition
        issues?: string[]
    }

    export async function augment(path: Path.raw): Promise<Path.augmented> {
        // TODO: Consider antispam delay of subsequent surges
        // TODO: Auto wait for cooldown (Emit warning)

        let augmented_steps: augmented_step[] = []

        let carry: {
            tick: number,
            cooldowns: {    // Cooldowns signify the next tick the ability/charge can be used.
                escape: [number, number],
                surge: [number, number],
                barge: number,
                dive: number,
            },
            acceleration_activation_tick: number,
            position: PlayerPosition,
            targeted_entity: MapCoordinate,      // The targeted entity is set by redclicking it and can be used to set the player's orientation after running.
        } = {
            tick: 0,
            cooldowns: {
                escape: [0, 0],
                surge: [0, 0],
                barge: 0,
                dive: 0,
            },
            acceleration_activation_tick: -1000,
            position: {tile: null, direction: null},
            targeted_entity: null
        }

        for (let i = 0; i < path.steps.length; i++) {
            let step = path.steps[i]

            let augmented: augmented_step = {
                ends_up: lodash.clone(carry.position) || {tile: null, direction: null},
                tick: carry.tick,
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
                        tile: index(step.waypoints, -1),
                        direction: direction.fromVector(
                            carry.targeted_entity
                                ? Vector2.sub(carry.targeted_entity, index(step.waypoints, -1))
                                : Vector2.sub(index(step.waypoints, -1), index(step.waypoints, -2)))
                    }
                    carry.targeted_entity = null
                }
                    break;
                case "ability":
                    // Check whether start and target matches expectations
                    if (carry.position) {
                        if (carry.position.tile && !MapCoordinate.eq(carry.position.tile, step.from)) {
                            augmented.issues.push("Ability does not start where the previous step ends!")
                        } else {

                            // if there is no previous position, at least assume the defined start position
                            let assumed_pos = carry.position

                            assumed_pos.tile ||= step.from

                            if (assumed_pos.direction == null) {
                                assumed_pos.direction = direction.fromVector(Vector2.sub(step.to, step.from))
                                if (step.ability == "escape") assumed_pos.direction = direction.invert(assumed_pos.direction)
                            }

                            switch (step.ability) {
                                case "surge": {
                                    let res = await MovementAbilities.surge2(assumed_pos)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push("Surge target does not match where it would end up!")

                                    break
                                }
                                case "escape": {
                                    let res = await MovementAbilities.escape2(assumed_pos)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push("Escape target does not match where it would end up!")

                                    break
                                }
                                case "dive": {
                                    let res = await MovementAbilities.dive2(assumed_pos.tile, step.to)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push("Dive target can't be reached!")

                                    break
                                }
                                case "barge": {
                                    let res = await MovementAbilities.barge2(assumed_pos.tile, step.to)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push("Barge target can't be reached!")

                                    break
                                }
                            }
                        }
                    }

                    // Whether powerburst is active can only be determined AFTER the real tick of the step is set
                    // To not duplicate so much code, this is used as a reusable shortcut.
                    const powerburst = () => (augmented.tick - carry.acceleration_activation_tick) <= 120

                    // Check cooldowns
                    // Assumes mobile as well as double surge/escape.
                    // TODO: This entire logic is most likely riddled by off-by-one errors that need to be checked to ensure path lengths are estimated correctly.

                    // TODO: Incorporate the fact that you can run 2 tiles and use an ability in the same tick.
                    // [13:46] treborsmada: its just (surge/escape/bd/(surge + bd)/(bd + surge)/(escape + bd)/(bd+ escape)) + <= 2 tiles movement
                    // So essentially: Any movement + optionally dive + 2 tiles movement.
                    // moving first and THEN an ability in the same tick does not work.
                    switch (step.ability) {
                        case "surge": {
                            let min = minIndex(carry.cooldowns.surge)

                            if (carry.cooldowns.surge[min] > augmented.tick) {
                                if (carry.cooldowns.surge[min] - augmented.tick <= 2 && carry.cooldowns.surge[1 - min] >= cooldown("surge", powerburst()) - 2)
                                    augmented.issues.push(`Antispam delay. Waiting for ${carry.cooldowns.surge[min] - augmented.tick} ticks.`)
                                else
                                    augmented.issues.push(`Both surge charges are still on cooldown for ${carry.cooldowns.surge[min] - augmented.tick} ticks.`)

                                augmented.tick = carry.cooldowns.surge[min] // Wait for cooldown
                            }

                            // Put the used charge on cooldown
                            carry.cooldowns.surge[min] = augmented.tick + cooldown("surge", powerburst())
                            // Set the antispam delay for the second charge
                            carry.cooldowns.surge[1 - min] = Math.max(augmented.tick + 2, carry.cooldowns.surge[1 - min])

                            // Surge puts both escape charges on cooldown
                            carry.cooldowns.escape.fill(augmented.tick + cooldown("escape", powerburst()))

                            break
                        }
                        case "escape": {
                            let min = minIndex(carry.cooldowns.escape)

                            if (carry.cooldowns.escape[min] > augmented.tick) {
                                if (carry.cooldowns.escape[min] - augmented.tick <= 2 && carry.cooldowns.escape[1 - min] >= cooldown("escape", powerburst()) - 2)
                                    augmented.issues.push(`Antispam delay. Waiting for ${carry.cooldowns.escape[min] - augmented.tick} ticks.`)
                                else
                                    augmented.issues.push(`Both escape charges are still on cooldown for ${carry.cooldowns.escape[min] - augmented.tick} ticks.`)

                                augmented.tick = carry.cooldowns.escape[min] // Wait for cooldown
                            }

                            // Put the used charge on cooldown
                            carry.cooldowns.escape[min] = augmented.tick + cooldown("escape", powerburst())
                            // Set the antispam delay for the second charge
                            carry.cooldowns.escape[1 - min] = Math.max(augmented.tick + 2, carry.cooldowns.escape[1 - min])

                            // Escape puts both surge charges on cooldown
                            carry.cooldowns.surge.fill(augmented.tick + cooldown("surge", powerburst()))

                            break
                        }
                        case "dive": {
                            if (carry.cooldowns.dive > augmented.tick) {
                                augmented.issues.push(`Dive is still on cooldown for ${carry.cooldowns.dive - augmented.tick} ticks!`)
                                augmented.tick = carry.cooldowns.dive // Wait for cooldown
                            }

                            carry.cooldowns.dive = augmented.tick + cooldown("dive", powerburst())

                            break
                        }
                        case "barge": {
                            if (carry.cooldowns.barge > augmented.tick) {
                                augmented.issues.push(`Barge is still on cooldown for ${carry.cooldowns.barge - augmented.tick} ticks!`)
                                augmented.tick = carry.cooldowns.barge // Wait for cooldown
                            }

                            carry.cooldowns.barge = augmented.tick + cooldown("barge", powerburst())

                            break
                        }
                    }

                    augmented.ticks = 1

                    augmented.ends_up = {
                        tile: step.to,
                        direction: direction.fromVector(Vector2.sub(step.to, step.from))
                    }
                    if (step.ability == "escape") augmented.ends_up.direction = direction.invert(augmented.ends_up.direction)

                    // A movement ability overrides target (TODO: Or does it?)
                    carry.targeted_entity = null

                    break;
                case "teleport":

                    // With this implementation, teleports always preserve player orientation.
                    // There are teleports in the game that do not do that, but that's not included in the data I have.
                    if (step.spot_override) augmented.ends_up.tile = step.spot_override
                    else augmented.ends_up.tile = teleport_data.resolveTarget(step.id)

                    break;
                case "interaction":
                    augmented.ends_up = step.ends_up

                    augmented.ticks = step.ticks

                    break;
                case "redclick":
                    let next = path.steps[i + 1] as step_run

                    if (next?.type != "run")
                        augmented.issues.push("Redclicking is not followed by a run")
                    else if (next) {
                        let natural = direction.fromVector(Vector2.sub(index(next.waypoints, -1), index(next.waypoints, -2)))
                        let redclicked = direction.fromVector(Vector2.sub(step.where, index(next.waypoints, -1)))

                        if (natural == redclicked)
                            augmented.issues.push("Redclicking orientation is the same as natural orientation.")
                    }

                    carry.targeted_entity = step.where
                    break;
                case "powerburst":
                    if (carry.position.tile && !MapCoordinate.eq(carry.position.tile, step.where)) {
                        augmented.issues.push("Position of powerburst does not match where the player is at that point.")
                        augmented.ends_up.tile = step.where
                    }

                    if (carry.tick - carry.acceleration_activation_tick < 120) {
                        augmented.issues.push(`Powerburst of acceleration still on cooldown for ${carry.acceleration_activation_tick + 120 - carry.tick} ticks!`)
                        augmented.tick = carry.acceleration_activation_tick + 120
                    }

                    carry.acceleration_activation_tick = carry.tick
                    augmented.ticks = 1

                    break;
            }

            carry.position = augmented.ends_up
            carry.tick = augmented.tick + augmented.ticks

            augmented_steps.push(augmented)
        }

        return {
            raw: path,
            steps: augmented_steps,
            expected_execution_time: augmented_steps.map((s) => s.ticks).reduce((a, b) => a + b, 0),
            ends_up: index(augmented_steps, -1)?.ends_up
        }
    }

    export function title(step: step): string {
        switch (step.type) {
            case "orientation":
                return `Face ${direction.toString(step.direction)}`
            case "ability":
                return `Ability - ${capitalize(step.ability)}`
            case "run":
                return `Run ${step.waypoints.length} tiles`
            case "teleport":
                return `Teleport TODO`
            case "interaction":
                return "Use entrance/shortcut";
            case "redclick":
                return "Redclick"
            case "powerburst":
                return "Use Powerburst of Acceleration"

        }

        return "MISSING"
    }
}