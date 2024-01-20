import {Path} from "./pathing";
import {Rectangle, Vector2} from "../math";
import {TileRectangle} from "./coordinates";
import {TileCoordinates} from "./coordinates";
import {direction} from "./movement";

export namespace Shortcuts {
    import entity = Path.entity;
    export type shortcut_orientation_type =
        { type: "forced", direction: direction, relative: boolean }
        | { type: "byoffset" }
        | { type: "toentitybefore" }
        | { type: "toentityafter" }
        | { type: "keep" }

    export type entity_shortcut_action = {
        cursor: Path.InteractionType,
        interactive_area: TileRectangle,
        time: number,
        name: string,
        movement: { type: "offset", offset: Vector2 & { level: number } }
            | { type: "fixed", target: TileCoordinates, relative: boolean },
        orientation: shortcut_orientation_type
    }

    export type entity_shortcut = {
        type: "entity",
        entity: entity,
        clickable_area: TileRectangle,
        actions: entity_shortcut_action[]
    }

    export type door_shortcut = {
        type: "door",
        name: string,
        area: TileRectangle,
        direction: "northsouth" | "eastwest"
    }

    export type shortcut = entity_shortcut | door_shortcut

    /**
     * Coalesces all shortcuts into the general entity_shortcut.
     * More specifically, it transforms door shortcuts into an equivalent {@link entity_shortcut} to allow unified handling across the code base.
     * Doors are modelled differently in case their handling for pathing is ever changed from the current, hacky variant.
     * @param shortcut
     */
    export function normalize(shortcut: shortcut): entity_shortcut {
        if (shortcut.type == "entity") return shortcut

        switch (shortcut.direction) {
            case "northsouth":
                return {
                    type: "entity",
                    entity: {kind: "static", name: shortcut.name},
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
                        movement: {type: "offset", offset: {x: 0, y: -1, level: 0}},
                        orientation: {type: "forced", direction: direction.south, relative: true}
                    }, {
                        cursor: "open",
                        interactive_area: TileRectangle.bottom(shortcut.area),
                        time: 1,
                        name: "Cross north",
                        movement: {type: "offset", offset: {x: 0, y: 1, level: 0}},
                        orientation: {type: "forced", direction: direction.north, relative: true}
                    }]
                }
            case "eastwest":
                return {
                    type: "entity",
                    entity: {kind: "static", name: shortcut.name},
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
                        movement: {type: "offset", offset: {x: 1, y: 0, level: 0}},
                        orientation: {type: "forced", direction: direction.east, relative: true}
                    }, {
                        cursor: "open",
                        interactive_area: TileRectangle.right(shortcut.area),
                        time: 1,
                        name: "Cross west",
                        movement: {type: "offset", offset: {x: -1, y: 0, level: 0}},
                        orientation: {type: "forced", direction: direction.west, relative: true}

                    }]
                }
        }
    }

    export function bounds(shortcut: shortcut): TileRectangle {
        switch (shortcut.type) {
            case "entity":
                return TileRectangle.lift(Rectangle.combine(
                    shortcut.clickable_area,
                    ...shortcut.actions.map(a => a.interactive_area)
                ), shortcut.clickable_area.level)
            case "door":
                return shortcut.area
        }
    }

    export function position(shortcut: shortcut): TileCoordinates {
        switch (shortcut.type){
            case "entity":
                return TileRectangle.center(shortcut.clickable_area)
            case "door":
                return TileRectangle.center(shortcut.area)
        }
    }

    export function name(shortcut: shortcut): string {
        switch (shortcut.type) {
            case "entity":
                return shortcut.entity.name
            case "door":
                return shortcut.name

        }
    }
}