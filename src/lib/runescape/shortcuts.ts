import {floor_t} from "./coordinates";
import {direction} from "./movement";
import {Path} from "./pathing";
import {Rectangle, Vector2} from "../math/Vector2";
import { TileRectangle } from "./coordinates/TileRectangle";
import {TileCoordinates} from "./coordinates/TileCoordinates";

export namespace Shortcuts {

    //Shortcuts: From A to B
    /*
        Shortcuts:
            - From A to B
            - From A* to B
            - From A* to B* (1 to 1)
        Doors: A to B, A* to B*
        Portals: A* to B
        Stairs/Ladders: A* to B, A* to B*


        type: "door" | "entity"
        Clickable Area: TileRectangle (Entity size)
        Interaction Area: TileRectangle, where the player can trigger the action from
        Animation Time: number, ticks until the player can move again
        Target: Move to specific spot | Offset player position

        Entity Name: string
        Action Name: string

     */

    export type new_shortcut_entity_action = {
        cursor: Path.InteractionType,
        interactive_area: TileRectangle,
        time: number,
        name: string,
        movement: { type: "offset", offset: Vector2, level: floor_t } | { type: "fixed", target: TileCoordinates }
    }

    export type new_shortcut_entity = {
        type: "entity",
        name: string,
        clickable_area: TileRectangle,
        actions: new_shortcut_entity_action[]
    }

    export type new_shortcut_door = {
        type: "door",
        name: string,
        area: TileRectangle,
        direction: "northsouth" | "eastwest"
    }

    export type new_shortcut = new_shortcut_entity | new_shortcut_door

    export namespace new_shortcut {
        export function normalize(shortcut: new_shortcut): new_shortcut_entity {
            if (shortcut.type == "entity") return shortcut

            switch (shortcut.direction) {
                case "northsouth":
                    return {
                        type: "entity",
                        name: shortcut.name,
                        clickable_area: {
                            topleft: Vector2.add(shortcut.area.topleft, {x: -0.5, y: 0}),
                            botright: Vector2.add(shortcut.area.botright, {x: 0.5, y: 0}),
                            level: shortcut.area.level
                        },
                        actions: [{
                            cursor: "open",
                            interactive_area: TileRectangle.top(shortcut.area),
                            time: 1,
                            name: "Cross south",
                            movement: {type: "offset", offset: {x: 0, y: -1}, level: shortcut.area.level}
                        }, {
                            cursor: "open",
                            interactive_area: TileRectangle.bottom(shortcut.area),
                            time: 1,
                            name: "Cross north",
                            movement: {type: "offset", offset: {x: 0, y: 1}, level: shortcut.area.level}
                        }]
                    }
                case "eastwest":
                    return {
                        type: "entity",
                        name: shortcut.name,
                        clickable_area: {
                            topleft: Vector2.add(shortcut.area.topleft, {x: 0, y: 0.5}),
                            botright: Vector2.add(shortcut.area.botright, {x: 0, y: -0.5}),
                            level: shortcut.area.level
                        },
                        actions: [{
                            cursor: "open",
                            interactive_area: TileRectangle.left(shortcut.area),
                            time: 1,
                            name: "Cross east",
                            movement: {type: "offset", offset: {x: 1, y: 0}, level: shortcut.area.level}
                        }, {
                            cursor: "open",
                            interactive_area: TileRectangle.right(shortcut.area),
                            time: 1,
                            name: "Cross west",
                            movement: {type: "offset", offset: {x: -1, y: 0}, level: shortcut.area.level}
                        }]
                    }
            }
        }

        export function bounds(shortcut: new_shortcut): TileRectangle {
            switch (shortcut.type) {
                case "entity":

                    let bounds = shortcut.clickable_area

                    shortcut.actions.forEach(a => {
                        bounds = TileRectangle.extendToRect(bounds, a.interactive_area)
                    })

                    return bounds
                case "door":
                    return shortcut.area
            }
        }
    }

    type start_t = { type: "area", area: TileRectangle } | { type: "tile", tile: TileCoordinates }
    type click_t = { type: "area", area: TileRectangle, where: "center" | "nearest" } | { type: "tile", tile: TileCoordinates }
    type movement_t = { type: "offset", offset: Vector2, level: floor_t } | { type: "fixed", target: TileCoordinates }

    export namespace start {
        export function get(start: start_t, position: TileCoordinates | null): TileCoordinates {
            if (start.type == "tile") return start.tile
            else if (start.type == "area") {
                if (position != null) return TileRectangle.clampInto(position, start.area)
                else return TileRectangle.tl(start.area)
            }
        }
    }

    export namespace click {
        export function get(click: click_t, position: TileCoordinates | null): TileCoordinates {
            if (click.type == "tile") return click.tile
            else if (click.type == "area") {
                if (click.where == "nearest" && position != null) return TileRectangle.clampInto(position, click.area)
                else return TileRectangle.center(click.area)
            }
        }
    }

    export namespace movement {
        export function get(movement: movement_t, start: TileCoordinates): TileCoordinates {
            if (movement.type == "fixed") return movement.target
            else if (movement.type == "offset") return TileCoordinates.lift(Vector2.add(start, movement.offset), movement.level)

        }
    }

    export type shortcut = {
        name: string,
        ticks: number,
        forced_orientation: direction | null,
        how: Path.InteractionType,
        start: start_t,
        click: click_t,
        movement: movement_t
    }

    export namespace shortcut {

    }

    export function create_index(): shortcut[] {
        let buffer: shortcut[] = []

        function p(value: shortcut | shortcut[]) {
            if (Array.isArray(value)) buffer.push(...value)
            else buffer.push(value)
        }

        function door(south_west_corner: TileCoordinates, size: Vector2): shortcut[] {
            let hori = size.x > 0

            let rectangle = TileRectangle.lift(
                hori
                    ? Rectangle.from(south_west_corner, Vector2.add(south_west_corner, size, {x: -1, y: 1}))
                    : Rectangle.from(south_west_corner, Vector2.add(south_west_corner, size, {x: 1, y: -1})),
                south_west_corner.level)

            if (hori) {
                return [{
                    name: "Cross North",
                    ticks: 1,
                    forced_orientation: direction.north,
                    how: "open",
                    start: {type: "area", area: TileRectangle.bottom(rectangle)},
                    click: {type: "tile", tile: TileRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 0, y: 1}, level: south_west_corner.level},
                }, {
                    name: "Cross South",
                    ticks: 1,
                    forced_orientation: direction.south,
                    how: "open",
                    start: {type: "area", area: TileRectangle.top(rectangle)},
                    click: {type: "tile", tile: TileRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 0, y: -1}, level: south_west_corner.level},
                }]
            } else {
                return [{
                    name: "Cross East",
                    ticks: 1,
                    forced_orientation: direction.east,
                    how: "open",
                    start: {type: "area", area: TileRectangle.left(rectangle)},
                    click: {type: "tile", tile: TileRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 1, y: 0}, level: south_west_corner.level},
                }, {
                    name: "Cross West",
                    ticks: 1,
                    forced_orientation: direction.west,
                    how: "open",
                    start: {type: "area", area: TileRectangle.right(rectangle)},
                    click: {type: "tile", tile: TileRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: -1, y: 0}, level: south_west_corner.level},
                }]
            }
        }

        function door1V(west: TileCoordinates): shortcut[] {
            return door(west, {x: 0, y: 1})
        }

        function door1H(south: TileCoordinates): shortcut[] {
            return door(south, {x: 1, y: 0})
        }

        function portal(rectangle: TileRectangle, lands: TileCoordinates): shortcut[] {
            /*
            let sources: TileCoordinates[] = []

            // Traverse top/bottom
            let ys = rectangle.topleft.y != rectangle.botright.y ? [rectangle.topleft.y, rectangle.botright.y] : [rectangle.topleft.y]

            for (let x = rectangle.topleft.x; x <= rectangle.botright.x; x++) {
                ys.forEach(y => {
                    sources.push({x: x, y: y, level: rectangle.level})
                })
            }

            let xs = rectangle.topleft.x != rectangle.botright.x ? [rectangle.topleft.x, rectangle.botright.x] : [rectangle.topleft.x]

            for (let y = rectangle.topleft.y - 1; y <= rectangle.botright.y + 1; y--) {
                xs.forEach(x => {
                    sources.push({x: x, y: y, level: rectangle.level})
                })
            }

            return sources.map(src => ({
                name: "Use Portal",
                ticks: 2,
                starts: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0),
                where: TileCoordinates.lift(northern_end, 0),
                ends_up: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0),
                forced_orientation: direction.south,
                how: "agility_obstacle"
            }))*/

            // TODO: Implement
            return []
        }

        function neitiznot_bridge(northern_end: Vector2): shortcut[] {
            return [
                {
                    name: "Cross South",
                    ticks: 5,
                    start: {type: "tile", tile: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0)},
                    click: {type: "tile", tile: TileCoordinates.lift(northern_end, 0)},
                    movement: {type: "fixed", target: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0)},
                    forced_orientation: direction.south,
                    how: "agility_obstacle"
                },
                {
                    name: "Cross North",
                    ticks: 5,
                    start: {type: "tile", tile: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0)},
                    click: {type: "tile", tile: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: -7}), 0)},
                    movement: {type: "fixed", target: TileCoordinates.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0)},
                    forced_orientation: direction.north,
                    how: "agility_obstacle"
                },
            ]
        }

        // Neitiznot/Jatizso
        {
            // Bridges
            p(neitiznot_bridge({x: 2314, y: 3847}))
            p(neitiznot_bridge({x: 2355, y: 3847}))
            p(neitiznot_bridge({x: 2378, y: 3847}))
            p(neitiznot_bridge({x: 2317, y: 3831}))
            p(neitiznot_bridge({x: 2343, y: 3828}))

            // Neitiznot
            p(door({x: 2328, y: 3804, level: 0}, {x: 0, y: 2}))
            p(door1H({x: 2339, y: 3800, level: 0}))
            p(door1H({x: 2347, y: 3800, level: 0}))
            p(door1V({x: 2345, y: 3807, level: 0}))
            p(door1V({x: 2352, y: 3801, level: 0}))

            // Jatizso
            p(door({x: 2387, y: 3798, level: 0}, {x: 0, y: 2}))
            p(door({x: 2412, y: 3796, level: 0}, {x: 2, y: 0}))
            p(door({x: 2415, y: 3823, level: 0}, {x: 2, y: 0}))
        }

        // Zanaris
        {
            p(portal({topleft: {"x": 1564, "y": 4355}, botright: {"x": 1567, "y": 4355}, level: 0}, {"x": 2453, "y": 4476, "level": 0}))

            p(door({"x": 2469, "y": 4437, "level": 0}, {x: 0, y: 2}))
            p(door({"x": 2465, "y": 4433, "level": 0}, {x: 2, y: 0}))
        }

        return buffer
    }

    export const index: shortcut[] = create_index()
}