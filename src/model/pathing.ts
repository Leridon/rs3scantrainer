import {MapCoordinate, MapRectangle} from "./coordinates";
import {direction, MovementAbilities, PlayerPosition} from "./movement";
import movement_ability = MovementAbilities.movement_ability;
import {util} from "../util/util";
import * as lodash from "lodash"
import {teleport_data} from "../data/teleport_data";
import {full_teleport_id, Teleports} from "./teleports";
import {Vector2} from "../util/math";
import {ExportImport} from "../util/exportString";
import * as L from "leaflet"

export namespace Path {
    import getAllFlattened = teleport_data.getAllFlattened;
    type step_base = {
        type: string,
        description: string
    }

    export type InteractionType =
        "generic"
        | "chop"
        | "talk"
        | "open"
        | "enter"
        | "spellonentity"
        | "agility_obstacle"
        | "ladderdown"
        | "ladderup"

    export namespace InteractionType {

        export function all(): InteractionType[] {
            return [
                "generic", "chop", "talk", "open", "enter", "spellonentity", "agility_obstacle", "ladderdown", "ladderup"
            ]
        }

        export function meta(type: InteractionType): { icon_url: string, description: string, short_icon: string } {
            switch (type) {
                case "generic":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Click", short_icon: "missing_icon"}
                case "chop":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Chop", short_icon: "missing_icon"}
                case "talk":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Talk to", short_icon: "missing_icon"}
                case "open":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Open", short_icon: "missing_icon"}
                case "enter":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Enter", short_icon: "missing_icon"}
                case "spellonentity":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Use spell", short_icon: "missing_icon"}
                case "agility_obstacle":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Use", short_icon: "missing_icon"}
                case "ladderdown":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Climb up ladder", short_icon: "missing_icon"}
                case "ladderup":
                    return {icon_url: "assets/icons/missing_icon.png", description: "Climb down ladder", short_icon: "missing_icon"}
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

        function cooldown(state: movement_state, charges: number[]): number {
            return Math.max(0, Math.min(...charges) - state.tick)
        }

        export function surge_cooldown(state: movement_state): number {
            return cooldown(state, state.cooldowns.surge)
        }

        export function escape_cooldown(state: movement_state): number {
            return cooldown(state, state.cooldowns.escape)
        }

        export function barge_cooldown(state: movement_state): number {
            return cooldown(state, [state.cooldowns.barge])
        }

        export function dive_cooldown(state: movement_state): number {
            return cooldown(state, [state.cooldowns.dive])
        }
    }

    export type raw = {
        start_state?: movement_state,   // Useful for movement trees, where a path depends on a previous state
        target?: MapRectangle
        steps: step[],
    }

    export type augmented = {
        pre_state: movement_state,
        post_state: movement_state,
        raw: raw,
        steps: augmented_step[],
        issues: issue[]
    }

    export type augmented_step = {
        pre_state: movement_state,
        post_state: movement_state,
        raw: Path.step,
        section?: number,
        issues: issue[] // 0 = error, 1 = warning
    }

    export type issue_level = 0 | 1
    export type issue = { level: issue_level, message: string }

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
                    if (i > 0) augmented.issues.push({level: 0, message: "Orientation steps should only be used as the first step!"})

                    // Assume one tick
                    state.tick += 1
                    state.targeted_entity = null

                    state.position.direction = step.direction
                    break
                case "run": {
                    if (state.position.tile && !MapCoordinate.eq(state.position.tile, step.waypoints[0]))
                        augmented.issues.push({level: 0, message: "Running does not start where the previous step ends!"})

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
                            augmented.issues.push({level: 0, message: "Ability does not start where the previous step ends!"})
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
                                        augmented.issues.push({level: 0, message: "Surge target does not match where it would end up!"})

                                    break
                                }
                                case "escape": {
                                    let res = await MovementAbilities.escape2(assumed_pos)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push({level: 0, message: "Escape target does not match where it would end up!"})

                                    break
                                }
                                case "dive": {
                                    let res = await MovementAbilities.dive2(assumed_pos.tile, step.to)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push({level: 0, message: "Dive target can't be reached!"})

                                    break
                                }
                                case "barge": {
                                    let res = await MovementAbilities.barge2(assumed_pos.tile, step.to)

                                    if (!res || !MapCoordinate.eq(step.to, res.tile))
                                        augmented.issues.push({level: 0, message: "Barge target can't be reached!"})

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

                            let cd = state.cooldowns.surge[min] - state.tick
                            if (cd > 0) {
                                if (cd <= 2 && state.cooldowns.surge[1 - min] >= cooldown("surge", powerburst()) - 2)
                                    augmented.issues.push({level: 1, message: `Antispam delay. Delaying for ${cd} ticks.`})
                                else
                                    augmented.issues.push({
                                        level: cd >= 4 ? 0 : 1,
                                        message: `Both surge charges are still on cooldown for ${cd} ticks!`
                                    })

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

                            let cd = state.cooldowns.escape[min] - state.tick
                            if (cd > 0) {
                                if (cd <= 2 && state.cooldowns.escape[1 - min] >= cooldown("escape", powerburst()) - 2)
                                    augmented.issues.push({level: 1, message: `Antispam delay. Delaying for ${cd} ticks.`})
                                else
                                    augmented.issues.push({
                                        level: cd >= 4 ? 0 : 1,
                                        message: `Both escape charges are still on cooldown for ${cd} ticks!`
                                    })

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
                            let cd = state.cooldowns.dive - state.tick
                            if (cd > 0) {
                                augmented.issues.push({level: cd >= 4 ? 0 : 1, message: `Dive is still on cooldown for ${cd} ticks!`})
                                state.tick = state.cooldowns.dive // Wait for cooldown
                            }

                            state.cooldowns.dive = state.tick + cooldown("dive", powerburst())

                            break
                        }
                        case "barge": {
                            let cd = state.cooldowns.barge - state.tick
                            if (cd > 0) {
                                augmented.issues.push({level: cd >= 4 ? 0 : 1, message: `Barge is still on cooldown for ${cd} ticks!`})
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

                    let teleport = Teleports.find(teleport_data.getAllFlattened(), step.id)

                    // With this implementation, teleports always preserve player orientation.
                    // There are teleports in the game that do not do that, but that's not included in the data I have.
                    if (step.spot_override) state.position.tile = step.spot_override
                    else state.position.tile = teleport.spot

                    state.tick += teleport.menu_ticks
                    state.tick += teleport.animation_ticks
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
                        augmented.issues.push({level: 0, message: "Redclicking is not followed by a run"})
                    else if (next) {
                        let natural = direction.fromVector(Vector2.sub(index(next.waypoints, -1), index(next.waypoints, -2)))
                        let redclicked = direction.fromVector(Vector2.sub(step.where, index(next.waypoints, -1)))

                        if (natural == redclicked)
                            augmented.issues.push({level: 1, message: "Redclicking orientation is the same as natural orientation."})
                    }

                    state.targeted_entity = step.where

                    // redclicks are considered to be loss less, i.e. don't take any ticks.

                    break;
                case "powerburst":
                    if (state.position.tile && !MapCoordinate.eq(state.position.tile, step.where)) {
                        augmented.issues.push({level: 0, message: "Position of powerburst does not match where the player is at that point."})
                        state.position.tile = step.where
                    }

                    if (state.tick - state.acceleration_activation_tick < 120) {
                        augmented.issues.push({
                            level: 1,
                            message: `Powerburst of acceleration still on cooldown for ${state.acceleration_activation_tick + 120 - state.tick} ticks!`
                        })
                        state.tick = state.acceleration_activation_tick + 120
                    }

                    // Reset cooldowns
                    state.cooldowns.surge = [state.tick, state.tick]
                    state.cooldowns.escape = [state.tick, state.tick]
                    state.cooldowns.dive = state.tick

                    state.acceleration_activation_tick = state.tick
                    state.tick += 1

                    break;
            }


            augmented.post_state = lodash.cloneDeep(state)

            augmented_steps.push(augmented)
        }

        let post_state = index(augmented_steps, -1)?.post_state || start_state
        let path_issues: issue[] = []

        if ((path.target && (!state.position.tile || !MapRectangle.contains(path.target, state.position.tile)))) {
            path_issues.push({level: 0, message: "Path does not end in target area"})
        }

        return {
            pre_state: start_state,
            post_state: post_state,
            raw: path,
            steps: augmented_steps,
            issues: path_issues
        }
    }

    export function title(step: step): string {
        switch (step.type) {
            case "orientation":
                return `Face ${direction.toString(step.direction)}`
            case "ability":
                return `${capitalize(step.ability)}`
            case "run":
                return `Run ${step.waypoints.length - 1} tiles`
            case "teleport":
                return `Teleport`
            case "interaction":
                return "Use entrance";
            case "redclick":
                return "Redclick"
            case "powerburst":
                return "Use Powerburst"

        }

        return "MISSING"
    }

    export function auto_description(step: step): string {
        if (step.type === "orientation") {
            return `Face ${direction.toString(step.direction)}`
        } else if (step.type === "ability") {
            let dir = direction.toString(direction.fromVector(Vector2.sub(step.to, step.from)))

            switch (step.ability) {
                case "surge":
                    return `{{surge}} ${dir}`;
                case "dive":
                    return `{{dive}} ${dir}`
                case "escape":
                    return `{{escape}} ${dir}`
                case "barge":
                    return `{{barge}} ${dir}`
            }
        } else if (step.type === "run") {
            return `Run ${step.waypoints.length - 1} tiles`
        } else if (step.type === "teleport") {
            let teleport = Teleports.find(teleport_data.getAllFlattened(), step.id)

            if (teleport.variant && teleport.variant.name) return `{{teleport ${teleport.group.id} ${teleport.sub.id}}} to ${teleport.variant.name}`
            else if (teleport.sub.name) return `Use {{teleport ${teleport.group.id} ${teleport.sub.id}}} to ${teleport.sub.name}`
            else return `Use {{teleport ${teleport.group.id} ${teleport.sub.id}}}`
        } else if (step.type === "interaction") {
            return "Use entrance/shortcut"; // TODO:
        } else if (step.type === "redclick") {
            return "Redclick" // TODO:
        } else if (step.type === "powerburst") {
            return "Use {{icon accel}}"
        }
    }

    export function auto_describe(step: step): step {
        step.description = auto_description(step)
        return step
    }

    export function collect_issues(path: augmented): (issue & { step?: augmented_step, path?: augmented })[] {
        let accumulator: (issue & { step?: augmented_step, path?: augmented })[] = []

        for (let step of path.steps) {
            for (let issue of step.issues) {
                accumulator.push({...issue, step: step})
            }
        }

        accumulator = accumulator.concat(path.issues.map(i => {
            return {...i, path: path}
        }))

        return accumulator
    }

    export function export_path(p: Path.raw): string {
        return ExportImport.exp({type: "path", version: 0}, false, true)(p)
        //return export_string("path", 0, p.steps)
    }

    export function import_path(str: string): Path.raw {
        return ExportImport.imp<Path.raw>({expected_type: "path", expected_version: 0})(str)
    }

    function tile_bounds(tile: Vector2): L.Bounds {
        return L.bounds([
            L.point({x: tile.x - 0.5, y: tile.y - 0.5}),
            L.point({x: tile.x + 0.5, y: tile.y + 0.5}),
        ])
    }

    export function step_bounds(step: augmented_step): L.Bounds {
        let bounds = L.bounds([])

        switch (step.raw.type) {
            case "ability":
                bounds.extend(tile_bounds(step.raw.from))
                bounds.extend(tile_bounds(step.raw.to))
                break
            case "run":
                bounds.extend(L.bounds(step.raw.waypoints.map(L.point)))
                break
            case "teleport":
                if (step.raw.spot_override) bounds.extend(L.point(step.raw.spot_override))
                else {
                    let teleport = Teleports.find(getAllFlattened(), step.raw.id)
                    bounds.extend(L.point(teleport.spot))
                }
                break
            case "interaction":
                bounds.extend(L.point(step.raw.where))
                bounds.extend(L.point(step.raw.ends_up.tile))

                break;
            case "redclick":
                bounds.extend(L.point(step.raw.where))
                break;
            case "powerburst":
                bounds.extend(L.point(step.raw.where))
                break;
        }

        // Only include pre and post state if the bounds are empty
        if (step.pre_state?.position?.tile && bounds.getCenter().distanceTo(L.point(step.pre_state.position.tile)) < 100) bounds.extend(tile_bounds(step.pre_state.position.tile))
        if (step.post_state?.position?.tile && bounds.getCenter().distanceTo(L.point(step.post_state.position.tile)) < 100) bounds.extend(tile_bounds(step.post_state.position.tile))

        return bounds
    }

    export function path_bounds(path: augmented): L.Bounds {
        let bounds = L.bounds([])

        path.steps.forEach(s => bounds.extend(step_bounds(s)))

        if (path.raw.target) bounds.extend(L.point(path.raw.target.topleft)).extend(L.point(path.raw.target.botright))
        if (path.raw.start_state?.position?.tile && bounds.getCenter().distanceTo(L.point(path.raw.start_state.position.tile)) < 100) bounds.extend(tile_bounds(path.raw.start_state?.position?.tile))

        return bounds
    }
}