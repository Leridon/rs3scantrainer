import {floor_t, MapCoordinate, MapRectangle} from "./coordinates";
import {direction} from "./movement";
import {Path} from "./pathing";
import {Rectangle, Vector2} from "../math/Vector";

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
        Clickable Area: MapRectangle (Entity size)
        Interaction Area: MapRectangle, where the player can trigger the action from
        Animation Time: number, ticks until the player can move again
        Target: Move to specific spot | Offset player position

        Entity Name: string
        Action Name: string

     */

    export type new_shortcut = ({
        type: "door",
        area: MapRectangle,
        direction: "northsouth" | "eastwest"
    } | {
        type: "entity",
        name: string,
        clickable_area: MapRectangle,
        actions: {
            cursor: Path.InteractionType,
            interactive_area: MapRectangle,
            time: number,
            name: string,
            movement: { type: "offset", offset: Vector2, level: floor_t } | { type: "fixed", target: MapCoordinate }
        }[]
    }) & { id: number }

    type start_t = { type: "area", area: MapRectangle } | { type: "tile", tile: MapCoordinate }
    type click_t = { type: "area", area: MapRectangle, where: "center" | "nearest" } | { type: "tile", tile: MapCoordinate }
    type movement_t = { type: "offset", offset: Vector2, level: floor_t } | { type: "fixed", target: MapCoordinate }

    export namespace start {
        export function get(start: start_t, position: MapCoordinate | null): MapCoordinate {
            if (start.type == "tile") return start.tile
            else if (start.type == "area") {
                if (position != null) return MapRectangle.clampInto(position, start.area)
                else return MapRectangle.tl(start.area)
            }
        }
    }

    export namespace click {
        export function get(click: click_t, position: MapCoordinate | null): MapCoordinate {
            if (click.type == "tile") return click.tile
            else if (click.type == "area") {
                if (click.where == "nearest" && position != null) return MapRectangle.clampInto(position, click.area)
                else return MapRectangle.center(click.area)
            }
        }
    }

    export namespace movement {
        export function get(movement: movement_t, start: MapCoordinate): MapCoordinate {
            if (movement.type == "fixed") return movement.target
            else if (movement.type == "offset") return MapCoordinate.lift(Vector2.add(start, movement.offset), movement.level)

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

        function door(south_west_corner: MapCoordinate, size: Vector2): shortcut[] {
            let hori = size.x > 0

            let rectangle = MapRectangle.lift(
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
                    start: {type: "area", area: MapRectangle.bottom(rectangle)},
                    click: {type: "tile", tile: MapRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 0, y: 1}, level: south_west_corner.level},
                }, {
                    name: "Cross South",
                    ticks: 1,
                    forced_orientation: direction.south,
                    how: "open",
                    start: {type: "area", area: MapRectangle.top(rectangle)},
                    click: {type: "tile", tile: MapRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 0, y: -1}, level: south_west_corner.level},
                }]
            } else {
                return [{
                    name: "Cross East",
                    ticks: 1,
                    forced_orientation: direction.east,
                    how: "open",
                    start: {type: "area", area: MapRectangle.left(rectangle)},
                    click: {type: "tile", tile: MapRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: 1, y: 0}, level: south_west_corner.level},
                }, {
                    name: "Cross West",
                    ticks: 1,
                    forced_orientation: direction.west,
                    how: "open",
                    start: {type: "area", area: MapRectangle.right(rectangle)},
                    click: {type: "tile", tile: MapRectangle.center(rectangle)},
                    movement: {type: "offset", offset: {x: -1, y: 0}, level: south_west_corner.level},
                }]
            }
        }

        function door1V(west: MapCoordinate): shortcut[] {
            return door(west, {x: 0, y: 1})
        }

        function door1H(south: MapCoordinate): shortcut[] {
            return door(south, {x: 1, y: 0})
        }

        function portal(rectangle: MapRectangle, lands: MapCoordinate): shortcut[] {
            /*
            let sources: MapCoordinate[] = []

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
                starts: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0),
                where: MapCoordinate.lift(northern_end, 0),
                ends_up: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0),
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
                    start: {type: "tile", tile: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0)},
                    click: {type: "tile", tile: MapCoordinate.lift(northern_end, 0)},
                    movement: {type: "fixed", target: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0)},
                    forced_orientation: direction.south,
                    how: "agility_obstacle"
                },
                {
                    name: "Cross North",
                    ticks: 5,
                    start: {type: "tile", tile: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0)},
                    click: {type: "tile", tile: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -7}), 0)},
                    movement: {type: "fixed", target: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0)},
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