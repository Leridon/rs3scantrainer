import {Box, MapCoordinate, Vector2} from "./coordinates";
import {direction, MovementAbilities, PlayerPosition} from "./movement";
import movement_ability = MovementAbilities.movement_ability;
import {util} from "../util/util";
import * as lodash from "lodash"
import {teleport_data} from "../data/teleport_data";
import {full_teleport_id} from "./teleports";
import {capitalize} from "lodash";
import {stat} from "fs";


export namespace Path {
    type step_base = {
        type: string,
        description: string
    }

    export enum InteractionType {
        GENERIC = "generic",
        CHOP = "chop",
        TALK = "talk"

        /** TODO:
         * Use Shortcut
         *  - Different Types
         * Enter Cave
         * Exit Cave
         * Ladder Up
         * Ladder Down
         * Open Door
         * Use Spell on Object
         *
         */
    }

    export type interaction_type =
        "generic" | "chop" | "talk"

    export namespace interaction_type {
        export function meta(type: InteractionType): { icon_url: string, description: string } {
            return {
                icon_url: "assets/icons/accel.png",
                description: capitalize(type.toString())
            }
            // TODO: Add real data
        }
    }

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
        how: InteractionType
    }

    export type step_redclick = step_base & {
        type: "redclick",
        where: MapCoordinate,
        how: InteractionType
    }

    export type step_powerburst = step_base & {
        type: "powerburst",
        where: MapCoordinate
    }

    export type step = step_orientation | step_ability | step_run | step_teleport | step_interact | step_redclick | step_powerburst


    import index = util.index;
    import minIndex = util.minIndex;
    import cooldown = MovementAbilities.cooldown;
    import capitalize = util.capitalize;

    export type movement_state = {
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
    }

    export namespace movement_state {
        export function start(): movement_state {
            return {
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
        }
    }

    export type raw = {
        start_state?: movement_state,   // Useful for movement trees, where a path depends on a previous state
        target?: Box
        description?: string,
        steps: step[],
    }

    export type augmented = {
        pre_state: movement_state,
        post_state: movement_state,
        raw: raw,
        steps: augmented_step[],
    }

    export type augmented_step = {
        pre_state: movement_state,
        post_state: movement_state,
        raw: Path.step,
        section?: number,
        issues?: string[]
    }

    export async function augment(path: Path.raw): Promise<Path.augmented> {
        let augmented_steps: augmented_step[] = []

        let start_state = path.start_state ? lodash.cloneDeep(path.start_state) : movement_state.start()
        let state: movement_state = lodash.cloneDeep(start_state)


        // null positions are a pain, replace with position with unknown tile and direction
        state.position ||= {tile: null, direction: null}

        for (let i = 0; i < path.steps.length; i++) {
            let step = path.steps[i]

            let augmented: augmented_step = {
                pre_state: lodash.cloneDeep(state),
                post_state: null,
                issues: [],
                section: 0,
                raw: step
            }

            switch (step.type) {
                case "orientation":
                    if (i > 0) augmented.issues.push("Orientation steps should only be used as the first step!")

                    // Assume one tick
                    state.tick += 1
                    state.targeted_entity = null

                    state.position.direction = step.direction
                    break
                case "run": {
                    if (state.position.tile && !MapCoordinate.eq(state.position.tile, step.waypoints[0]))
                        augmented.issues.push("Running does not start where the previous step ends!")

                    state.position = {
                        tile: index(step.waypoints, -1),
                        direction: direction.fromVector(
                            state.targeted_entity
                                ? Vector2.sub(state.targeted_entity, index(step.waypoints, -1))
                                : Vector2.sub(index(step.waypoints, -1), index(step.waypoints, -2)))
                    }

                    // The first waypoint is the start point, so path length is |waypoints| - 1
                    state.tick += Math.ceil((step.waypoints.length - 1) / 2)

                    state.targeted_entity = null
                }
                    break;
                case "ability":
                    // Check whether start and target matches expectations
                    if (state.position) {
                        if (state.position.tile && !MapCoordinate.eq(state.position.tile, step.from)) {
                            augmented.issues.push("Ability does not start where the previous step ends!")
                        } else {

                            // if there is no previous position, at least assume the defined start position
                            let assumed_pos = state.position

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
                    const powerburst = () => (state.tick - state.acceleration_activation_tick) <= 120

                    // Check cooldowns
                    // Assumes mobile as well as double surge/escape.
                    // TODO: This entire logic is most likely riddled by off-by-one errors that need to be checked to ensure path lengths are estimated correctly.

                    // [13:46] treborsmada: its just (surge/escape/bd/(surge + bd)/(bd + surge)/(escape + bd)/(bd+ escape)) + <= 2 tiles movement
                    // So essentially: Any movement + optionally dive + 2 tiles movement.
                    // moving first and THEN an ability in the same tick does not work.
                    // This essentially means that surge/escape/dive do not end the tick, but running does
                    switch (step.ability) {
                        case "surge": {
                            let min = minIndex(state.cooldowns.surge)

                            if (state.cooldowns.surge[min] > state.tick) {
                                if (state.cooldowns.surge[min] - state.tick <= 2 && state.cooldowns.surge[1 - min] >= cooldown("surge", powerburst()) - 2)
                                    augmented.issues.push(`Antispam delay. Waiting for ${state.cooldowns.surge[min] - state.tick} ticks.`)
                                else
                                    augmented.issues.push(`Both surge charges are still on cooldown for ${state.cooldowns.surge[min] - state.tick} ticks.`)

                                state.tick = state.cooldowns.surge[min] // Wait for cooldown
                            }

                            // Put the used charge on cooldown
                            state.cooldowns.surge[min] = state.tick + cooldown("surge", powerburst())
                            // Set the antispam delay for the second charge
                            state.cooldowns.surge[1 - min] = Math.max(state.tick + 2, state.cooldowns.surge[1 - min])

                            // Surge puts both escape charges on cooldown
                            state.cooldowns.escape.fill(state.tick + cooldown("escape", powerburst()))

                            break
                        }
                        case "escape": {
                            let min = minIndex(state.cooldowns.escape)

                            if (state.cooldowns.escape[min] > state.tick) {
                                if (state.cooldowns.escape[min] - state.tick <= 2 && state.cooldowns.escape[1 - min] >= cooldown("escape", powerburst()) - 2)
                                    augmented.issues.push(`Antispam delay. Waiting for ${state.cooldowns.escape[min] - state.tick} ticks.`)
                                else
                                    augmented.issues.push(`Both escape charges are still on cooldown for ${state.cooldowns.escape[min] - state.tick} ticks.`)

                                state.tick = state.cooldowns.escape[min] // Wait for cooldown
                            }

                            // Put the used charge on cooldown
                            state.cooldowns.escape[min] = state.tick + cooldown("escape", powerburst())
                            // Set the antispam delay for the second charge
                            state.cooldowns.escape[1 - min] = Math.max(state.tick + 2, state.cooldowns.escape[1 - min])

                            // Escape puts both surge charges on cooldown
                            state.cooldowns.surge.fill(state.tick + cooldown("surge", powerburst()))

                            break
                        }
                        case "dive": {
                            if (state.cooldowns.dive > state.tick) {
                                augmented.issues.push(`Dive is still on cooldown for ${state.cooldowns.dive - state.tick} ticks!`)
                                state.tick = state.cooldowns.dive // Wait for cooldown
                            }

                            state.cooldowns.dive = state.tick + cooldown("dive", powerburst())

                            break
                        }
                        case "barge": {
                            if (state.cooldowns.barge > state.tick) {
                                augmented.issues.push(`Barge is still on cooldown for ${state.cooldowns.barge - state.tick} ticks!`)
                                state.tick = state.cooldowns.barge // Wait for cooldown
                            }

                            state.cooldowns.barge = state.tick + cooldown("barge", powerburst())

                            break
                        }
                    }

                    state.position = {
                        tile: step.to,
                        direction: direction.fromVector(Vector2.sub(step.to, step.from))
                    }
                    if (step.ability == "escape") state.position.direction = direction.invert(state.position.direction)

                    switch (step.ability) {
                        case "surge":
                        case "dive":
                        case "escape":
                            break; // Movement abilities do not end the tick and allow for another action (such as doing the other ability or running) in the same tick
                        case "barge":
                            state.tick += 1
                            break;
                    }

                    // A movement ability overrides target (TODO: Or does it?)
                    state.targeted_entity = null

                    break;
                case "teleport":

                    // With this implementation, teleports always preserve player orientation.
                    // There are teleports in the game that do not do that, but that's not included in the data I have.
                    if (step.spot_override) state.position.tile = step.spot_override
                    else state.position.tile = teleport_data.resolveTarget(step.id)

                    state.tick += 1 // TODO: Add teleport and interface times!
                    state.targeted_entity = null

                    break;
                case "interaction":

                    state.position = step.ends_up
                    state.tick += step.ticks
                    state.targeted_entity = null

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

                    state.targeted_entity = step.where

                    // redclicks are considered to be loss less, i.e. don't take any ticks.

                    break;
                case "powerburst":
                    if (state.position.tile && !MapCoordinate.eq(state.position.tile, step.where)) {
                        augmented.issues.push("Position of powerburst does not match where the player is at that point.")
                        state.position.tile = step.where
                    }

                    if (state.tick - state.acceleration_activation_tick < 120) {
                        augmented.issues.push(`Powerburst of acceleration still on cooldown for ${state.acceleration_activation_tick + 120 - state.tick} ticks!`)
                        state.tick = state.acceleration_activation_tick + 120
                    }

                    state.acceleration_activation_tick = state.tick
                    state.tick += 1

                    break;
            }

            if ((i == path.steps.length - 1 && path.target && (!state.position.tile || !Box.contains(path.target, state.position.tile)))) {
                augmented.issues.push("Path does not end in target area")
            }

            augmented.post_state = lodash.cloneDeep(state)

            augmented_steps.push(augmented)
        }

        // TODO: Sort issues into warning and errors

        return {
            pre_state: start_state,
            post_state: index(augmented_steps, -1)?.post_state || start_state,
            raw: path,
            steps: augmented_steps,
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