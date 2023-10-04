import {MapCoordinate, MapRectangle} from "./coordinates";
import {direction} from "./movement";
import {Path} from "./pathing";
import {Vector2} from "../util/math";
import {range} from "lodash";

export namespace Shortcuts {

    export type shortcut = {
        name: string,
        ticks: number,
        where: MapCoordinate,
        starts: MapCoordinate,
        ends_up: MapCoordinate,
        forced_orientation: direction | null
        how: Path.InteractionType
    }

    export function create_index(): shortcut[] {
        let buffer: shortcut[] = []

        function p(value: shortcut | shortcut[]) {
            if (Array.isArray(value)) buffer.push(...value)
            else buffer.push(value)
        }

        function door(south_west_corner: MapCoordinate, size: Vector2): shortcut[] {
            let hori = size.x > 0

            let click_off = hori ? {x: 0, y: 0.5} : {x: 0.5, y: 0}
            let iteration_off = hori ? {x: 1, y: 0} : {x: 0, y: 1}

            let iterations = hori ? size.x : size.y

            return range(0, iterations).flatMap(i => {
                let south_west = MapCoordinate.move(south_west_corner, Vector2.scale(i, iteration_off))
                let click = MapCoordinate.move(south_west, click_off)
                let north_east = MapCoordinate.move(click, click_off)

                return [{
                    name: hori ? "Cross North" : "Cross East",
                    ticks: 1,
                    starts: south_west,
                    where: click,
                    ends_up: north_east,
                    forced_orientation: hori ? direction.north : direction.east,
                    how: "open"
                }, {
                    name: hori ? "Cross South" : "Cross West",
                    ticks: 1,
                    starts: north_east,
                    where: click,
                    ends_up: south_west,
                    forced_orientation: hori ? direction.south : direction.west,
                    how: "open"
                }]
            })
        }

        function door1V(west: MapCoordinate): shortcut[] {
            return door(west, {x: 0, y: 1})
        }

        function door1H(south: MapCoordinate): shortcut[] {
            return door(south, {x: 1, y: 0})
        }

        function portal(rectangle: MapRectangle, lands: MapCoordinate): shortcut[] {

            // TODO: Implement
            return []
        }

        function neitiznot_bridge(northern_end: Vector2): shortcut[] {
            return [
                {
                    name: "Cross South",
                    ticks: 5,
                    starts: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0),
                    where: MapCoordinate.lift(northern_end, 0),
                    ends_up: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0),
                    forced_orientation: direction.south,
                    how: "agility_obstacle"
                },
                {
                    name: "Cross North",
                    ticks: 5,
                    starts: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -8}), 0),
                    where: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: -7}), 0),
                    ends_up: MapCoordinate.lift(Vector2.add(northern_end, {x: 0, y: 1}), 0),
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